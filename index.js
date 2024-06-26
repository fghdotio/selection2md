(async function () {
    // Check if Clipboard API is available
    if (!navigator.clipboard) {
        console.error('Clipboard API not available')
        alert('Clipboard API not available')
        return
    }

    // Create a new instance of TurndownService, import TurndownService from the CDN if not already available
    async function loadTurndown() {
        if (typeof TurndownService === 'undefined') {
            const script = document.createElement('script')
            script.src = 'https://unpkg.com/turndown/dist/turndown.js'
            // script.onload = () => {
            //     console.log('TurndownService loaded')
            // }
            script.onerror = () => {
                console.error('Failed to load TurndownService')
                alert('Failed to load TurndownService')
            }
            document.head.appendChild(script)
            await new Promise((resolve, reject) => {
                script.onload = resolve
                script.onerror = reject
            })
        }
    }
    await loadTurndown()

    // https://github.com/mixmark-io/turndown?tab=readme-ov-file#options
    const turndownService = new TurndownService({
        headingStyle: 'atx',
        hr: '---',
        bulletListMarker: '-',
        codeBlockStyle: 'fenced',
        fence: '```',
        emDelimiter: '*',
        strongDelimiter: '**',
        linkStyle: 'inlined',
        linkReferenceStyle: 'full',
    })

    const showResultInDOM = document.getElementById('selection2md') !== null

    function copySelectionToClipboard() {
        // Get the current selection
        const selection = document.getSelection()
        // no text selected
        if (!selection.rangeCount) {
            return
        }

        // Create a new range from the current selection
        const range = selection.getRangeAt(0)
        // Check if the selection is collapsed (no actual selection)
        if (range.collapsed) {
            console.log('Selection is collapsed, nothing to copy.')
            return
        }

        // Wrap selected nodes in their parent elements' HTML tags
        let commonAncestor = range.commonAncestorContainer
        if (commonAncestor.nodeType === Node.TEXT_NODE && commonAncestor.parentNode !== null) {
            commonAncestor = commonAncestor.parentNode
            // if commonAncestor.parentNode is <code> or <pre>, go up one more level recursively until it's not a code block
            while (commonAncestor.parentNode !== null && commonAncestor.parentNode.nodeName === 'CODE' || commonAncestor.parentNode.nodeName === 'PRE') {
                commonAncestor = commonAncestor.parentNode
            }
        }

        const clonedContents = range.cloneContents()
        const tempDiv = document.createElement('div')
        tempDiv.appendChild(clonedContents)
        // sanitize tempDiv.innerHTML by removing empty tags and empty text nodes
        tempDiv.querySelectorAll('*').forEach(el => {
            if (el.textContent.trim() === '') {
                el.remove()
            }
        })

        let contentInHTML = commonAncestor.outerHTML.replace(commonAncestor.innerHTML, tempDiv.innerHTML)
        // if contentInHTML is a <pre>, append a <code> child element with its innerHTML
        if (contentInHTML.startsWith('<pre>')) {
            const preContent = contentInHTML.slice(5, -6)
            contentInHTML = `<pre><code>${preContent}</code></pre>`
        }

        // convert the HTML content to Markdown
        const contentInMarkdown = turndownService.turndown(contentInHTML)

        navigator.clipboard.writeText(contentInMarkdown).then(() => {
            if (showResultInDOM) {
                document.getElementById('selection2md').innerHTML = `<pre>${contentInMarkdown}</pre>`
            }
        }).catch(err => {
            console.error('Error caught while writing to clipboard:', err)
            if (showResultInDOM) {
                document.getElementById('selection2md').innerText = `Error caught while writing to clipboard: ${err.message}`
            }
        })
    }

    document.addEventListener('copy', e => {
        e.preventDefault()
        setTimeout(copySelectionToClipboard, 0)
    })
})()

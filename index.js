(async function () {
    // Check if Clipboard API is available
    if (!navigator.clipboard) {
        console.error('Clipboard API not available')
        // alert('Clipboard API not available')
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

        const div = document.createElement('div')
        // Wrap selected nodes in their parent elements' HTML tags
        let commonAncestor = range.commonAncestorContainer
        if (commonAncestor.nodeType === Node.TEXT_NODE) {
            commonAncestor = commonAncestor.parentNode
        }

        const clonedContents = range.cloneContents()
        const tempDiv = document.createElement('div')
        tempDiv.appendChild(clonedContents)

        div.innerHTML = commonAncestor.outerHTML.replace(commonAncestor.innerHTML, tempDiv.innerHTML)

        // convert the HTML content to Markdown
        const htmlContentInMarkdown = turndownService.turndown(div.innerHTML)
        // write the markdown content to the clipboard
        navigator.clipboard.writeText(htmlContentInMarkdown).then(() => {
            if (showResultInDOM) {
                document.getElementById('selection2md').innerHTML = `<pre>${htmlContentInMarkdown}</pre>`
            }
        }).catch(err => {
            console.error('Error caught while writing to clipboard:', err)
            if (showResultInDOM) {
                document.getElementById('selection2md').innerText = `Error caught while writing to clipboard: ${err.message}`
            }
        })
    }

    document.addEventListener('mouseup', () => {
        // Delay the execution to ensure selection is updated
        setTimeout(copySelectionToClipboard, 0)
    })

    document.addEventListener('keyup', (event) => {
        if (event.key === 'Shift' || event.key === 'ArrowRight' || event.key === 'ArrowLeft' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            // Delay the execution to ensure selection is updated
            setTimeout(copySelectionToClipboard, 0)
        }
    })
})()

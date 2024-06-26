(async function () {
    // Check if Clipboard API is available
    if (!navigator.clipboard) {
        console.error('Clipboard API not available');
        alert('Clipboard API not available');
        return;
    }

    // Create a new instance of TurndownService, import TurndownService from the CDN if not already available
    async function loadTurndown() {
        if (typeof TurndownService === 'undefined') {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/turndown/dist/turndown.js';
            // script.onload = () => {
            //     console.log('TurndownService loaded');
            // };
            script.onerror = () => {
                console.error('Failed to load TurndownService');
                alert('Failed to load TurndownService');
            }
            document.head.appendChild(script);
            await new Promise((resolve, reject) => {
                script.onload = resolve;
                script.onerror = reject;
            });
        }
    }
    await loadTurndown();

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
    });

    const showResultInDOM = document.getElementById('selection2md') !== null;

    function copySelectionToClipboard() {
        // Get the current selection
        const selection = document.getSelection();
        // no text selected
        if (!selection.rangeCount) {
            return;
        }

        // Create a new range from the current selection
        const range = selection.getRangeAt(0);
        // Check if the selection is collapsed (no actual selection)
        if (range.collapsed) {
            console.log('Selection is collapsed, nothing to copy.');
            return;
        }

        // Wrap selected nodes in their parent elements' HTML tags
        let commonAncestor = range.commonAncestorContainer;
        if (commonAncestor.nodeType === Node.TEXT_NODE && commonAncestor.parentNode !== null) {
            commonAncestor = commonAncestor.parentNode;
            // if commonAncestor.parentNode is <code> or <pre>, go up one more level recursively until it's not a code block
            while (commonAncestor.parentNode !== null && commonAncestor.parentNode.nodeName === 'CODE' || commonAncestor.parentNode.nodeName === 'PRE') {
                commonAncestor = commonAncestor.parentNode;
            }
        }

        const clonedContents = range.cloneContents();
        const tempDiv = document.createElement('div');
        tempDiv.appendChild(clonedContents);
        // sanitize tempDiv.innerHTML by removing empty tags and empty text nodes
        tempDiv.querySelectorAll('*').forEach(el => {
            if (el.textContent.trim() === '') {
                el.remove();
            }
        });

        /* console.log('commonAncestor.outerHTML:', commonAncestor.outerHTML);
        console.log('commonAncestor.innerHTML:', commonAncestor.innerHTML);
        console.log('tempDiv.innerHTML:', tempDiv.innerHTML); */
        let contentInHTML = commonAncestor.outerHTML.replace(commonAncestor.innerHTML, tempDiv.innerHTML);
        // console.log('contentInHTML:', contentInHTML)

        // if contentInHTML is a <pre> and that <pre> has no <code> as a child, wrap its content in a <code> tag and make the <code> as <pre>'s only child
        if (contentInHTML.startsWith('<pre') && !contentInHTML.includes('<code')) {
            const tempElement = document.createElement('div');
            tempElement.innerHTML = contentInHTML;

            // Find the <pre> tag
            const tempPre = tempElement.querySelector('pre');
            if (tempPre) {
                // Create a <code> tag
                const tempCode = document.createElement('code');
                // Set the <code> tag's content to be the inner content of the <pre> tag
                tempCode.innerHTML = tempPre.innerHTML;

                // Clear the <pre> tag's content
                tempPre.innerHTML = '';
                // Append the <code> tag as the only child of the <pre> tag
                tempPre.appendChild(tempCode);
                contentInHTML = tempPre.outerHTML;
                // console.log('contentInHTML wrapped:', contentInHTML);
            }
        }

        // convert the HTML content to Markdown
        const contentInMarkdown = turndownService.turndown(contentInHTML);
        // console.log('contentInMarkdown:', contentInMarkdown);

        navigator.clipboard.writeText(contentInMarkdown).then(() => {
            if (showResultInDOM) {
                document.getElementById('selection2md').innerHTML = `<pre>${contentInMarkdown}</pre>`;
            }
        }).catch(err => {
            console.error('Error caught while writing to clipboard:', err);
            if (showResultInDOM) {
                document.getElementById('selection2md').innerText = `Error caught while writing to clipboard: ${err.message}`;
            }
        });
    }

    document.addEventListener('copy', e => {
        e.preventDefault();
        setTimeout(copySelectionToClipboard, 0);
    });
})()

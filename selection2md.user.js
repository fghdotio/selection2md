// ==UserScript==
// @name         selection2md
// @namespace    https://funfungho.com/
// @version      2024-06-26
// @description  Convert selected content on a web page to Markdown format. The selection is copied, converted to Markdown, and put back into the clipboard.
// @author       funfungho
// @match        https://learning-oreilly-com.ezproxy.bpl.org/library/view/programming-rust-2nd/9781492052586/ch08.html
// @require      https://unpkg.com/turndown/dist/turndown.js
// @require      https://raw.githubusercontent.com/funfungho/selection2md/main/index.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bpl.org
// @grant        none
// ==/UserScript==


(function () {
    'use strict';

    // Your code here...
    console.log(typeof TurndownService, typeof initSelection2md);
    initSelection2md();
})();

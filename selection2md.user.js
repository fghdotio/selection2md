// ==UserScript==
// @name         selection2md
// @namespace    https://funfungho.com/
// @version      2024-06-26
// @description  Convert selected content on a web page to Markdown format. The selection is copied, converted to Markdown, and put back into the clipboard.
// @author       funfungho
// @match <protocol>://<domain><path>
// @require      https://unpkg.com/turndown/dist/turndown.js
// @require      https://raw.githubusercontent.com/funfungho/selection2md/main/index.js
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bpl.org
// @grant        none
// ==/UserScript==


(function () {
    'use strict';

    // Your code here...
    initSelection2md();
})();

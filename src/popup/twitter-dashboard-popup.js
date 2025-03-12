/**
 * twitter-dashboard
 *
 * twitter-dashboard-popup.js
 *
 * @namespace twitter-dashboard-popup
 * @property {twitter-dashboard-popup.module:twitter-dashboard-popup} twitter-dashboard-popup webext popup module
 */

import sanitizeHtml from 'sanitize-html'

(async function () {
    /**
     * @memberof twitter-dashboard-popup
     * @module twitter-dashboard-popup
     */

    /**
     * @memberof twitter-dashboard-popup
     * @typedef {configObject} config twitter-dashboard-popup config object
     */

    /**
     * @memberof twitter-dashboard-popup.module:twitter-dashboard-popup
     * @type {configObject}
     */
    const config = {
        debug: true,
        selectors: {
            content: '#popup-content',
            header: '#popup-content-header'
        }
    }

    /**
     * easter egg
     * @memberof twitter-dashboard-popup.module:twitter-dashboard-popup
     */
    async function egg() {
        // get header
        const header = document.querySelector(config.selectors.header)
        // check if easter egg was triggered
        if (header.childNodes[4]) {
            header.childNodes[1].toggleAttribute('hidden')
            header.childNodes[4].toggleAttribute('hidden')
        } else {
            // hide header text
            header.childNodes[1].toggleAttribute('hidden')
            // load egg from template
            const range = document.createRange()
            const eggTemplate = (await (await fetch('/templates/egg.html')).text())
            const popup = {
                allowedTags: ['template', 'img'],
                allowedAttributes: { 'template': ['id'], 'img': ['src'] }
            }
            const sanitized = sanitizeHtml(eggTemplate, popup)
            const eggFrag = range.createContextualFragment(sanitized)
            document.body.appendChild(eggFrag)
            const template = document.getElementById('egg-template')
            const clone = template.content.cloneNode(true)
            header.appendChild(clone)
        }
    }

    /**
     * add click listeners to html elements
     * @memberof twitter-dashboard-popup.module:twitter-dashboard-popup
     */
    function addClickListener() {
        const header = document.querySelector(config.selectors.header)
        header.addEventListener('click', (e) => {
            egg()
        })
    }

    /**
     * popup
     * main
     * @memberof twitter-dashboard-popup.module:twitter-dashboard-popup
     */
    function popup() {
        addClickListener()
    }

    popup()

})();
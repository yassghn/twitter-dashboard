/**
 * twitter-dashboard
 *
 * twitter-dashboard.js
 *
 * @module twitter-dashboard
 */
import $ from 'jquery'
import sanitizeHtml from 'sanitize-html'

(async () => {
    'use strict'

    /**
     * @memberof module:twitter-dashboard
     * @typedef {css} string css
     */
    /**
     * @memberof module:twitter-dashboard
     * @typedef {html} string html
     */

    /**
     * @memberof module:twitter-dashboard
     * @type {configObject}
     */
    const config = {
        debug: true,
        projectName: 'twitter-dashboard',
        selectors: {
            dashboardTemplate: '#dashboard-template'
        }
    }

    /**
     * takes [upto] two arguments
     * logs to stdout or stderr
     * @memberof module:twitter-dashboard
     * @param {*} msg object or string
     * @param {boolean} [err] flag indicating to log to error
     */
    function log(msg, err = false) {
        if (config.debug) {
            if (!err)
                console.log(msg)
            else
                console.error(msg)
        }
    }

    /**
     * return dashboard css
     * @memberof module:twitter-dashboard
     * @returns {css} css string
     */
    async function getDashboardCss() {
        // fetch css
        const url = browser.runtime.getURL('/templates/dashboard.css')
        const css = (await (await fetch(url)).text())
        return css
    }

    /**
     * return dashboard template
     * @memberof module:twitter-dashboard
     * @returns {html} html element string
     */
    async function getDashboardTemplate() {
        // fetch template
        const url = browser.runtime.getURL('/templates/dashboard.html')
        const dashboardTemplate = (await (await fetch(url)).text())
        // sanitize
        const options = {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['template']),
            allowedAttributes: sanitizeHtml.defaults.allowedAttributes
        }
        options.allowedAttributes.template = ['id']
        options.allowedAttributes.div = ['id']
        const sanitized = sanitizeHtml(dashboardTemplate, options)
        return sanitized
    }

    /**
     * insert dashboard html
     * @memberof module:twitter-dashboard
     */
    async function insertHtml() {
        // get template
        const dashboardTemplate = await getDashboardTemplate()
        // insert template to shadow dom
        const range = document.createRange()
        const frag = range.createContextualFragment(dashboardTemplate)
        document.body.appendChild(frag)
        // clone template
        const template = document.querySelector(config.selectors.dashboardTemplate)
        const clone = template.content.cloneNode(true)
        // remove existing html
        $('div').eq(0).html(sanitizeHtml(''))
        // append
        document.body.appendChild(clone)
    }

    /**
     * insert style element with css into document body
     * @memberof module:twitter-dashboard
     */
    async function insertCss() {
        let style = document.createElement('style')
        style.dataset.insertedBy = config.projectName
        style.dataset.role = 'features'
        style.textContent = await getDashboardCss()
        document.head.appendChild(style)
    }

    /**
     * load dashboard html/css
     * @memberof module:twitter-dashboard
     */
    function loadDashboard() {
        document.body.style.border = '5px red dashed'
        log(`LOOK AT THIS PIECE OF SHIT ${$('div')[0]}`)
        insertCss()
        insertHtml()
    }

    /**
     * main
     * @memberof module:twitter-dashboard
     */
    function twitterDashboard() {
        loadDashboard()
    }

    window.onload = twitterDashboard()

})();
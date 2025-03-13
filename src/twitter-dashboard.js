/**
 * twitter-dashboard
 *
 * twitter-dashboard.js
 *
 * @namespace twitter-dashboard
 * @property {twitter-dashboard.module:twitter-dashboard} twitter-dashboard webext main content module
 */

import $ from 'jquery'
import sanitizeHtml from 'sanitize-html'
import { config, log, logObj } from './modules/util.mjs'

(async () => {
    /**
     * @memberof twitter-dashboard
     * @module twitter-dashboard
     */

    'use strict'

    /**
     * @memberof twitter-dashboard
     * @typedef {css} string css
     */

    /**
     * @memberof twitter-dashboard
     * @typedef {html} string html
     */

    /**
     * @memberof twitter-dashboard
     * @typedef {configObject} config twitter-dashboard config object
     */

    /**
     * return dashboard css
     * @memberof twitter-dashboard.module:twitter-dashboard
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
     * @memberof twitter-dashboard.module:twitter-dashboard
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
     * @memberof twitter-dashboard.module:twitter-dashboard
     */
    async function insertHtml() {
        // get template
        const dashboardTemplate = await getDashboardTemplate()
        // insert template to shadow dom
        const range = document.createRange()
        const frag = range.createContextualFragment(dashboardTemplate)
        const sanitized = sanitizeHtml(frag)
        document.body.appendChild(sanitized)
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
     * @memberof twitter-dashboard.module:twitter-dashboard
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
     * @memberof twitter-dashboard.module:twitter-dashboard
     */
    function loadDashboard() {
        document.body.style.border = '5px red dashed'
        log(`LOOK AT THIS PIECE OF SHIT ${$('div')[0]}`)
        insertCss()
        insertHtml()
    }

    /**
     * main
     * @memberof twitter-dashboard.module:twitter-dashboard
     */
    function twitterDashboard() {
        loadDashboard()
    }

    window.onload = twitterDashboard()

})();
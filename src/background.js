/**
* twitter-dashboard
*
* background.js
*
* @namespace background
* @property {background.module:background} background webext background work
* @property {background.module:util} util config/logging
* @property {background.module:whitelist} whitelist whitelisting
*/

import { config, log, logObj } from './background/util.mjs'
import whitelist from './background/whitelist.mjs'

(async () => {
    /**
     * background.js
     *
     * @memberof background
     * @module background
     */

    'use strict'

    /**
     * @memberof background
     * @typedef {twitterApiObject} object twitter api response object
     */

    /**
     * @memberof background
     * @typedef {webApiObject} object webapi object
    */

    /**
     * takes url as string
     * returns configured api target
     * @memberof background.module:background
     * @param {string} url
     * @returns {string} string or undefined
     */
    function isTargetUrl(url) {
        log(url)
        return Object.values(config.apiTargets).find((item) => url.includes(item))
    }

    // monitor headers received
    function logHeadersReceived(headerDetails) {
        if (isTargetUrl(headerDetails.url)) {
            log(`<START>[HEADERS RECEIVED: #${headerDetails.requestId}]: ${headerDetails.url}`)
            logObj(headerDetails)
        }
    }

    function logAllHeadersReceived() {
        browser.webRequest.onHeadersReceived.addListener(logHeadersReceived, { urls: ['<all_urls>'] }, ['responseHeaders'])
    }

    // monitor all request responses
    function logRequestResponse(responseDetails) {
        if (isTargetUrl(responseDetails.url)) {
            log(`<START>[RESPONSE DETAILS: #${responseDetails.requestId}]: ${responseDetails.url}`)
            logObj(responseDetails)
        }
    }

    function logAllRequestResponses() {
        browser.webRequest.onResponseStarted.addListener(logRequestResponse, { urls: ['<all_urls>'] }, ['responseHeaders'])
    }

    /**
     * takes 2 arguments
     * aggregate request data chunks and filter twitter api data object
     * @memberof background.module:background
     * @param {number} requestId positive integer representing request id
     * @param {string} target configured api target
     */
    function filterResponse(requestId, target) {
        let filter = browser.webRequest.filterResponseData(requestId)
        let decoder = new TextDecoder('utf-8')
        let encoder = new TextEncoder()

        // many responses are split into large chunks
        // aggregate those chunks within an array
        let dataChunks = []

        filter.ondata = (event) => {
            // get event data
            let data = decoder.decode(event.data, { stream: true })
            //log(`<*>[FILTER DATA: #${requestId}]:`)
            //logObj(event)
            //logObj(data)
            dataChunks.push(data)
        }

        filter.onstop = async (event) => {
            try {
                log(`<END>[REUQEST DETAILS: #]:${requestId}`)
                // check if we need to apply whitelist
                if (config.options.whitelist != undefined) {
                    // check if we got data
                    if (dataChunks.length > 0) {
                        // get request json as a single json object
                        let dataObj = JSON.parse(dataChunks.join(''))
                        logObj(dataObj)
                        // delete unwhitelisted entries
                        dataObj = whitelist.apply(dataObj, target)
                        logObj(dataObj)
                        filter.write(encoder.encode(JSON.stringify(dataObj)))
                    }
                }
            } catch (e) {
                log(e, true)
            } finally {
                // disconnect filter
                filter.disconnect()
            }
        }
    }

    /**
     * takes 1 argument
     * initiate filtering responses for configured api targets
     * @memberof background.module:background
     * @param {webApiObject} requestDetails webapi object
     */
    function requestListener(requestDetails) {
        // check if whitelisting is enabled
        if (config.options.whitelistEnabled) {
            // only process configured api targets
            const target = isTargetUrl(requestDetails.url)
            if (target !== undefined) {
                log(`target: ${target}`)
                log(`<START>[REUQEST DETAILS: #${requestDetails.requestId}]:`)
                logObj(requestDetails)
                filterResponse(requestDetails.requestId, target)
            }
        }
    }

    /**
     * add blocking request listener for all urls and attach request body
     */
    function addRequestListener() {
        browser.webRequest.onBeforeRequest.addListener(requestListener, { urls: ['<all_urls>'] }, ['blocking', 'requestBody'])
    }

    /**
     * get options from local storage
     * @memberof background.module:background
     */
    async function loadOptions() {
        // get options from storage
        // get whitelistEnabled
        const whitelistEnabled = await browser.storage.local.get('whitelistEnabled')
        config.options.whitelistEnabled = (whitelistEnabled === undefined) ? false : whitelistEnabled.whitelistEnabled
        // get whitelist from options
        const whitelist = await browser.storage.local.get('whitelist')
        if (whitelist != undefined) {
            config.options.whitelist = whitelist.whitelist
        }
        logObj(config.options)
    }

    /**
     * listen for local storage changes
     * @memberof background.module:background
     */
    function addOptionsListener() {
        browser.storage.local.onChanged.addListener(loadOptions)
    }

    /**
     * main
     * begin twitter-dashboard background processing
     * @memberof background.module:background
     */
    function startBackground() {
        loadOptions()
        addOptionsListener()
        addRequestListener()
        //logAllHeadersReceived()
        //logAllRequestResponses()
    }

    startBackground()

})();
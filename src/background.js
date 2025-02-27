/*
* twitter-dashboard
*
* background.js
*/

(async () => {
    'use strict'

    const config = {
        debug: true,
        options: {},
        apiTargets: {
            userTweets: 'UserTweets?',
            tweetDetail: 'TweetDetail?'
        }
    }

    function log(msg, err = false) {
        if (config.debug) {
            if (!err)
                console.log(msg)
            else
                console.error(msg)
        }
    }

    function isTargetUrl(url) {
        // uncomment to use all urls
        //return true
        return Object.values(config.apiTargets).find((item) => url.includes(item))
    }

    // monitor headers received
    function logHeadersReceived(headerDetails) {
        if (isTargetUrl(headerDetails.url)) {
            log(`<START>[HEADERS RECEIVED: #${headerDetails.requestId}]: ${headerDetails.url}`)
            log(headerDetails)
        }
    }

    function logAllHeadersReceived() {
        browser.webRequest.onHeadersReceived.addListener(logHeadersReceived, { urls: ['<all_urls>'] }, ['responseHeaders'])
    }

    // monitor all request responses
    function logRequestResponse(responseDetails) {
        if (isTargetUrl(responseDetails.url)) {
            log(`<START>[RESPONSE DETAILS: #${responseDetails.requestId}]: ${responseDetails.url}`)
            log(responseDetails)
        }
    }

    function logAllRequestResponses() {
        browser.webRequest.onResponseStarted.addListener(logRequestResponse, { urls: ['<all_urls>'] }, ['responseHeaders'])
    }

    function whitelistUserTweets(data) {
        // get reference to instructions
        const instructions = data?.data?.user?.result?.timeline_v2?.timeline?.instructions
        // interate instruction entries
        //for (let entry of instructions[2].entries) {
        let indices = []
        // collect indices of entries to remove
        instructions[2].entries.forEach((entry, index) => {
            if (entry?.content?.entryType === "TimelineTimelineItem") {
                log(entry)
                // get screen_name of post
                let screen_name = ''
                if (entry.content.itemContent.tweet_results.result.legacy.retweeted_status_result == undefined) {
                    screen_name = entry.content.itemContent.tweet_results.result.core.user_results.result.legacy.screen_name
                } else {
                    screen_name = entry.content.itemContent.tweet_results.result.legacy.retweeted_status_result.result.core.user_results.result.legacy.screen_name
                }
                // aggregate index to delete entry
                if (screen_name != '') {
                    log(screen_name)
                    if (config.options.whitelist.includes(screen_name)) {
                        indices.push(index)
                    }
                }
            }
        })
        // filter out aggregated indices
        instructions[2].entries = instructions[2].entries.filter((entry, index) => {
            if (indices.includes(index)) {
                return true
            }
        })
        log(instructions[2].entries)
        return data
    }

    function applyWhiteList(data, target) {
        // whitelist strategy based on api target
        switch (true) {
            case (target === config.apiTargets.userTweets):
                return whitelistUserTweets(data)
            default:
                return undefined
        }
    }

    function filterResponse(requestId, target) {
        let filter = browser.webRequest.filterResponseData(requestId)
        let decoder = new TextDecoder('utf-8')
        let encoder = new TextEncoder()

        let dm = new Map()
        dm.set(requestId, [])

        filter.ondata = (event) => {
            // get event data
            let data = decoder.decode(event.data, { stream: true })
            log(`<*>[FILTER DATA: #${requestId}]:`)
            log(event)
            log(data)
            dm.get(requestId).push(data)
            //filter.write(encoder.encode(data))
        }

        filter.onstop = async (event) => {
            log(`<END>[REUQEST DETAILS: #]:${requestId}`)
            // check if we got data
            if (dm.get(requestId).length > 0) {
                // check if we need to apply whitelist
                try {
                    log(`<END>[REUQEST DETAILS: #]:${requestId}`)
                    if (config.options.whitelist != undefined) {
                        // get request json as json object
                        let dataObj = JSON.parse(dm.get(requestId).join())
                        log(dataObj)
                        // delete unwhitelisted entries
                        dataObj = applyWhiteList(dataObj, target)
                        log(dataObj)
                        filter.write(encoder.encode(JSON.stringify(dataObj)))
                    }
                } catch (e) {
                    log(e, true)
                }
            }
            // disconnect filter
            filter.disconnect()
        }
    }

    function requestListener(requestDetails) {
        const target = isTargetUrl(requestDetails.url)
        log(target)
        if (target !== undefined) {
            log(`<START>[REUQEST DETAILS: #${requestDetails.requestId}]:`)
            log(requestDetails)
            filterResponse(requestDetails.requestId, target)
        }
    }

    function addRequestListener() {
        browser.webRequest.onBeforeRequest.addListener(requestListener, { urls: ['<all_urls>'] }, ['blocking', 'requestBody'])
    }

    async function loadOptions() {
        // get whitelist from options
        const whitelist = await browser.storage.local.get('whitelist')
        if (whitelist != undefined) {
            config.options.whitelist = whitelist.whitelist
        }
        log(config.options)
    }

    function addOptionsListener() {
        browser.storage.local.onChanged.addListener(loadOptions)
    }

    function startBackground() {
        loadOptions()
        addOptionsListener()
        addRequestListener()
        logAllHeadersReceived()
        logAllRequestResponses()
    }

    startBackground()

})();
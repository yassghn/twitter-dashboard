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
            tweetDetail: 'TweetDetail?',
            homeTimeline: 'HomeTimeline'
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
        log(url)
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

    function removeTimelineItems(instructions, index, indices) {
        // filter out aggregated indices
        instructions[index].entries = instructions[index].entries.filter((entry, index) => !indices.includes(index))
    }

    function whitelistUserTweets(data) {
        // get reference to instructions
        const instructions = data?.data?.user?.result?.timeline_v2?.timeline?.instructions
        // get entries
        const index = instructions.findIndex((item) => item.type === 'TimelineAddEntries')
        const entries = instructions[index].entries
        // interate instruction entries
        //for (let entry of instructions[2].entries) {
        let indices = []
        // collect indices of entries to remove
        entries.forEach((entry, i) => {
            if (entry?.content?.entryType === "TimelineTimelineItem") {
                log(entry)
                // get screen_name of post
                let screen_name = ''
                if (entry.content.itemContent.tweet_results.result.legacy == undefined) {
                    screen_name = entry.content.itemContent.tweet_results.result.tweet.legacy.retweeted_status_result.result.tweet.core.user_results.result.legacy.screen_name
                } else if (entry.content.itemContent.tweet_results.result.legacy.retweeted_status_result == undefined) {
                    screen_name = entry.content.itemContent.tweet_results.result.core.user_results.result.legacy.screen_name
                } else {
                    screen_name = entry.content.itemContent.tweet_results.result.legacy.retweeted_status_result.result.core.user_results.result.legacy.screen_name
                }
                // aggregate index to delete entry
                if (screen_name != '') {
                    if (!config.options.whitelist.includes(screen_name)) {
                        indices.push(i)
                    }
                }
            }
        })
        // todo: cannot remove whole entry, breaks tl loading
        removeTimelineItems(instructions, index, indices)
        return data
    }

    function whitelistTweetDetails(data) {
        // get reference to instructions
        const instructions = data?.data?.threaded_conversation_with_injections_v2?.instructions
        // get entries
        const index = instructions.findIndex((item) => item.type === 'TimelineAddEntries')
        const entries = instructions[index].entries
        // interate instruction entries
        //for (let entry of instructions[2].entries) {
        let indices = []
        // collect indices of entries to remove
        entries.forEach((entry, i) => {
            log(entry)
            if (entry?.content?.entryType === "TimelineTimelineItem" ||
                entry?.content?.entryType === "TimelineTimelineModule") {
                // get screen_name of timeline item entry
                let screen_name = ''
                if (entry.content.itemContent == undefined) {
                    screen_name = entry.content.items[0].item.itemContent.tweet_results.result.core.user_results.result.legacy.screen_name
                } else if (entry.content.itemContent.tweet_results !== undefined &&
                    entry.content.itemContent.itemType !== 'TimelineTimelineCursor') {
                    screen_name = entry.content.itemContent.tweet_results.result.core.user_results.result.legacy.screen_name
                }
                // aggregate index to delete entry
                if (screen_name != '') {
                    if (!config.options.whitelist.includes(screen_name)) {
                        indices.push(i)
                    }
                }
            }
        })
        // filter out aggregated indices
        removeTimelineItems(instructions, index, indices)
        log(instructions[index].entries)
        return data
    }

    // whitelist home timeline
    function whitelistHomeTimeline(data) {
        // get reference to instructions
        const instructions = data?.data?.home?.home_timeline_urt?.instructions
        // get entries
        const index = instructions.findIndex((item) => item.type === 'TimelineAddEntries')
        const entries = instructions[index].entries
        // interate instruction entries
        //for (let entry of instructions[2].entries) {
        let indices = []
        // collect indices of entries to remove
        entries.forEach((entry, i) => {
            log(entry)
            if (entry?.content?.entryType === "TimelineTimelineItem") {
                // get screen_name of timeline item entry
                let screen_name = ''
                if (entry.content.itemContent.tweet_results.result.core == undefined) {
                    screen_name = entry.content.itemContent.tweet_results.result.tweet.core.user_results.result.legacy.screen_name
                }
                else {
                    screen_name = entry.content.itemContent.tweet_results.result.core.user_results.result.legacy.screen_name
                }
                // aggregate index to delete entry
                if (screen_name != '') {
                    if (!config.options.whitelist.includes(screen_name)) {
                        indices.push(i)
                    }
                }
            }
        })
        // filter out aggregated indices
        removeTimelineItems(instructions, index, indices)
        log(instructions[index].entries)
        return data
    }

    function applyWhiteList(data, target) {
        // whitelist strategy based on api target
        switch (true) {
            case (target === config.apiTargets.userTweets):
                return whitelistUserTweets(data)
            case (target === config.apiTargets.tweetDetail):
                return whitelistTweetDetails(data)
            case (target === config.apiTargets.homeTimeline):
                return whitelistHomeTimeline(data)
            default:
                return undefined
        }
    }

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
            log(`<*>[FILTER DATA: #${requestId}]:`)
            log(event)
            log(data)
            dataChunks.push(data)
            //filter.write(encoder.encode(data))
        }

        filter.onstop = async (event) => {
            log(`<END>[REUQEST DETAILS: #]:${requestId}`)
            try {
                log(`<END>[REUQEST DETAILS: #]:${requestId}`)
                // check if we need to apply whitelist
                if (config.options.whitelist != undefined) {
                    // check if we got data
                    if (dataChunks.length > 0) {
                        // get request json as a single json object
                        let dataObj = JSON.parse(dataChunks.join(''))
                        log(dataObj)
                        // delete unwhitelisted entries
                        dataObj = applyWhiteList(dataObj, target)
                        log(dataObj)
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

    function requestListener(requestDetails) {
        // check if whitelisting is enabled
        if (config.options.whitelistEnabled) {
            // only process configured api targets
            const target = isTargetUrl(requestDetails.url)
            if (target !== undefined) {
                log(`target: ${target}`)
                log(`<START>[REUQEST DETAILS: #${requestDetails.requestId}]:`)
                log(requestDetails)
                filterResponse(requestDetails.requestId, target)
            }
        }
    }

    function addRequestListener() {
        browser.webRequest.onBeforeRequest.addListener(requestListener, { urls: ['<all_urls>'] }, ['blocking', 'requestBody'])
    }

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
        log(config.options)
    }

    function addOptionsListener() {
        browser.storage.local.onChanged.addListener(loadOptions)
    }

    function startBackground() {
        loadOptions()
        addOptionsListener()
        addRequestListener()
        //logAllHeadersReceived()
        //logAllRequestResponses()
    }

    startBackground()

})();
/**
* twitter-dashboard
*
* background.js
*
* @module background
*/
(async () => {
    'use strict'

    /** @typedef {configObject} object config object */
    /**
     * @memberof module:background
     * @typedef {twitterApiObject} object twitter api response object
     */
    /**
     * @memberof module:background
     * @typedef {webApiObject} object webapi object
    */

    /**
     * @memberof module:background
     * @type {configObject}
     * */
    const config = {
        debug: true,
        options: {},
        apiTargets: {
            userTweets: 'UserTweets?',
            tweetDetail: 'TweetDetail?',
            homeTimeline: 'HomeTimeline',
            searchTimeline: 'SearchTimeline?'
        }
    }

    /**
     * takes [upto] two arguments
     * logs to stdout or stderr
     * @memberof module:background
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
     * takes [upto] two arguments
     * use console.dir to log an object with a specified depth
     * @param {*} obj object
     * @param {number} depth number indicating object depth to log
     */
    function logObj(obj, depth = null) {
        if (config.debug) {
            console.dir(obj, { depth: depth }, true)
        }
    }

    /**
     * takes url as string
     * returns configured api target
     * @memberof module:background
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
     * takes 3 arguments
     * filters out entries from twitterApiObject instructions
     * @memberof module:background
     * @param {twitterApiObject} instructions twitter api object
     * @param {number} index positive integer representing element in instructions
     * @param {number[]} indices aggregated indices to filter out of instructions
     */
    function removeTimelineItems(instructions, index, indices) {
        // filter out aggregated indices
        instructions[index].entries = instructions[index].entries.filter((entry, index) => !indices.includes(index))
    }

    /**
     * takes 3 arguments
     * filters out usersResults from twitterApiObject instructions
     * @memberof module:background
     * @param {twitterApiObject} instructions twitter api object
     * @param {number} index positive integer representing element in instructions
     * @param {number[]} indices aggregated indices to filter out of instructions
     */
    function removeAlerts(instructions, index, indices) {
        // filter out aggregated indices
        instructions[index].usersResults = instructions[index].usersResults.filter((entry, index) => !indices.includes(index))
    }

    /**
     * takes 3 arguments
     * @memberof module:background
     * @callback strategyCallback
     * @param {twitterApiObject} entry twitter api object
     * @param {number[]} indices array to aggregate entry indices for filtering
     * @param {number} index positive integer representing current index of entry
     */

    /**
     * user tweets api target whitelisting strategy
     * @memberof module:background
     * @type {strategyCallback}
     */
    function whitelistUserTweets(entry, indices, index) {
        if (entry?.content?.entryType === "TimelineTimelineItem") {
            log(entry)
            // get screen_name of post
            let screen_name = ''
            if (entry.content.itemContent.tweet_results.result.legacy == undefined) {
                if (entry.content.itemContent.tweet_results.result.tweet.legacy.retweeted_status_result == undefined) {
                    screen_name = entry.content.itemContent.tweet_results.result.tweet.core.user_results.result.legacy.screen_name
                } else {
                    screen_name = entry.content.itemContent.tweet_results.result.tweet.legacy.retweeted_status_result.result.tweet.core.user_results.result.legacy.screen_name
                }
            } else if (entry.content.itemContent.tweet_results.result.legacy.retweeted_status_result == undefined) {
                screen_name = entry.content.itemContent.tweet_results.result.core.user_results.result.legacy.screen_name
            } else {
                screen_name = entry.content.itemContent.tweet_results.result.legacy.retweeted_status_result.result.core.user_results.result.legacy.screen_name
            }
            // aggregate index to delete entry
            if (screen_name != '') {
                if (!config.options.whitelist.includes(screen_name)) {
                    indices.push(index)
                }
            }
        }
    }

    /**
     * tweet details api target whitelisting strategy
     * @memberof module:background
     * @type {strategyCallback}
     */
    function whitelistTweetDetails(entry, indices, index) {
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
                    indices.push(index)
                }
            }
        }
    }

    /**
     * hometimeline api target whitelisting strategy
     * @memberof module:background
     * @type {strategyCallback}
     */
    function whitelistHomeTimeline(entry, indices, index) {
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
                    indices.push(index)
                }
            }
        }
    }

    /**
     * takes 3 arguments
     * @memberof module:background
     * @param {twitterApiObject} result twitter api object
     * @param {number[]} indices array to aggregate entry indices for filtering
     * @param {number} index positive integer representing current index of entry
     */
    function whitelistAlerts(result, indices, index) {
        let screen_name = result.result.legacy.screen_name
        if (!config.options.whitelist.includes(screen_name)) {
            indices.push(index)
        }
    }

    /**
     * takes 2 arguments
     * filter twitter api object
     * @memberof module:background
     * @param {twitterApiObject} data twitter api object
     * @param {twitterApiObject} instructions twitter api object
     * @returns {twitterApiObject} filtered twitter api object
     */
    function whitelistTimelineShowAlert(data, instructions) {
        // get entries
        const index = instructions.findIndex((item) => item.type === 'TimelineShowAlert')
        if (index != -1) {
            const usersResults = instructions[index].usersResults
            // interate instruction usersresults
            let indices = []
            // collect indices of results to remove
            usersResults.forEach((result, i) => {
                logObj(result)
                whitelistAlerts(result, indices, i)
            })
            // filter out aggregated indices
            removeAlerts(instructions, index, indices)
            logObj(instructions[index].usersResults)
        }
        return data
    }

    /**
     * takes 3 arguments
     * filter twitter api object based on api target strategy
     * @memberof module:background
     * @param {twitterApiObject} data twitter api object
     * @param {twitterApiObject} instructions twitter api object
     * @param {strategyCallback} strategy api target strategy callback function
     * @returns {twitterApiObject} filtered twitter api object
     */
    function whitelist(data, instructions, strategy) {
        // get entries
        const index = instructions.findIndex((item) => item.type === 'TimelineAddEntries')
        const entries = instructions[index].entries
        // interate instruction entries
        let indices = []
        // collect indices of entries to remove
        entries.forEach((entry, i) => {
            logObj(entry)
            strategy(entry, indices, i)
        })
        // filter out aggregated indices
        removeTimelineItems(instructions, index, indices)
        logObj(instructions[index].entries)
        return data
    }

    /**
     * takes two arguments
     * filter twitter api data object based on target strategy callback
     * @memberof module:background
     * @param {twitterApiObject} data twitter api object
     * @param {string} target configured api target
     * @returns {twitterApiObject} filtered twitter api object
     */
    function applyWhiteList(data, target) {
        // init instructions
        let instructions = {}
        // whitelist strategy based on api target
        switch (true) {
            case (target === config.apiTargets.userTweets):
                instructions = data?.data?.user?.result?.timeline_v2?.timeline?.instructions
                return whitelist(data, instructions, whitelistUserTweets)
            case (target === config.apiTargets.tweetDetail):
                instructions = data?.data?.threaded_conversation_with_injections_v2?.instructions
                return whitelist(data, instructions, whitelistTweetDetails)
            case (target === config.apiTargets.homeTimeline):
                instructions = data?.data?.home?.home_timeline_urt?.instructions
                whitelistTimelineShowAlert(data, instructions)
                return whitelist(data, instructions, whitelistHomeTimeline)
            case (target === config.apiTargets.searchTimeline):
                instructions = data?.data?.search_by_raw_query?.search_timeline?.timeline?.instructions
                return whitelist(data, instructions, whitelistHomeTimeline)
            default:
                return undefined
        }
    }

    /**
     * takes 2 arguments
     * aggregate request data chunks and filter twitter api data object
     * @memberof module:background
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
            log(`<*>[FILTER DATA: #${requestId}]:`)
            logObj(event)
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
                        dataObj = applyWhiteList(dataObj, target)
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
     * @memberof module:background
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
     * @memberof module:background
     */
    function addRequestListener() {
        browser.webRequest.onBeforeRequest.addListener(requestListener, { urls: ['<all_urls>'] }, ['blocking', 'requestBody'])
    }

    /**
     * get options from local storage
     * @memberof module:background
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
     * @memberof module:background
     */
    function addOptionsListener() {
        browser.storage.local.onChanged.addListener(loadOptions)
    }

    /**
     * main
     * begin twitter-dashboard background processing
     * @memberof module:background
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
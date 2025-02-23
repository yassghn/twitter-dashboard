/*
* twitter-dashboard
*
* background.js
*/

(async () => {
    'use strict'

    const config = {
        debug: true
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
        return true

        // filter urls
        switch (true) {
            case url.includes('UserTweets?'):
            case url.includes('UserMedia?'):
            case url.includes('UsersVerifiedAvatars?'):
            case url.includes('DataSaverMode?'):
            case url.includes('ExploreSidebar?'):
                return false
            case url.includes('graphql/'):
            case url.includes('blocks/'):
                return true
            default:
                return false
        }
    }

    // log urls
    function filterRequest(id) {
        let filter = browser.webRequest.filterResponseData(id)
        let decoder = new TextDecoder('utf-8')
        let encoder = new TextEncoder()

        filter.ondata = (event) => {
            // get event data
            let data = decoder.decode(event.data, { stream: true })

            log(`filter data [id=${id}]:`)
            log(event)
            log(data)

            let newData = ''
            let needNewWrite = false

            // write new data
            if (needNewWrite)
                filter.write(encoder.encode(newData))
            else
                filter.write(encoder.encode(data))
        }

        filter.onstop = (event) => {
            // disconnect filter
            filter.disconnect()
        }
    }

    function logRequest(requestDetails) {
        if (isTargetUrl(requestDetails.url)) {
            log(`Loading [id=${requestDetails.requestId}]: ${requestDetails.url}`)
            log(requestDetails)
            filterRequest(requestDetails.requestId)
        }
    }

    function logAllRequests() {
        browser.webRequest.onBeforeRequest.addListener(logRequest, { urls: ['<all_urls>'] }, ['blocking', 'requestBody'])
    }

    // monitor headers received
    function logHeadersReceived(headerDetails) {
        if (isTargetUrl(headerDetails.url)) {
            log(`received header [id=${headerDetails.requestId}]: ${headerDetails.url}`)
            log(headerDetails)
        }
    }

    function logAllHeadersReceived() {
        browser.webRequest.onHeadersReceived.addListener(logHeadersReceived, { urls: ['<all_urls>'] }, ['responseHeaders'])
    }

    // monitor all request responses
    function logRequestResponse(responseDetails) {
        if (isTargetUrl(responseDetails.url)) {
            log(`processing response [id=${responseDetails.requestId}]: ${responseDetails.url}`)
            log(responseDetails)
        }
    }

    function logAllRequestResponses() {
        browser.webRequest.onResponseStarted.addListener(logRequestResponse, { urls: ['<all_urls>'] }, ['responseHeaders'])
    }

    logAllRequests()
    //logAllHeadersReceived()
    //logAllRequestResponses()

})();
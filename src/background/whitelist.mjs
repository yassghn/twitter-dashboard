/**
 * twitter-dashboard
 *
 * whitelist.mjs
 *
 * @memberof background
 * @module whitelist
 * @property {background.module:whitelist} whitelist export object
 */

import { config, log, logObj } from './util.mjs'

/**
 * takes 3 arguments
 * @callback strategyCallback
 * @param {twitterApiObject} entry twitter api object
 * @param {number[]} indices array to aggregate entry indices for filtering
 * @param {number} index positive integer representing current index of entry
 * @memberof background
 */

/**
 * takes 3 arguments
 * filters out entries from twitterApiObject instructions
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
 * @param {twitterApiObject} instructions twitter api object
 * @param {number} index positive integer representing element in instructions
 * @param {number[]} indices aggregated indices to filter out of instructions
 */
function removeAlerts(instructions, index, indices) {
	// filter out aggregated indices
	instructions[index].usersResults = instructions[index].usersResults.filter((entry, index) => !indices.includes(index))
}

/**
 * user tweets api target whitelisting strategy
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
			//logObj(result)
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
 * @param {twitterApiObject} data twitter api object
 * @param {twitterApiObject} instructions twitter api object
 * @param {strategyCallback} strategy api target strategy callback function
 * @returns {twitterApiObject} filtered twitter api object
 */
function applyWhiteList(data, instructions, strategy) {
	// get entries
	const index = instructions.findIndex((item) => item.type === 'TimelineAddEntries')
	const entries = instructions[index].entries
	// interate instruction entries
	let indices = []
	// collect indices of entries to remove
	entries.forEach((entry, i) => {
		//logObj(entry)
		strategy(entry, indices, i)
	})
	// filter out aggregated indices
	removeTimelineItems(instructions, index, indices)
	logObj(instructions[index].entries)
	return data
}

/**
 * whitelist export object
 * @global
 * @property {background.module:whitelist.apply} apply whitelist.apply(data, target)
 */
const whitelist = {
	/**
	 * takes two arguments
	 * filter twitter api data object based on target strategy callback
	 * @memberof background.module:whitelist
	 * @param {twitterApiObject} data twitter api object
	 * @param {string} target configured api target
	 * @returns {twitterApiObject} filtered twitter api object
	 */
	apply: function (data, target) {
		// init instructions
		let instructions = {}
		// whitelist strategy based on api target
		switch (true) {
			case (target === config.apiTargets.userTweets):
				instructions = data?.data?.user?.result?.timeline_v2?.timeline?.instructions
				return applyWhiteList(data, instructions, whitelistUserTweets)
			case (target === config.apiTargets.tweetDetail):
				instructions = data?.data?.threaded_conversation_with_injections_v2?.instructions
				return applyWhiteList(data, instructions, whitelistTweetDetails)
			case (target === config.apiTargets.homeTimeline):
				instructions = data?.data?.home?.home_timeline_urt?.instructions
				whitelistTimelineShowAlert(data, instructions)
				return applyWhiteList(data, instructions, whitelistHomeTimeline)
			case (target === config.apiTargets.searchTimeline):
				instructions = data?.data?.search_by_raw_query?.search_timeline?.timeline?.instructions
				return applyWhiteList(data, instructions, whitelistHomeTimeline)
			default:
				return undefined
		}
	}
}

export default whitelist
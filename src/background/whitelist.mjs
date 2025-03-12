/**
 * twitter-dashboard
 *
 * whitelist.mjs
 *
 * @memberof background
 * @module whitelist
 * @property {whitelist} whitelist export object
 */

import { config, log, logObj } from './util.mjs'

/**
 * @memberof background
 * @typedef {apiObjTypes} object twitter api object types
 */

/**
 * @type {apiObjTypes}
 */
const apiObjTypes = {
	instruction: {
		entries: 'TimelineAddEntries',
		alert: 'TimelineShowAlert'
	},
	entry: {
		timelineItem: 'TimelineTimelineItem',
		timelineModule: 'TimelineTimelineModule'
	},
	item: {
		timelineCurosr: 'TimelineTimelineCursor'
	}
}

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
function removeTimelineItems(instructions, index, indices, type) {
	// filter out aggregated indices
	switch (type) {
		case apiObjTypes.instruction.entries:
			instructions[index].entries = instructions[index].entries.filter((entry, index) => !indices.includes(index))
			break
		case apiObjTypes.instruction.alert:
			instructions[index].usersResults = instructions[index].usersResults.filter((entry, index) => !indices.includes(index))
			break
	}
}

/**
 * user tweets api target whitelisting strategy
 * @type {strategyCallback}
 */
function whitelistUserTweets(entry, indices, index) {
	if (entry?.content?.entryType === apiObjTypes.entry.timelineItem) {
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
	if (entry?.content?.entryType === apiObjTypes.entry.timelineItem ||
		entry?.content?.entryType === apiObjTypes.entry.timelineModule) {
		// get screen_name of timeline item entry
		let screen_name = ''
		if (entry.content.itemContent == undefined) {
			screen_name = entry.content.items[0].item.itemContent.tweet_results.result.core.user_results.result.legacy.screen_name
		} else if (entry.content.itemContent.tweet_results !== undefined &&
			entry.content.itemContent.itemType !== apiObjTypes.item.timelineCurosr) {
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
	if (entry?.content?.entryType === apiObjTypes.entry.timelineItem) {
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
 * hometimeline api target whitelisting strategy for alerts
 * @type {strategyCallback}
 */
function whitelistAlerts(result, indices, index) {
	let screen_name = result.result.legacy.screen_name
	if (!config.options.whitelist.includes(screen_name)) {
		indices.push(index)
	}
}

/**
 * takes 2 arguments
 * @param {twitterApiObject} instructions
 * @param {apiObjTypes} type
 * @returns {object} object containing target index and target api object array
 */
function getInstruction(instructions, type) {
	// instruction return obj
	const instruction = {
		index: -1,
		apiObjArray: []
	}
	// get appropriate index and api object array
	switch (type) {
		case apiObjTypes.instruction.entries:
			instruction.index = instructions.findIndex((item) => item.type === type)
			instruction.apiObjArray = instructions[instruction.index].entries
			break
		case apiObjTypes.instruction.alert:
			instruction.index = instructions.findIndex((item) => item.type === type)
			if (instruction.index > -1) {
				instruction.apiObjArray = instructions[instruction.index].usersResults
			}
			break
	}
	// return
	return instruction
}

/**
 * takes 3 arguments
 * filter twitter api object based on api target strategy
 * @param {twitterApiObject} data twitter api object
 * @param {twitterApiObject} instructions twitter api object
 * @param {strategyCallback} strategy api target strategy callback function
 * @returns {twitterApiObject} filtered twitter api object
 */
function applyWhiteList(data, instructions, strategy, type) {
	// get instruction
	const instruction = getInstruction(instructions, type)
	// check index
	if (instruction.index > -1 && instruction.apiObjArray.length > 0) {
		// aggregate instruction api object array indices
		let indices = []
		// interate instruction api object array, collect indices of entries to remove
		instruction.apiObjArray.forEach((obj, i) => {
			//logObj(obj)
			strategy(obj, indices, i)
		})
		// filter out aggregated indices
		if (indices.length > 0) {
			removeTimelineItems(instructions, instruction.index, indices, type)
			logObj(instructions)
		}
	}
	// return data
	return data
}

/**
 * takes two arguments
 * filter twitter api data object based on target strategy callback
 * @memberof background.module:whitelist
 * @param {twitterApiObject} data twitter api object
 * @param {string} target configured api target
 * @returns {twitterApiObject} filtered twitter api object
 */
function applyWhitelistStrategy(data, target) {
	// init instructions
	let instructions = {}
	// whitelist strategy based on api target
	switch (true) {
		case (target === config.apiTargets.userTweets):
			instructions = data?.data?.user?.result?.timeline_v2?.timeline?.instructions
			return applyWhiteList(data, instructions, whitelistUserTweets, apiObjTypes.instruction.entries)
		case (target === config.apiTargets.tweetDetail):
			instructions = data?.data?.threaded_conversation_with_injections_v2?.instructions
			return applyWhiteList(data, instructions, whitelistTweetDetails, apiObjTypes.instruction.entries)
		case (target === config.apiTargets.homeTimeline):
			instructions = data?.data?.home?.home_timeline_urt?.instructions
			data = applyWhiteList(data, instructions, whitelistAlerts, apiObjTypes.instruction.alert)
			return applyWhiteList(data, instructions, whitelistHomeTimeline, apiObjTypes.instruction.entries)
		case (target === config.apiTargets.searchTimeline):
			instructions = data?.data?.search_by_raw_query?.search_timeline?.timeline?.instructions
			return applyWhiteList(data, instructions, whitelistHomeTimeline, apiObjTypes.instruction.entries)
		default:
			return undefined
	}
}

/**
 * whitelist export object
 * @global
 * @property {background.module:whitelist.apply} apply whitelist.apply(data, target)
 */
const whitelist = {
	/**
	 * takes two arguments
	 * apply whitelisting strategy to twitterapi data object based on provided target
	 * @memberof background.module:whitelist
	 * @param {twitterApiObject} data twitter api object
	 * @param {string} target configured api target
	 * @returns {twitterApiObject} filtered twitter api object
	 */
	apply: function (data, target) {
		return applyWhitelistStrategy(data, target)
	}
}

export default whitelist
/**
 * twitter-dashboard
 *
 * util.mjs
 *
 * @memberof background
 * @module util
 * @property {config} config background config object
 * @property {log} log log message
 * @property {logObj} logObj log object
 */

/**
 * @memberof background
 * @typedef {configObject} object config object
 */

/**
 * @global
 * @type {configObject}
 * */
export const config = {
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
 * @global
 * @param {*} msg object or string
 * @param {boolean} [err] flag indicating to log to error
 */
export function log(msg, err = false) {
	if (config.debug) {
		if (!err) {
			console.log(msg)
		} else {
			console.error(msg)
		}
	}
}

/**
 * takes [upto] two arguments
 * use console.dir to log an object with a specified depth
 * @global
 * @param {*} obj object
 * @param {number} depth number indicating object depth to log
 */
export function logObj(obj, depth = null) {
	if (config.debug) {
		console.dir(obj, { depth: depth }, true)
	}
}
/**
 * twitter-dashboard
 *
 * util.mjs
 *
 * @memberof twitter-dashboard
 * @module twitter-dashboard/util
 * @property {twitter-dashboard.module:twitter-dashboard/util.config} config config export object
 * @property {twitter-dashboard.module:twitter-dashboard/util.log} log log message export function
 * @property {twitter-dashboard.module:twitter-dashboard/util.logObj} logObj log object export function
 *
 */

/**
 * @type {configObject}
 */
export const config = {
	debug: true,
	projectName: 'twitter-dashboard',
	selectors: {
		dashboardTemplate: '#dashboard-template'
	}
}

/**
 * takes [upto] two arguments
 * logs to stdout or stderr
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
 * @param {*} obj object
 * @param {number} depth number indicating object depth to log
 */
export function logObj(obj, depth = null) {
	if (config.debug) {
		console.dir(obj, { depth: depth }, true)
	}
}
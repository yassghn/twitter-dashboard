/**
 * twitter-dashboard
 *
 * rollup.config.mjs
 */
import resolve from '@rollup/plugin-node-resolve'
import cjs from '@rollup/plugin-commonjs'
import nodePolyfills from 'rollup-plugin-polyfill-node'

export default [{
    input: 'src/twitter-dashboard.js',
    output: {
        file: 'dist/rolledup/twitter-dashboard.js',
        format: 'iife',
        name: 'twitterDashboard'
    },
    plugins: [
        // resolve node imports
        resolve(),
        // convert commonjs to es6
        cjs(),
        // fill import dependencies
        nodePolyfills()
    ]
},{
    input: 'src/options/twitter-dashboard-options.js',
    output: {
        file: 'dist/rolledup/options/twitter-dashboard-options.js',
        format: 'iife',
        name: 'twitterDashboardOptions'
    },
    plugins: [resolve(), cjs(), nodePolyfills()]
},{
    input: 'src/popup/twitter-dashboard-popup.js',
    output: {
        file: 'dist/rolledup/popup/twitter-dashboard-popup.js',
        format: 'iife',
        name: 'twitterDashboardPopup'
    },
    plugins: [resolve(), cjs(), nodePolyfills()]
}]
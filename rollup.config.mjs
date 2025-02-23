/**
 * twitter-dashboard
 *
 * rollup.config.mjs
 */
import resolve from '@rollup/plugin-node-resolve'
import cjs from '@rollup/plugin-commonjs'

export default {
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
        cjs()
    ]
}
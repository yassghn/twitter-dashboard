/**
 * web-ext-config.mjs
 *
 * web-ext config
 */
export default {
    // global options
    verbose: true,
    sourceDir: 'dist/ext',
    artifactsDir: 'dist',
    // build options
    build: {
        overwriteDest: true
    },
    // run options
    run: {
        firefox: 'C:/Users/borys/AppData/Local/Programs/mozilla/firefox/firefox.exe',
        firefoxProfile: 'selenium',
        reload: true,
        keepProfileChanges: true,
        browserConsole: true,
        startUrl: ['https://x.com']
    }
}
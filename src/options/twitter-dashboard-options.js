/**
 * twitter-dashboard
 *
 * twitter-dashboard-options.js
 *
 * @module twitter-dashboard-options
 */
(async function(){

    /**
     * @memberof module:twitter-dashboard-options
     * @type {configObject}
     */
    const config = {
        debug: true,
        selectors: {
            default: '#options-header',
            enableWhitelist: '#enable-whitelist',
            whitelist: 'div#whitelist',
            whitelistText: 'textarea#whitelist',
            save: '#save'
        },
        options: {}
    }

    /**
     * takes [upto] two arguments
     * logs to stdout or stderr
     * @memberof module:twitter-dashboard-options
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
     * format whitelist string for storage
     * @memberof module:twitter-dashboard-options
     * @param {string} text whitelist textarea text
     * @returns {string} formatted whitelist string
     */
    function formatWhitelist(text) {
        let ret = text.trim()
                      .replace(/\r?\n|\r/g, '')
                      .replace(/[\n\r\t]/gm, '')
                      .replace(/['"]+/g, '')
                      .replace(/[ ]/g, '')
        return ret
    }

    /**
     * save options to local storage
     * @memberof module:twitter-dashboard-options
     */
    async function saveOptions() {
        const enableWhitelist = document.querySelector(config.selectors.enableWhitelist).checked
        const whitelistText = formatWhitelist(document.querySelector(config.selectors.whitelistText).value)
        const whitelistArray = whitelistText.split(',')
        const options = {
            whitelistEnabled: enableWhitelist,
            whitelist: whitelistArray
        }
        await browser.storage.local.set(options)
    }

    /**
     * easter egg
     * @memberof module:twitter-dashboard-options
     */
    function egg() {
        const menuItem = document.querySelector(config.selectors.default)
        menuItem.innerHTML =
            `<img src="../icons/twitter-dashboard-96.png"></img>`
    }

    /**
     * add click listeners to options items
     * @memberof module:twitter-dashboard-options
     */
    function addClickListeners() {
        const enableWhitelist = document.querySelector(config.selectors.enableWhitelist)
        enableWhitelist.addEventListener('change', (e) => {
            // hide and unhide whitelist textarea
            const whitelist = document.querySelector(config.selectors.whitelist)
            const whitelistEnabled = document.querySelector(config.selectors.enableWhitelist).checked
            whitelist.style.visibility = whitelistEnabled ? "visible" : "hidden"
        })
        const save = document.querySelector(config.selectors.save)
        save.addEventListener('click', (e) => {
            saveOptions();
        })
        const title = document.querySelector(config.selectors.default)
        title.addEventListener('click', (e) => {
            egg()
        })
    }

    /**
     * load options from local storage
     * @memberof module:twitter-dashboard-options
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
        log(config.options)
    }

    /**
     * populate settings page with stored options
     * @memberof module:twitter-dashboard-options
     */
    async function populateSavedSettings() {
        // load options
        await loadOptions()
        // populate settings
        if (config.options.whitelistEnabled != undefined) {
            const enableWhitelist = document.querySelector(config.selectors.enableWhitelist)
            enableWhitelist.checked = config.options.whitelistEnabled
        }
        if (config.options.whitelist) {
            const whitelistText = config.options.whitelist
            const whitelistTextArea = document.querySelector(config.selectors.whitelistText)
            whitelistTextArea.value = whitelistText
            whitelist.style.visibility = config.options.whitelistEnabled ? "visible" : "hidden"
        }
    }

    /**
     * options
     * main
     * @memberof module:twitter-dashboard-options
     */
    function options() {
        addClickListeners()
        populateSavedSettings()
    }

    options()

})();
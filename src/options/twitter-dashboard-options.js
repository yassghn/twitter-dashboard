(async function(){

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

    function log(msg, err = false) {
        if (config.debug) {
            if (!err)
                console.log(msg)
            else
                console.error(msg)
        }
    }

    function formatWhitelist(text) {
        let ret = text.trim()
                      .replace(/\r?\n|\r/g, '')
                      .replace(/[\n\r\t]/gm, '')
                      .replace(/['"]+/g, '')
                      .replace(/[ ]/g, '')
        return ret
    }

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

    function egg() {
        const menuItem = document.querySelector(config.selectors.default)
        menuItem.innerHTML =
            `<img src="../icons/twitter-dashboard-96.png"></img>`
    }

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

    function options() {
        addClickListeners()
        populateSavedSettings()
    }

    options()

})();
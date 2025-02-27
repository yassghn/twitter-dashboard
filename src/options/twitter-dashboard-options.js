(async function(){

    const config = {
        debug: true,
        selectors: {
            default: '#options-header',
            enableWhitelist: '#enable-whitelist',
            whitelist: '#whitelist',
            save: '#save'
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
        const whitelistText = formatWhitelist(document.querySelector(config.selectors.whitelist).value)
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
            console.log(enableWhitelist.checked)
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

    addClickListeners()

})();
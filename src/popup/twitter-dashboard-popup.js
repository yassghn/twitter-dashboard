/**
 * twitter-dashboard
 *
 * twitter-dashboard-popup.js
 *
 * @module twitter-dashboard-popup
 */
(async function(){

    /**
     * @memberof module:twitter-dashboard-popup
     * @type {configObject}
     */
    const config = {
        debug: true,
        selectors: {
            default: '#popup-content'
        }
    }

    /**
     * easter egg
     * @memberof module:twitter-dashboard-popup
     */
    function egg() {
        const menuItem = document.querySelector(config.selectors.default)
        menuItem.innerHTML =
            `<img src="../icons/twitter-dashboard-96.png"></img>`
    }

    /**
     * add click listeners to html elements
     * @memberof module:twitter-dashboard-popup
     */
    function addClickListener() {
        const menuItem = document.querySelector(config.selectors.default)
        menuItem.addEventListener('click', (e) => {
            egg()
        })
    }

    /**
     * popup
     * main
     * @memberof module:twitter-dashboard-popup
     */
    function popup() {
        addClickListener()
    }

    popup()

})();
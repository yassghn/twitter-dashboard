(async function(){

    const config = {
        debug: true,
        selectors: {
            default: '#popup-content'
        }
    }

    function popup() {
        const menuItem = document.querySelector(config.selectors.default)
        menuItem.innerHTML =
            `<img src="../icons/twitter-dashboard-96.png"></img>`
    }

    function addClickListener() {
        const menuItem = document.querySelector(config.selectors.default)
        menuItem.addEventListener('click', (e) => {
            popup()
        })
    }

    addClickListener()

})();
(async function(){

    const config = {
        debug: true,
        selectors: {
            default: '#options-content'
        }
    }

    function options() {
        const menuItem = document.querySelector(config.selectors.default)
        menuItem.innerHTML =
            `<img src="../icons/twitter-dashboard-96.png"></img>`
    }

    function addClickListener() {
        const menuItem = document.querySelector(config.selectors.default)
        menuItem.addEventListener('click', (e) => {
            options()
        })
    }

    addClickListener()

})();
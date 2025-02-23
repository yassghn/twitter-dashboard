/*
 * twitter-dashboard
 *
 * twitter-dashboard.js
 */
import $ from 'jquery'

(async () => {
    'use strict'

    const config = {
        projectName: 'twitter-dashboard'
    }

    function log(msg) {
        console.log(msg)
    }

    function getDashboardCss() {
        const dashboardCss =
            `* {
                padding: 0;
                margin: 0;
            }
            body {
                background-color: #1b1b1b;
                color: #cac4c4;
                overflow-x: hidden;
                overflow-y: auto;
                -webkit-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
            div#dashboard-container {
                position: absolute;
                display: -webkit-box;
                display: -ms-flexbox;
                display: flex;
                z-index: -1;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                -webkit-box-pack: center;
                -ms-flex-pack: center;
                justify-content: center;
                -webkit-box-align: center;
                -ms-flex-align: center;
                align-items: center;
                text-align: center;
            }
            div#content-text {
                display: inline-block;
                margin: 0 5px;
            }
            div#content-text span {
                font-family: "Trebuchet MS", sans-serif;
                font-style: normal;
                font-display: swap;
                font-weight: 500;
                font-size: 100px;
                line-height: 0;
                letter-spacing: 2px;
                text-decoration: underline;
            }`
        return dashboardCss
    }

    function getDashboardHtml() {
        const dashboardHtml =
            `<div id="dashboard-container">
                <div id="content-container">
                    <div id="content-text">
                        <span>FUCK THIS PIECE OF SHIT PLATFORM</span>
                    </div>
                </div>
            </div>`
        return dashboardHtml
    }

    function insertCss() {
        let style = document.createElement('style')
        style.dataset.insertedBy = config.projectName
        style.dataset.role = 'features'
        style.textContent = getDashboardCss()
        document.head.appendChild(style)
    }

    function loadDashboard() {
        document.body.style.border = '5px red dashed'
        log(`LOOK AT THIS PIECE OF SHIT ${$('div')[0]}`)
        insertCss()
        $('div').eq(0).html(getDashboardHtml())
    }

    function twitterDashboard() {
        loadDashboard()
    }

    window.onload = twitterDashboard()

})();
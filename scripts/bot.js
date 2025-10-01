let hkticketingOptions = {
    'speed': 0x3
};
let actionStartTime;
let interval;
let debugLog = function(message) {
    console.log("HKTicketKiller:", message);
};
let clickNextbutton = function() {
    let offerContainer = document.getElementsByClassName("chooseTicketsOfferDiv")[0x0];
    if (!offerContainer) {
        return;
    }
    let firstButton = offerContainer.querySelector("button");
    if (!firstButton) {
        return;
    }
    firstButton.click();
    const retryDelay = Math.floor(Math.random() * 501) + 0x1f4;
    setTimeout(clickNextbutton, retryDelay);
};
let clickMobileNextbutton = function() {
    let mobileButton = document.querySelector(".submitSection .btnStandalone input");
    if (!mobileButton) {
        return;
    }
    mobileButton.click();
    const mobileRetryDelay = Math.floor(Math.random() * 501) + 0x1f4;
    setTimeout(clickMobileNextbutton, mobileRetryDelay);
};
let getCurrentTime = async function() {
    try {
        const timeResponse = await fetch("https://worldtimeapi.org/api/timezone/Asia/Hong_Kong");
        const timeData = await timeResponse.json();
        return timeData.unixtime;
    } catch (timeError) {
        return false;
    }
};
let checkDeadline = async function(deadlineInfo) {
    try {
        let currentTime = await getCurrentTime();
        if (!deadlineInfo || !currentTime || !deadlineInfo.deadline) {
            return false;
        }
        if (currentTime > deadlineInfo.deadline) {
            return false;
        } else {
            return true;
        }
    } catch (deadlineError) {
        console.log(deadlineError);
        return false;
    }
};
let deleteAllCookies = function() {
    var cookies = document.cookie.split("; ");
    for (var cookieIndex = 0x0; cookieIndex < cookies.length; cookieIndex++) {
        var domains = window.location.hostname.split('.');
        while (domains.length > 0x0) {
            var cookieString = encodeURIComponent(cookies[cookieIndex].split(';')[0x0].split('=')[0x0]) + "=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=" + domains.join('.') + " ;path=";
            var paths = location.pathname.split('/');
            document.cookie = cookieString + '/';
            while (paths.length > 0x0) {
                document.cookie = cookieString + paths.join('/');
                paths.pop();
            };
            domains.shift();
        }
    }
};
let handleBlockedPage = function(targetUrl) {
    debugLog("Busy? Refresh in 3s");
    let mainIframe = document.getElementById("main-iframe");
    if (mainIframe) {
        try {
            let exitLink = mainIframe.contentWindow.document.getElementsByTagName('a')[0x1];
            if (exitLink) {
                exitLink.click();
            }
        } catch (clickError) {
            console.log("Error:", clickError);
        }
    }
    setTimeout(() => {
        deleteAllCookies();
        window.location.href = targetUrl;
    }, 0xbb8);
};
let onQuenePage = function(queueUrl) {
    let now = new Date().getTime();
    let elapsed = now - actionStartTime;
    let refreshInterval = (hkticketingOptions.speed || 0x3) * 0x3e8;
    if (elapsed > refreshInterval) {
        chrome.runtime.sendMessage({
            'action': "saveWindowId"
        }, responseMessage => {
            window.location.href = queueUrl;
        });
        clearInterval(interval);
    } else {
        debugLog("queuing. Refresh in " + (refreshInterval - elapsed) / 0x3e8 + " sec");
    }
};
let main = async function() {
    debugLog("Start Loading bot");
    let currentUrl = window.location.href;
    debugLog("Current page: " + currentUrl);
    actionStartTime = new Date().getTime();
    if (currentUrl.includes("queue.hkticketing.com")) {
        interval = setInterval(() => {
            onQuenePage('https://entry-hotshow.hkticketing.com');
        }, 0x1f4);
    } else {
        if (currentUrl === "https://entry-hotshow.hkticketing.com/") {
            handleBlockedPage("https://entry-hotshow.hkticketing.com");
        } else {
            if (currentUrl.includes("hotshow.hkticketing.com")) {
                if (currentUrl.includes("mhotshow.hkticketing.com")) {}
                if (document.querySelector('title').innerText === "Error Page") {
                    debugLog("Error. Retry in 3s.");
                    setTimeout(() => {
                        window.location.reload();
                    }, 0xbb8);
                } else {
                    console.log("Done. Set Window Size");
                    const targetHeight = Math.floor(window.screen.height * 0.9);
                    chrome.runtime.sendMessage({
                        'action': "setWindowSize",
                        'width': 0x0,
                        'height': targetHeight
                    }, sizeResponse => {});
                    setTimeout(clickNextbutton, 0xfa);
                }
            } else {
                if (currentUrl.includes("busy.hkticketing.com")) {
                    interval = setInterval(() => {
                        onQuenePage("https://entry.hkticketing.com");
                    }, 0x1f4);
                } else {
                    if (currentUrl === "https://entry.hkticketing.com/") {
                        handleBlockedPage("https://entry.hkticketing.com");
                    } else {
                        if (currentUrl.includes("premier.hkticketing.com")) {
                            console.log("Done. Set Window Size");
                            const premierHeight = Math.floor(window.screen.height * 0.9);
                            chrome.runtime.sendMessage({
                                'action': "setWindowSize",
                                'width': 0x0,
                                'height': premierHeight
                            }, sizeResponse2 => {});
                            let passwordField = document.querySelector(".buyTicketsInformation input[type=\"password\"]");
                            console.log(passwordField);
                            setTimeout(clickNextbutton, 0xfa);
                        } else {
                            setTimeout(clickNextbutton, 0xfa);
                        }
                    }
                }
            }
        }
    }
    return true;
};
window.onload = function() {
    try {
        chrome.runtime.sendMessage({
            'action': "getOptions"
        });
        chrome.runtime.sendMessage({
            'action': "checkDeadline"
        });
    } catch (sendError) {
        debugLog(JSON.stringify(sendError));
    }
};
window.addEventListener("message", function(event) {
    debugLog("Window received message");
    let eventData = event.data;
    if (eventData.action === 'recorderReady') {
        recorderReady();
    }
}, false);
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    debugLog("Window received message from background");
    console.log(sender);
    console.log(request);
    if (request.action === "getDeadlineCallback") {
        let deadlineValid = await checkDeadline(request);
        if (!deadlineValid) {
            debugLog("Bot outdated. Please update to the latest version.");
        } else {
            main();
        }
        sendResponse(true);
    } else {
        if (request.action === "checkDeadlineCallback") {
            if (request.disable) {
                debugLog("Bot outdated. Please update to the latest version.");
            } else {
                debugLog("Key valid.");
                main();
            }
            sendResponse(true);
        } else {
            if (request.action === 'getOptionsCallback') {
                sendResponse(true);
                if (request.options) {
                    let options = request.options;
                    hkticketingOptions = options.hkticketing || {};
                }
            }
        }
    }
    return true;
});
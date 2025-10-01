let iframe;
let debugLog = function(logMessage) {
    console.log('HKTicketKiller:', logMessage);
};
let sendMessageToBubblePage = function(payload) {
    if (iframe) {
        let bubbleOrigin = "https://" + iframe.contentWindow.location.hostname;
        iframe.contentWindow.postMessage(payload, bubbleOrigin);
    } else {
        window.postMessage(payload, window.location.origin);
    }
};
window.onload = function() {
    iframe = document.getElementById("customnocode_main_iframe");
};
window.addEventListener('message', function(event) {
    debugLog("window received message");
    let eventData = event.data;
    if (eventData.action === "updateOptions") {
        debugLog("content script triggered updateOptions");
        debugLog(eventData);
        chrome.runtime.sendMessage(eventData);
    } else {
        if (eventData.action === "getDeadlineFromKey") {
            chrome.runtime.sendMessage(eventData);
        } else {
            if (eventData.action === "getDeadline") {
                chrome.runtime.sendMessage(eventData);
            } else {
                if (eventData.action === "setDeadline") {
                    chrome.runtime.sendMessage(eventData);
                } else {
                    if (eventData.action === "getOptions") {
                        chrome.runtime.sendMessage(eventData);
                    } else {
                        if (eventData.action === "getVersion") {
                            let manifest = chrome.runtime.getManifest();
                            debugLog("content script getVersionCallback");
                            debugLog(manifest.version);
                            let versionMessage = {
                                'action': 'getVersionCallback',
                                'version': manifest.version
                            };
                            sendMessageToBubblePage(versionMessage);
                        }
                    }
                }
            }
        }
    }
}, false);
chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    sendMessageToBubblePage(request);
    return true;
});
let doNotChangeWindowIds = [];
let startedWindowIds = [];
let stopForceReloadIds = [];
let getCurrentTab = async function() {
    let queryOptions = {
        'active': true,
        'currentWindow': true
    };
    let [activeTab] = await chrome.tabs.query(queryOptions);
    return activeTab;
};
let openNewTab = function(url) {
    console.log("openNewTab", url);
    chrome.tabs.create({
        'active': true,
        'url': url
    });
};
let sendMsg = async function(action) {
    let currentTab = await getCurrentTab();
    chrome.tabs.sendMessage(currentTab.id, {
        'action': action
    }, function(response) {});
    return true;
};
let getCurrentTime = async function() {
    try {
        const worldTimeResponse = await fetch("https://worldtimeapi.org/api/timezone/Asia/Hong_Kong");
        const worldTimeData = await worldTimeResponse.json();
        return worldTimeData.unixtime;
    } catch (timeError) {
        return Math.floor(Date.now() / 0x3e8);
    }
};
let checkDeadline = async function(senderInfo) {
    let storedData = await chrome.storage.local.get(["hkticketkiller_key", "hkticketkiller_deadline", 'hkticketkiller_enabled', 'hkticketkiller_disabled']);
    if (!storedData) {
        return;
    }
    let storedDeadline = storedData.hkticketkiller_deadline;
    let deadlineMessage = {
        'action': 'checkDeadlineCallback',
        'deadline': storedDeadline,
        'key': storedData.hkticketkiller_key
    };
    if (storedData.hkticketkiller_enabled) {
        deadlineMessage.disable = false;
    } else {
        if (storedData.hkticketkiller_disabled) {
            deadlineMessage.disable = true;
        } else {
            if (storedDeadline) {
                console.log("checkDeadline: check again");
                let currentTimestamp = await getCurrentTime();
                if (!storedDeadline || !currentTimestamp) {
                    deadlineMessage.disable = true;
                } else {
                    if (currentTimestamp > storedDeadline) {
                        deadlineMessage.disable = true;
                    } else {
                        deadlineMessage.disable = false;
                    }
                }
                if (deadlineMessage.disable) {
                    console.log("checkDeadline: disabled");
                    await chrome.storage.local.set({
                        'hkticketkiller_disabled': true
                    });
                } else {
                    console.log("checkDeadline: enabled");
                    await chrome.storage.local.set({
                        'hkticketkiller_enabled': true
                    });
                }
            } else {
                console.log("checkDeadline: no key");
                deadlineMessage.disable = true;
            }
        }
    }
    if (!senderInfo) {
        return;
    }
    if (senderInfo.tab && senderInfo.tab.id) {
        chrome.tabs.sendMessage(senderInfo.tab.id, deadlineMessage);
    } else {
        chrome.runtime.sendMessage(deadlineMessage);
    }
};
chrome.notifications.onButtonClicked.addListener(function() {
    let focusSuccess = async function() {
        let successState = await chrome.storage.session.get(["hkticketkiller_success_tabId", "hkticketkiller_success_windowId"]);
        if (!successState) {
            return;
        }
        let successTabId = successState.hkticketkiller_success_tabId;
        let successWindowId = successState.hkticketkiller_success_windowId;
        if (successTabId) {
            await chrome.tabs.update(successTabId, {
                'highlighted': true
            });
        }
        if (successWindowId) {
            await chrome.windows.update(successWindowId, {
                'focused': true
            });
        }
    };
    focusSuccess();
});
chrome.windows.onCreated.addListener(() => {
    console.log('onCreated');
    chrome.storage.local.set({
        'hkticketkiller_disabled': false,
        'hkticketkiller_enabled': false
    }, () => {
        checkDeadline();
    });
});
chrome.runtime.onMessageExternal.addListener(function(externalMessage, externalSender, externalResponse) {
    console.log("msg received from bubble app", externalMessage);
    if (externalMessage.action === "openNewTab") {
        openNewTab(externalMessage.url);
    } else if (externalMessage.action) {
        sendMsg(externalMessage.action);
    }
    return true;
});
let forceReload = async function(tabId) {
    console.log("forceReload", tabId);
    console.log(stopForceReloadIds);
    if (stopForceReloadIds.includes(tabId)) {
        console.log("stopForceReloadIds", tabId);
        sendResponse(false);
        return;
    }
    await chrome.tabs.reload(tabId, {
        'bypassCache': true
    });
    return true;
};
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(sender.tab ? "msg received from a content script:" + sender.tab.url : "msg received from the extension");
    console.log(sender);
    console.log(request);
    if (request.action === "maximizedWindow") {
        chrome.windows.update(sender.tab.windowId, {
            'state': "maximized"
        });
    } else {
        if (request.action === "setWindowSize") {
            let windowId = sender.tab.windowId;
            if (doNotChangeWindowIds.includes(windowId)) {
                sendResponse(false);
                return;
            }
            if (startedWindowIds.includes(windowId)) {
                let windowIndex = startedWindowIds.indexOf(windowId);
                if (windowIndex > 0x0) {
                    startedWindowIds.splice(windowIndex, 0x1);
                }
            } else {
                sendResponse(false);
                return;
            }
            sendResponse(true);
            doNotChangeWindowIds.push(windowId);
            chrome.system.display.getInfo(function(displayInfo) {
                if (displayInfo.length > 0x0) {
                    let workAreaWidth = displayInfo[0x0].workArea.width;
                    let targetWidth = Math.round(workAreaWidth * 0.5);
                    chrome.windows.update(windowId, {
                        'drawAttention': true,
                        'width': targetWidth,
                        'height': request.height,
                        'left': 0x0,
                        'top': 0x0,
                        'state': 'normal'
                    });
                    if (request.from === "cityline") {
                        chrome.tabs.setZoom(sender.tab.id, 0.5);
                    } else {
                        chrome.tabs.setZoom(sender.tab.id, 0.65);
                    }
                }
            });
            let notifySuccess = async function(tab) {
                await chrome.storage.session.set({
                    'hkticketkiller_success_tabId': tab.id,
                    'hkticketkiller_success_windowId': tab.windowId
                });
                await chrome.notifications.create('hkticketkiller_success', {
                    'title': 'HKticketkiller',
                    'message': "成功進入購票頁面",
                    'buttons': [{
                        'title': '查看'
                    }],
                    'iconUrl': chrome.runtime.getURL('images/1.png'),
                    'type': 'basic'
                });
            };
            notifySuccess(sender.tab);
        } else {
            if (request.action === "saveWindowId") {
                let savedWindowId = sender.tab.windowId;
                if (!startedWindowIds.includes(savedWindowId)) {
                    startedWindowIds.push(savedWindowId);
                }
                sendResponse(true);
            } else {
                if (request.action === "checkDeadline") {
                    checkDeadline(sender);
                    sendResponse(true);
                } else {
                    if (request.action === "getDeadline") {
                        chrome.storage.local.get(["hkticketkiller_deadline"]).then(deadlineData => {
                            console.log("Value currently is " + deadlineData.hkticketkiller_deadline);
                            let deadline = deadlineData.hkticketkiller_deadline;
                            if (sender.tab && sender.tab.id) {
                                chrome.tabs.sendMessage(sender.tab.id, {
                                    'action': "getDeadlineCallback",
                                    'deadline': deadline
                                });
                            } else {
                                chrome.runtime.sendMessage({
                                    'action': "getDeadlineCallback",
                                    'deadline': deadline
                                });
                            }
                            sendResponse({
                                'deadline': deadline
                            });
                        })['catch'](deadlineError => {
                            console.log("Error:", deadlineError);
                        });
                    } else {
                        if (request.action === 'getDeadlineFromKey') {
                            let validationUrl = "https://hkticketkiller-backend-latest.vercel.app/v0/validation/" + request.key;
                            fetch(validationUrl, {
                                'mode': "cors"
                            }).then(validationResponse => validationResponse.json()).then(validationData => {
                                console.log("validation data:", validationData);
                                if (validationData && validationData.error) {
                                    throw validationData.error;
                                }
                                if (!validationData) {
                                    sendResponse(null);
                                } else {
                                    chrome.storage.local.set({
                                        'hkticketkiller_deadline': validationData.unixtime,
                                        'hkticketkiller_enabled': false,
                                        'hkticketkiller_disabled': false,
                                        'hkticketkiller_key': request.key
                                    }).then(() => {
                                        checkDeadline(sender);
                                    });
                                    sendResponse({
                                        'deadline': validationData.unixtime
                                    });
                                }
                            })["catch"](validationError => {
                                console.log("Error:", validationError);
                                let errorMessage = {
                                    'action': "checkDeadlineCallback",
                                    'disable': true,
                                    'error': validationError.message
                                };
                                if (sender.tab && sender.tab.id) {
                                    chrome.tabs.sendMessage(sender.tab.id, errorMessage);
                                } else {
                                    chrome.runtime.sendMessage(errorMessage);
                                }
                            });
                        } else {
                            if (request.action === "setDeadline") {
                                chrome.storage.local.set({
                                    'hkticketkiller_deadline': request.deadline
                                });
                                sendResponse(true);
                            } else {
                                if (request.action === 'updateOptions') {
                                    chrome.storage.local.set({
                                        'hkticketkiller_options': request.options
                                    });
                                    sendResponse(true);
                                } else {
                                    if (request.action === "getOptions") {
                                        chrome.storage.local.get(['hkticketkiller_options']).then(optionsData => {
                                            console.log(optionsData.hkticketkiller_options);
                                            if (sender.tab && sender.tab.id) {
                                                chrome.tabs.sendMessage(sender.tab.id, {
                                                    'action': "getOptionsCallback",
                                                    'options': optionsData.hkticketkiller_options
                                                });
                                            } else {
                                                chrome.runtime.sendMessage({
                                                    'action': "getOptionsCallback",
                                                    'options': optionsData.hkticketkiller_options
                                                });
                                            }
                                            sendResponse(optionsData.hkticketkiller_options);
                                        });
                                    } else {
                                        if (request.action === "goToSettings") {
                                            let settingsUrl = "https://hkticketkiller.com/settings";
                                            if (request.page) {
                                                settingsUrl = "https://hkticketkiller.com/settings?page=" + request.page;
                                            }
                                            openNewTab(settingsUrl);
                                            sendResponse(true);
                                        } else {
                                            if (request.action === "forceReload") {
                                                const forceReloadIndex = stopForceReloadIds.indexOf(sender.tab.id);
                                                if (forceReloadIndex > -0x1) {
                                                    stopForceReloadIds.splice(forceReloadIndex, 0x1);
                                                }
                                                setTimeout(() => {
                                                    forceReload(sender.tab.id);
                                                }, request.delay || 0x64);
                                                sendResponse(true);
                                            } else if (request.action === 'stopForceReload') {
                                                stopForceReloadIds.push(sender.tab.id);
                                                console.log("stopForceReload");
                                                console.log(stopForceReloadIds);
                                                sendResponse(true);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return true;
});
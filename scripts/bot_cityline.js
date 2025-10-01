let citylineOptions = {
    'paymentInfo': {},
    'addCart': {}
};
let debugLog = function(var_0) {
    console.log("HKTicketKiller:", var_0);
};
let tools = {
    'secondToTime': function(var_1) {
        return new Date(var_1 * 0x3e8).toISOString().substring(0xe, 0x13);
    },
    'createDivWithClass': function(var_2) {
        let var_3 = document.createElement("div");
        for (let var_4 = 0x0; var_4 < var_2.length; var_4++) {
            var_3.classList.add(var_2[var_4]);
        }
        return var_3;
    },
    'getRandNum': function(var_5, var_6) {
        return Math.floor(Math.random() * (var_6 - var_5 + 0x1)) + var_5;
    },
    'getMobileOperatingSystem': function() {
        var var_7 = navigator.userAgent || navigator.vendor || window.opera;
        if (/windows phone/i.test(var_7)) {
            return "Windows Phone";
        }
        if (/android/i.test(var_7)) {
            return "Android";
        }
        if (/iPad|iPhone|iPod/.test(var_7) && !window.MSStream) {
            return "iOS";
        }
        return "unknown";
    }
};
let clickNextbutton = function() {
    let var_8 = document.getElementsByClassName('chooseTicketsOfferDiv')[0x0];
    if (!var_8) {
        return;
    }
    let var_9 = var_8.querySelector('button');
    if (!var_9) {
        return;
    }
    var_9.click();
    const var_10 = Math.floor(Math.random() * 1001) + 0x3e8;
    setTimeout(clickNextbutton, var_10);
};
let getCurrentTime = async function() {
    try {
        const var_11 = await fetch("https://worldtimeapi.org/api/timezone/Asia/Hong_Kong");
        const var_12 = await var_11.json();
        return var_12.unixtime;
    } catch (var_13) {
        return false;
    }
};
let checkDeadline = async function(var_14) {
    try {
        let var_15 = await getCurrentTime();
        if (!var_14 || !var_15 || !var_14.deadline) {
            return false;
        }
        if (var_15 > var_14.deadline) {
            return false;
        } else {
            return true;
        }
    } catch (var_16) {
        console.log(var_16);
        return false;
    }
};
let simulateClick = function(var_17, var_18) {
    if (!var_17) {
        return;
    }
    var var_19 = var_17.getBoundingClientRect();
    var var_20 = var_19.left + Math.random() * var_19.width;
    var var_21 = var_19.top + Math.random() * var_19.height;
    var var_22 = new MouseEvent(var_18, {
        'bubbles': true,
        'cancelable': true,
        'view': window,
        'clientX': var_20,
        'clientY': var_21
    });
    var_17.dispatchEvent(var_22);
};
let selectOption = function(var_23, var_24) {
    if (var_24 > 0x32) {
        debugLog("Error: unhandled options: " + var_23.length);
        return;
    }
    if (var_23.length <= 0x0) {
        return;
    }
    let var_25 = var_23[0x0];
    let var_26 = var_25.value;
    let var_27 = document.querySelector("option[value=\"" + var_26 + "\"]");
    if (var_27) {
        console.log('click', var_27);
        var_27.click();
        var_23.shift();
    }
    if (var_23.length > 0x0) {
        var_23[0x0].click();
        setTimeout(() => {
            selectOption(var_23, var_24++);
        }, 0x64);
    }
};
let autofillPaymentInfo = function() {
    debugLog("Autofill");
    let var_28 = citylineOptions.paymentInfo;
    let var_29 = var_28.paymentMethod;
    let var_30 = document.querySelector("button[data-payment-code=\"" + var_29 + "\"]");
    if (var_30) {
        var_30.click();
    }
    let var_31 = document.querySelectorAll("#mainContainer input");
    console.log(var_31.id);
    for (let var_32 = 0x0; var_32 < var_31.length; var_32++) {
        let var_33 = var_31[var_32];
        if (!var_33.id) {
            continue;
        }
        let var_34 = var_28[var_33.id];
        if (var_33.id === "confirmEmail") {
            var_34 = var_28.email;
        }
        if (!var_34) {
            continue;
        }
        var_33.focus();
        var_33.value = var_34;
        var_33.blur();
    }
    let var_35 = document.getElementById("expiryMonth");
    let var_36 = document.getElementById("expiryYear");
    let var_37 = var_28.expiry || '';
    if (var_37.includes('/')) {
        let var_38 = var_37.split('/');
        var_35.value = var_38[0x0];
        var_36.value = var_38[0x1];
    }
};
let onEventDetail = function() {
    debugLog("onEventDetail");
    let var_39 = document.querySelector(".puchase-bottom .ticketCard button");
    if (var_39) {
        var_39.click();
    } else {
        setTimeout(onEventDetail, 0x1f4);
    }
};
let createAutoAddCartButton = function(var_40) {
    let var_41 = document.createElement("button");
    var_41.id = 'hkticketkiller_auto_add_cart';
    var_41.innerText = "Auto retry";
    let var_42 = function() {
        if (!citylineOptions.addCart) {
            citylineOptions.addCart = {};
        }
        let var_43 = (citylineOptions.addCart.autoClickSpeed || 1.5) * 0x3e8;
        debugLog("autoClick");
        let var_44 = document.getElementById("commonWarningMessageModal");
        if (var_44 && var_44.style.display !== "none") {}
        if (var_41.dataset.stopAuto !== "yes") {
            debugLog("Click purchase button.");
            var_40.click();
        }
        setTimeout(() => {
            var_42();
        }, var_43);
    };
    var_41.onclick = function() {
        if (var_41.dataset.started !== "yes") {
            var_41.dataset.started = 'yes';
            var_41.innerText = 'Stop';
            var_42();
        } else {
            debugLog(var_41.dataset.stopAuto);
            if (var_41.dataset.stopAuto === 'yes') {
                debugLog("Set to false");
                var_41.dataset.stopAuto = 'no';
            } else {
                debugLog("Set to true");
                var_41.dataset.stopAuto = 'yes';
            }
            if (var_41.dataset.stopAuto === "yes") {
                var_41.innerText = "Auto retry";
            } else {
                var_41.innerText = 'Stop';
            }
        }
    };
    var_40.parentNode.appendChild(var_41);
};
let onAddCartPage = function() {
    if (citylineOptions.addCart && citylineOptions.addCart.enable && citylineOptions.addCart.qty) {
        debugLog("autoAddCart");
        let var_45 = citylineOptions.addCart.qty || 0x0;
        let var_46 = document.querySelectorAll(".ticket-price-btn");
        let var_47 = [];
        var_46.forEach(var_48 => {
            var_47.push(var_48);
        });
        let var_49;
        while (var_47.length > 0x0) {
            if (citylineOptions.addCart.rule === "由上而下") {
                var_49 = var_47.shift();
            } else if (citylineOptions.addCart.rule === '由下而上') {
                var_49 = var_47.pop();
            } else {
                var_49 = var_47.splice(Math.floor(Math.random() * var_47.length), 0x1)[0x0];
            }
            let var_50 = var_49.closest(".form-check");
            let var_51 = '';
            if (var_50) {
                var_51 = var_50.innerText;
            }
            console.log(var_51);
            let var_52 = citylineOptions.addCart.ignore;
            let var_53 = [];
            if (var_52) {
                var_52 = var_52.replaceAll('，', ',');
                var_53 = var_52.split(',');
            }
            var_53.push('售罄');
            if (var_53.some(var_54 => var_51.includes(var_54.trim()))) {
                var_49 = null;
            } else {
                break;
            }
        }
        if (var_49) {
            var_49.click();
        }
        let var_55 = document.getElementById("ticketType0");
        if (var_55 && var_45) {
            var_55.value = var_45.toString();
            var_55.dispatchEvent(new Event("change", {
                'bubbles': true
            }));
        }
        if (var_49 && var_45) {
            let var_56 = document.getElementById("hkticketkiller_auto_add_cart");
            if (var_56) {
                var_56.click();
            }
            return;
        }
    }
    setTimeout(onAddCartPage, 0x1f4);
};
let createAutofillBtn = function() {
    if (document.getElementById('hkticketkiller_autofill_btn')) {
        return;
    }
    let var_57 = document.createElement("button");
    var_57.classList.add("btn-outline-primary");
    var_57.classList.add('btn');
    var_57.id = 'hkticketkiller_autofill_btn';
    var_57.innerText = "Autofill by hkticketkiller";
    var_57.onclick = function() {
        if (citylineOptions && citylineOptions.paymentInfo && citylineOptions.paymentInfo.enable) {
            autofillPaymentInfo();
        } else {
            chrome.runtime.sendMessage({
                'action': "goToSettings",
                'page': 'cityline'
            });
        }
    };
    let var_58 = tools.createDivWithClass(["hkticketkiller"]);
    var_58.appendChild(var_57);
    let var_59 = document.querySelector(".tips");
    if (!var_59) {
        return;
    }
    let var_60 = document.createElement("style");
    var_60.innerHTML = ".hkticketkiller button:hover{ background-color: rgba(70, 90, 186, 0.1);}";
    var_59.after(var_60);
    var_59.after(var_58);
};
let main = async function() {
    chrome.runtime.sendMessage({
        'action': "getOptions"
    });
    debugLog("Start Loading bot");
    let var_61 = window.location.href;
    debugLog("Current page: " + var_61);
    let var_62 = document.getElementById("expressPurchaseBtn");
    const var_63 = new RegExp("*event.cityline.com/utsvInternet/*/login*".replace(/\*/g, "[^ ]*"));
    const var_64 = new RegExp("*event.cityline.com/utsvInternet/*/home*".replace(/\*/g, "[^ ]*"));
    if (var_61.includes("busy") || var_61.includes("msg")) {
        debugLog("queuing. Refresh in 3 sec");
        chrome.runtime.sendMessage({
            'action': "saveWindowId"
        }, var_65 => {});
        let var_66 = new Date().getTime();
        let var_67 = Date.now();
        let var_68 = function() {
            if (window.location.href.includes('venue.cityline.com')) {
                debugLog("Done. Set Window Size");
                const var_69 = Math.floor(window.screen.height * 0.9);
                chrome.runtime.sendMessage({
                    'action': "setWindowSize",
                    'width': 0x0,
                    'height': var_69,
                    'from': "cityline"
                }, var_70 => {});
                clearInterval(var_71);
                return true;
            }
            return false;
        };
        let var_71 = setInterval(() => {
            let var_72 = document.getElementById("autoRetryMsg");
            let var_73 = document.getElementById("autoRetryingMsg");
            let var_74 = document.getElementById("btn-retry-en-1");
            let var_75 = document.getElementById("btn-retrying-en-1");
            let var_76 = new Date().getTime();
            let var_77 = var_76 - var_66;
            let var_78 = (citylineOptions.speed || 0x3) * 0x3e8;
            if (var_78 === 0x2710) {
                debugLog("Speed=10. Disabled auto reload.");
                var_68();
                return;
            }
            if (var_72) {
                var_72.style.display = 'none';
            }
            if (var_73) {
                var_73.style.display = "block";
                var_73.innerHTML = "Hkticketkiller 重試中...<br>" + Math.ceil((var_78 - var_77) / 0x3e8) + "秒後重試";
            }
            if (var_74) {
                var_74.style.display = "inline-block";
            }
            if (var_75) {
                var_75.style.display = 'none';
            }
            if (var_77 > var_78) {
                chrome.runtime.sendMessage({
                    'action': "saveWindowId"
                }, var_79 => {});
                if (var_68()) {
                    return;
                }
                let var_80 = 'https://event.cityline.com';
                let var_81 = new URL(window.location.href);
                let var_82 = var_81.searchParams.get("loc");
                if (var_82) {
                    var_80 = var_80 + '/queue?loc=' + encodeURIComponent(var_82);
                }
                let var_83 = function(var_84) {
                    return Array.prototype.map.call(var_84, var_85 => ('0' + var_85.toString(0x10)).slice(-0x2)).join('');
                };
                let var_86 = function() {
                    var var_87 = '';
                    var var_88 = Module._malloc(0x30);
                    Module.ccall("getData", "void", ['string', "string", 'number', "number"], [{}, var_67.toString(), 0x30, var_88]);
                    var var_89 = new Uint8Array(Module.HEAP8.buffer, var_88, 0x30);
                    var_87 = var_83(var_89);
                    Module._free(var_88);
                    return var_87;
                };
                let var_90 = async function() {
                    debugLog("Retry");
                    if (var_72) {
                        var_72.style.display = "none";
                    }
                    if (var_73) {
                        var_73.style.display = "block";
                    }
                    if (var_74) {
                        var_74.style.display = "none";
                    }
                    if (var_75) {
                        var_75.style.display = "inline-block";
                    }
                    debugLog("Reset");
                    var_66 = new Date().getTime();
                    return;
                    let var_91 = var_80;
                    let var_92 = {};
                    try {
                        var_92 = await fetch(var_91, {
                            'method': "POST",
                            'body': {
                                'data': var_86()
                            },
                            'cache': 'no-store',
                            'credentials': "include"
                        });
                    } catch (var_93) {
                        console.log(var_93);
                        debugLog("Fetch error. Reset");
                        var_66 = new Date().getTime();
                    }
                    if (var_92.ok) {
                        let var_94 = await var_92.json();
                        console.log(var_94);
                        if (var_94.ACTION == "REDIRECT") {
                            window.location.href = var_94.REDIRECT_URL;
                            clearInterval(var_71);
                        } else {
                            debugLog("reset");
                            var_66 = new Date().getTime();
                            var_67 = var_94.STIMESTAMP;
                        }
                    }
                };
                var_90();
                return;
                window.location.href = var_80;
                return;
                let var_95 = document.getElementById("btn-retry-en-1");
                if (var_95 && var_95.getAttribute("disabled") !== 'disabled') {
                    simulateClick(var_95, "mouseover");
                    simulateClick(var_95, "click");
                    var_66 = new Date().getTime();
                } else {
                    var_68();
                }
            }
        }, 0x1f4);
    } else {
        if (var_61.includes("shoppingBasket")) {
            debugLog("ShoppingBasket");
            createAutofillBtn();
            let var_96 = document.getElementById("proceed");
            console.log("proceed");
            console.log(var_96);
            if (var_96) {
                var_96.addEventListener("click", function() {
                    if (citylineOptions && citylineOptions.paymentInfo && citylineOptions.paymentInfo.enable) {
                        autofillPaymentInfo();
                    }
                });
            }
        } else {
            if (var_63.test(var_61)) {
                debugLog("blocked? Refresh in 3 sec");
                setTimeout(() => {
                    window.location.href = window.location.href;
                }, 0xfa0);
            } else {
                if (var_64.test(var_61)) {
                    debugLog("earlyLink not redirected. Try reload in 3 sec");
                    setTimeout(() => {
                        window.location.href = window.location.href;
                    }, 0xbb8);
                } else {
                    if (var_61.includes('venue')) {
                        let var_97 = document.getElementById("btn-retry-en-1");
                        if (var_97) {
                            debugLog("queuing. Refresh in 3 sec");
                            setInterval(() => {
                                let var_98 = document.getElementById("btn-retry-en-1");
                                if (var_98) {
                                    var_98.click();
                                }
                            }, 0x1f4);
                            return;
                        }
                        debugLog("Done. Set Window Size");
                        const var_99 = Math.floor(window.screen.height * 0.9);
                        chrome.runtime.sendMessage({
                            'action': "setWindowSize",
                            'width': 0x0,
                            'height': var_99,
                            'from': "cityline"
                        }, var_100 => {});
                        if (var_61.includes("eventDetail")) {
                            onEventDetail();
                        }
                    } else {
                        if (var_61.includes("shows.cityline.com")) {
                            let var_101 = function() {
                                debugLog("autoClickBuy");
                                let var_102 = document.getElementById("buyTicketBtn");
                                if (var_102) {
                                    var_102.click();
                                } else {
                                    setTimeout(var_101, 0x1f4);
                                }
                            };
                        }
                    }
                }
            }
        }
    }
    if (var_62) {
        createAutoAddCartButton(var_62);
        onAddCartPage();
    }
    return;
};
window.onload = async function() {
    chrome.runtime.sendMessage({
        'action': "checkDeadline"
    });
};
window.addEventListener("message", function(var_103) {
    debugLog("Window received message");
    let var_104 = var_103.data;
    if (var_104.action === "recorderReady") {}
}, false);
chrome.runtime.onMessage.addListener(async function(var_105, var_106, var_107) {
    debugLog("Window received message from background");
    if (var_105.action === "getDeadlineCallback") {
        let var_108 = await checkDeadline(var_105);
        if (!var_108) {
            debugLog("Bot outdated. Please update to the latest version.");
        } else {
            main();
        }
        var_107(true);
    } else {
        if (var_105.action === "checkDeadlineCallback") {
            if (var_105.disable) {
                debugLog("Bot outdated. Please update to the latest version.");
            } else {
                debugLog("Key valid.");
                main();
            }
            var_107(true);
        } else {
            if (var_105.action === "getOptionsCallback") {
                var_107(true);
                if (var_105.options) {
                    let var_109 = var_105.options;
                    citylineOptions = var_109.cityline || {};
                    if (var_109.hkticketing && var_109.hkticketing.speed) {
                        citylineOptions.speed = var_109.hkticketing.speed;
                    }
                }
                let var_110 = window.location.href;
                if (var_110.includes("shoppingBasket") && citylineOptions && citylineOptions.paymentInfo && citylineOptions.paymentInfo.enable) {
                    setTimeout(autofillPaymentInfo, 0x1f4);
                }
            }
        }
    }
    return true;
});
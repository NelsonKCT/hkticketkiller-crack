let mainInterval;
let kktixOptions = {
    'addCart': {
        'enable': false,
        'qty': '',
        'ignore': '',
        'rule': "由上而下",
        'speed': 0x1,
        'membershipNumber': '123'
    },
    'selectDate': {}
};
let options;
let debugLog = function(var_0) {
    console.log("HKTicketKiller:", var_0);
};
let actionStartTime;
let selectedDate = false;
let clickedNextStepOnEvent = false;
let addedCart = false;
let stayAddCartPage = false;
let scheduledReload = false;
let checkAgree = function() {
    let var_1 = document.getElementById("person_agree_terms");
    if (var_1 && !var_1.checked) {
        var_1.click();
    }
};
let autoAddCart = function() {
    let var_2 = document.querySelectorAll(".ticket-quantity .plus");
    let var_3 = [];
    var_2.forEach(var_4 => {
        var_3.push(var_4);
    });
    let var_5;
    while (var_3 && var_3.length > 0x0) {
        console.log(var_2);
        if (kktixOptions.addCart.rule === "由上而下") {
            var_5 = var_3.shift();
        } else if (kktixOptions.addCart.rule === "由下而上") {
            var_5 = var_3.pop();
        } else {
            var_5 = var_3.splice(Math.floor(Math.random() * var_3.length), 0x1)[0x0];
        }
        let var_6 = var_5.closest(".display-table-row");
        let var_7;
        if (var_6) {
            var_7 = var_6.querySelector(".ticket-name");
        }
        let var_8 = kktixOptions.addCart.ignore;
        if (var_8) {
            var_8 = var_8.replaceAll('，', ',');
            let var_9 = var_8.split(',');
            if (var_9.some(var_10 => var_7.innerText.includes(var_10.trim()))) {
                var_5 = null;
            } else {
                break;
            }
        } else {
            break;
        }
    }
    let var_11 = parseInt(kktixOptions.addCart.qty || 0x0);
    console.log(var_5);
    if (!var_5) {
        return false;
    }
    for (let var_12 = 0x0; var_12 < var_11; var_12++) {
        var_5.click();
    }
    let var_13 = kktixOptions.addCart.membershipNumber;
    if (var_13) {
        let var_14 = document.querySelectorAll(".control-group input[type=\"text\"]");
        var_14.forEach(var_15 => {
            var_15.focus();
            var_15.value = var_13;
            var_15.dispatchEvent(new Event("chagne"));
            var_15.blur();
        });
    }
    checkAgree();
    let var_16 = function() {
        let var_17 = document.getElementById("hkticketkiller_auto_add_cart_btn");
        if (var_17 && var_17.innerText === "啟動自動加車") {
            return;
        }
        let var_18 = document.querySelector(".register-new-next-button-area button");
        if (var_18 && kktixOptions.addCart && kktixOptions.addCart.enable) {
            if (var_18.disabled) {
                stayAddCartPage = true;
            }
            var_18.click();
        }
    };
    var_16();
    setInterval(var_16, 0x12c);
    return true;
};
let selectDate = function() {
    let var_19 = document.querySelectorAll(".event-list li");
    let var_20 = [];
    let var_21;
    var_19.forEach(var_22 => {
        var_20.push(var_22);
    });
    let var_23 = kktixOptions.selectDate.ignore || '';
    let var_24 = [];
    if (var_23) {
        let var_25 = var_23.replaceAll('，', ',');
        var_24 = var_25.split(',');
    }
    while (var_20 && var_20.length > 0x0) {
        if (kktixOptions.selectDate.rule === "由左至右") {
            var_21 = var_20.shift();
        } else if (kktixOptions.selectDate.rule === "由右至左") {
            var_21 = var_20.pop();
        } else {
            var_21 = var_20.splice(Math.floor(Math.random() * var_20.length), 0x1)[0x0];
        }
        if (var_24.some(var_26 => var_21.innerText.includes(var_26.trim()))) {
            var_21 = null;
        } else {
            break;
        }
    }
    if (var_21) {
        let var_27 = var_21.querySelector('a');
        if (var_27) {
            var_27.click();
        }
    }
    return var_21;
};
let onSelectDate = function() {
    let var_28 = new Date().getTime();
    let var_29 = var_28 - actionStartTime;
    let var_30 = (kktixOptions.speed || 0x1) * 0x3e8;
    if (kktixOptions.selectDate && kktixOptions.selectDate.enable) {
        if (!selectedDate) {
            selectedDate = selectDate();
        } else {
            debugLog("selected date");
        }
        if (!selectedDate) {
            debugLog("No available date.");
            if (var_29 > var_30) {
                window.location.reload();
            }
        }
    } else {
        debugLog("selectDate disabled");
    }
};
let createStopAutoAddCartButton = function() {
    if (document.getElementById('hkticketkiller_auto_add_cart_btn')) {
        return;
    }
    let var_31 = document.createElement("button");
    var_31.id = 'hkticketkiller_auto_add_cart_btn';
    var_31.classList.add("btn");
    var_31.classList.add('btn-primary');
    var_31.innerText = "停止自動加車";
    var_31.onclick = function() {
        if (!kktixOptions.addCart) {
            kktixOptions.addCart = {};
        }
        if (var_31.innerText === "停止自動加車") {
            var_31.innerText = '啟動自動加車';
        } else {
            var_31.innerText = '停止自動加車';
            if (!kktixOptions.addCart.qty) {
                chrome.runtime.sendMessage({
                    'action': 'goToSettings',
                    'page': "kktix"
                });
                return;
            }
        }
    };
    let var_32 = document.getElementsByClassName('register-new-next-button-area')[0x0];
    if (var_32) {
        var_32.appendChild(var_31);
    }
};
let onAddCartPage = function() {
    createStopAutoAddCartButton();
    let var_33 = new Date().getTime();
    let var_34 = var_33 - actionStartTime;
    let var_35 = (kktixOptions.speed || 0x1) * 0x3e8;
    chrome.runtime.sendMessage({
        'action': "saveWindowId"
    }, var_36 => {});
    if (kktixOptions.addCart && kktixOptions.addCart.enable) {
        if (!addedCart) {
            addedCart = autoAddCart();
        }
        if (!addedCart) {
            debugLog("No available ticket.");
            if (var_34 > var_35) {
                window.location.reload();
                clearInterval(mainInterval);
            }
        }
        let var_37 = kktixOptions.addCart.reloadDelay;
        if (var_37 && !scheduledReload) {
            forceReload(var_37 * 0x3e8);
            scheduledReload = true;
        }
    } else {
        debugLog("addCart disabled");
        let var_38 = document.getElementById("hkticketkiller_auto_add_cart_btn");
        if (var_38) {
            var_38.innerText = "啟動自動加車";
        }
    }
};
let forceReload = function(var_39) {
    chrome.runtime.sendMessage({
        'action': "forceReload",
        'delay': var_39
    });
};
let stopForceReload = function() {
    chrome.runtime.sendMessage({
        'action': "stopForceReload"
    });
};
let main = async function() {
    actionStartTime = new Date().getTime();
    debugLog("Start Loading bot");
    mainInterval = setInterval(function() {
        let var_40 = window.location.href;
        if (var_40.includes("/users/sign_in")) {} else {
            if (var_40.includes("/registrations/new")) {
                setTimeout(onAddCartPage, 0x3e8);
            } else {
                if (var_40.includes("/registrations/")) {
                    stopForceReload();
                    const var_41 = Math.floor(window.screen.height * 0.9);
                    chrome.runtime.sendMessage({
                        'action': "setWindowSize",
                        'width': 0x0,
                        'height': var_41
                    }, var_42 => {});
                } else {
                    if (var_40.includes('/events/')) {
                        if (document.querySelector('.event-list')) {
                            onSelectDate();
                        } else if (document.querySelector(".tickets .btn-point")) {
                            if (!clickedNextStepOnEvent) {
                                clickedNextStepOnEvent = true;
                                document.querySelector(".tickets .btn-point").click();
                            }
                        }
                    }
                }
            }
        }
    }, 0xc8);
    return true;
};
window.onload = function() {
    chrome.runtime.sendMessage({
        'action': "getOptions"
    });
};
document.addEventListener("readystatechange", var_43 => {
    if (var_43.target.readyState === "complete") {
        try {
            chrome.runtime.sendMessage({
                'action': "checkDeadline"
            });
        } catch (var_44) {
            debugLog(JSON.stringify(var_44));
        }
    }
});
window.addEventListener('message', function(var_45) {
    debugLog("Window received message");
    let var_46 = var_45.data;
    if (var_46.action === "recorderReady") {
        recorderReady();
    }
}, false);
chrome.runtime.onMessage.addListener(async function(var_47, var_48, var_49) {
    debugLog("Window received message from background");
    console.log(var_48);
    console.log(var_47);
    if (var_47.action === "checkDeadlineCallback") {
        if (var_47.disable) {
            debugLog("Bot outdated. Please update to the latest version.");
        } else {
            debugLog("Key valid.");
            main();
        }
        var_49(true);
    } else if (var_47.action === "getOptionsCallback") {
        var_49(true);
        if (var_47.options) {
            kktixOptions = var_47.options.kktix || {};
            options = var_47.options;
        }
    }
    return true;
});
let hkticketkiller;
let mainInterval;
let enabled = true;
let fantopiaOptions = {
    'autofillMembershipNumber': {
        'enable': false,
        'membershipNumber': ''
    },
    'addCart': {
        'enable': false,
        'dateSelectionRule': '由右至左',
        'priceSelectionRule': "由下至上",
        'qty': 0x2,
        'ignore': "缺貨登記,Reserve",
        'reloadDelay': 0xa
    }
};
let debugLog = function(var_0) {
    console.log("HKTicketKiller:", var_0);
};
let importHkticketkillerFuncs = async function() {
    const var_1 = chrome.runtime.getURL("scripts/hkticketkiller.js");
    hkticketkiller = await import(var_1);
};
let init = async function() {
    debugLog("Start Loading bot");
    await importHkticketkillerFuncs();
    mainInterval = setInterval(main, 0x1f4);
    chrome.runtime.sendMessage({
        'action': "checkDeadline"
    });
    chrome.runtime.sendMessage({
        'action': "getOptions"
    });
};
let clickNextbutton = function() {
    let var_2 = document.querySelector("button.btn-linear-bg");
    if (!var_2) {
        return;
    }
    var_2.click();
    const var_3 = Math.floor(Math.random() * 1001) + 0x3e8;
    setTimeout(clickNextbutton, var_3);
};
const PresaleMemberCodeHelper = {
    'firstAttempt': false,
    'run': function() {
        if (!fantopiaOptions.autofillMembershipNumber.enable) {
            return;
        }
        if (!this.firstAttempt) {
            let var_4 = document.querySelector("form input");
            if (!var_4) {
                return;
            }
            var_4.focus();
            var_4.value = fantopiaOptions.autofillMembershipNumber.membershipNumber || '';
            var_4.blur();
            var_4.dispatchEvent(new Event('input', {
                'bubbles': true
            }));
            this.firstAttempt = true;
        }
        let var_5 = document.querySelector("form button");
        if (var_5) {
            var_5.click();
        }
    }
};
const PurchasePageAddCartHelper = {
    'priceSelected': false,
    'dateSelected': false,
    'qtySelected': false,
    'complete': false,
    'lastTimestamp': null,
    'interval': 0x1f4,
    'scheduledReload': false,
    'reloadDelay': null,
    'run': function() {
        if (this.complete) {
            return;
        } else {
            if (!fantopiaOptions.addCart.enable || !fantopiaOptions.addCart.qty) {
                return;
            }
        }
        if (!this.scheduledReload && fantopiaOptions.addCart.reloadDelay) {
            chrome.runtime.sendMessage({
                'action': "forceReload",
                'delay': fantopiaOptions.addCart.reloadDelay * 0x3e8
            });
            this.scheduledReload = true;
        }
        let var_6 = Date.now();
        if (this.lastTimestamp && var_6 - this.lastTimestamp < this.interval) {
            return;
        }
        this.lastTimestamp = var_6;
        debugLog("PurchasePageAddCartHelper.run()");
        if (!this.dateSelected) {
            let var_7 = document.querySelectorAll(".flex-wrap .flex-col");
            let var_8 = [];
            var_7.forEach(var_9 => {
                var_8.push(var_9);
            });
            while (var_8.length > 0x0) {
                let var_10;
                if (fantopiaOptions.addCart.dateSelectionRule === '由左至右') {
                    var_10 = var_8.shift();
                } else if (fantopiaOptions.addCart.dateSelectionRule === '由右至左') {
                    var_10 = var_8.pop();
                } else {
                    var_10 = var_8.splice(Math.floor(Math.random() * var_8.length), 0x1)[0x0];
                }
                var_10.click();
                break;
            }
            debugLog("select date");
            this.dateSelected = true;
            return;
        }
        if (!this.qtySelected) {
            let var_11 = document.querySelectorAll('button.bg-dark2')[0x1];
            if (!var_11) {
                let var_12 = document.querySelectorAll(".border.cursor-pointer.rounded-xl");
                let var_13 = [];
                var_12.forEach(var_14 => {
                    var_13.push(var_14);
                });
                let var_15 = fantopiaOptions.addCart.ignore;
                let var_16 = [];
                if (var_15) {
                    var_15 = var_15.replaceAll('，', ',');
                    var_16 = var_15.split(',');
                }
                var_16.push("缺貨登記");
                var_16.push("缺货登记");
                var_16.push("Reserve");
                let var_17;
                while (var_13.length > 0x0) {
                    if (fantopiaOptions.addCart.priceSelectionRule === "由上至下") {
                        var_17 = var_13.shift();
                    } else if (fantopiaOptions.addCart.priceSelectionRule === "由下至上") {
                        var_17 = var_13.pop();
                    } else {
                        var_17 = var_13.splice(Math.floor(Math.random() * var_13.length), 0x1)[0x0];
                    }
                    if (var_16.some(var_18 => var_17.innerText.includes(var_18.trim()))) {
                        var_17 = null;
                    } else {
                        var_17.click();
                        debugLog("select price");
                        this.priceSelected = true;
                        break;
                    }
                }
                if (!var_17) {
                    debugLog("No available ticket");
                    window.location.href = window.location.href;
                }
                return;
            }
            for (let var_19 = 0x0; var_19 < fantopiaOptions.addCart.qty; var_19++) {
                var_11.click();
            }
            this.qtySelected = true;
        }
    }
};
const PurchasePageRetryHelper = {
    'purchaseButton': null,
    'retryButton': null,
    'createRetryButton': function() {
        let var_20 = document.createElement("button");
        var_20.id = "hkticketkiller-auto-retry";
        var_20.classList.add("cursor-pointer", 'relative', "overflow-hidden", "w-[160px]", 'h-11', "btn-linear-bg", "rounded-full", "text-sm", "text-white", 'font-semibold');
        var_20.innerText = "Auto retry";
        var_20.onclick = function() {
            if (var_20.dataset.started !== 'yes') {
                var_20.dataset.started = "yes";
                var_20.innerText = "Stop";
                PurchasePageRetryHelper.autoClick();
            } else {
                debugLog(var_20.dataset.stopAuto);
                if (var_20.dataset.stopAuto === "yes") {
                    debugLog("Set to false");
                    var_20.dataset.stopAuto = 'no';
                } else {
                    debugLog("Set to true");
                    var_20.dataset.stopAuto = "yes";
                }
                if (var_20.dataset.stopAuto === 'yes') {
                    var_20.innerText = "Auto retry";
                } else {
                    var_20.innerText = "Stop";
                }
            }
        };
        if (this.purchaseButton) {
            this.retryButton = this.purchaseButton.parentNode.appendChild(var_20);
            debugLog("Created retry btn.");
        }
    },
    'autoClick': function() {
        let var_21 = this.retryButton;
        let var_22 = this.purchaseButton;
        if (!var_21 || !var_22) {
            return;
        }
        let var_23 = document.querySelector('.ant-modal-mask');
        let var_24 = !!var_23 && !!var_23.style && var_23.style.display !== "none";
        if (var_21.dataset.stopAuto !== "yes" && !var_24) {
            debugLog("Click purchase button.");
            var_22.click();
        } else {
            PresaleMemberCodeHelper.run();
        }
        setTimeout(() => {
            PurchasePageRetryHelper.autoClick();
        }, 0x4b);
    }
};
let onPurchasePage = function() {
    if (!document.getElementById('hkticketkiller-auto-retry')) {
        PurchasePageRetryHelper.createRetryButton();
    }
    PurchasePageAddCartHelper.run();
};
let main = async function() {
    if (!enabled) {
        debugLog("disabled.");
        clearInterval(mainInterval);
        return;
    }
    PurchasePageRetryHelper.purchaseButton = document.querySelector(".text-right button.cursor-pointer.relative.overflow-hidden");
    onPurchasePage();
};
document.addEventListener("readystatechange", var_25 => {
    if (var_25.target.readyState === "complete") {
        try {} catch (var_26) {
            debugLog(JSON.stringify(var_26));
        }
    }
});
window.addEventListener('message', function(var_27) {}, false);
chrome.runtime.onMessage.addListener(async function(var_28, var_29, var_30) {
    if (var_28.action === 'checkDeadlineCallback') {
        if (var_28.disable) {
            enabled = false;
            debugLog("Bot outdated. Please update to the latest version.");
        } else {
            debugLog("Key valid.");
        }
        var_30(true);
    } else if (var_28.action === "getOptionsCallback") {
        var_30(true);
        if (var_28.options && var_28.options.fantopia) {
            fantopiaOptions = var_28.options.fantopia;
        }
    }
    return true;
});
init();
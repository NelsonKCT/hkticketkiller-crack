let urbtixOptions = {};
let mainInterval;
let enabled = true;
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
    }
};
let init = async function() {
    debugLog("Start Loading bot");
    mainInterval = setInterval(main, 0xc8);
    chrome.runtime.sendMessage({
        'action': "checkDeadline"
    });
    chrome.runtime.sendMessage({
        'action': "getOptions"
    });
    ReloadAt10amHelper.run();
};
let clickNextbutton = function() {
    let var_7 = document.querySelector("button.btn-linear-bg");
    if (!var_7) {
        return;
    }
    var_7.click();
    const var_8 = Math.floor(Math.random() * 1001) + 0x3e8;
    setTimeout(clickNextbutton, var_8);
};
let selectOption = function(var_9, var_10) {
    if (var_10 > 0x32) {
        debugLog("Error: unhandled options: " + var_9.length);
        return;
    }
    if (var_9.length <= 0x0) {
        return;
    }
    let var_11 = var_9[0x0];
    let var_12 = var_11.value;
    let var_13 = document.querySelector(".select-option[aria-label=\"" + var_12 + "\"]");
    if (var_13) {
        var_13.click();
        var_9.shift();
    }
    if (var_9.length > 0x0) {
        var_9[0x0].input.click();
        setTimeout(() => {
            selectOption(var_9, var_10++);
        }, 0x64);
    }
};
const AutoFillHelper = {
    'autofilledPaymentInfo': false,
    'selectOption': function(var_14, var_15) {
        if (var_15 > 0x32) {
            debugLog("Error: unhandled options: " + var_14.length);
            return;
        }
        if (var_14.length <= 0x0) {
            return;
        }
        let var_16 = var_14[0x0];
        let var_17 = var_16.value;
        let var_18 = document.querySelector(".select-option[aria-label=\"" + var_17 + "\"]");
        if (var_18) {
            var_18.click();
            var_14.shift();
        }
        if (var_14.length > 0x0) {
            var_14[0x0].input.click();
            setTimeout(() => {
                this.selectOption(var_14, var_15++);
            }, 0x64);
        }
    },
    'autofillPaymentInfo': async function() {
        debugLog("Auto fill payment info");
        this.autofilledPaymentInfo = true;
        if (!urbtixOptions || !urbtixOptions.paymentInfo) {
            return false;
        }
        let var_19 = urbtixOptions.paymentInfo;
        let var_20 = document.querySelector(".payment-way-wrapper[title=" + var_19.paymentMethod + ']');
        if (var_20) {
            var_20.click();
        }
        let var_21 = document.querySelectorAll(".personal-info input , .payment-info input");
        console.log(var_21);
        for (let var_22 = 0x0; var_22 < var_21.length; var_22++) {
            let var_23 = var_21[var_22];
            if (!var_23.name) {
                continue;
            }
            let var_24 = var_19[var_23.name];
            if (!var_24) {
                continue;
            }
            var_23.focus();
            var_23.value = var_24;
            var_23.blur();
        }
        let var_25 = document.querySelector(".agree-remind .agree-check");
        if (var_25) {
            let var_26 = var_25.getAttribute("aria-checked");
            debugLog('agreeRemindCheckbox' + var_26);
            if (var_19.agreeRemind && var_26 !== "true") {
                var_25.click();
            } else if (!var_19.agreeRemind && var_26 !== "false") {
                var_25.click();
            }
        }
        let var_27 = document.querySelectorAll(".payment-info input.select-input");
        let var_28 = [];
        for (let var_29 = 0x0; var_29 < var_27.length; var_29++) {
            let var_30 = var_27[var_29];
            let var_31 = var_30.getAttribute('placeholder');
            let var_32;
            if (var_31 === 'MM') {
                var_32 = var_19.cardValidMM;
            } else if (var_31 === 'YYYY') {
                var_32 = var_19.cardValidYYYY;
            }
            if (var_32) {
                let var_33 = {
                    'input': var_30,
                    'value': var_32
                };
                var_28.push(var_33);
            }
        }
        this.selectOption(var_28, 0x0);
        return true;
    },
    'createAutofillBtn': function() {
        if (document.getElementById("hkticketkiller_autofill_btn")) {
            return;
        }
        let var_34 = tools.createDivWithClass(["button-wrapper", 'blue', 'button']);
        var_34.id = "hkticketkiller_autofill_btn";
        var_34.innerText = "Autofill";
        var_34.onclick = function() {
            if (urbtixOptions && urbtixOptions.paymentInfo && urbtixOptions.paymentInfo.enable) {
                this.autofillPaymentInfo();
            } else {
                chrome.runtime.sendMessage({
                    'action': "goToSettings",
                    'page': "urbtix"
                });
            }
        };
        let var_35 = document.getElementsByClassName('step-two')[0x0];
        if (!var_35) {
            return;
        }
        var_35.prepend(var_34);
    }
};
const AutoLoginHelper = {
    'clickedLoginButton': false,
    'clickLoginButton': function() {
        if (this.clickedLoginButton) {
            return;
        }
        let var_36 = document.querySelectorAll(".radio-wrapper .radio-icon")[0x1];
        let var_37 = document.querySelector(".login-button");
        if (var_36 && var_37) {
            var_36.click();
            var_37.click();
            this.clickedLoginButton = true;
        }
    }
};
const AutoConfirmHelper = {
    'lastTimestamp': null,
    'interval': 0xbb8,
    'confirmButton': null,
    'run': function() {
        let var_38 = Date.now();
        if (this.lastTimestamp && var_38 - this.lastTimestamp < this.interval) {
            return;
        }
        this.lastTimestamp = var_38;
        if (!this.confirmButton) {
            debugLog("Error: AutoConfirmHelper / No confirm button");
            return;
        }
        debugLog("Auto click confirmButton");
        this.confirmButton.click();
    }
};
const AutoClickBuyButtonHelper = {
    'lastTimestamp': null,
    'interval': 0xbb8,
    'buyButton': null,
    'buttonDisabled': null,
    'run': function() {
        let var_39 = Date.now();
        if (this.lastTimestamp && var_39 - this.lastTimestamp < this.interval) {
            return;
        }
        if (!this.buyButton) {
            debugLog("Error: AutoClickBuyButtonHelper / No buy button");
            return;
        }
        debugLog("Found Button");
        this.buttonDisabled = this.buyButton.getAttribute("aria-disabled");
        debugLog("Button available " + this.buttonDisabled);
        if (this.buttonDisabled !== "false") {} else {
            this.lastTimestamp = var_39;
            setTimeout(function() {
                debugLog("Auto click");
                null.click();
            }, 0x3e8);
        }
    }
};
const ReloadAt10amHelper = {
    'getMsDiffFromNext10am': function() {
        const var_40 = Date.now();
        const var_41 = new Date(var_40).getHours();
        let var_42;
        if (var_41 >= 0xa) {
            const var_43 = new Date().setDate(new Date().getDate() + 0x1);
            const var_44 = new Date(var_43).setHours(0xa, 0x0, 0x0, 0x0);
            var_42 = var_44 - var_40;
        } else {
            const var_45 = new Date().setHours(0xa, 0x0, 0x0, 0x0);
            var_42 = var_45 - var_40;
        }
        return var_42;
    },
    'run': function() {
        let var_46 = window.location.href;
        if (var_46.includes('www.urbtix.hk')) {
            let var_47 = this.getMsDiffFromNext10am() - 0x1f4;
            const var_48 = Math.floor(var_47 / 3600000);
            const var_49 = Math.floor(var_47 % 3600000 / 60000);
            debugLog("Reload after " + var_48 + "hr " + var_49 + "min");
            if (var_47 > 0x0) {
                setTimeout(() => {
                    window.location.reload();
                }, var_47);
            }
        }
    }
};
let main = async function() {
    if (!enabled) {
        debugLog("disabled.");
        clearInterval(mainInterval);
        return;
    }
    let var_50 = window.location.href;
    AutoClickBuyButtonHelper.buyButton = document.querySelector('[aria-label=確認選擇門票]');
    AutoConfirmHelper.confirmButton = document.getElementsByClassName('notification-confirm-btn')[0x0];
    if (var_50.includes("/login")) {
        AutoLoginHelper.clickLoginButton();
    } else {
        if (var_50.includes("/payment-information/") && true) {
            if (!document.querySelector(".loading-wrapper:not(.hidden)")) {
                AutoFillHelper.createAutofillBtn();
                if (urbtixOptions && urbtixOptions.paymentInfo && urbtixOptions.paymentInfo.enable) {
                    AutoFillHelper.autofillPaymentInfo();
                }
            }
        } else {
            AutoConfirmHelper.run();
        }
    }
};
document.addEventListener("readystatechange", var_51 => {
    if (var_51.target.readyState === "complete") {}
});
chrome.runtime.onMessage.addListener(async function(var_52, var_53, var_54) {
    debugLog("Window received message from background");
    if (var_52.action === "checkDeadlineCallback") {
        if (var_52.disable) {
            debugLog("Bot outdated. Please update to the latest version.");
            enabled = false;
        } else {
            debugLog("Key valid.");
            main();
        }
        var_54(true);
    } else {
        if (var_52.action === "getOptionsCallback") {
            var_54(true);
            if (var_52.options) {
                urbtixOptions = var_52.options.urbtix || {};
            }
        }
    }
    return true;
});
init();
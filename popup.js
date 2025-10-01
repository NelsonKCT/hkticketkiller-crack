let scale = 0x1;
let title = document.getElementById("title");
let desc = document.getElementById("desc");
let activateInput = document.getElementById('activate_input');
let activateButton = document.getElementById("activate_button");
let mainContainer = document.getElementById('main_container');
let loadingContainer = document.getElementById("loading_container");
let checkKeyUrl = document.getElementById("check_key_url");
let currentStatus = "未啟用";
let deadline;
let options = {
    'hkticketing': {
        'speed': 0x3
    }
};
let showLoadingContainer = function(show) {
    if (show) {
        mainContainer.style.display = "none";
        loadingContainer.style.display = "flex";
    } else {
        mainContainer.style.display = 'flex';
        loadingContainer.style.display = 'none';
    }
};
let initOptionsButton = function() {
    let optionsButton = document.getElementById("all_settings");
    optionsButton.onclick = async function() {
        return;
        let optionsContainer = document.getElementById("options_container");
        optionsContainer.style.display = 'flex';
        mainContainer.style.display = "none";
    };
};
let createToggle = function(targetElement) {
    let toggleId = "toggle-" + Math.random().toString(0x24).substring(0x2, 0x10);
    let indicatorId = "togid" + Math.random().toString(0x18).substring(0x2, 0x10);
    const label = document.createElement("LABEL");
    const checkbox = document.createElement('input');
    checkbox.setAttribute("type", "checkbox");
    checkbox.setAttribute('id', toggleId);
    checkbox.classList.add("toG");
    const indicator = document.createElement("div");
    indicator.setAttribute('id', indicatorId);
    indicator.style.setProperty("--check-toggle", '#be1931');
    label.append(checkbox);
    label.append(indicator);
    indicator.classList.add("mytoggle");
    targetElement.appendChild(label);
    return toggleId;
};
let initOptions = async function() {
    let optionsContainer = document.getElementById("options_container");
    optionsContainer.style.display = "flex";
    let speedRange = document.getElementById("options_hkticketing_range");
    let speedRangeDescription = document.getElementById('options_hkticketing_range_desc');
    if (!options) {
        options = {};
    }
    if (options.hkticketing) {
        speedRange.value = options.hkticketing.speed;
        speedRangeDescription.innerText = "快達票自動刷新速度: " + speedRange.value + '秒';
    }
    speedRange.oninput = function() {
        console.log(this.value);
        speedRangeDescription.innerText = "快達票自動刷新速度: " + this.value + '秒';
        if (!options.hkticketing) {
            options.hkticketing = {};
        }
        options.hkticketing.speed = this.value;
        chrome.runtime.sendMessage({
            'action': "updateOptions",
            'options': options
        });
    };
    let urbtixToggleContainer = document.getElementById("toggle_urbtix_autofill");
    let urbtixToggleId = createToggle(urbtixToggleContainer);
    let urbtixToggle = document.getElementById(urbtixToggleId);
    if (options.urbtix && options.urbtix.paymentInfo) {
        urbtixToggle.checked = options.urbtix.paymentInfo.enable;
    }
    urbtixToggle.addEventListener('change', function() {
        if (!options.urbtix) {
            options.urbtix = {};
        }
        if (!options.urbtix.paymentInfo) {
            options.urbtix.paymentInfo = {};
        }
        options.urbtix.paymentInfo.enable = urbtixToggle.checked;
        chrome.runtime.sendMessage({
            'action': "updateOptions",
            'options': options
        });
        if (options.urbtix.paymentInfo.enable) {
            chrome.runtime.sendMessage({
                'action': "goToSettings",
                'page': "urbtix"
            });
        }
    });
    let citylineToggleContainer = document.getElementById('toggle_cityline_autofill');
    let citylineToggleId = createToggle(citylineToggleContainer);
    let citylineToggle = document.getElementById(citylineToggleId);
    if (options.cityline && options.cityline.paymentInfo) {
        citylineToggle.checked = options.cityline.paymentInfo.enable;
    }
    citylineToggle.addEventListener("change", function() {
        if (!options.cityline) {
            options.cityline = {};
        }
        if (!options.cityline.paymentInfo) {
            options.cityline.paymentInfo = {};
        }
        options.cityline.paymentInfo.enable = citylineToggle.checked;
        chrome.runtime.sendMessage({
            'action': 'updateOptions',
            'options': options
        });
        if (options.cityline.paymentInfo.enable) {
            chrome.runtime.sendMessage({
                'action': "goToSettings",
                'page': "cityline"
            });
        }
    });
    initOptionsButton();
};
let setStatus = function(status) {
    currentStatus = status;
    if (currentStatus === '已過期') {
        let expiredDate = new Date(deadline * 0x3e8);
        title.innerText = currentStatus + " (" + expiredDate.toLocaleString("zh-HK") + ')';
        desc.innerText = '請更新產品金鑰';
        activateButton.innerHTML = '更新';
    } else {
        if (currentStatus === "已啟用") {
            let expiryDate = new Date(deadline * 0x3e8);
            title.innerText = currentStatus;
            desc.innerText = "有效期至: " + expiryDate.toLocaleString("zh-HK");
            activateButton.style.display = "none";
            activateInput.style.display = 'none';
        }
    }
};
let getOptions = async function() {
    try {
        let fetchedOptions = await chrome.runtime.sendMessage({
            'action': 'getOptions'
        });
        if (fetchedOptions) {
            options = fetchedOptions;
        }
    } catch (optionsError) {
        console.log(optionsError);
    }
};
let handleScale = function() {
    let popupWidth = document.documentElement.getBoundingClientRect().width;
    scale = popupWidth / 0x12c;
    document.body.style.width = 0x12c * scale + 'px';
    var rootElement = document.querySelector(":root");
    rootElement.style.setProperty('--scale', scale);
};
let main = async function() {
    handleScale();
    // 跳过key校验，直接激活
    currentStatus = "已啟用";
    deadline = Math.floor(Date.now() / 1000) + 31536000; // 伪造一年有效期

    // 设置存储值以确保background.js正确识别扩展状态
    await chrome.storage.local.set({
        'hkticketkiller_enabled': true,
        'hkticketkiller_disabled': false,
        'hkticketkiller_deadline': deadline,
        'hkticketkiller_key': 'bypassed'
    });

    // 触发background.js检查deadline，这会激活所有功能
    await chrome.runtime.sendMessage({
        'action': 'checkDeadline'
    });
    title.innerText = currentStatus;
    desc.innerText = '已跳过金鑰校驗，功能已啟用';
    activateButton.style.display = 'none';
    activateInput.style.display = 'none';
    showLoadingContainer(false); // 隐藏加载界面
    await getOptions(); // 获取选项
    await initOptions(); // 初始化并显示选项界面
    return true;
};
main();
chrome.runtime.onMessage.addListener(async function(message, sender, sendResponse) {
    if (message.action === "checkDeadlineCallback") {
        deadline = message.deadline;
        if (message.key) {
            checkKeyUrl.setAttribute("href", 'https://hkticketkiller.com/check_key?key=' + message.key);
            checkKeyUrl.innerText = "剩餘金鑰使用次數";
        }
        if (message.error) {
            setStatus("未啟用");
            desc.innerText = message.error;
        } else {
            if (!deadline) {
                setStatus("未啟用");
            } else if (message.disable) {
                setStatus('已過期');
            } else {
                setStatus("已啟用");
                getOptions();
            }
        }
        showLoadingContainer(false);
        sendResponse(true);
    } else if (message.action === "getOptionsCallback") {
        options = message.options;
        initOptions();
        sendResponse(true);
    }
    return true;
});
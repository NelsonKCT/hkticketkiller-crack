# HK Ticket Killer - 學術研究版本

## ⚠️ 重要聲明

**本專案為破解版軟件，僅供學術研究和教育用途。**

- **原版軟件**: [https://hkticketkiller.com/](https://hkticketkiller.com/)
- **版權聲明**: 請尊重知識產權，本專案僅限於學術用途
- **免責聲明**: 使用者需自行承擔使用本軟件的風險和責任

## 📖 專案簡介

HK Ticket Killer 是一個輔助購票的 Chrome 瀏覽器擴展程式，支援多個香港票務平台的自動化操作。本版本 (v1.16.0) 為最小化版本，專為學術研究而設計。

## 🎯 支援平台

根據程式碼分析，本擴展支援以下票務平台：

- **Cityline** (event.cityline.com)
- **HK Ticketing** (hkticketing.com)
- **Fantopia** (fantopia.io)
- **UrbtIX** (透過 bot_urbtix.js)
- **KKTIX** (透過 bot_kktix.js)

## 🚀 功能特色

- 自動化購票流程
- 多平台支援
- 即時通知功能
- 設定界面
- 後台服務工作者

## 📁 專案結構

```
hkticketkiller-min_v1.16.0/
├── manifest.json          # 擴展配置文件
├── background.js           # 後台服務腳本
├── popup.html             # 彈出視窗界面
├── popup.js               # 彈出視窗邏輯
├── popup.css              # 彈出視窗樣式
├── images/                # 圖標資源
│   ├── logo.png
│   ├── 1.png, 2.png, 3.png
│   └── settings_FILL0_wght400_GRAD0_opsz24.svg
└── scripts/               # 核心腳本
    ├── bot.js             # 主要機器人邏輯
    ├── bot.css            # 機器人樣式
    ├── bot_cityline.js    # Cityline 平台腳本
    ├── bot_fantopia.js    # Fantopia 平台腳本
    ├── bot_kktix.js       # KKTIX 平台腳本
    ├── bot_urbtix.js      # UrbtIX 平台腳本
    ├── hkticketkiller.js  # 核心功能腳本
    └── settings.js        # 設定管理腳本
```

## 🔧 安裝方式

### 開發者模式安裝

1. 打開 Chrome 瀏覽器
2. 進入 `chrome://extensions/`
3. 開啟「開發者模式」
4. 點擊「載入未封裝項目」
5. 選擇本專案資料夾

## 📋 系統要求

- Chrome 瀏覽器 (支援 Manifest V3)
- 需要的權限：
  - `tabs` - 標籤頁管理
  - `storage` - 本地儲存
  - `system.display` - 顯示資訊
  - `notifications` - 通知功能

## 🔒 隱私與安全

本擴展會存取以下外部服務：
- `https://hkticketkiller-backend-latest.vercel.app/*`
- `https://worldtimeapi.org/*`
- `https://event.cityline.com/*`

請確保您了解並同意這些存取權限。

## 📚 學術用途指南

本專案可用於以下學術研究：

1. **網頁自動化技術研究**
2. **瀏覽器擴展開發學習**
3. **反機器人檢測機制研究**
4. **網路爬蟲技術分析**

## ⚖️ 法律責任

- 本軟件僅供學術研究和教育目的
- 使用者應遵守相關法律法規
- 不得用於商業用途或非法活動
- 使用者需自行承擔所有風險

## 🤝 貢獻

由於本專案為學術研究版本，我們不接受功能增強的 Pull Request。如有學術討論需求，請通過 Issues 進行交流。

## 📄 授權

本專案僅供學術研究使用。請尊重原版軟件的知識產權。

---

**再次提醒：本專案僅供學術用途，請勿用於商業或違法用途。使用前請詳細閱讀相關條款。**

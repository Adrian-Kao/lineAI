# 萬春宮 DEMO：2.5 天開發與四人分工

## 交付目標

3 分鐘影片展示：在 LINE 中開啟 → 讀取真實 LINE 名稱／頭貼 → 中區地圖選萬春宮 → 數位蓋章 → 拍照補洞 → 拼圖 → 文化故事 → 錨點點亮 → 圖鑑、集章簿 → 模板旅程手札。

一個活動點位完成代表萬春宮 DEMO 路線完成，不代表實際整個中區／台中市已完成。其他行政區淺灰、淺黃、橘色用預設進度截圖說明。所有非正式 LINE 權益、AI 結果和感應驗證標示模擬。

估算以兩個完整工作日，每人每日約 8 小時，加最後半日約 4 小時為準；晚間不列為必要工時。錄影、剪輯、輸出與上傳包含在時程內。

## 範圍排序

P0 必須：LINE MINI App／LIFF 真實入口與 profile、萬春宮頁、三任務依序、模擬蓋章、真實照片選取或拍攝、2×2 拼圖、故事、完成狀態、集章與照片時間、本機保存、部署；影片由團隊在系統外製作。

P1 有餘裕：固定模板手札時間線、一次 LINE 分享、簡單蓋章／點亮動畫。手札若來不及，直接用三張收藏卡構成回顧頁。

不做：全台 GeoJSON 互動地圖、真正 AI 圖像相似度、AI 生成小遊戲、SMS OTP、電話復原、完整換頭貼／頭框、LINE POINTS 發送、永久貼圖／主題發送、多人同步、管理後台。

LINE Touch 硬體若現成可用，另列 P1；若沒有，使用 QR 開啟正式 MINI App 入口，畫面內模擬蓋章。自備普通 NFC 寫網址可展示 NFC 開啟流程，但不得稱為已串接官方 LINE Touch。感應開啟與任務驗證是兩件事。

## 精簡技術與共同介面

React + Vite + JS、React Router、CSS。本次共享狀態先用一個 Context + useReducer；localStorage 保存少量進度，IndexedDB 保存一張壓縮照片。地圖採靜態圖片／SVG 加可點擊萬春宮標記，不安裝 MapLibre。不依賴線上 AI。

由 A 在最初 90 分鐘固定介面：

```jsx
<StampTask onComplete={handleComplete} />
<PhotoTask onComplete={handleComplete} />
<PuzzleTask imageUrl={imageUrl} onComplete={handleComplete} />
```

onComplete(result) 回傳 { taskId, completedAt, mediaId? }；A 的 reducer 驗證順序、去重並寫入收藏。任務完成前照片必須已保存；取消、拍照失敗或拼圖未完成均不回呼成功。

統一狀態：profile、missionCompletions、photoRecords、stampRecords、journalEvents。完成色彩由 missionCompletions 推導。所有成員使用同一份 temple.js，避免文案及 ID 不一致。game.js 不含 LINE 私密憑證。

## 四人角色

| 人員 | 主責 | 交付與檔案邊界 |
| --- | --- | --- |
| A：經驗較豐富的資管三 | 技術負責、整合、LINE SDK、任務狀態 | app/、state/、services/line.js、路由與部署設定；支援 B 的帳號問題 |
| B：另一名資管三 | 拍照任務、LINE Console 與部署協作 | features/photo/；先建立 Console 設定、提供 LIFF ID 與入口；處理真機測試 |
| C：資管二 | 遊戲首頁、萬春宮介紹、蓋章、收藏與視覺 | features/map/、features/stamp/、features/collection/、共享樣式；前三者先完成，其餘逐步加 |
| D：資管二 | 2×2 拼圖、故事與旅程頁、素材及影片 | features/puzzle/、features/story/、features/journal/；先拼圖與故事，再回顧頁；從首日起準備錄影脚本 |

A 不負責所有頁面；B 遇到 LINE 阻礙超過 30 分鐘即與 A 配對排查。C/D 用簡單點選交换或選片再點槽位，不先做自由拖曳。所有素材與文案四人共同提供，D 統一整理，避免耗掉整個人的開發時間。

## 第一天：先證明 LINE 能跑，再做出完整粗版

| 時間 | A | B | C | D | 檢查點 |
| --- | --- | --- | --- | --- | --- |
| 0–1.5h | 建立路由、狀態與任務介面、空頁；啟動部署 | Console、MINI App channel、測試帳號權限、準備 Vercel 連 GitHub | 手機版樣式及地圖底圖 | 整理萬春宮照片、短故事、180 秒腳本；拼圖骨架 | 共同介面凍結 |
| 1.5–3h | LIFF init、登入／profile、錯誤訊息 | endpoint、profile scope、HTTPS、真機開啟與回呼測試 | 可點萬春宮的地圖與介紹 | 完成可玩 2×2 拼圖 | LINE 中看到真實頭貼／名稱 |
| 3–5h | 接蓋章與拼圖、任務順序、本機進度 | 拍照／相簿、預覽、壓縮保存 | 蓋章動畫與印章卡 | 拼圖成功＋短故事 | 任務頁可以由頭走到尾 |
| 5–8h | 整合全流程、部署當日可用版 | 遮罩合成、真機相機測試 | 集章、圖鑑骨架與完成畫面 | 故事頁、模板回顧頁 | 當天必須錄一段粗版流程 |

LINE 檢查點最多容許到第 3 小時：若 MINI App 建立／帳號設定卡住，先排查角色、地區、scope、LIFF ID、endpoint 及同意設定。確實受阻時，可用 LINE Login channel 的 LIFF app 作應急真實展示，但影片必須標示「LIFF 原型」，不能說已完成 MINI App 串接。不等待正式 verified MINI App 審核。

## 第二天：修正手機問題、整理視覺、完成錄影版本

| 時間 | 工作 | 分工／檢查點 |
| --- | --- | --- |
| 0–2h | 修復昨日粗版錯誤；照片、順序、重新整理 | A/B 修整合與手機問題，C/D 完成收藏／故事 |
| 2–4h | 統一字體、按鈕、色彩、任務回饋；完成回顧 | C 視覺主責，D 回顧；A/B 確認資料保存 |
| 4–5h | 若 P0 全通，加入分享或現成 NFC；否则只修 P0 | A/B 限時 1 小時，失败即移出影片 |
| 5–6h | 兩支手機完整走一遍、錄影排練；展示前資料準備在系統外處理 | 一人操作、一人記錄、一人查畫面、一人看台詞 |
| 6–8h | 功能凍結；錄乾淨素材、準備地圖截圖 | D 錄影／剪輯主責，C 截圖／字幕，A/B 只修阻斷錯誤 |

第二天末必須已經有可用錄影素材。若字幕、配音尚未完成仍可在半天內補；功能不能再等第三天才整合。

## 第三天半日：影片交付

0–1h：必要補錄與旁白。1–2.5h：剪輯、加模擬功能標籤、核對 180 秒限制。2.5–3h：輸出、手機與電腦檢查畫面／音量。3–4h：保留上傳與失敗重試時間。凍結後只修無法錄影／交付的問題。

## 3 分鐘影片腳本

| 時間 | 畫面與說明 |
| --- | --- |
| 0–15 秒 | 宮廟文化探索目標、萬春宮場景 |
| 15–40 秒 | QR／現成 NFC 開啟 LINE MINI App；真實 LINE profile |
| 40–55 秒 | 地圖點萬春宮、三任務順序 |
| 55–75 秒 | 模擬蓋章、集章取得時間；說明未來 LINE Touch |
| 75–105 秒 | 找點拍照、選取／拍攝、補洞預覽；相似度標示模擬 |
| 105–130 秒 | 2×2 拼圖、文化故事 |
| 130–150 秒 | 萬春宮錨點點亮、照片及印章收藏 |
| 150–170 秒 | 模板旅程回顧，若分享已測通則展示 |
| 170–180 秒 | 行政區顏色截圖、未來擴展與模擬獎勵說明 |

若分享需较长操作，從拼圖／照片片段各縮短幾秒；不要超出時長。可剪接，但不將靜態示意圖誤呈為實際已完成互動功能。

## LINE 展示驗收

- 使用 LINE MINI App 入口開啟，Vercel HTTPS endpoint 正常，前端顯示當次真實 LINE 名稱和頭貼。
- 確認 liff.init 成功、使用所需 scope、外部瀏覽器必要時可登入後返回。不展示 access token、userId 或 Console secret。
- 分享為可選項，先檢查 liff.isApiAvailable('shareTargetPicker') 與 Console 設定；取消分享不得阻斷完成流程。只向團隊自己的測試對象分享。
- 自有普通 NFC / QR 標示為入口展示；LINE Touch 只有使用正式硬體／方案並確認串接後才聲稱完成。
- 雙重驗證、AI、POINTS、永久貼圖／主題不列為真實完成能力。

## 協作与風險控制

每人一個功能分支，A 整合主分支。共用檔案由 A 修改，C 的共享樣式變更先通知其他人。每日最少在第 3 小時及下班前整合，依賴版本统一，用 npm ci 重現環境。

錄影、截圖、展示前資料準備皆由團隊在系統外處理；不開發錄影介面、進度重置按鈕或示意進度載入功能。故事來源保留於內容檔。

降級順序：移除分享 → 移除 NFC（保留 QR）→ 手札改收藏回顧卡 → 照片改相簿選取及簡單遮罩 → 動畫縮成狀態切換。真實 LINE profile 與完整三任務流程始終優先保留。

## 官方參考與確認事項

- MINI App channel 與開發流程：https://developers.line.biz/en/docs/line-mini-app/develop/develop-overview/
- MINI App Console guide：https://developers.line.biz/en/docs/line-mini-app/discover/console-guide/
- LIFF API：https://developers.line.biz/en/reference/liff
- LIFF 開發及分享設定：https://developers.line.biz/en/docs/liff/developing-liff-apps
- LINE Touch 官方說明：https://tw.linebiz.com/service/other-solutions/line-touch/

LINE 官方文件有 unverified MINI App 流程；實際可用入口、權限及設定仍以團隊帳號 Console 與實機測試為準。不要把經驗不足或網頁尚未發布當成必須等待正式審核的理由。

# 智慧宮廟文化探索遊戲：前端架構設計

設計日期：2026-09-18。狀態：設計提案，尚未安裝依賴或修改既有應用程式。

> 本次繳交以 [demo-plan.md](demo-plan.md) 為準：2.5 天、四人、3 分鐘影片、台中市中區萬春宮單一點位。以下為長期架構；全台互動地圖、多點位、完整 AI 與獎勵服務不屬本次必要交付。

## 1. 技術選擇

沿用現有 React + Vite + JavaScript（ES modules、JSX），搭配 JSDoc 描述資料與服務介面。採用行動裝置優先的單頁應用程式。

| 用途 | 建議 | 理由 |
| --- | --- | --- |
| 頁面路由 | React Router（react-router 8），Declarative 模式 | 任務、收藏、帳戶可有獨立網址，保留返回導航 |
| 狀態管理 | Zustand | 共用遊戲進度、登入狀態與展示佇列 |
| 地圖 | MapLibre GL JS + GeoJSON | 行政區多邊形、依進度上色、定位與縮放、宮廟點位 |
| 視覺 | CSS Modules + CSS variables | 將色彩、間距、字體與動畫統一，不需要先引入大型 UI 框架 |
| 小遊戲 | React + SVG；照片合成使用 Canvas | 固定規則遊戲可用 DOM/SVG 實作，觸控操作容易整合 |
| 本機儲存 | localStorage + IndexedDB | 前者放少量設定及進度，後者放照片 Blob、手札內容 |
| LINE | LIFF SDK，透過服務介面包裝 | 可切換 DEMO 與真實 LINE 執行環境 |
| 部署 | GitHub → Vercel → LINE MINI App endpoint | Vercel 專案 Root Directory 指向 my-react-app |

先不引入完整遊戲引擎或 SSR。未來有大量異步伺服器資料時，再評估 TanStack Query。套件版本於實作時確認與現有 React/Vite 相容性並鎖入 lockfile。

## 2. 分層與資料方向

頁面與功能元件 → 遊戲操作（commands）→ 領域規則（domain）→ Repository / Service → DEMO adapter 或正式 API adapter。

- 頁面負責呈現和使用者輸入，不直接改寫完成狀態或發放獎勵。
- domain 使用純 JavaScript 函式，處理任務前置條件、區域進度、里程碑與獎勵規則。
- Repository 處理保存與讀取；Service 處理登入、感應、照片比對、AI 和獎勵整合。
- Zustand 保存執行中的狀態。地圖色彩與完成百分比由進度推導，避免另外保存造成不同步。
- 正式版伺服器將成為任務證據、完成時間與獎勵資格的權威來源；本機資料只作快取。

## 3. 預計目錄

```text
my-react-app/
  public/
    maps/                     # 簡化後的行政區 GeoJSON，按需要載入
    content/                  # 經確認授權的 DEMO 圖片、故事、印章
  src/
    app/
      App.jsx
      router.jsx
      bootstrap.js            # LIFF / DEMO 初始化與本機資料還原
    pages/
      EntryPage.jsx
      MapPage.jsx
      TemplePage.jsx
      MissionPage.jsx
      CollectionPage.jsx
      StampBookPage.jsx
      JournalPage.jsx
      AccountPage.jsx
      SettingsPage.jsx
    features/
      auth/
      map/                    # 地圖圖層、圖例、區域選取、宮廟錨點
      missions/
        stamp/
        photo/
        minigame/
      games/
        registry.js
        puzzle/
        restoration/
        coloring/
        conservation/
      stories/
      collections/
      stampbook/
      journal/
      rewards/
      account/
    domain/
      missionRules.js
      progressSelectors.js
      milestoneRules.js
      rewardRules.js
      commands.js
    data/
      demoManifest.js
      regions.js
      temples.js
      missions.js
      stories.js
      collectibles.js
      rewardPolicy.js
    stores/
      authStore.js
      gameStore.js
      uiStore.js
    repositories/
      progressRepository.js
      mediaRepository.js
      profileRepository.js
    services/
      contracts.js
      createServices.js
      demo/
      line/
      api/
    shared/
      components/
      hooks/
      styles/
      utils/
  docs/
  vercel.json                 # 實作時設定 SPA fallback
```

這是預計結構，開發時依功能逐步建立，不先產生大量空檔。

## 4. 路由與使用者流程

| 路由 | 功能 |
| --- | --- |
| / | 入口、LINE 初始化、登入／補充驗證 |
| /map | 全台地圖 |
| /map?district=:id | 特定鄉鎮市區視角 |
| /temples/:templeId | 宮廟介紹、三項任務與進度 |
| /temples/:templeId/missions/:missionId | 單一任務，檢查前置任務 |
| /collection | 圖鑑：歷史／文化照片及使用者照片 |
| /stampbook | 集章簿與取得時間 |
| /journal | 旅程預覽、手札製作與全台完成動畫 |
| /account | 頭貼、頭像框、顯示名稱、LINE 綁定資訊 |
| /settings | 音效、動畫、資料管理等 |

MapPage 放在保留狀態的地圖 layout 中；任務可作為巢狀 overlay，避免每次返回都重新建立地圖。選取行政區保存於 URL；地圖中心、縮放和邊界保存於 uiStore。

任務成功 → 顯示該任務對應文化故事 → 下一任務；第三項完成 → 宮廟點亮 → 依序顯示新達成的鄉鎮市區、縣市、全台里程碑 → 回原行政區地圖。動畫不是寫入完成進度的必要條件，重新整理後仍保有完成紀錄。

## 5. 內容資料與玩家資料分離

內容資料使用穩定 ID，行政區採官方代碼及縣市父 ID，不用名稱作關聯鍵。

| 資料 | 主要欄位 |
| --- | --- |
| County | id、name、districtIds |
| District | id、countyId、name、geometryId、bounds、templeIds |
| Temple | id、districtId、name、coordinates [longitude, latitude]、missionIds |
| Mission | id、templeId、type、order、prerequisiteIds、config、storyId |
| Story | id、title、body、sources、reviewStatus |
| Collectible | id、districtId、imageUrl、caption、source、license |
| ContentManifest | version、coverageMode、requiredDistrictIds、requiredTempleIds |

玩家資料：

| 資料 | 主要欄位 |
| --- | --- |
| Profile | userId、lineLinked、displayName、avatarMediaId、frameId |
| MissionCompletion | missionId、completedAt、evidenceId |
| PhotoRecord | id、templeId、missionId、mediaId、capturedAt |
| StampRecord | id、templeId、missionId、acquiredAt |
| CollectionEntry | id、collectibleId 或 photoRecordId、acquiredAt |
| Milestone | id、scope、scopeId、contentVersion、achievedAt |
| RewardGrant | id、milestoneId、type、amount、status、externalReference |
| JourneyEvent | id、type、occurredAt、templeId、districtId、mediaIds、storyId |
| Journal | id、sourceEventIds、status、sections、createdAt |

所有時間保存 ISO UTC，顯示使用 Asia/Taipei；DEMO 時間来自本機，正式版由伺服器記錄。LINE 身分與遊戲內可修改的名字、頭貼分開保存。

## 6. 任務與進度規則

每間宮廟固定順序：stamp → photo → minigame。任務 UI 狀態 locked、available、inProgress、completed；locked/available 從前置條件推導，inProgress 可保存草稿，completed 必須有完成紀錄。

completeMission 操作依序驗證前置任務及結果、去除重複提交、產生完成紀錄與收藏、計算新的里程碑、建立獎勵及旅程事件，最後保存完整進度快照。照片先保存成功，才寫入引用它的完成紀錄；未提交的媒體可清理。避免跨 localStorage / IndexedDB 保存失敗留下不可讀收藏。

- 宮廟三項皆完成：錨點黃色；未完成：深灰。
- 行政區尚無宮廟完成：淺灰。
- 行政區至少一間完成、仍有未完成宮廟：淺黃。
- 行政區所有納入活動的宮廟完成：橘色。
- 宮廟少於三項任務、無宮廟的行政區、未開放區域：不得因空集合而自動完成。
- 縣市與全台完成以 ContentManifest 的必須完成範圍計算。DEMO 只顯示「DEMO 範圍完成」，不得宣稱全台已完成。
- 活動內容版本固定完成分母，後續新增宮廟不撤銷既有獎勵；新版本獎勵資格須由明確政策決定。

獎勵政策資料化：鄉鎮市區為文化照片 + 50 POINTS；縣市為遊戲徽章 + 200 POINTS；全台為手札動畫 + 貼圖／主題預定獎勵 + 1000 POINTS。DEMO 均標示模擬，不實際發送 LINE 權益。

同一次提交可能連續解鎖三種里程碑，展示佇列順序為宮廟 → 行政區 → 縣市 → 全台。RewardGrant 使用穩定的里程碑／獎勵鍵去重；achievement 與 grant 分開，發送失敗可重試。正式版在伺服器設定唯一約束與交易，避免多裝置重複領取。

## 7. 三項任務與小遊戲擴充

蓋章：StampService.start / verify，DEMO 用模擬感應按鈕。正式硬體須確認協定；NFC 開啟網址本身不足以證明到訪，需後端驗證可用的現場證據，不讓網址 templeId 直接完成任務。

拍照：顯示原圖遮罩 → 相機／檔案選取 → 拍攝預覽 → ImageMatchService.compare → 使用者裁切、對位 → 遮罩內合成 → 保存。照片相似度與補洞合成為兩個獨立功能。DEMO 使用明確標示的模擬結果；權限拒絕提供重試／相簿選取，錯誤時保持任務未完成。原圖壓縮後存 Blob，生成預覽時使用 object URL 並適時釋放。

小遊戲共用介面 Game({ config, initialState, onProgress, onComplete })。registry 依 type 載入 renderer；完成必須通過各自的規則 validator。

- puzzle：拼圖片段位置／旋轉符合目標。
- restoration：石柱碎片放入指定槽位。
- coloring：指定區域填色條件，容許文化內容自行設定答案。
- conservation：依正確工具與步驟完成文物保護。

第一版只完成 puzzle 模板，其他模板保留資料介面。AI 小遊戲服務未來只產生符合白名單模板 schema 的 JSON 設定，經檢查後呈現，不執行生成的 JS 或 HTML。故事由內容資料載入，DEMO 文案標記為示意；正式內容需有來源與審核。

## 8. LINE、AI 與後端邊界

| 能力 | 前端 DEMO | 正式需求 |
| --- | --- | --- |
| LINE 身分 | 模擬帳號；可另接 LIFF 測試 | LIFF 登入，伺服器驗證 token、建立遊戲帳戶 |
| 雙重驗證／電話備援 | 模擬流程與結果 | SMS OTP 服務、重試限制、帳戶綁定與復原規則 |
| LINE Touch | 模擬感應 | 確認硬體、支援流程及防重放驗證 |
| 照片辨識 | 模擬相似度 | 圖片上傳、模型推論、門檻校準、結果驗證 |
| AI 手札 | 使用事件資料生成固定模板 | 後端 AI proxy，回傳結構化手札段落 |
| AI 小遊戲 | 固定模板設定 | 後端生成與 schema 驗證，必要時內容審核 |
| POINTS／永久貼圖／主題 | 模擬獎勵紀錄 | 確認商務合作、發放方式與可行性，再接正式服務 |

雙重驗證與電話備援不等於 LIFF 登入。電話只作已綁定 LINE 遊戲帳戶的補充驗證／復原，不建立未綁定 LINE 的獨立正式帳戶。LINE 登入失敗時仍需考慮 MINI App 的進入路徑，不假設 SMS 能解除平台登入限制。無其他社群登入入口。

LIFF 初始化後處理登入狀態、同意畫面與導回地址。從感應網址進入時暫存待開啟宮廟，登入後恢復；返回後重新檢查任務鎖定。前端不可把 getProfile / decoded token 當成正式獎勵身分證明。

服务介面：AuthService、StampService、ImageMatchService、GameTemplateService、JournalService、RewardService。createServices 依 VITE_SERVICE_MODE 選擇 adapter。VITE_LIFF_ID、VITE_API_BASE_URL 可以放前端；AI API key、LINE channel secret、SMS 憑證不得放在 VITE_*。前端 DEMO 的所有驗證均可被修改，不能承擔真實權益發放。

手札的資料來源是 JourneyEvent、PhotoRecord、StampRecord 與 Story。預覽可隨時使用模板產生，全台完成後解鎖最終動畫。動畫用相同的結構化 sections / timeline 資料渲染，不把動畫寫死成影片。正式 AI 僅協助敘事，不自行捏造文化史實。

## 9. 保存、行動相容性與部署

- localStorage 使用含 userId 的命名空間、schemaVersion 與 migration；登出清除執行中的帳戶狀態，避免看到其他人的收藏。
- IndexedDB 保存壓縮照片、頭貼及手札。處理容量不足、存取失敗、清除資料；本機 DEMO 無法保證跨裝置同步或解除安裝後復原。
- 相機採 HTTPS 與使用者互動啟動；依裝置能力選擇 getUserMedia 或 input capture。LINE 內 iOS / Android WebView 都需實機確認。
- 行政區幾何需確認資料來源、授權、座標系統、離島與圖形拓撲；先顯示簡化全台幾何，再載入選取區域詳細資料。地圖未使用商業底圖，載入自己的行政區圖層即可。
- 地圖錨點與行政區提供清單式替代導航、顏色圖例與文字進度；小遊戲避免只依賴 hover，支援觸控與基本鍵盤操作。
- Vercel build command 為 npm run build、output 為 dist；配置 SPA rewrite，確認直接開啟任務網址仍可載入。
- 先建立開發用 MINI App endpoint，依 LINE 測試／審核流程上線；放入網址不是完成所有正式發布程序。

## 10. 第一版 DEMO 範圍與實作順序

採用一個縣市、兩個行政區、每區兩間宮廟，以四個點位展示完整進度邏輯。宮廟及圖片來源實作前選定，模擬內容明确標示。

1. 建立路由、行動版 layout、內容 ID 與 DEMO manifest。
2. 完成 domain、進度 store、版本化保存；驗證任務順序、無宮廟區域、里程碑與重複提交。
3. 完成全台地圖與 DEMO 點位、色彩狀態、返回地圖視角。
4. 完成模擬蓋章、拍照對位合成、一款拼圖與文化故事。
5. 完成圖鑑、集章簿、帳戶設定、模擬獎勵與旅程時間線。
6. 接 LIFF 測試登入、Vercel 部署與 LINE 內實機驗證；此階段另行執行部署。

核心驗收：不可跳關、完成後可重新整理、照片與時間可查、行政區正確上色、獎勵只建一次、同次多里程碑按序顯示、任務返回原視角、模擬獎勵與 AI 不誤導為正式服務。

## 11. 官方參考

- LINE MINI App 開發概覽：https://developers.line.biz/en/docs/line-mini-app/develop/develop-overview/
- LINE MINI App 起步與發布設定：https://developers.line.biz/en/docs/line-mini-app/quickstart/
- React Router 路由：https://reactrouter.com/start/declarative/routing
- Zustand 保存：https://zustand.docs.pmnd.rs/reference/middlewares/persist
- MapLibre 地圖 API：https://maplibre.org/maplibre-gl-js/docs/API/classes/Map/
- MapLibre feature state 範例：https://maplibre.org/maplibre-gl-js/docs/examples/hover-styles/

上述文件支持平台與函式庫用法；本設計不假設 LINE Touch、POINTS、永久貼圖或主題已有可用的公開發放 API，正式串接需另行確認。

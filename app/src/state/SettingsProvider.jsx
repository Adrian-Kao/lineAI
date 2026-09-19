import { useEffect, useMemo, useState } from 'react'
import { SettingsContext } from './SettingsContext.js'
import { formatMessage } from '../utils/i18n.js'

const STORAGE_KEY = 'wanchun-settings:v1'
const DEFAULT_SETTINGS = { language: 'zh-TW', reduceMotion: false, highContrast: false }

const MESSAGES = {
  'zh-TW': {
    'nav.taiwan': '台灣', 'nav.stamps': '集章', 'nav.collection': '圖鑑', 'nav.journal': '手札', 'nav.points': '點數',
    'nav.collapse': '收合底部導覽', 'nav.expand': '展開底部導覽', 'nav.main': '主要導覽',
    'drawer.open': '開啟選單', 'drawer.close': '關閉選單', 'drawer.navigation': '導覽選單', 'drawer.other': '其他頁面',
    'drawer.stampbook': '集章簿', 'drawer.photos': '照片圖鑑', 'drawer.news': '最新消息', 'drawer.settings': '設定', 'drawer.friends': '好友', 'drawer.profile': '個人資料',
    'session.current': '目前玩家', 'session.disconnected': '尚未連接 LINE', 'session.progress': '萬春宮任務 {completed}／{total}', 'session.loginHint': '進入任務時會請你登入', 'session.mock': '本機模擬登入', 'session.connect': '連接 LINE',
    'common.backMap': '返回地圖', 'common.retry': '重試', 'common.close': '關閉',
    'settings.eyebrow': '遊戲偏好', 'settings.title': '設定', 'settings.description': '調整介面語言與顯示方式，設定會保存在目前裝置。',
    'settings.language': '介面語言', 'settings.languageHelp': '切換共用導覽、任務與介紹文字；有正式英譯的宮廟會一併切換名稱。', 'settings.chinese': '繁體中文', 'settings.english': 'English',
    'settings.motion': '減少動畫', 'settings.motionHelp': '縮短地圖移動、蓋章與選單動畫，適合容易暈動或希望快速操作的玩家。',
    'settings.contrast': '高對比文字', 'settings.contrastHelp': '加深文字與邊框，提升戶外環境下的可讀性。',
    'settings.storage': '資料與隱私', 'settings.storageHelp': '遊戲進度、照片、個人資料及偏好目前只保存在這台裝置；照片不會自動上傳。', 'settings.saved': '設定已自動儲存。',
    'map.selectCounty': '全台地圖：選擇縣市', 'map.countyLabel': '選擇縣市', 'map.overview': '全台地圖', 'map.search': '搜尋{region}宮廟', 'map.searchLabel': '搜尋宮廟', 'map.results': '宮廟搜尋結果', 'map.noResults': '沒有符合的宮廟', 'map.loading': '宮廟資料載入中…', 'map.loadFailed': '載入失敗', 'map.noTemples': '這個區域目前沒有符合條件的宮廟', 'map.notFound': '找不到這間宮廟',
    'profile.eyebrow': '玩家帳戶', 'profile.title': '個人資料', 'profile.description': '自訂資料只會保存在目前裝置，LINE 帳號連結維持不變。', 'profile.avatar': '大頭照', 'profile.replaceAvatar': '替換大頭照', 'profile.restoreAvatar': '恢復 LINE 頭像', 'profile.avatarHelp': '圖片會裁切成正方形並縮小後保存。', 'profile.name': '姓名', 'profile.lineId': 'LINE 使用者 ID', 'profile.lineIdHelp': '由 LINE LIFF 提供，系統無法取得或修改使用者公開設定的 LINE ID。', 'profile.phone': '電話', 'profile.phonePlaceholder': '例如：0912-345-678', 'profile.save': '儲存個人資料', 'profile.saving': '儲存中…', 'profile.saved': '個人資料已儲存在這台裝置。',
    'task.stamp': '數位蓋章', 'task.photo': '找點拍照', 'task.puzzle': '文化拼圖', 'task.label': '任務 {order}', 'task.progress': '任務進度', 'task.completedAt': '完成時間：{time}', 'task.locked': '鎖定', 'task.available': '可開始', 'task.completed': '已完成', 'task.start': '開始', 'task.review': '回顧', 'task.finishPrevious': '請先完成任務 {order}',
    'temple.back': '返回萬春宮', 'temple.location': '台中市中區', 'temple.routeProgress': 'DEMO 活動路線：{completed} / {total} 項任務完成', 'temple.completeTitle': '中區 DEMO 活動路線完成', 'temple.completeBody': '三項任務都已完成，萬春宮錨點已在地圖上點亮。', 'temple.viewStamps': '查看集章簿', 'temple.viewCollection': '查看圖鑑', 'temple.next': '請依序完成三項任務，下一步：{task}', 'temple.list': '任務清單', 'temple.hint.stamp': '依畫面說明完成模擬感應，印章會加入集章簿。', 'temple.hint.photo': '到指定位置拍攝或選圖，對位後補上缺口並保存。', 'temple.hint.puzzle': '完成拼圖後即可閱讀文化故事。',
    'mission.alreadyDone': '任務已完成', 'mission.previousFirst': '請先完成前一項任務', 'mission.back': '返回萬春宮', 'mission.saving': '正在保存…', 'mission.saveFailed': '保存失敗，請重試',
    'stamp.demo': 'DEMO 模擬感應，未連接實體印章或 NFC', 'stamp.step1': '到萬春宮服務台找到活動印章（示意）。', 'stamp.step2': '將手機靠近印章感應區，按下「模擬感應」。', 'stamp.step3': '感應完成後印章會蓋上並加入集章簿。', 'stamp.intro': '尚未感應', 'stamp.sensing': '模擬感應中…', 'stamp.stamping': '感應完成，蓋章中…', 'stamp.done': '已蓋章，正在加入集章簿…', 'stamp.start': '模擬感應', 'stamp.sensingButton': '感應中…', 'stamp.finishedButton': '已完成感應', 'stamp.retry': '重新感應',
    'photo.eyebrow': '宮廟找點', 'photo.title': '拍照補上文化場景', 'photo.description': 'DEMO 版可拍照或從裝置選取圖片，確認後會保存在這台裝置。', 'photo.choose': '拍照或選擇照片', 'photo.rechoose': '重新選擇照片', 'photo.previewAlt': '準備保存的萬春宮任務照片', 'photo.confirm': '請確認照片後完成任務', 'photo.empty': '尚未選擇照片', 'photo.saving': '儲存中…', 'photo.save': '保存照片並完成任務',
    'puzzle.eyebrow': '廟宇尋寶', 'puzzle.title': '2 × 2 拼圖', 'puzzle.instructions': '點選兩塊碎片交換位置，將圖片恢復完整。', 'puzzle.board': '2 × 2 拼圖棋盤', 'puzzle.tile': '第 {position} 格，目前是圖片第 {tile} 塊{selected}', 'puzzle.selected': '，已選取', 'puzzle.complete': '完成！你已成功拼回萬春宮。', 'puzzle.selectFirst': '請先選擇一塊碎片。', 'puzzle.selectSecond': '再選擇另一塊碎片即可交換。', 'puzzle.restart': '再玩一次',
    'temple.preview': '宮廟簡介', 'temple.closePreview': '關閉宮廟簡介', 'temple.details': '查看詳情', 'temple.explore': '探索任務', 'temple.imagePending': '宮廟圖片待補', 'temple.loading': '宮廟資料載入中…', 'temple.notFound': '找不到這間宮廟', 'temple.religion': '宗教分類', 'temple.deity': '主祀神祇', 'temple.address': '地址', 'temple.phone': '電話', 'temple.history': '歷史', 'temple.features': '特色', 'temple.additionalSources': '補充內容來源：{sources}', 'temple.imageSource': '圖片來源：{source}', 'temple.dataSource': '資料來源：', 'temple.publicData': '公開宗教場所資料', 'temple.notInDemo': '此宮廟未納入 DEMO 活動', 'temple.noRecord': '尚無任務紀錄', 'temple.record': '已完成 {completed}／{total} 項任務，最近一次：{time}',
    'story.back': '返回任務頁', 'story.kicker': '萬春宮 · 任務完成', 'story.title': '{task}的小故事', 'story.fallback': '完成「{task}」後，你在萬春宮留下了一段探索記錄。沿著任務一步步前進，這趟文化小旅行也多了一個值得回看的片段。', 'story.imageAlt': '萬春宮探索紀錄', 'story.imagePending': '圖片待補：需使用具來源／授權的素材。', 'story.source': '來源：', 'story.demoSource': '萬春宮 DEMO 活動流程紀錄', 'story.backMap': '回到地圖',
  },
  en: {
    'nav.taiwan': 'Taiwan', 'nav.stamps': 'Stamps', 'nav.collection': 'Gallery', 'nav.journal': 'Journal', 'nav.points': 'Points',
    'nav.collapse': 'Collapse bottom navigation', 'nav.expand': 'Expand bottom navigation', 'nav.main': 'Main navigation',
    'drawer.open': 'Open menu', 'drawer.close': 'Close menu', 'drawer.navigation': 'Navigation menu', 'drawer.other': 'Other pages',
    'drawer.stampbook': 'Stamp Book', 'drawer.photos': 'Photo Gallery', 'drawer.news': 'News', 'drawer.settings': 'Settings', 'drawer.friends': 'Friends', 'drawer.profile': 'Profile',
    'session.current': 'Current player', 'session.disconnected': 'LINE not connected', 'session.progress': 'Wanchun Temple missions {completed}/{total}', 'session.loginHint': 'Sign in before starting missions', 'session.mock': 'Local mock login', 'session.connect': 'Connect LINE',
    'common.backMap': 'Back to map', 'common.retry': 'Retry', 'common.close': 'Close',
    'settings.eyebrow': 'Game preferences', 'settings.title': 'Settings', 'settings.description': 'Choose the interface language and display preferences. Settings are saved on this device.',
    'settings.language': 'Interface language', 'settings.languageHelp': 'Changes navigation, missions, and introductions. Temples with registered English names are translated as well.', 'settings.chinese': '繁體中文', 'settings.english': 'English',
    'settings.motion': 'Reduce motion', 'settings.motionHelp': 'Shortens map, stamp, and menu animations for faster and more comfortable use.',
    'settings.contrast': 'High-contrast text', 'settings.contrastHelp': 'Darkens text and borders for better readability outdoors.',
    'settings.storage': 'Data and privacy', 'settings.storageHelp': 'Progress, photos, profile details, and preferences are currently stored only on this device. Photos are not uploaded automatically.', 'settings.saved': 'Settings saved automatically.',
    'map.selectCounty': 'Taiwan map: select a city or county', 'map.countyLabel': 'Select city or county', 'map.overview': 'Taiwan map', 'map.search': 'Search temples in {region}', 'map.searchLabel': 'Search temples', 'map.results': 'Temple search results', 'map.noResults': 'No matching temples', 'map.loading': 'Loading temple data…', 'map.loadFailed': 'Unable to load', 'map.noTemples': 'No matching temples in this area', 'map.notFound': 'Temple not found',
    'profile.eyebrow': 'Player account', 'profile.title': 'Profile', 'profile.description': 'Custom details are stored on this device. Your linked LINE account remains unchanged.', 'profile.avatar': 'Profile picture', 'profile.replaceAvatar': 'Change picture', 'profile.restoreAvatar': 'Restore LINE picture', 'profile.avatarHelp': 'The image is cropped to a square and resized before saving.', 'profile.name': 'Name', 'profile.lineId': 'LINE user ID', 'profile.lineIdHelp': 'Provided by LINE LIFF. The public LINE ID is not available and cannot be changed here.', 'profile.phone': 'Phone', 'profile.phonePlaceholder': 'Example: 0912-345-678', 'profile.save': 'Save profile', 'profile.saving': 'Saving…', 'profile.saved': 'Profile saved on this device.',
    'task.stamp': 'Digital Stamp', 'task.photo': 'Photo Hunt', 'task.puzzle': 'Culture Puzzle', 'task.label': 'Mission {order}', 'task.progress': 'Mission progress', 'task.completedAt': 'Completed: {time}', 'task.locked': 'Locked', 'task.available': 'Available', 'task.completed': 'Completed', 'task.start': 'Start', 'task.review': 'Review', 'task.finishPrevious': 'Complete mission {order} first',
    'temple.back': 'Back to Wanchun Temple', 'temple.location': 'Central District, Taichung', 'temple.routeProgress': 'DEMO route: {completed}/{total} missions completed', 'temple.completeTitle': 'Central District DEMO route completed', 'temple.completeBody': 'All three missions are complete. The Wanchun Temple marker is now lit.', 'temple.viewStamps': 'View Stamp Book', 'temple.viewCollection': 'View Gallery', 'temple.next': 'Complete the missions in order. Next: {task}', 'temple.list': 'Mission list', 'temple.hint.stamp': 'Follow the instructions to simulate LINE Touch and add the stamp to your book.', 'temple.hint.photo': 'Take or select a photo, align the scene, and save it.', 'temple.hint.puzzle': 'Complete the puzzle to unlock a cultural story.',
    'mission.alreadyDone': 'Mission completed', 'mission.previousFirst': 'Complete the previous mission first', 'mission.back': 'Back to Wanchun Temple', 'mission.saving': 'Saving…', 'mission.saveFailed': 'Unable to save. Please try again.',
    'stamp.demo': 'DEMO simulation. No physical stamp or NFC is connected.', 'stamp.step1': 'Find the event stamp at the Wanchun Temple service desk.', 'stamp.step2': 'Hold your phone near the stamp area and tap “Simulate Touch.”', 'stamp.step3': 'The stamp will be added to your Stamp Book after the simulation.', 'stamp.intro': 'Waiting for touch', 'stamp.sensing': 'Simulating LINE Touch…', 'stamp.stamping': 'Touch detected. Applying stamp…', 'stamp.done': 'Stamp acquired. Adding it to your book…', 'stamp.start': 'Simulate Touch', 'stamp.sensingButton': 'Detecting…', 'stamp.finishedButton': 'Touch completed', 'stamp.retry': 'Try again',
    'photo.eyebrow': 'Temple Photo Hunt', 'photo.title': 'Complete the cultural scene', 'photo.description': 'For this DEMO, take or select a photo and save it on this device.', 'photo.choose': 'Take or choose a photo', 'photo.rechoose': 'Choose another photo', 'photo.previewAlt': 'Selected Wanchun Temple mission photo', 'photo.confirm': 'Confirm the photo to complete this mission', 'photo.empty': 'No photo selected', 'photo.saving': 'Saving…', 'photo.save': 'Save photo and complete mission',
    'puzzle.eyebrow': 'Temple Treasure Hunt', 'puzzle.title': '2 × 2 Puzzle', 'puzzle.instructions': 'Select two tiles to swap them and restore the image.', 'puzzle.board': '2 × 2 puzzle board', 'puzzle.tile': 'Position {position}, currently image tile {tile}{selected}', 'puzzle.selected': ', selected', 'puzzle.complete': 'Complete! You restored the Wanchun Temple image.', 'puzzle.selectFirst': 'Select a tile first.', 'puzzle.selectSecond': 'Select another tile to swap them.', 'puzzle.restart': 'Play again',
    'temple.preview': 'Temple introduction', 'temple.closePreview': 'Close temple introduction', 'temple.details': 'View details', 'temple.explore': 'Explore missions', 'temple.imagePending': 'Temple image pending', 'temple.loading': 'Loading temple data…', 'temple.notFound': 'Temple not found', 'temple.religion': 'Religion', 'temple.deity': 'Primary deity', 'temple.address': 'Address', 'temple.phone': 'Phone', 'temple.history': 'History', 'temple.features': 'Features', 'temple.additionalSources': 'Additional sources: {sources}', 'temple.imageSource': 'Image source: {source}', 'temple.dataSource': 'Data source: ', 'temple.publicData': 'Public religious-place dataset', 'temple.notInDemo': 'This temple is not included in the DEMO activity.', 'temple.noRecord': 'No mission records yet', 'temple.record': '{completed}/{total} missions completed. Latest: {time}',
    'story.back': 'Back to missions', 'story.kicker': 'Wanchun Temple · Mission complete', 'story.title': 'The story of {task}', 'story.fallback': 'After completing “{task},” you left a new exploration record at Wanchun Temple. Each mission adds another memory to this cultural journey.', 'story.imageAlt': 'Wanchun Temple exploration record', 'story.imagePending': 'Image pending: licensed or properly sourced material is required.', 'story.source': 'Source: ', 'story.demoSource': 'Wanchun Temple DEMO activity record', 'story.backMap': 'Back to map',
  },
}

function loadSettings() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
    return { ...DEFAULT_SETTINGS, ...stored }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(loadSettings)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    document.documentElement.lang = settings.language
    document.documentElement.dataset.reduceMotion = String(settings.reduceMotion)
    document.documentElement.dataset.highContrast = String(settings.highContrast)
  }, [settings])

  const value = useMemo(() => {
    const messages = MESSAGES[settings.language] ?? MESSAGES['zh-TW']
    return {
      ...settings,
      setSetting(key, settingValue) { setSettings(current => ({ ...current, [key]: settingValue })) },
      t(key, values) { return formatMessage(messages[key] ?? MESSAGES['zh-TW'][key] ?? key, values) },
    }
  }, [settings])

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
}

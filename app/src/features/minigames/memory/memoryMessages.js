import { formatMessage } from '../../../utils/i18n.js'

const MESSAGES = {
  'zh-TW': {
    eyebrow: '廟宇文物',
    title: '文物翻牌配對',
    instructions: '牌面朝下藏著 {pairs} 對廟宇器物。一次翻兩張，翻到相同的就配對成功，全部配對完成即過關。',
    board: '{pairs} 對翻牌配對盤面',
    card: '第 {position} 張牌，{state}',
    faceDown: '蓋著',
    matchedState: '已配對：{name}',
    faceUpState: '翻開：{name}',
    progress: '已配對 {matched}／{pairs} 對，翻了 {moves} 次',
    mismatch: '不一樣，記住位置再試。',
    complete: '全部配對完成！共翻 {moves} 次。',
    perfect: '全部配對完成！每一對都一次翻中，太厲害了。',
    restart: '再玩一次',
    legend: '共 {pairs} 種文物，配對成功會點亮',
    legendFound: '（已配對）',
    'artifact.censer': '香爐',
    'artifact.lantern': '燈籠',
    'artifact.fortune': '籤筒',
    'artifact.moonblocks': '筊杯',
    'artifact.bell': '鐘',
    'artifact.drum': '鼓',
    'artifact.incense': '線香',
    'artifact.amulet': '平安符',
  },
  en: {
    eyebrow: 'Temple Artifacts',
    title: 'Artifact Memory Match',
    instructions: '{pairs} pairs of temple objects are hidden face down. Flip two cards at a time; matching pairs stay open. Match them all to finish.',
    board: '{pairs}-pair memory board',
    card: 'Card {position}, {state}',
    faceDown: 'face down',
    matchedState: 'matched: {name}',
    faceUpState: 'face up: {name}',
    progress: '{matched}/{pairs} pairs matched, {moves} turns',
    mismatch: 'Not a match. Remember where they are.',
    complete: 'All pairs matched in {moves} turns!',
    perfect: 'All pairs matched with no misses. Impressive!',
    restart: 'Play again',
    legend: '{pairs} artifacts in total; matched ones light up',
    legendFound: '(matched)',
    'artifact.censer': 'Incense burner',
    'artifact.lantern': 'Lantern',
    'artifact.fortune': 'Fortune sticks',
    'artifact.moonblocks': 'Moon blocks',
    'artifact.bell': 'Bell',
    'artifact.drum': 'Drum',
    'artifact.incense': 'Incense sticks',
    'artifact.amulet': 'Amulet',
  },
}

export function createTranslator(language) {
  const messages = MESSAGES[language] ?? MESSAGES['zh-TW']
  return (key, values) => formatMessage(messages[key] ?? MESSAGES['zh-TW'][key] ?? key, values)
}

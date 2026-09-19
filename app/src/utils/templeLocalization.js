const RELIGION_NAMES = {
  道教: { 'zh-TW': '道教', en: 'Taoism' },
  佛教: { 'zh-TW': '佛教', en: 'Buddhism' },
}

const RELIGION_ADJECTIVES = {
  道教: 'Taoist',
  佛教: 'Buddhist',
}

const DEITY_NAMES = {
  天上聖母: { 'zh-TW': '天上聖母', en: 'Mazu (天上聖母)' },
  媽祖: { 'zh-TW': '媽祖', en: 'Mazu (媽祖)' },
  觀世音菩薩: { 'zh-TW': '觀世音菩薩', en: 'Guanyin (觀世音菩薩)' },
  觀音佛祖: { 'zh-TW': '觀音佛祖', en: 'Guanyin (觀音佛祖)' },
  福德正神: { 'zh-TW': '福德正神', en: 'Fude Zhengshen (福德正神)' },
  土地公: { 'zh-TW': '土地公', en: 'Earth God (土地公)' },
  玉皇上帝: { 'zh-TW': '玉皇上帝', en: 'Jade Emperor (玉皇上帝)' },
  釋迦牟尼佛: { 'zh-TW': '釋迦牟尼佛', en: 'Shakyamuni Buddha (釋迦牟尼佛)' },
  阿彌陀佛: { 'zh-TW': '阿彌陀佛', en: 'Amitabha Buddha (阿彌陀佛)' },
}

export function localizedValue(value, language, fallback = '') {
  if (!value) return fallback
  if (typeof value === 'string') return value
  return value[language] ?? value['zh-TW'] ?? fallback
}

export function localizeReligion(religion, language, content) {
  if (!content?.displayName) return religion
  return RELIGION_NAMES[religion]?.[language] ?? religion
}

export function localizeDeity(deity, language, content) {
  if (!content?.displayName) return deity
  return DEITY_NAMES[deity]?.[language] ?? deity
}

export function localizeTempleName(temple, content, language) {
  return localizedValue(content?.displayName, language, temple.name)
}

export function buildTempleDescription(temple, language, content) {
  if (language !== 'en') return `位於${temple.county}的${temple.religion}寺廟${temple.deity ? `，主祀${temple.deity}` : ''}。`
  if (!content?.displayName) return `位於${temple.county}的${temple.religion}寺廟${temple.deity ? `，主祀${temple.deity}` : ''}。`
  const religion = RELIGION_ADJECTIVES[temple.religion] ?? localizeReligion(temple.religion, language, content)
  const deity = temple.deity ? `, primarily dedicated to ${localizeDeity(temple.deity, language, content)}` : ''
  return `A ${religion} temple in ${temple.county}${deity}.`
}

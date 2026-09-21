// 六件常見廟宇器物的簡化圖示，自行繪製，無授權問題。只用作配對圖案，不附文史說明。
const ICONS = {
  censer: <>
    <ellipse cx="32" cy="46" rx="20" ry="7" />
    <path d="M14 30h36l-4 16H18Z" />
    <path d="M22 30q-6-8 0-14M32 30q-6-9 0-18M42 30q-6-8 0-14" className="artifact-smoke" />
    <path d="M12 30h40" />
  </>,
  lantern: <>
    <path d="M32 6v6" /><rect x="24" y="12" width="16" height="5" rx="2" />
    <ellipse cx="32" cy="34" rx="17" ry="17" />
    <path d="M22 22q10 12 0 24M42 22q-10 12 0 24M32 17v34" />
    <rect x="24" y="51" width="16" height="5" rx="2" /><path d="M30 56v6M34 56v6" />
  </>,
  fortune: <>
    <path d="M20 26h24v26a4 4 0 0 1-4 4H24a4 4 0 0 1-4-4Z" />
    <path d="M24 26V12M29 26V8M34 26V10M39 26V12" />
    <path d="M20 34h24" />
  </>,
  moonblocks: <>
    <path d="M12 40q10-22 24-8-8 6-6 18-12 2-18-10Z" />
    <path d="M52 40q-10-22-24-8 8 6 6 18 12 2 18-10Z" />
  </>,
  bell: <>
    <path d="M32 8v6" /><path d="M18 42q0-24 14-28 14 4 14 28Z" />
    <path d="M14 42h36" /><path d="M28 46h8l-4 8Z" /><path d="M18 30h28" />
  </>,
  drum: <>
    <ellipse cx="32" cy="20" rx="20" ry="7" />
    <path d="M12 20v22q20 12 40 0V20" />
    <path d="M12 42q20 12 40 0" /><path d="M20 26l-4 14M44 26l4 14M32 27v16" />
    <path d="M8 8l12 10M56 8L44 18" />
  </>,
  incense: <>
    <path d="M22 56V22M32 56V16M42 56V22" />
    <circle cx="22" cy="19" r="2.5" /><circle cx="32" cy="13" r="2.5" /><circle cx="42" cy="19" r="2.5" />
    <path d="M22 14q-3-4 0-8M32 8q-3-4 0-8M42 14q-3-4 0-8" className="artifact-smoke" />
    <path d="M14 56h36" />
  </>,
  amulet: <>
    <path d="M32 6v8" /><circle cx="32" cy="12" r="3" />
    <path d="M20 18h24v30l-12 8-12-8Z" />
    <path d="M26 26h12M26 34h12M32 26v16" />
  </>,
}

export default function ArtifactIcon({ id }) {
  return <svg className={`artifact-icon artifact-icon--${id}`} viewBox="0 0 64 64" aria-hidden="true">{ICONS[id]}</svg>
}

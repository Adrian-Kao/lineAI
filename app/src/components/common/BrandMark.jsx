import { useId } from 'react'

// Templore 圓形標誌：重簷燕尾脊＋廟門＋台基，配色取自競賽簡報。
// 與 public/brand/templore-logo.svg 同一份圖形，改動請兩邊一起改。
export default function BrandMark({ size = 32, className }) {
  const id = useId()
  return <svg className={className} width={size} height={size} viewBox="0 0 640 640" role="img" aria-label="Templore">
    <defs>
      <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="0.65" y2="1">
        <stop offset="0" stopColor="#4CB87A" />
        <stop offset="1" stopColor="#2E8B57" />
      </linearGradient>
      <mask id={`${id}-cut`}>
        <rect width="640" height="640" fill="#fff" />
        <path d="M 320 324 C 284 324 262 350 262 390 L 262 432 L 378 432 L 378 390 C 378 350 356 324 320 324 Z" fill="#000" />
      </mask>
    </defs>
    <circle cx="320" cy="320" r="320" fill={`url(#${id}-bg)`} />
    <g fill="#F7F9F8" mask={`url(#${id}-cut)`}>
      <rect x="252" y="200" width="136" height="112" rx="12" />
      <path d="M 170 176 Q 320 206 470 176 L 440 220 Q 320 244 200 220 Z" />
      <rect x="216" y="300" width="208" height="132" rx="14" />
      <path d="M 102 264 Q 320 298 538 264 L 502 312 Q 320 342 138 312 Z" />
      <rect x="196" y="424" width="248" height="46" rx="20" />
    </g>
  </svg>
}

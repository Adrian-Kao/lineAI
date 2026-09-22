import { useId } from 'react'

// Templore 圓形標誌：廟宇屋簷＋廟門＋台基，配色取自競賽簡報。
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
        <path d="M 320 318 C 286 318 266 344 266 380 L 266 430 L 374 430 L 374 380 C 374 344 354 318 320 318 Z" fill="#000" />
      </mask>
    </defs>
    <circle cx="320" cy="320" r="320" fill={`url(#${id}-bg)`} />
    <g fill="#F7F9F8" mask={`url(#${id}-cut)`}>
      <path d="M 100 246 C 190 210 450 210 540 246 L 484 306 C 436 278 204 278 156 306 Z" />
      <rect x="212" y="272" width="216" height="158" rx="16" />
      <rect x="196" y="422" width="248" height="46" rx="20" />
    </g>
  </svg>
}

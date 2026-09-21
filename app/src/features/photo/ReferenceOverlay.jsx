import { useId } from 'react'

const VIEWBOX_WIDTH = 1500
const VIEWBOX_HEIGHT = 1000

export default function ReferenceOverlay({ imageUrl, hole, showHole = true, passed = false }) {
  const reactId = useId()
  const maskId = `photo-mask-${reactId.replaceAll(':', '')}`
  const holeStyle = {
    left: `${hole.x * 100}%`,
    top: `${hole.y * 100}%`,
    width: `${hole.width * 100}%`,
    height: `${hole.height * 100}%`,
  }

  if (!showHole) return <img className="reference-overlay__full" src={imageUrl} alt="" />

  return <>
    <svg className="reference-overlay" viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`} aria-hidden="true">
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT}>
          <rect width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} fill="white" />
          <rect
            x={hole.x * VIEWBOX_WIDTH}
            y={hole.y * VIEWBOX_HEIGHT}
            width={hole.width * VIEWBOX_WIDTH}
            height={hole.height * VIEWBOX_HEIGHT}
            fill="black"
          />
        </mask>
      </defs>
      <image href={imageUrl} width={VIEWBOX_WIDTH} height={VIEWBOX_HEIGHT} preserveAspectRatio="xMidYMid slice" mask={`url(#${maskId})`} />
    </svg>
    <div className={`photo-hole-guide${passed ? ' is-passed' : ''}`} style={holeStyle} aria-hidden="true">
      <span className="is-top-left" /><span className="is-top-right" /><span className="is-bottom-left" /><span className="is-bottom-right" />
    </div>
  </>
}

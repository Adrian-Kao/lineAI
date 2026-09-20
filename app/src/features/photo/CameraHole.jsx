export default function CameraHole({ videoRef, hole, frozenPatchUrl = '' }) {
  const clipPath = `inset(${hole.y * 100}% ${(1 - hole.x - hole.width) * 100}% ${(1 - hole.y - hole.height) * 100}% ${hole.x * 100}%)`
  const style = { clipPath, WebkitClipPath: clipPath }

  return <div className="camera-hole" aria-hidden="true">
    <video ref={videoRef} className="camera-hole__video" style={style} autoPlay muted playsInline />
    {frozenPatchUrl && <img className="camera-hole__freeze" style={style} src={frozenPatchUrl} alt="" />}
  </div>
}

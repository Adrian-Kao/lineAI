export default function CameraHole({ videoRef, hole, frozenPatchUrl = '' }) {
  const clipPath = `inset(${hole.y * 100}% ${(1 - hole.x - hole.width) * 100}% ${(1 - hole.y - hole.height) * 100}% ${hole.x * 100}%)`
  const videoStyle = { clipPath, WebkitClipPath: clipPath }
  const patchStyle = {
    inset: 'auto',
    left: `${hole.x * 100}%`,
    top: `${hole.y * 100}%`,
    width: `${hole.width * 100}%`,
    height: `${hole.height * 100}%`,
  }

  return <div className="camera-hole" aria-hidden="true">
    <video ref={videoRef} className="camera-hole__video" style={videoStyle} autoPlay muted playsInline />
    {frozenPatchUrl && <img className="camera-hole__freeze" style={patchStyle} src={frozenPatchUrl} alt="" />}
  </div>
}

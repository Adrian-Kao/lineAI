export default function JournalClosedView({ phase, onOpen }) {
  return <section className={`journal-closed-view is-${phase}`} aria-label="旅行手札封面">
    <button className="journal-scene" type="button" onClick={onOpen} disabled={phase === 'zooming'} aria-label="打開旅行手札">
      <img className="journal-desk-layer" src="/journal/journal-desk.png" alt="" aria-hidden="true" />
      <span className="journal-book-object">
        <span className="journal-opening-pages" aria-hidden="true">
          <span className="journal-opening-sheet is-left" />
          <span className="journal-opening-sheet is-right" />
          <span className="journal-opening-binding" />
        </span>
        <img className="journal-cover-object" src="/journal/journal-notebook-cutout.png" alt="暖色木桌上的青綠色旅行手札" />
      </span>
      <span className="journal-cover-title"><small>文化收藏</small>我的旅行手札</span>
    </button>
  </section>
}

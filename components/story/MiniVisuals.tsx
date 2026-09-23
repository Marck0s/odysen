export function WebsiteMiniVisual() {
  return (
    <div className="chip-visual chip-visual--web">
      <div className="mini-browser">
        <div className="mini-browser-bar">
          <span />
          <span />
          <span />
        </div>
        <div className="mini-browser-body">
          <div className="mb-block mb-block--wide" />
          <div className="mb-block" />
          <div className="mb-block mb-block--accent" />
        </div>
      </div>
    </div>
  );
}

export function ChatbotMiniVisual() {
  return (
    <div className="chip-visual chip-visual--bot">
      <svg viewBox="0 0 160 90" className="mini-flow">
        <line x1="24" y1="20" x2="80" y2="45" stroke="var(--purple-light)" strokeWidth="1.4" />
        <line x1="24" y1="70" x2="80" y2="45" stroke="var(--purple-light)" strokeWidth="1.4" />
        <line x1="80" y1="45" x2="136" y2="45" stroke="var(--purple-light)" strokeWidth="1.4" />
        <circle cx="24" cy="20" r="7" fill="var(--bg)" stroke="var(--purple-light)" strokeWidth="1.4" />
        <circle cx="24" cy="70" r="7" fill="var(--bg)" stroke="var(--purple-light)" strokeWidth="1.4" />
        <circle cx="80" cy="45" r="10" fill="var(--purple)" />
        <circle cx="136" cy="45" r="7" fill="var(--bg)" stroke="var(--purple-light)" strokeWidth="1.4" />
      </svg>
    </div>
  );
}

export function AdsMiniVisual() {
  return (
    <div className="chip-visual chip-visual--ads">
      <svg viewBox="0 0 160 90" className="mini-graph" preserveAspectRatio="none">
        <polyline
          points="4,78 34,64 60,68 90,38 120,44 156,10"
          fill="none"
          stroke="var(--purple-light)"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="156" cy="10" r="4" fill="var(--purple-light)" />
      </svg>
    </div>
  );
}

export function MarketingMiniVisual() {
  return (
    <div className="chip-visual chip-visual--mkt">
      <div className="mkt-tile mkt-tile--a" />
      <div className="mkt-tile mkt-tile--b">
        <span className="play-dot" />
      </div>
      <div className="mkt-tile mkt-tile--c" />
    </div>
  );
}

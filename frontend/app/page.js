import Link from 'next/link';

const features = [
  {
    number: '01',
    title: 'Bring your data',
    description: 'Upload a CSV or Excel workbook and keep every dataset organized in your account.',
  },
  {
    number: '02',
    title: 'Explore every row',
    description: 'Review dynamic columns and stored values without requiring a fixed business schema.',
  },
  {
    number: '03',
    title: 'Forecast what comes next',
    description: 'Run a linear-regression forecast and see the next three values, trend, confidence, and insight.',
  },
];

export default function HomePage() {
  return (
    <main className="landing-shell">
      <nav className="landing-nav" aria-label="Primary navigation">
        <Link className="brand" href="/">
          <span className="brand-mark">IF</span>
          <span>InsightFlow</span>
        </Link>
        <div className="nav-actions">
          <Link className="button button-ghost" href="/login">Log in</Link>
          <Link className="button button-dark" href="/register">Create account</Link>
        </div>
      </nav>

      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow"><span className="status-dot" /> Machine-learning analytics</span>
          <h1>Turn business data into a clearer next move.</h1>
          <p>
            Upload a dataset, inspect the details, and generate a transparent three-step forecast from
            your real numbers—not manufactured dashboard metrics.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary button-large" href="/register">Start analyzing</Link>
            <Link className="text-link" href="/login">I already have an account <span>→</span></Link>
          </div>
          <div className="hero-proof">
            <span>CSV &amp; Excel</span>
            <span>Private datasets</span>
            <span>Linear regression</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Forecast illustration">
          <div className="visual-window">
            <div className="visual-header">
              <div>
                <span className="mini-label">Forecast preview</span>
                <strong>Sales trend</strong>
              </div>
              <span className="trend-pill trend-up">↗ Increasing</span>
            </div>
            <div className="visual-chart" aria-hidden="true">
              <div className="chart-grid-line line-one" />
              <div className="chart-grid-line line-two" />
              <div className="chart-grid-line line-three" />
              <svg viewBox="0 0 520 220" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#5f5ce6" stopOpacity="0.28" />
                    <stop offset="100%" stopColor="#5f5ce6" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path d="M0 190 C70 174 90 145 145 153 S228 119 280 125 S360 83 402 91 S470 49 520 32 L520 220 L0 220 Z" fill="url(#area)" />
                <path d="M0 190 C70 174 90 145 145 153 S228 119 280 125 S360 83 402 91" fill="none" stroke="#5f5ce6" strokeWidth="5" strokeLinecap="round" />
                <path d="M402 91 C448 76 470 49 520 32" fill="none" stroke="#21a179" strokeWidth="5" strokeLinecap="round" strokeDasharray="10 10" />
                <circle cx="402" cy="91" r="7" fill="#fff" stroke="#5f5ce6" strokeWidth="4" />
                <circle cx="520" cy="32" r="7" fill="#fff" stroke="#21a179" strokeWidth="4" />
              </svg>
            </div>
            <div className="visual-stats">
              <div><span>Model</span><strong>Linear regression</strong></div>
              <div><span>Output</span><strong>3 future values</strong></div>
            </div>
          </div>
          <div className="floating-note">
            <span className="note-icon">✦</span>
            <div><strong>Readable insight</strong><span>Understand the result at a glance.</span></div>
          </div>
        </div>
      </section>

      <section className="feature-strip" aria-label="How it works">
        {features.map((feature) => (
          <article key={feature.number} className="feature-item">
            <span className="feature-number">{feature.number}</span>
            <div>
              <h2>{feature.title}</h2>
              <p>{feature.description}</p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

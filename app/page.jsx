import Reveal from './reveal';

const features = [
  {
    title: 'Dental screening',
    body: 'Answer a few guided questions and get a clear picture of your oral health, in plain language.',
  },
  {
    title: 'Clinic Finder',
    body: 'See dental clinics near you on a map or list, filter by what you need, and get directions in a tap.',
  },
  {
    title: 'Treatment guide',
    body: 'Search treatments by category and follow each one step by step, so nothing at the clinic is a surprise.',
  },
];

const steps = [
  { n: '1', title: 'Check in', body: 'Complete a quick screening whenever something feels off.' },
  { n: '2', title: 'Understand', body: 'Learn what your results and possible treatments mean.' },
  { n: '3', title: 'Get care', body: 'Find a nearby clinic and book your visit with confidence.' },
];

function Soon({ className = '' }) {
  return (
    <span className={`btn btn-soon ${className}`} aria-disabled="true">
      Google Play · Coming soon
    </span>
  );
}

export default function Home() {
  return (
    <>
      <header className="nav">
        <div className="wrap nav-in">
          <a href="#top" className="brand">DENTRA</a>
          <nav aria-label="Primary">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero wrap">
          <div className="hero-copy rise">
            <p className="eyebrow">Dental screening app</p>
            <h1>Your smile, understood.</h1>
            <p className="lead">
              DENTRA helps you screen your oral health, find the right clinic nearby, and know exactly
              what to expect from treatment.
            </p>
            <Soon />
          </div>

          <div className="phone rise" style={{ animationDelay: '120ms' }} aria-hidden="true">
            <div className="screen">
              <p className="s-title">Clinics near you</p>
              <div className="s-card"><b>Bright Smile Dental</b><span>0.8 km · Cleaning, Fillings</span></div>
              <div className="s-card"><b>Dental Care Center</b><span>1.4 km · Braces, Extraction</span></div>
              <div className="s-card"><b>Family Dentistry</b><span>2.1 km · Check-ups</span></div>
              <div className="s-pill">Find a clinic near me</div>
            </div>
          </div>
        </section>

        <section id="features" className="wrap section">
          <Reveal>
            <h2>Everything you need, nothing you don’t.</h2>
          </Reveal>
          <div className="grid">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 80} className="card">
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="how" className="band">
          <div className="wrap section">
            <Reveal>
              <h2>Simple from the first tap.</h2>
            </Reveal>
            <div className="grid">
              {steps.map((s, i) => (
                <Reveal key={s.n} delay={i * 80} className="step">
                  <span className="num">{s.n}</span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="wrap section cta">
          <Reveal>
            <h2>Coming soon to Android.</h2>
            <p className="lead">Be ready for the day DENTRA lands on Google Play.</p>
            <Soon />
          </Reveal>
        </section>
      </main>

      <footer className="wrap foot">
        <p>
          DENTRA is a screening aid and does not replace professional dental advice. See a licensed
          dentist for diagnosis and treatment.
        </p>
        <p>© {new Date().getFullYear()} DENTRA</p>
      </footer>
    </>
  );
}

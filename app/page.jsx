import Reveal from './reveal';

const steps = [
  { n: '1', title: 'Scan', body: 'Follow guided steps to capture photos of your teeth, region by region.' },
  { n: '2', title: 'Understand', body: 'Read plain-language guides to common treatments, or ask the assistant.' },
  { n: '3', title: 'Act', body: 'Find a dental clinic near you and call or get directions in one tap.' },
];

const features = [
  { title: 'Find a Dentist', body: 'See real dental clinics near your location on a map and in a list, nearest first. Search by name, then call or open directions.' },
  { title: 'Treatment guide', body: 'Browse common treatments and see what to expect, step by step, before your visit.' },
  { title: 'Rabi, your AI assistant', body: 'Ask about oral health or a treatment and get educational answers in plain language.' },
  { title: 'Guided scan', body: 'Capture five regions of your mouth with on-screen positioning help and quality checks.' },
];


const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const shots = [
  { src: `${basePath}/screens/clinics.webp`, title: 'Clinics nearby', alt: 'Clinics Nearby screen listing dental clinics sorted by distance', body: 'Real clinics around you, nearest first.' },
  { src: `${basePath}/screens/treatments.webp`, title: 'Treatments', alt: 'Treatments screen with search and category chips', body: 'Search and browse by category.' },
  { src: `${basePath}/screens/detail.webp`, title: 'What to expect', alt: 'Teeth Cleaning detail screen with duration and follow-up info', body: 'Duration, follow-up and steps at a glance.' },
  { src: `${basePath}/screens/rabi.webp`, title: 'Ask Rabi', alt: 'Rabi, the DENTRA assistant, with suggested dental questions', body: 'Educational answers, not a diagnosis.' },
  { src: `${basePath}/screens/scan.webp`, title: 'Guided scan', alt: 'Dental Scan screen with five mouth regions to capture', body: 'Five regions, one at a time.' },
];

const faqs = [
  ['Is DENTRA a diagnosis?', 'No. DENTRA gives general information and screening guidance to help you decide when to see a dentist. It does not diagnose any condition.'],
  ['Does it replace my dentist?', 'No. Think of it as a first step. Always see a licensed dentist for care.'],
  ['When can I get it?', 'DENTRA is coming soon to Google Play.'],
  ['Which phones does it run on?', 'Android.'],
];

function Soon() {
  return (
    <span className="btn btn-soon" aria-disabled="true">
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
            <a href="#how">How it works</a>
            <a href="#features">Features</a>
            <a href="#screens">Screens</a>
            <a href="#faq">FAQ</a>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="hero wrap">
          <div className="hero-copy rise">
            <p className="eyebrow">Dental screening app</p>
            <h1>A smarter first step for your smile.</h1>
            <p className="lead">
              Screen at home. Understand your options. Find a dentist nearby. All in one app.
            </p>
            <Soon />
          </div>

          <div className="hero-art rise" style={{ animationDelay: '120ms' }}>
            <picture>
              <source media="(prefers-reduced-motion: reduce)" srcSet={`${basePath}/mascot/bunny-still.webp`} />
              <img className="peek" src={`${basePath}/mascot/bunny.webp`} width="238" height="276" alt="" />
            </picture>
            <div className="phone">
              <img src={`${basePath}/screens/hero.webp`} width="600" height="1201" alt="DENTRA welcome screen: A closer look at your smile" />
            </div>
          </div>
        </section>

        <section id="how" className="band">
          <div className="wrap section">
            <Reveal><h2>Simple from the first tap.</h2></Reveal>
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

        <section id="features" className="wrap section">
          <Reveal><h2>Everything in one place.</h2></Reveal>
          <div className="grid four">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 80} className="card">
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="screens" className="wrap section">
          <Reveal><h2>See it in action.</h2></Reveal>
          <div className="gallery" role="region" aria-label="App screenshots" tabIndex={0}>
            {shots.map((x) => (
              <figure key={x.title} className="shot">
                <div className="phone">
                  <img src={x.src} width="600" height="1201" alt={x.alt} loading="lazy" />
                </div>
                <figcaption><b>{x.title}</b><span>{x.body}</span></figcaption>
              </figure>
            ))}
          </div>
          <p className="note">Clinic details, services and prices shown in the app are estimates and are not verified by the clinics.</p>
        </section>

        <section className="band">
          <div className="wrap section">
            <Reveal>
              <h2>Know what to expect.</h2>
              <p className="sub">
                From cleanings to braces, learn how each treatment works, how long it takes, and
                whether you will need a follow-up.
              </p>
              <div className="chips" aria-label="Treatment categories">
                <span className="chip g">All</span>
                <span className="chip">General</span>
                <span className="chip">Cosmetic</span>
                <span className="chip">Orthodontics</span>
                <span className="chip">Surgical</span>
              </div>
            </Reveal>
          </div>
        </section>

        <section id="faq" className="wrap section">
          <Reveal><h2>Questions</h2></Reveal>
          <div className="faq">
            {faqs.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="wrap section cta">
          <Reveal>
            <h2>Coming soon to Android.</h2>
            <p className="lead">A friendly companion for your next dental visit.</p>
            <Soon />
          </Reveal>
        </section>
      </main>

      <footer className="wrap foot">
        <p>
          DENTRA provides general information and screening guidance. It is not a medical diagnosis.
          Always consult a licensed dentist.
        </p>
        <p>© {new Date().getFullYear()} DENTRA · A capstone project</p>
      </footer>
    </>
  );
}

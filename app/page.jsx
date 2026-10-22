'use client';

import { useEffect, useRef, useState } from 'react';
import Phone3D from './phone-3d';
import Reveal from './reveal';
import ToothAnatomy from './tooth-anatomy';
import useScrollProgress from './use-scroll-progress';

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
const shot = (name) => `${base}/screens/${name}.webp`;
const shot2x = (name) => `${base}/screens/2x/${name}.webp`;

const ICONS = {
  tooth: <path d="M7 3C4.5 3 3 5 3 7.5c0 3 1.5 4.5 2 7.5s1 6 2.5 6 1.5-4 2.5-6 1-2 2-2 1 0 2 2 1 6 2.5 6 2-3 2.5-6 2-4.5 2-7.5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z" />,
  pin: <><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></>,
  book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5z" /><path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" /></>,
  chat: <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />,
  camera: <><path d="M4 8h3l2-3h6l2 3h3v11H4z" /><circle cx="12" cy="13" r="3.5" /></>,
  calendar: <><rect x="4" y="5" width="16" height="15" rx="2" /><path d="M4 10h16M9 3v4M15 3v4" /></>,
  shield: <path d="M12 3l8 3v6c0 4.5-3.4 8.3-8 9-4.6-.7-8-4.5-8-9V6z" />,
  check: <path d="M5 12l5 5L20 7" />,
  plus: <path d="M12 5v14M5 12h14" />,
  phone: <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />,
  route: <path d="M3 11l18-8-8 18-2-8z" />,
  play: <path d="M6 3.5v17L19.5 12z" />,
  arrow: <path d="M12 5v14M6 13l6 6 6-6" />,
};

function Icon({ name, size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

const heroScreens = [
  { name: 'clinics', label: 'Clinics', icon: 'pin', title: 'Clinics nearby', sub: 'Sorted nearest first', alt: 'Clinics Nearby screen listing dental clinics sorted by distance' },
  { name: 'treatments', label: 'Treatments', icon: 'book', title: 'Treatment library', sub: 'Know what to expect', alt: 'Treatments screen with search and category chips' },
  { name: 'rabi', label: 'Ask Rabi', icon: 'chat', title: 'Rabi, AI assistant', sub: 'Answers in plain language', alt: 'Rabi, the DENTRA assistant, with suggested dental questions' },
  { name: 'scan', label: 'Scan', icon: 'camera', title: 'Guided scan', sub: 'Five views, one at a time', alt: 'Dental Scan screen with five mouth regions to capture' },
];

const story = [
  { name: 'scan', tag: 'Scan', status: 'Prototype', title: 'Capture your smile.', body: 'Guided steps walk you through five views of your mouth, one at a time, with quality checks along the way.', alt: 'Guided scan screen with five capture regions' },
  { name: 'rabi', tag: 'Understand', title: 'Make sense of it.', body: 'Read what common treatments involve, or ask Rabi, the AI assistant, in plain language.', alt: 'Rabi assistant with suggested questions' },
  { name: 'clinics', tag: 'Act', title: 'See a dentist.', body: 'Find real clinics around you, nearest first. Call or get directions in one tap.', alt: 'Clinics list sorted by distance' },
];

const heroSrcs = heroScreens.map((s) => shot2x(s.name));
const storySrcs = story.map((s) => shot2x(s.name));

const treatments = {
  General: { name: 'Teeth cleaning', what: 'Removes plaque and tartar that brushing can miss.', time: '30–60 min', follow: 'Check-ups every 6 months', steps: ['Check-up and exam', 'Scaling removes tartar', 'Polishing', 'Home care tips'] },
  Cosmetic: { name: 'Teeth whitening', what: 'Lightens stains for a brighter-looking smile.', time: '60–90 min', follow: 'Touch-ups as advised', steps: ['Shade check', 'Gums protected', 'Whitening gel applied', 'New shade reviewed'] },
  Orthodontics: { name: 'Braces', what: 'Gradually moves teeth into better alignment.', time: '1–2 hrs to fit', follow: 'Regular adjustments', steps: ['Consult and X-rays', 'Brackets bonded', 'Wire placed', 'Adjustment visits'] },
  Surgical: { name: 'Tooth extraction', what: 'Removes a tooth that can’t be saved or is crowding others.', time: '20–40 min', follow: 'Sometimes, to check healing', steps: ['Exam and X-ray', 'Area numbed', 'Tooth removed', 'Aftercare guidance'] },
};

const features = [
  { icon: 'pin', title: 'Clinic Finder', status: 'Working', body: 'Real dental clinics near you on a live map and in a list, with distance, rating and reviews.' },
  { icon: 'book', title: 'Treatment Library', status: 'Working', body: 'General, cosmetic, orthodontic and surgical treatments explained, with a step-by-step timeline.' },
  { icon: 'chat', title: 'Rabi, AI assistant', status: 'Working', body: 'Ask about oral health or a treatment and get educational answers. Guidance, not diagnosis.' },
  { icon: 'camera', title: 'Guided scan', status: 'Prototype', body: 'Five capture regions with positioning help and quality checks. Analysis results are a demo for now.' },
  { icon: 'calendar', title: 'History', status: 'Prototype', body: 'A month view and cards for past screenings. Shows sample data until the backend is connected.' },
  { icon: 'shield', title: 'Privacy controls', status: 'Prototype', body: 'Consent toggles, security settings and account deletion, designed in from the start.' },
];

const faqs = [
  ['Is DENTRA a diagnosis?', 'No. DENTRA gives general information and screening guidance to help you decide when to see a dentist. It does not diagnose any condition.'],
  ['Does it replace my dentist?', 'No. Think of it as a first step. Always see a licensed dentist for care.'],
  ['When can I get it?', 'DENTRA is coming soon to Google Play.'],
  ['Which phones does it run on?', 'Android.'],
  ['Are clinic prices and services real?', 'Clinic locations come from real map data. Service lists in the app are estimates, so confirm details with the clinic directly.'],
];

// Set to the Play Store listing URL once DENTRA is published; until then the badge isn't a link.
const PLAY_URL = null;

function PlayBadge({ small }) {
  const img = <img src={`${base}/badges/google-play.png`} alt="Get it on Google Play" width="564" height="168" />;
  const cls = `play-badge${small ? ' play-badge-sm' : ''}`;
  return PLAY_URL ? (
    <a href={PLAY_URL} className={cls} target="_blank" rel="noopener noreferrer">{img}</a>
  ) : (
    <span className={cls}>{img}</span>
  );
}

function Phone({ screens, active = 0, style }) {
  return (
    <div className="phone" style={style}>
      <div className="phone-notch" />
      <div className="phone-screen">
        {screens.map((s, i) => (
          <img
            key={s.name}
            src={shot(s.name)}
            srcSet={`${shot(s.name)} 600w, ${shot2x(s.name)} 1200w`}
            sizes="290px"
            alt={i === active ? s.alt : ''}
            className={i === active ? 'on' : ''}
            width="600"
            height="1201"
            loading={i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
    </div>
  );
}

function Nav() {
  const [solid, setSolid] = useState(false);

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav${solid ? ' solid' : ''}`}>
      <div className="wrap nav-in">
        <a href="#top" className="brand">
          <span className="brand-mark"><Icon name="tooth" size={18} /></span>
          DENTRA
        </a>
        <nav className="nav-links" aria-label="Primary">
          <a href="#how">How it works</a>
          <a href="#anatomy">Anatomy</a>
          <a href="#treatments">Treatments</a>
          <a href="#clinics">Find a dentist</a>
          <a href="#features">Features</a>
          <a href="#faq">FAQ</a>
        </nav>
        <PlayBadge small />
      </div>
    </header>
  );
}

function Hero() {
  const [active, setActive] = useState(0);
  const [auto, setAuto] = useState(true);
  const s = heroScreens[active];

  useEffect(() => {
    if (!auto) return;
    const id = setInterval(() => setActive((i) => (i + 1) % heroScreens.length), 4000);
    return () => clearInterval(id);
  }, [auto]);

  return (
    <section className="hero" id="top">
      <div className="hero-bg" />
      <div className="wrap hero-grid">
        <div className="hero-text rise">
          <span className="chip"><span className="dot live" />Android</span>
          <h1>
            Your dental health,
            <br />
            <span className="grad">at a glance.</span>
          </h1>
          <p className="lead">
            Screen at home. Understand your options. Find a dentist nearby. DENTRA is a friendly first step before your next dental visit.
          </p>
          <div className="hero-cta">
            <PlayBadge />
            <a href="#how" className="btn">How it works <Icon name="arrow" size={16} /></a>
          </div>
          <dl className="facts">
            <div><dt>Platform</dt><dd>Android</dd></div>
            <div><dt>Made for</dt><dd>The Philippines</dd></div>
            <div><dt>Role</dt><dd>Guidance, not diagnosis</dd></div>
          </dl>
        </div>

        <div className="hero-visual rise" style={{ animationDelay: '120ms' }}>
          <div className="ring" />
          <Phone3D srcs={heroSrcs} active={active} label={s.alt}>
            <Phone screens={heroScreens} active={active} />
          </Phone3D>
          <div className="toast" key={active} aria-live="polite">
            <span className="toast-icon"><Icon name={s.icon} size={18} /></span>
            <div>
              {s.title}
              <span>{s.sub}</span>
            </div>
          </div>
          <div className="picker" role="group" aria-label="Show a screen">
            {heroScreens.map((h, i) => (
              <button
                key={h.name}
                className={i === active ? 'on' : ''}
                aria-pressed={i === active}
                onClick={() => {
                  setAuto(false);
                  setActive(i);
                }}
              >
                <Icon name={h.icon} size={15} />
                {h.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Story() {
  const ref = useRef(null);
  const progress = useScrollProgress(ref);
  const n = story.length;
  const step = Math.min(n - 1, Math.floor(progress * n));
  const s = story[step];

  return (
    <section className="story" id="how" ref={ref}>
      <div className="story-sticky">
        <div className="wrap story-grid">
          <div className="story-copy">
            <p className="eyebrow">How it works</p>
            <h2 className="h2">From photo to dentist.</h2>
            <div className="card story-card fade-up" key={step}>
              <div className="story-tag">
                <span className="n">0{step + 1} · {s.tag}</span>
                {s.status && <span className="chip proto">{s.status}</span>}
              </div>
              <h3>{s.title}</h3>
              <p className="muted">{s.body}</p>
            </div>
            <ol className="rail" aria-hidden="true">
              {story.map((x, i) => (
                <li key={x.tag}>
                  <span style={{ '--f': Math.min(1, Math.max(0, progress * n - i)) }} />
                </li>
              ))}
            </ol>
          </div>
          <div className="story-visual">
            <div className="ring" />
            <Phone3D srcs={storySrcs} active={step} label={s.alt}>
              <Phone screens={story} active={step} />
            </Phone3D>
          </div>
        </div>
      </div>
    </section>
  );
}

function Treatments() {
  const cats = Object.keys(treatments);
  const [cat, setCat] = useState(cats[0]);
  const t = treatments[cat];

  return (
    <section className="section" id="treatments">
      <div className="wrap sim">
        <Reveal>
          <p className="eyebrow">Treatment Library</p>
          <h2 className="h2">Know what to expect.</h2>
          <p className="muted sim-lead">Pick a category and see how a typical visit goes, step by step, before you sit in the chair.</p>
          <div className="seg" role="group" aria-label="Treatment category">
            {cats.map((c) => (
              <button key={c} className={c === cat ? 'on' : ''} aria-pressed={c === cat} onClick={() => setCat(c)}>
                {c}
              </button>
            ))}
          </div>
          <div className="card t-card" key={cat}>
            <h3 className="fade-up">{t.name}</h3>
            <p className="muted fade-up">{t.what}</p>
            <div className="t-meta">
              <span className="chip">Typical: {t.time}</span>
              <span className="chip">Follow-up: {t.follow}</span>
            </div>
            <ol className="timeline">
              {t.steps.map((step, i) => (
                <li key={step} style={{ animationDelay: `${i * 70}ms` }}>
                  <b>{i + 1}</b>
                  {step}
                </li>
              ))}
            </ol>
            <p className="note">General information, not medical advice. Your dentist will tailor the plan to you.</p>
          </div>
        </Reveal>
        <Reveal delay={120} className="sim-visual">
          <div className="ring" />
          <Phone screens={[{ name: 'detail', alt: 'Teeth Cleaning detail screen with duration and follow-up info' }]} />
        </Reveal>
      </div>
    </section>
  );
}

function Clinics() {
  return (
    <section className="section tint" id="clinics">
      <div className="wrap clinic">
        <Reveal className="duo">
          <div className="ring" />
          <Phone screens={[{ name: 'clinics', alt: 'Clinics Nearby screen listing dental clinics sorted by distance' }]} />
          <span className="float f-call"><Icon name="phone" size={16} />Call</span>
          <span className="float f-dir"><Icon name="route" size={16} />Directions</span>
        </Reveal>
        <Reveal delay={100}>
          <p className="eyebrow">Find a Dentist</p>
          <h2 className="h2">Real clinics, nearest first.</h2>
          <p className="muted sim-lead">DENTRA searches for dental clinics around your location and shows them on a map and in a list. Tap one to call or get directions.</p>
          <dl className="specs">
            <div><dt>Map</dt><dd>Live map in DENTRA teal, with your position and clinic markers</dd></div>
            <div><dt>Sorted</dt><dd>Nearest first, with distance, rating and review count</dd></div>
            <div><dt>Search</dt><dd>By clinic name or address</dd></div>
            <div><dt>One tap</dt><dd>Call opens your dialer, Directions opens Google Maps</dd></div>
            <div><dt>Location</dt><dd>Asked for in the app. Still usable if you say no</dd></div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section className="section" id="features">
      <div className="wrap">
        <Reveal className="head">
          <p className="eyebrow">Features</p>
          <h2 className="h2">Everything in one app.</h2>
          <p>We label what works today and what is still a prototype.</p>
        </Reveal>
        <div className="feat-grid">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={(i % 3) * 80} className="card feat">
              <div className="feat-top">
                <span className="feat-icon"><Icon name={f.icon} /></span>
                <span className={`chip ${f.status === 'Working' ? 'ok' : 'proto'}`}>{f.status}</span>
              </div>
              <h3>{f.title}</h3>
              <p>{f.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Trust() {
  const points = [
    ['Not a diagnosis', 'Screening guidance to help you decide when to see a dentist.'],
    ['Your dentist comes first', 'For any concern, a licensed dentist is the right call.'],
    ['Honest about status', 'Features marked Prototype use sample data for now.'],
  ];
  return (
    <section className="section trust-section">
      <div className="wrap">
        <Reveal className="card trust">
          <div className="trust-head">
            <span className="feat-icon"><Icon name="shield" /></span>
            <h2>A first step, not the last word.</h2>
          </div>
          <ul>
            {points.map(([title, body]) => (
              <li key={title}>
                <span className="check"><Icon name="check" size={16} /></span>
                <div>
                  <b>{title}</b>
                  <p className="muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section" id="faq">
      <div className="wrap faq-wrap">
        <Reveal className="head">
          <p className="eyebrow">FAQ</p>
          <h2 className="h2">Good questions.</h2>
        </Reveal>
        <div className="faq">
          {faqs.map(([q, a], i) => (
            <div key={q} className={`faq-item${open === i ? ' open' : ''}`}>
              <button aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                {q}
                <Icon name="plus" size={18} />
              </button>
              <div className="faq-body" inert={open !== i}>
                <p className="muted">{a}</p>
              </div>
            </div>
          ))}
        </div>

        <Reveal className="card cta-final">
          <h2>Coming soon to Google Play.</h2>
          <p className="muted">Screen at home, understand your options and find a dentist nearby, all in one app.</p>
          <PlayBadge />
        </Reveal>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Story />
        <ToothAnatomy />
        <Treatments />
        <Clinics />
        <Features />
        <Trust />
        <Faq />
      </main>
      <footer className="footer">
        <div className="wrap">
          <a href="#top" className="brand">
            <span className="brand-mark"><Icon name="tooth" size={18} /></span>
            DENTRA
          </a>
          <p className="disclaimer">
            DENTRA provides general information and screening guidance. It is not a medical diagnosis. Always consult a licensed dentist.
          </p>
          <p className="fine">A capstone project. © {new Date().getFullYear()} DENTRA.</p>
        </div>
      </footer>
    </>
  );
}

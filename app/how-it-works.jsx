import Icon from '../components/icon';
import { shot, shot2x } from '../components/phone';
import Reveal from './reveal';

const steps = [
  { tag: '01', title: 'Capture', icon: 'camera', body: 'Guided steps help you photograph your teeth, one view at a time. This part is a prototype, so results are demo values for now.', screen: 'scan', alt: 'Guided capture screen with five photo regions (prototype)' },
  { tag: '02', title: 'Understand', icon: 'chat', body: 'Read what common treatments involve, or ask the AI assistant in plain language.', screen: 'rabi', alt: 'AI assistant screen with suggested questions' },
  { tag: '03', title: 'Act', icon: 'pin', body: 'Find real clinics around you, nearest first. Call or get directions.', screen: 'clinics', alt: 'Clinics list sorted by distance' },
];

export default function HowItWorks() {
  return (
    <section className="section" id="how">
      <div className="wrap">
        <Reveal className="head center">
          <p className="eyebrow">How it works</p>
          <h2 className="h2">Capture. Understand. Act.</h2>
        </Reveal>
        <div className="how-grid">
          {steps.map((s, i) => (
            <Reveal key={s.tag} delay={i * 90} className="card how-card">
              <div className="how-top">
                <span className="icon-tile"><Icon name={s.icon} /></span>
                <span className="how-tag">{s.tag}</span>
              </div>
              <h3>{s.title}</h3>
              <p className="muted">{s.body}</p>
              <div className="how-shot">
                <img src={shot(s.screen)} srcSet={`${shot(s.screen)} 600w, ${shot2x(s.screen)} 1200w`} sizes="240px" alt={s.alt} width="600" height="1201" loading="lazy" />
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

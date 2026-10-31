import Icon from '../components/icon';
import { shot, shot2x } from '../components/phone';
import Reveal from './reveal';

const steps = [
  { tag: '01', title: 'Scan', icon: 'camera', body: 'Guided steps walk you through five views of your mouth, one at a time.', screen: 'scan', alt: 'Guided scan screen with five capture regions' },
  { tag: '02', title: 'Understand', icon: 'chat', body: 'Read what common treatments involve, or ask Rabi in plain language.', screen: 'rabi', alt: 'Rabi assistant with suggested questions' },
  { tag: '03', title: 'Act', icon: 'pin', body: 'Find real clinics around you, nearest first. Call or get directions.', screen: 'clinics', alt: 'Clinics list sorted by distance' },
];

export default function HowItWorks() {
  return (
    <section className="section" id="how">
      <div className="wrap">
        <Reveal className="head center">
          <p className="eyebrow">How it works</p>
          <h2 className="h2">Scan. Understand. Act.</h2>
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

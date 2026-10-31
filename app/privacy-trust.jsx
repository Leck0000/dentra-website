import Icon from '../components/icon';
import Reveal from './reveal';

const points = [
  ['shield', 'Not a diagnosis', 'Screening guidance to help you decide when to see a dentist. It does not diagnose any condition.'],
  ['user', 'Your dentist comes first', 'For any concern, a licensed dentist is the right call.'],
  ['info', 'Clear about what’s ready', 'Scan results and history show sample data for now. The camera is a capstone prototype.'],
  ['lock', 'Privacy settings', 'Consent and security settings are built into the app. They don’t save between sessions yet.'],
];

export default function PrivacyTrust() {
  return (
    <section className="section" id="trust">
      <div className="wrap">
        <Reveal className="head center">
          <p className="eyebrow">Privacy and trust</p>
          <h2 className="h2">A first step, not the last word.</h2>
        </Reveal>
        <div className="trust-grid">
          {points.map(([icon, title, body], i) => (
            <Reveal key={title} delay={(i % 4) * 80} className="card trust-card">
              <span className="icon-tile"><Icon name={icon} /></span>
              <h3>{title}</h3>
              <p className="muted">{body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

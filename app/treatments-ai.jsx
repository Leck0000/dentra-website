'use client';

import { useState } from 'react';
import Icon from '../components/icon';
import Reveal from './reveal';

const treatments = {
  General: { name: 'Teeth cleaning', what: 'Removes plaque and tartar that brushing can miss.', time: '30–60 min', steps: ['Check-up and exam', 'Hardened plaque (tartar) scraped off', 'Polishing', 'Home care tips'] },
  Cosmetic: { name: 'Teeth whitening', what: 'Lightens stains for a brighter-looking smile.', time: '60–90 min', steps: ['Shade check', 'Gums protected', 'Whitening gel applied', 'New shade reviewed'] },
  Orthodontics: { name: 'Braces', what: 'Gradually moves teeth into better alignment.', time: '1–2 hrs to fit', steps: ['Consult and X-rays', 'Small brackets glued to teeth', 'Wire placed', 'Adjustment visits'] },
  Surgical: { name: 'Tooth extraction', what: 'Removes a tooth that can’t be saved or is crowding others.', time: '20–40 min', steps: ['Exam and X-ray', 'Area numbed', 'Tooth removed', 'Aftercare guidance'] },
};

// Sample exchanges showing the kind of answer Rabi gives. Educational only.
const chats = [
  { q: 'How often should I get a cleaning?', a: 'Many dentists suggest a check-up and cleaning about every six months. Your dentist may suggest a different schedule for you.' },
  { q: 'What happens when braces are fitted?', a: 'Small brackets are glued to your teeth and a thin wire is threaded through them. Fitting usually takes one to two hours, with adjustment visits after.' },
  { q: 'Is whitening right for me?', a: 'It depends on your teeth and gums. A dentist can check whether whitening suits you and which option is safest.' },
];

export default function TreatmentsAI() {
  const cats = Object.keys(treatments);
  const [cat, setCat] = useState(cats[0]);
  const [chat, setChat] = useState(0);
  const t = treatments[cat];
  const c = chats[chat];

  return (
    <section className="section" id="treatments">
      <div className="wrap">
        <Reveal className="head center">
          <p className="eyebrow">Treatments and AI assistant</p>
          <h2 className="h2">Know what to expect.</h2>
        </Reveal>
        <div className="duo-grid">
          <Reveal className="card panel">
            <div className="panel-head">
              <span className="icon-tile icon-tile-sm"><Icon name="book" size={18} /></span>
              <b>Treatment library</b>
            </div>
            <div className="seg" role="group" aria-label="Treatment category">
              {cats.map((k) => (
                <button key={k} className={k === cat ? 'on' : ''} aria-pressed={k === cat} onClick={() => setCat(k)}>
                  {k}
                </button>
              ))}
            </div>
            <div key={cat}>
              <h3 className="fade-up">{t.name}</h3>
              <p className="muted fade-up">{t.what}</p>
              <span className="chip">Typical visit: {t.time}</span>
              <ol className="timeline">
                {t.steps.map((step, i) => (
                  <li key={step} style={{ animationDelay: `${i * 70}ms` }}>
                    <b>{i + 1}</b>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
            <p className="note">General information, not medical advice. Your dentist will tailor the plan to you.</p>
          </Reveal>

          <Reveal delay={100} className="card panel">
            <div className="panel-head">
              <span className="icon-tile icon-tile-sm"><Icon name="chat" size={18} /></span>
              <b>Ask the AI assistant</b>
              <span className="chip">Sample answers</span>
            </div>
            <div className="chat" key={chat} aria-live="polite">
              <p className="bubble bubble-me fade-up">{c.q}</p>
              <p className="bubble fade-up" style={{ animationDelay: '160ms' }}>{c.a}</p>
            </div>
            <div className="chat-chips" role="group" aria-label="Sample questions">
              {chats.map((x, i) => (
                <button key={x.q} className={i === chat ? 'on' : ''} aria-pressed={i === chat} onClick={() => setChat(i)}>
                  {x.q}
                </button>
              ))}
            </div>
            <p className="note">The AI assistant gives general, educational answers in plain language. It is not medical advice or a diagnosis.</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

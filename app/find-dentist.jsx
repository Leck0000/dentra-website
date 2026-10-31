'use client';

import { useState } from 'react';
import Icon from '../components/icon';
import Reveal from './reveal';

// Illustrative listings only. They show how the app presents clinics; they are
// not real clinics, ratings or reviews, and the UI says so. `route` continues
// the path from you along the drawn roads.
const clinics = [
  { id: 'a', name: 'Example clinic A', km: '0.6 km', rating: '4.8', reviews: 120, x: 372, y: 150, route: 'V125 H372 V150' },
  { id: 'b', name: 'Example clinic B', km: '1.1 km', rating: '4.6', reviews: 86, x: 150, y: 120, route: 'V125 H150 V120' },
  { id: 'c', name: 'Example clinic C', km: '1.9 km', rating: '4.5', reviews: 54, x: 452, y: 318, route: 'V280 H452 V318' },
];
const ME = { x: 300, y: 238 };

const points = [
  ['pin', 'Live map', 'Your position and nearby clinics, in DENTRA teal.'],
  ['star', 'Nearest first', 'With distance, rating and review count.'],
  ['phone', 'One tap', 'Call opens your dialer. Directions opens Google Maps.'],
];

function MapArt({ selected, onSelect }) {
  return (
    <svg className="map-art" viewBox="0 0 600 440" role="group" aria-label="Illustrated map with example clinics around your location">
      <rect width="600" height="440" fill="#F3FBF9" />
      {/* Water and park */}
      <path d="M0 330 C120 300 190 370 300 360 S470 400 600 372 V440 H0 Z" fill="#CDEFEA" />
      <path d="M430 40 h120 a14 14 0 0 1 14 14 v80 a14 14 0 0 1 -14 14 h-120 a14 14 0 0 1 -14 -14 v-80 a14 14 0 0 1 14 -14 Z" fill="#DDF4EC" />
      {/* Blocks */}
      {[[30, 30, 110, 60], [170, 30, 120, 60], [310, 30, 90, 60], [30, 160, 90, 110], [140, 180, 110, 90], [330, 180, 80, 70], [440, 180, 130, 90], [170, 290, 100, 40]].map(([x, y, w, h]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="10" fill="#E6F4F1" />
      ))}
      {/* Roads */}
      <g fill="none" stroke="#fff" strokeLinecap="round">
        <path d="M0 125 H600 M300 0 V350 M120 125 L60 440 M420 125 V330" strokeWidth="16" />
        <path d="M0 280 H600" strokeWidth="10" />
      </g>
      {/* Route to the selected clinic */}
      {clinics.map((c) => (
        <path key={c.id} className={`map-route${c.id === selected ? ' on' : ''}`} d={`M${ME.x} ${ME.y} ${c.route}`} />
      ))}
      {/* You */}
      <g transform={`translate(${ME.x} ${ME.y})`}>
        <circle className="map-pulse" r="34" fill="rgba(77, 216, 200, 0.3)" />
        <circle r="10" fill="#fff" />
        <circle r="7" fill="#2CA6A4" />
      </g>
      {/* Clinic pins */}
      {clinics.map((c) => (
        <g key={c.id} transform={`translate(${c.x} ${c.y})`}>
          <g
            className={`map-pin${c.id === selected ? ' on' : ''}`}
            role="button"
            tabIndex={0}
            aria-label={`${c.name}, ${c.km}`}
            aria-pressed={c.id === selected}
            onClick={() => onSelect(c.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(c.id);
              }
            }}
          >
            <circle r="26" fill="transparent" />
            <path d="M0 0 C-12 -14 -16 -20 -16 -28 a16 16 0 0 1 32 0 c0 8 -4 14 -16 28 Z" className="map-pin-body" />
            <circle cy="-28" r="6" fill="#fff" />
          </g>
        </g>
      ))}
    </svg>
  );
}

export default function FindDentist() {
  const [selected, setSelected] = useState(clinics[0].id);
  const c = clinics.find((x) => x.id === selected);

  return (
    <section className="section tint" id="clinics">
      <div className="wrap clinic">
        <Reveal className="clinic-copy">
          <p className="eyebrow">Find a dentist</p>
          <h2 className="h2">Real clinics, nearest first.</h2>
          <p className="muted sim-lead">DENTRA finds dental clinics around you and shows them on a map and in a list.</p>
          <ul className="clinic-points">
            {points.map(([icon, title, body]) => (
              <li key={title}>
                <span className="icon-tile icon-tile-sm"><Icon name={icon} size={18} /></span>
                <div>
                  <b>{title}</b>
                  <p className="muted">{body}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="note">Location is asked for in the app. It still works if you say no.</p>
        </Reveal>

        <Reveal delay={100} className="map-card card">
          <MapArt selected={selected} onSelect={setSelected} />
          <span className="map-badge">Illustration, not real clinic data</span>
          <div className="clinic-card" key={c.id} aria-live="polite">
            <div className="clinic-card-top">
              <span className="icon-tile icon-tile-sm"><Icon name="tooth" size={18} /></span>
              <div>
                <b>{c.name}</b>
                <span className="muted">
                  {c.km} · <Icon name="star" size={12} /> {c.rating} ({c.reviews} reviews)
                </span>
              </div>
            </div>
            <div className="clinic-actions" aria-hidden="true">
              <span className="pill pill-primary"><Icon name="phone" size={15} />Call</span>
              <span className="pill"><Icon name="route" size={15} />Directions</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const shot = (name) => `${base}/screens/${name}.webp`;
export const shot2x = (name) => `${base}/screens/2x/${name}.webp`;

// Flat phone frame wearing real app screenshots; `active` cross-fades between them.
export default function Phone({ screens, active = 0, eager = false }) {
  return (
    <div className="phone">
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
            loading={eager && i === 0 ? 'eager' : 'lazy'}
          />
        ))}
      </div>
    </div>
  );
}

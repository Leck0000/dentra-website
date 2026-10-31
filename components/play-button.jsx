import Icon from './icon';

// Set to the Play Store listing URL once DENTRA is published; until then this
// is a label, not a link.
export const PLAY_URL = null;

export default function PlayButton({ small }) {
  const cls = `btn btn-primary btn-play${small ? ' btn-sm' : ''}`;
  const label = PLAY_URL ? 'Get it on Google Play' : 'Google Play: coming soon';
  const body = (
    <>
      <Icon name="play" size={small ? 14 : 16} />
      <span className="btn-play-full">{label}</span>
      {/* Narrow nav: never shorten to a bare "Google Play" before it's live */}
      <span className="btn-play-short" aria-hidden="true">{PLAY_URL ? 'Google Play' : 'Coming soon'}</span>
    </>
  );
  return PLAY_URL ? (
    <a href={PLAY_URL} className={cls} target="_blank" rel="noopener noreferrer">{body}</a>
  ) : (
    <span className={cls}>{body}</span>
  );
}

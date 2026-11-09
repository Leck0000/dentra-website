// Store-style badges (black, logo left, small line over a big line). The Apple
// badge never says "App Store": iPhone users get DENTRA as a web app.

// Set to the Play Store listing URL once DENTRA is published; until then the
// Play badge is not a link. "Get it on" is the owner's call (2026-10-31).
export const PLAY_URL = null;

const AppleLogo = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
    />
  </svg>
);

const PlayLogo = () => (
  <svg viewBox="0 0 24 26" aria-hidden="true">
    <path fill="#4285F4" d="M2 1 L12 13 L2 25 Z" />
    <path fill="#34A853" d="M2 1 L16.5 9.7 L12 13 Z" />
    <path fill="#EA4335" d="M2 25 L12 13 L16.5 16.3 Z" />
    <path fill="#FBBC04" d="M16.5 9.7 L22 13 L16.5 16.3 L12 13 Z" />
  </svg>
);

// `href` defaults to the how-to section; pass WEB_APP_URL + external to open the web app.
export function HomeScreenBadge({ href = '#install', external = false }) {
  return (
    <a
      href={href}
      className="store-badge"
      aria-label="Add DENTRA to your iPhone Home Screen"
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      <AppleLogo />
      <span>
        <small className="caps">Add DENTRA to your</small>
        <strong>Home Screen</strong>
      </span>
    </a>
  );
}

export function PlayBadge({ small = false }) {
  const cls = `store-badge${small ? ' store-badge-sm' : ''}`;
  const body = (
    <>
      <PlayLogo />
      <span>
        <small className="caps">Get it on</small>
        <strong>Google Play</strong>
      </span>
    </>
  );
  return PLAY_URL ? (
    <a href={PLAY_URL} className={cls} target="_blank" rel="noopener noreferrer">{body}</a>
  ) : (
    <span className={cls}>{body}</span>
  );
}

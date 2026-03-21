export default function LoveFooter() {
  return (
    <div className="w-full flex justify-center items-center gap-2 py-4 mt-2">
      <span
        className="text-sm font-medium"
        style={{ color: 'rgba(255,255,255,0.45)', direction: 'rtl' }}
      >
        صنعت من كل حب لـ بنتييي
      </span>
      <MessengerHeart />
    </div>
  );
}

function MessengerHeart() {
  return (
    <span
      className="messenger-heart"
      style={{ display: 'inline-flex', alignItems: 'center' }}
    >
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="hg" cx="50%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#ff6b8a" />
            <stop offset="55%" stopColor="#f0254a" />
            <stop offset="100%" stopColor="#c0003a" />
          </radialGradient>
          <radialGradient id="hs" cx="38%" cy="28%" r="28%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.72)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>
        </defs>
        {/* Main heart */}
        <path
          d="M11 19.5C11 19.5 2.5 14 2.5 7.5C2.5 5 4.5 3 7 3C8.7 3 10.1 3.9 11 5.2C11.9 3.9 13.3 3 15 3C17.5 3 19.5 5 19.5 7.5C19.5 14 11 19.5 11 19.5Z"
          fill="url(#hg)"
        />
        {/* Shine highlight */}
        <ellipse
          cx="8.5"
          cy="7"
          rx="3"
          ry="2"
          fill="url(#hs)"
          opacity="0.75"
        />
        {/* Small sparkle dots */}
        <circle cx="17.5" cy="4.5" r="1" fill="#ff9eb5" opacity="0.85" />
        <circle cx="19" cy="7" r="0.6" fill="#ffcad8" opacity="0.7" />
        <circle cx="4" cy="5.5" r="0.7" fill="#ff9eb5" opacity="0.7" />
      </svg>
    </span>
  );
}

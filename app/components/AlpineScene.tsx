import styles from "../calendar.module.css";

const STARS: ReadonlyArray<[number, number, number, number]> = [
  [40, 96, 1.2, 0.8],
  [72, 150, 1, 0.6],
  [118, 84, 1.3, 0.9],
  [14, 190, 1, 0.5],
  [350, 120, 1.3, 0.8],
  [372, 176, 1, 0.6],
  [322, 214, 1.1, 0.7],
  [52, 232, 1.1, 0.6],
  [196, 70, 1, 0.5],
  [268, 96, 1.2, 0.7],
  [154, 236, 1, 0.5],
  [300, 80, 1, 0.6],
];

function Stars({ offset = 0 }: { offset?: number }) {
  return (
    <g fill="#f6efd8" transform={`translate(${offset} 0)`}>
      {STARS.map(([cx, cy, r, o]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} opacity={o} />
      ))}
    </g>
  );
}

function Range() {
  return (
    <>
      <path
        d="M0 260 L0 200 L40 170 L70 190 L110 150 L150 180 L190 140 L230 170 L270 135 L310 165 L350 145 L390 175 L390 260 Z"
        fill="url(#alp-far)"
        opacity="0.9"
      />
      <path
        d="M0 290 L0 212 L24 190 L44 200 L70 140 L84 150 L104 96 L116 70 L128 92 L136 84 L152 140 L176 170 L206 130 L222 110 L238 60 L250 52 L262 78 L270 70 L288 130 L312 150 L336 120 L352 130 L372 176 L390 190 L390 290 Z"
        fill="url(#alp-mid)"
      />
      <g fill="url(#alp-glow)" opacity="0.78">
        <path d="M116 70 L128 92 L136 84 L152 140 L130 152 L120 118 Z" />
        <path d="M250 52 L262 78 L270 70 L288 130 L264 142 L254 100 Z" />
        <path d="M238 60 L250 52 L254 100 L240 110 L226 108 Z" />
        <path d="M336 120 L352 130 L372 176 L346 168 Z" />
      </g>
      <rect x="0" y="190" width="390" height="80" fill="url(#alp-mist)" />
      <path
        d="M0 290 L0 262 C70 236 130 256 210 244 C280 232 340 248 390 236 L390 290 Z"
        fill="#151830"
      />
      <path
        d="M14 222 L5 238 L9 238 L2 252 L7 252 L-1 268 L29 268 L21 252 L26 252 L19 238 L23 238 Z"
        fill="#0f1226"
      />
      <path
        d="M376 214 L367 230 L371 230 L364 244 L369 244 L361 260 L391 260 L383 244 L388 244 L381 230 L385 230 Z"
        fill="#0f1226"
      />
    </>
  );
}

export function AlpineScene() {
  return (
    <div className={styles.scene} aria-hidden="true">
      <svg width="0" height="0" focusable="false" className={styles.defs}>
        <defs>
          <linearGradient id="alp-far" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5a5a94" />
            <stop offset="1" stopColor="#2d3060" />
          </linearGradient>
          <linearGradient id="alp-mid" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#7d6a99" />
            <stop offset="0.7" stopColor="#2f2d55" />
            <stop offset="1" stopColor="#1c1f3d" />
          </linearGradient>
          <linearGradient id="alp-glow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f6b99a" />
            <stop offset="1" stopColor="#c8738a" />
          </linearGradient>
          <linearGradient id="alp-mist" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f3d4c8" stopOpacity="0" />
            <stop offset="1" stopColor="#f3d4c8" stopOpacity="0.22" />
          </linearGradient>
          <radialGradient id="alp-moon">
            <stop offset="0" stopColor="#f6efd8" stopOpacity="0.45" />
            <stop offset="1" stopColor="#f6efd8" stopOpacity="0" />
          </radialGradient>
        </defs>
      </svg>

      <svg
        className={`${styles.stars} ${styles.narrow}`}
        viewBox="0 0 390 260"
        preserveAspectRatio="xMidYMin slice"
      >
        <Stars />
      </svg>
      <svg
        className={`${styles.mountains} ${styles.narrow}`}
        viewBox="0 0 390 290"
        preserveAspectRatio="xMidYMax slice"
      >
        <circle cx="332" cy="36" r="30" fill="url(#alp-moon)" />
        <circle cx="332" cy="36" r="12" fill="#f6efd8" />
        <Range />
      </svg>

      <svg
        className={`${styles.stars} ${styles.wide}`}
        viewBox="0 0 780 260"
        preserveAspectRatio="xMidYMin slice"
      >
        <Stars />
        <Stars offset={390} />
      </svg>
      <svg
        className={`${styles.mountains} ${styles.wide}`}
        viewBox="0 0 780 290"
        preserveAspectRatio="xMidYMax slice"
      >
        <circle cx="705" cy="92" r="32" fill="url(#alp-moon)" />
        <circle cx="705" cy="92" r="13" fill="#f6efd8" />
        <Range />
        <g transform="translate(780 0) scale(-1 1)">
          <Range />
        </g>
      </svg>
    </div>
  );
}

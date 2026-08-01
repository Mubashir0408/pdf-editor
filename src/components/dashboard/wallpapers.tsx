"use client";

/**
 * Hand-built SVG scenic wallpapers (no external image assets).
 * Each fills its container and scales responsively via viewBox.
 */

export type WallpaperId = "mountains" | "ocean" | "forest" | "city-night" | "minimal";

export const wallpaperMeta: { id: WallpaperId; label: string }[] = [
  { id: "mountains", label: "Mountains" },
  { id: "ocean", label: "Ocean" },
  { id: "forest", label: "Forest" },
  { id: "city-night", label: "City at Night" },
  { id: "minimal", label: "Minimal Landscape" },
];

function Stars() {
  const dots = Array.from({ length: 46 }, (_, i) => {
    const seed = (i * 53.17) % 1;
    const x = (i * 37.3) % 1440;
    const y = (seed * 260);
    const r = 0.6 + ((i * 13) % 10) / 10;
    const o = 0.25 + ((i * 7) % 10) / 14;
    return <circle key={i} cx={x} cy={y} r={r} fill="#ffffff" opacity={o} />;
  });
  return <g>{dots}</g>;
}

export function MountainsWallpaper() {
  return (
    <svg viewBox="0 0 1440 480" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="mtn-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a5cff" />
          <stop offset="45%" stopColor="#5b7fff" />
          <stop offset="75%" stopColor="#8f7bff" />
          <stop offset="100%" stopColor="#ffb37c" />
        </linearGradient>
        <linearGradient id="mtn-1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a3568" />
          <stop offset="100%" stopColor="#1c2650" />
        </linearGradient>
        <linearGradient id="mtn-2" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#232f63" />
          <stop offset="100%" stopColor="#141b3d" />
        </linearGradient>
        <linearGradient id="mtn-3" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#161d3f" />
          <stop offset="100%" stopColor="#0c1130" />
        </linearGradient>
        <radialGradient id="sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffe9c7" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#ffe9c7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1440" height="480" fill="url(#mtn-sky)" />
      <circle cx="1080" cy="150" r="160" fill="url(#sun)" />
      <circle cx="1080" cy="150" r="46" fill="#fff6e6" opacity="0.9" />
      <path d="M0 300 L180 190 L340 300 L520 150 L720 300 L860 210 L1040 320 L1220 200 L1440 310 L1440 480 L0 480 Z" fill="url(#mtn-1)" opacity="0.9" />
      <path d="M0 360 L220 260 L420 360 L640 240 L880 370 L1100 260 L1440 380 L1440 480 L0 480 Z" fill="url(#mtn-2)" />
      <path d="M0 420 L260 340 L520 420 L780 330 L1040 430 L1440 350 L1440 480 L0 480 Z" fill="url(#mtn-3)" />
    </svg>
  );
}

export function OceanWallpaper() {
  return (
    <svg viewBox="0 0 1440 480" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="ocean-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e2e6b" />
          <stop offset="55%" stopColor="#2861c9" />
          <stop offset="100%" stopColor="#36cfc9" />
        </linearGradient>
        <linearGradient id="ocean-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a4fb0" />
          <stop offset="100%" stopColor="#0a1e46" />
        </linearGradient>
        <radialGradient id="ocean-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff3d6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff3d6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1440" height="480" fill="url(#ocean-sky)" />
      <circle cx="720" cy="230" r="220" fill="url(#ocean-sun)" />
      <circle cx="720" cy="230" r="52" fill="#fff8e8" opacity="0.95" />
      <rect y="250" width="1440" height="230" fill="url(#ocean-water)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M0 ${280 + i * 38} Q 180 ${260 + i * 38} 360 ${280 + i * 38} T 720 ${280 + i * 38} T 1080 ${280 + i * 38} T 1440 ${280 + i * 38}`}
          stroke="#ffffff"
          strokeOpacity={0.14 - i * 0.02}
          strokeWidth="2"
          fill="none"
        />
      ))}
    </svg>
  );
}

export function ForestWallpaper() {
  const trees = (rowY: number, scale: number, color: string, count: number, seedBase: number) =>
    Array.from({ length: count }, (_, i) => {
      const x = (i / count) * 1440 + ((i * seedBase) % 40) - 20;
      const h = 90 * scale + ((i * 17) % 30);
      return (
        <g key={`${rowY}-${i}`} transform={`translate(${x} ${rowY})`}>
          <polygon points={`0,${-h} ${28 * scale},0 ${-28 * scale},0`} fill={color} />
          <polygon points={`0,${-h * 0.68} ${22 * scale},${-h * 0.18} ${-22 * scale},${-h * 0.18}`} fill={color} />
        </g>
      );
    });

  return (
    <svg viewBox="0 0 1440 480" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="forest-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#204d3c" />
          <stop offset="55%" stopColor="#2f8f6f" />
          <stop offset="100%" stopColor="#a8e6b8" />
        </linearGradient>
      </defs>
      <rect width="1440" height="480" fill="url(#forest-sky)" />
      <circle cx="1150" cy="140" r="130" fill="#eafff2" opacity="0.18" />
      {trees(300, 1.1, "#123524", 14, 11)}
      {trees(370, 1.4, "#0d2a1c", 11, 19)}
      {trees(440, 1.8, "#081f14", 9, 29)}
    </svg>
  );
}

export function CityNightWallpaper() {
  const buildings = (baseY: number, h1: number, h2: number, color: string, count: number, gap: number) =>
    Array.from({ length: count }, (_, i) => {
      const w = gap * 0.72;
      const x = i * gap;
      const h = h1 + ((i * 37) % (h2 - h1));
      const litWindows = Array.from({ length: Math.floor(h / 18) }, (_, r) =>
        Array.from({ length: Math.max(2, Math.floor(w / 12)) }, (_, c) => {
          const on = (i + r + c) % 3 === 0;
          if (!on) return null;
          return (
            <rect
              key={`${r}-${c}`}
              x={x + 6 + c * 12}
              y={baseY - h + 10 + r * 18}
              width="5"
              height="8"
              fill="#ffd98a"
              opacity={0.85}
            />
          );
        })
      );
      return (
        <g key={i}>
          <rect x={x} y={baseY - h} width={w} height={h} fill={color} />
          {litWindows}
        </g>
      );
    });

  return (
    <svg viewBox="0 0 1440 480" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="city-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#05070f" />
          <stop offset="55%" stopColor="#131a3a" />
          <stop offset="100%" stopColor="#3a2f6e" />
        </linearGradient>
        <radialGradient id="moon" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#eaf1ff" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#eaf1ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1440" height="480" fill="url(#city-sky)" />
      <Stars />
      <circle cx="220" cy="110" r="120" fill="url(#moon)" />
      <circle cx="220" cy="110" r="34" fill="#f5f8ff" opacity="0.95" />
      {buildings(420, 90, 170, "#141c3d", 16, 92)}
      {buildings(440, 140, 260, "#0c1230", 11, 134)}
    </svg>
  );
}

export function MinimalWallpaper() {
  return (
    <svg viewBox="0 0 1440 480" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
      <defs>
        <linearGradient id="min-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#5b7fff" />
          <stop offset="50%" stopColor="#7c5cff" />
          <stop offset="100%" stopColor="#36cfc9" />
        </linearGradient>
        <linearGradient id="min-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1b2340" />
          <stop offset="100%" stopColor="#0e1428" />
        </linearGradient>
      </defs>
      <rect width="1440" height="480" fill="url(#min-sky)" />
      <circle cx="1180" cy="150" r="70" fill="#ffffff" opacity="0.9" />
      <path d="M0 340 Q 360 250 720 330 T 1440 320 L1440 480 L0 480 Z" fill="url(#min-hill)" />
    </svg>
  );
}

export const wallpaperComponents: Record<WallpaperId, React.ComponentType> = {
  mountains: MountainsWallpaper,
  ocean: OceanWallpaper,
  forest: ForestWallpaper,
  "city-night": CityNightWallpaper,
  minimal: MinimalWallpaper,
};

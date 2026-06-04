import { useGarden } from '../store/useGarden';
import { TIME_THEMES } from '../lib/ambience';

// Fixed scatter so stars/fireflies don't jump around between renders.
const STARS = [
  [8, 12], [16, 22], [24, 9], [33, 18], [42, 8], [58, 14], [67, 7], [74, 20],
  [82, 11], [90, 19], [12, 32], [50, 24], [62, 30], [88, 33], [4, 24], [38, 33],
];
const FIREFLIES = [18, 34, 47, 61, 73, 85, 27, 54];

export default function SkyLayer() {
  const timeOfDay = useGarden((s) => s.timeOfDay);
  const theme = TIME_THEMES[timeOfDay];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* soft god-rays fanning from the sun */}
      {theme.rays && (
        <div className="godrays" style={{ top: '-22%', right: '-8%', width: '72vw', height: '72vw' }} />
      )}

      {/* celestial body with a soft glow */}
      {theme.celestial && (
        <div
          className="absolute"
          style={{
            top: '6%',
            right: '12%',
            width: 92,
            height: 92,
            borderRadius: '9999px',
            background:
              theme.celestial === 'sun'
                ? 'radial-gradient(circle at 50% 50%, #fff7d6 0%, #ffe89a 55%, #ffd970 75%, rgba(255,217,112,0) 78%)'
                : 'radial-gradient(circle at 38% 38%, #fdfcff 0%, #e6ecff 58%, #cfd9f5 72%, rgba(207,217,245,0) 76%)',
            boxShadow: `0 0 90px 40px ${theme.glow}`,
          }}
        />
      )}

      {/* stars */}
      {theme.stars &&
        STARS.map(([l, t], i) => (
          <span
            key={i}
            className="star"
            style={{ left: `${l}%`, top: `${t}%`, animationDelay: `${(i % 6) * 0.5}s` }}
          />
        ))}

      {/* fireflies drifting low over the meadow */}
      {theme.fireflies &&
        FIREFLIES.map((l, i) => (
          <span
            key={i}
            className="firefly"
            style={{
              left: `${l}%`,
              bottom: `${10 + (i % 4) * 12}%`,
              animationDelay: `${(i % 5) * -1.7}s`,
              animationDuration: `${7 + (i % 4) * 2}s`,
            }}
          />
        ))}
    </div>
  );
}

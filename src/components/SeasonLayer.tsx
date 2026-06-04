import { useGarden } from '../store/useGarden';
import { SEASON_THEMES } from '../lib/ambience';

const COLS = [4, 11, 17, 24, 31, 38, 45, 52, 59, 66, 73, 80, 87, 94, 8, 21, 35, 49, 63, 77, 91, 14, 70, 28];
const LEAF_COLORS = ['#e07b43', '#d2603a', '#e89a4a', '#c0512f', '#f0b85e'];

/** Ambient seasonal drift: autumn leaves, spring blossom, winter snow. */
export default function SeasonLayer() {
  const season = useGarden((s) => s.season);
  const drift = SEASON_THEMES[season].drift;
  if (drift === 'none') return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {COLS.map((l, i) => {
        const delay = `${(i % 11) * -1.1}s`;
        const duration = `${7 + (i % 6) * 1.5}s`;
        if (drift === 'snow') {
          return (
            <span
              key={i}
              className="snowflake"
              style={{ left: `${l}%`, fontSize: `${8 + (i % 4) * 4}px`, animationDelay: delay, animationDuration: `${7 + (i % 5) * 2}s` }}
            >
              ❄
            </span>
          );
        }
        if (drift === 'blossom') {
          return (
            <span
              key={i}
              className="petal"
              style={{ left: `${l}%`, background: ['#ffc9d4', '#ffd7e0', '#ffe3ef', '#f9c8e2'][i % 4], animationDelay: delay, animationDuration: duration }}
            />
          );
        }
        // autumn leaves
        return (
          <span
            key={i}
            className="leaf-fall"
            style={{ left: `${l}%`, background: LEAF_COLORS[i % LEAF_COLORS.length], animationDelay: delay, animationDuration: duration }}
          />
        );
      })}
    </div>
  );
}

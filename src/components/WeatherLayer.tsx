import { useGarden } from '../store/useGarden';

// Deterministic columns so drops/flakes are evenly spread but not gridded.
const COLS = [3, 9, 14, 21, 27, 33, 39, 45, 51, 57, 63, 69, 75, 81, 87, 93, 6, 17, 30, 48, 66, 84, 11, 72];

export default function WeatherLayer() {
  const weather = useGarden((s) => s.weather);
  if (weather === 'clear') return null;

  if (weather === 'rain') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {COLS.map((l, i) => (
          <span
            key={i}
            className="raindrop"
            style={{
              left: `${l}%`,
              animationDelay: `${(i % 9) * -0.13}s`,
              animationDuration: `${0.5 + (i % 4) * 0.12}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (weather === 'snow') {
    return (
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {COLS.concat(COLS.map((c) => c + 4)).map((l, i) => (
          <span
            key={i}
            className="snowflake"
            style={{
              left: `${l % 100}%`,
              fontSize: `${8 + (i % 4) * 4}px`,
              animationDelay: `${(i % 11) * -0.9}s`,
              animationDuration: `${6 + (i % 5) * 2}s`,
            }}
          >
            ❄
          </span>
        ))}
      </div>
    );
  }

  // petals
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {COLS.map((l, i) => (
        <span
          key={i}
          className="petal"
          style={{
            left: `${l}%`,
            animationDelay: `${(i % 10) * -1.1}s`,
            animationDuration: `${7 + (i % 5) * 1.6}s`,
            background: ['#ffc9d4', '#ffd7e0', '#ffe3cf', '#f7c8e0'][i % 4],
          }}
        />
      ))}
    </div>
  );
}

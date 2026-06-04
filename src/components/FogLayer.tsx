import { useGarden } from '../store/useGarden';
import { TIME_THEMES } from '../lib/ambience';

/** Low drifting ground mist at dusk and night. */
export default function FogLayer() {
  const timeOfDay = useGarden((s) => s.timeOfDay);
  if (!TIME_THEMES[timeOfDay].fog) return null;
  const color = timeOfDay === 'night' ? 'rgba(180,195,230,0.16)' : 'rgba(232,212,226,0.2)';

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="fogband"
          style={{
            bottom: `${3 + i * 11}%`,
            height: `${130 - i * 22}px`,
            opacity: 0.85 - i * 0.18,
            background: `radial-gradient(60% 100% at 50% 50%, ${color}, transparent 72%)`,
            animationDelay: `${i * -9}s`,
            animationDuration: `${26 + i * 7}s`,
          }}
        />
      ))}
    </div>
  );
}

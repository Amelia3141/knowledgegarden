import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGarden } from '../store/useGarden';
import {
  TIME_THEMES,
  TIME_ORDER,
  WEATHER_THEMES,
  WEATHER_ORDER,
  SEASON_THEMES,
  SEASON_ORDER,
} from '../lib/ambience';

export default function SceneControls() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timeOfDay = useGarden((s) => s.timeOfDay);
  const weather = useGarden((s) => s.weather);
  const season = useGarden((s) => s.season);
  const setTimeOfDay = useGarden((s) => s.setTimeOfDay);
  const setWeather = useGarden((s) => s.setWeather);
  const setSeason = useGarden((s) => s.setSeason);

  // Close on click/tap outside the popover.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    return () => document.removeEventListener('pointerdown', onDown);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        title="Scene & weather"
        className={`grid h-12 w-12 place-items-center rounded-2xl text-xl transition active:translate-y-0.5 ${
          open ? 'bg-sky/70' : 'bg-[#f3e8d8] hover:bg-[#ecdfca]'
        }`}
      >
        {TIME_THEMES[timeOfDay].emoji}
      </button>

      <AnimatePresence>
        {open && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 320, damping: 26 }}
              className="woodgrain absolute bottom-16 right-0 z-20 w-60 rounded-[22px] border border-white/60 bg-cream/95 p-3 shadow-soft backdrop-blur"
            >
              <p className="mb-1.5 px-1 text-[11px] font-extrabold uppercase tracking-wide text-[#bba88f]">Season</p>
              <div className="mb-3 grid grid-cols-4 gap-1.5">
                {SEASON_ORDER.map((s) => (
                  <Choice
                    key={s}
                    emoji={SEASON_THEMES[s].emoji}
                    label={SEASON_THEMES[s].label}
                    active={season === s}
                    onClick={() => setSeason(s)}
                  />
                ))}
              </div>
              <p className="mb-1.5 px-1 text-[11px] font-extrabold uppercase tracking-wide text-[#bba88f]">Time of day</p>
              <div className="mb-3 grid grid-cols-4 gap-1.5">
                {TIME_ORDER.map((t) => (
                  <Choice
                    key={t}
                    emoji={TIME_THEMES[t].emoji}
                    label={TIME_THEMES[t].label}
                    active={timeOfDay === t}
                    onClick={() => setTimeOfDay(t)}
                  />
                ))}
              </div>
              <p className="mb-1.5 px-1 text-[11px] font-extrabold uppercase tracking-wide text-[#bba88f]">Weather</p>
              <div className="grid grid-cols-4 gap-1.5">
                {WEATHER_ORDER.map((w) => (
                  <Choice
                    key={w}
                    emoji={WEATHER_THEMES[w].emoji}
                    label={WEATHER_THEMES[w].label}
                    active={weather === w}
                    onClick={() => setWeather(w)}
                  />
                ))}
              </div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Choice({ emoji, label, active, onClick }: { emoji: string; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex flex-col items-center gap-0.5 rounded-xl py-2 transition ${
        active ? 'bg-leaf/90 text-white shadow-pop' : 'bg-[#f3e8d8] text-[#9b8a78] hover:bg-[#ecdfca]'
      }`}
    >
      <span className="text-lg leading-none">{emoji}</span>
      <span className="text-[9px] font-bold leading-none">{label}</span>
    </button>
  );
}

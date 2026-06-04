import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Garden from './components/Garden';
import DetailDrawer from './components/DetailDrawer';
import PlantTaskModal from './components/PlantTaskModal';
import SkyLayer from './components/SkyLayer';
import WeatherLayer from './components/WeatherLayer';
import SeasonLayer from './components/SeasonLayer';
import FogLayer from './components/FogLayer';
import SceneControls from './components/SceneControls';
import FocusMode from './components/FocusMode';
import { WateringCan, Plus, Target } from './components/Icons';
import { useGarden } from './store/useGarden';
import { flatten, isThirsty, suggestNext } from './lib/growth';
import { TIME_THEMES, WEATHER_THEMES } from './lib/ambience';
import { setMuted } from './lib/sound';

// A handful of drifting pollen motes for ambiance (positions fixed for stability).
const MOTES = [12, 24, 37, 49, 58, 66, 73, 81, 88, 94, 18, 43, 69, 91];

export default function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const projects = useGarden((s) => s.projects);
  const select = useGarden((s) => s.select);
  const muted = useGarden((s) => s.muted);
  const toggleMute = useGarden((s) => s.toggleMute);
  const waterStalled = useGarden((s) => s.waterStalled);
  const timeOfDay = useGarden((s) => s.timeOfDay);
  const weather = useGarden((s) => s.weather);
  const setFocusMode = useGarden((s) => s.setFocusMode);
  const loadSeedIfEmpty = useGarden((s) => s.loadSeedIfEmpty);
  const theme = TIME_THEMES[timeOfDay];
  const dark = timeOfDay === 'night' || timeOfDay === 'dusk';

  // First-time visitors get a populated demo garden so they can see what it looks like.
  useEffect(() => loadSeedIfEmpty(), [loadSeedIfEmpty]);

  useEffect(() => setMuted(muted), [muted]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3400);
    return () => clearTimeout(t);
  }, [toast]);

  const allSubtasks = projects.flatMap((p) => flatten(p.subtasks));
  const totals = {
    total: allSubtasks.length,
    done: allSubtasks.filter((s) => s.status === 'done').length,
  };
  const donePct = totals.total ? Math.round((totals.done / totals.total) * 100) : 0;
  const thirstyCount = allSubtasks.filter(isThirsty).length;
  const empty = projects.length === 0;

  const onWater = () => {
    const n = waterStalled();
    const next = suggestNext(projects.flatMap((p) => p.subtasks));
    setToast(
      n > 0
        ? `🌧️ Watered ${n} thirsty ${n === 1 ? 'plant' : 'plants'}.${next ? ` Maybe start with: “${next.title}”` : ''}`
        : 'Your garden is happily watered 🌼',
    );
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden font-round text-[#5a4a3a]">
      <Garden />

      {/* sun / moon / stars / fireflies */}
      <SkyLayer />

      {/* mood wash for time-of-day + weather */}
      <div
        className="pointer-events-none absolute inset-0 transition-[background] duration-1000"
        style={{ background: theme.tint }}
      />
      <div className="pointer-events-none absolute inset-0" style={{ background: WEATHER_THEMES[weather].tint }} />

      {/* drifting ground mist (dusk / night) */}
      <FogLayer />

      {/* seasonal drift: leaves / blossom / snow */}
      <SeasonLayer />

      {/* falling rain / snow / petals */}
      <WeatherLayer />

      {/* depth vignette on the edges */}
      <div
        className="pointer-events-none absolute inset-0 transition-[background] duration-1000"
        style={{ background: `radial-gradient(130% 120% at 50% 42%, transparent 54%, ${theme.vignette} 100%)` }}
      />

      {/* ambient pollen motes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {MOTES.map((m, i) => (
          <span
            key={i}
            className="mote"
            style={{
              left: `${m}%`,
              animationDelay: `${(i % 7) * -2.3}s`,
              animationDuration: `${13 + (i % 5) * 3}s`,
              opacity: 0.5 + (i % 4) * 0.12,
            }}
          />
        ))}
      </div>

      {/* ── HUD: top-left brand ── */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 flex items-start justify-between p-4 sm:p-5">
        <div className="woodgrain pointer-events-auto flex items-center gap-3 rounded-[22px] border border-white/60 bg-cream/85 py-2.5 pl-2.5 pr-5 shadow-soft backdrop-blur">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-mint to-sage text-2xl shadow-inner">
            🌱
          </div>
          <div className="leading-none">
            <h1 className="text-xl font-extrabold tracking-tight text-[#4d6b50]">Bloom</h1>
            <p className="mt-0.5 text-[11px] font-semibold text-[#9b8a78]">grow your tasks, gently</p>
          </div>
        </div>

        {/* top-right stat HUD */}
        {!empty && (
          <div className="woodgrain pointer-events-auto flex items-center gap-2.5 rounded-[22px] border border-white/60 bg-cream/85 px-3 py-2.5 shadow-soft backdrop-blur">
            <Stat icon="🌸" label="bloomed" value={`${totals.done}/${totals.total}`} />
            <div className="h-9 w-px bg-[#e7d8c3]" />
            <Stat icon="🪴" label="gardens" value={`${projects.length}`} />
            <div className="relative ml-1 grid h-11 w-11 place-items-center">
              <svg viewBox="0 0 40 40" className="h-11 w-11 -rotate-90">
                <circle cx="20" cy="20" r="16" fill="none" stroke="#eadfce" strokeWidth="5" />
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  fill="none"
                  stroke="#6cc28a"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeDasharray={`${(donePct / 100) * 100.5} 100.5`}
                />
              </svg>
              <span className="absolute text-[11px] font-extrabold text-[#4d6b50]">{donePct}%</span>
            </div>
          </div>
        )}
      </div>

      {/* empty state */}
      {empty && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-4">
          <motion.div
            className="woodgrain pointer-events-auto max-w-sm rounded-[28px] border border-white/60 bg-cream/90 p-8 text-center shadow-soft backdrop-blur"
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 20 }}
          >
            <motion.div
              className="mb-3 text-6xl"
              animate={{ y: [0, -6, 0], rotate: [-3, 3, -3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              🪴
            </motion.div>
            <h2 className="mb-1 text-2xl font-extrabold text-[#4d6b50]">Your garden is empty</h2>
            <p className="mb-5 text-sm leading-relaxed text-[#9b8a78]">
              Plant your first task and watch a big, daunting project turn into a patch of tiny, doable steps.
            </p>
            <button
              onClick={() => setModalOpen(true)}
              className="rounded-2xl bg-gradient-to-b from-leaf to-sage px-6 py-3.5 font-extrabold text-white shadow-pop transition hover:brightness-105 active:translate-y-0.5"
            >
              🌱 Plant a task
            </button>
          </motion.div>
        </div>
      )}

      {/* gentle toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast}
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0 }}
            className="pointer-events-none absolute bottom-28 left-1/2 z-40 max-w-md -translate-x-1/2 rounded-2xl border border-white/15 bg-[#5a4a3a]/92 px-5 py-3 text-center text-sm font-semibold text-cream shadow-soft backdrop-blur"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── cozy bottom dock ── */}
      {!empty && (
        <div className="absolute bottom-5 left-1/2 z-30 -translate-x-1/2">
          <div className="woodgrain flex items-center gap-1.5 rounded-[26px] border border-white/60 bg-cream/90 p-2 shadow-soft backdrop-blur">
            <button
              onClick={() => setFocusMode(true)}
              title="Focus on one thing"
              className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f3e8d8] text-[#7a9b86] transition hover:bg-[#ecdfca] active:translate-y-0.5"
            >
              <Target size={20} />
            </button>

            <AnimatePresence>
              {thirstyCount > 0 && (
                <motion.button
                  initial={{ width: 0, opacity: 0, scale: 0.8 }}
                  animate={{ width: 'auto', opacity: 1, scale: 1 }}
                  exit={{ width: 0, opacity: 0, scale: 0.8 }}
                  onClick={onWater}
                  title="Refresh stalled tasks"
                  className="flex items-center gap-2 overflow-hidden whitespace-nowrap rounded-2xl bg-sky px-4 py-3 font-extrabold text-[#3f6b8a] transition hover:brightness-105 active:translate-y-0.5"
                >
                  <WateringCan size={18} /> <span>Water</span>
                  <span className="rounded-full bg-white/70 px-1.5 text-xs">{thirstyCount}</span>
                </motion.button>
              )}
            </AnimatePresence>

            <button
              onClick={() => setModalOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-b from-leaf to-sage px-6 py-3 text-base font-extrabold text-white shadow-pop transition hover:brightness-105 active:translate-y-0.5"
            >
              <Plus size={18} /> Plant a task
            </button>

            <SceneControls />

            <button
              onClick={toggleMute}
              title={muted ? 'Unmute sounds' : 'Mute sounds'}
              className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f3e8d8] text-xl transition hover:bg-[#ecdfca] active:translate-y-0.5"
            >
              {muted ? '🔇' : '🔔'}
            </button>
          </div>
          <p
            className="mt-2 text-center text-[11px] font-semibold transition-colors"
            style={{ color: dark ? 'rgba(220,230,210,0.8)' : 'rgba(111,125,99,0.8)' }}
          >
            tap a plant: start → done · drag to rearrange · scroll to zoom
          </p>
        </div>
      )}

      <DetailDrawer />
      <FocusMode />
      <PlantTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onPlanted={(id) => select({ kind: 'project', id })}
      />
    </div>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <span className="text-lg">{icon}</span>
      <div className="leading-none">
        <p className="text-sm font-extrabold text-[#4d6b50]">{value}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wide text-[#bba88f]">{label}</p>
      </div>
    </div>
  );
}

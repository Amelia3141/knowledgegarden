import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGarden } from '../store/useGarden';
import { flatten } from '../lib/growth';

export default function FocusMode() {
  const focusMode = useGarden((s) => s.focusMode);
  const setFocusMode = useGarden((s) => s.setFocusMode);
  const projects = useGarden((s) => s.projects);
  const setStatus = useGarden((s) => s.setStatus);
  const select = useGarden((s) => s.select);
  const [focusId, setFocusId] = useState<string | null>(null);

  // Everything not yet done, gentlest (oldest) first — your candidate "one things".
  const candidates = useMemo(
    () =>
      projects
        .flatMap((p) => flatten(p.subtasks).map((s) => ({ sub: s, project: p })))
        .filter(({ sub }) => sub.status !== 'done')
        .sort((a, b) => a.sub.updatedAt - b.sub.updatedAt),
    [projects],
  );

  // Keep the focused item valid as the list changes.
  useEffect(() => {
    if (!focusMode) return;
    if (!focusId || !candidates.some((c) => c.sub.id === focusId)) {
      setFocusId(candidates[0]?.sub.id ?? null);
    }
  }, [focusMode, focusId, candidates]);

  if (!focusMode) return null;

  const idx = candidates.findIndex((c) => c.sub.id === focusId);
  const current = idx >= 0 ? candidates[idx] : candidates[0];
  const nextId = candidates.length > 1 ? candidates[(Math.max(0, idx) + 1) % candidates.length].sub.id : null;

  const exit = () => {
    setFocusMode(false);
    setFocusId(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[60] flex items-center justify-center p-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{ background: 'rgba(40,50,40,0.55)', backdropFilter: 'blur(7px)' }}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          className="woodgrain w-full max-w-md overflow-hidden rounded-[30px] border border-white/50 bg-cream shadow-soft"
        >
          <div className="flex items-center justify-between bg-gradient-to-r from-sky via-[#cdeefb] to-sky px-6 py-3.5">
            <span className="text-sm font-extrabold tracking-wide text-[#3f6b8a]">🎯 One thing at a time</span>
            <button onClick={exit} className="rounded-full bg-white/60 px-3 py-1 text-sm font-bold text-[#3f6b8a] hover:bg-white/90">
              Done for now
            </button>
          </div>

          {current ? (
            <div className="p-7 text-center">
              <motion.div
                className="mb-3 text-5xl"
                animate={{ y: [0, -6, 0], rotate: [-3, 3, -3] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                {current.sub.status === 'doing' ? '🌿' : '🌱'}
              </motion.div>
              <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#bba88f]">
                {current.project.title} · {current.sub.category}
              </p>
              <h2 className="mb-1 text-2xl font-extrabold leading-tight text-[#4d6b50]">{current.sub.title}</h2>
              {current.sub.note && <p className="mb-2 text-sm text-[#9b8a78]">{current.sub.note}</p>}
              <p className="mb-5 text-sm text-[#9b8a78]">
                Just this one. The rest of the garden can wait. 🌼
              </p>

              <div className="flex flex-col gap-2">
                {current.sub.status === 'todo' ? (
                  <button
                    onClick={() => setStatus(current.sub.id, 'doing')}
                    className="rounded-2xl bg-gradient-to-b from-sky to-[#a9d6ff] py-3.5 text-lg font-extrabold text-[#3f6b8a] shadow-pop transition hover:brightness-105 active:translate-y-0.5"
                  >
                    ▶ Start this
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (nextId) setFocusId(nextId);
                      setStatus(current.sub.id, 'done');
                    }}
                    className="rounded-2xl bg-gradient-to-b from-leaf to-sage py-3.5 text-lg font-extrabold text-white shadow-pop transition hover:brightness-105 active:translate-y-0.5"
                  >
                    ✓ Mark as done
                  </button>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => nextId && setFocusId(nextId)}
                    disabled={!nextId}
                    className="flex-1 rounded-2xl border-2 border-[#ead8c2] py-2.5 font-bold text-[#9b8a78] transition hover:bg-[#f3e8d8] disabled:opacity-40"
                  >
                    ↦ Different one
                  </button>
                  <button
                    onClick={() => {
                      select({ kind: 'subtask', id: current.sub.id });
                      exit();
                    }}
                    className="flex-1 rounded-2xl border-2 border-[#ead8c2] py-2.5 font-bold text-[#9b8a78] transition hover:bg-[#f3e8d8]"
                  >
                    Show in garden
                  </button>
                </div>
              </div>
              <p className="mt-4 text-xs font-semibold text-[#bba88f]">
                {candidates.length} thing{candidates.length === 1 ? '' : 's'} left in the garden
              </p>
            </div>
          ) : (
            <div className="p-10 text-center">
              <div className="mb-3 text-6xl">🌸</div>
              <h2 className="mb-1 text-2xl font-extrabold text-[#4d6b50]">All caught up!</h2>
              <p className="mb-5 text-sm text-[#9b8a78]">Every step is bloomed. Go take a rest. 🍃</p>
              <button onClick={exit} className="rounded-2xl bg-gradient-to-b from-leaf to-sage px-6 py-3 font-extrabold text-white shadow-pop">
                Back to the garden
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

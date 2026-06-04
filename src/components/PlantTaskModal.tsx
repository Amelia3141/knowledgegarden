import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Granularity } from '../lib/types';
import { breakdownTask } from '../lib/api';
import { useGarden } from '../store/useGarden';
import GranularitySlider from './GranularitySlider';

interface Props {
  open: boolean;
  onClose: () => void;
  onPlanted: (projectId: string) => void;
}

export default function PlantTaskModal({ open, onClose, onPlanted }: Props) {
  const addProject = useGarden((s) => s.addProject);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [granularity, setGranularity] = useState<Granularity>(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setTitle('');
    setDescription('');
    setGranularity(3);
    setError(null);
  };

  const submit = async () => {
    if (!title.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const subtasks = await breakdownTask({ title, description, granularity });
      const id = addProject({ title, description, granularity, subtasks });
      reset();
      onClose();
      onPlanted(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#6b5847]/30 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="woodgrain w-full max-w-md overflow-hidden rounded-[28px] border border-white/60 bg-cream shadow-soft"
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* leafy header band */}
            <div className="flex items-center gap-3 bg-gradient-to-r from-mint via-sage/70 to-mint px-6 py-4">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/70 text-xl shadow-inner">🌱</span>
              <h2 className="text-xl font-extrabold text-[#3f6b50]">Plant a task</h2>
            </div>
            <div className="p-6 pt-5">
            <p className="mb-4 text-sm text-[#9b8a78]">
              Drop in anything big or scary. I'll split it into bite-size steps and plant them in your garden.
            </p>

            <label className="mb-1 block text-sm font-bold text-[#6b5847]">What do you want to grow?</label>
            <input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && submit()}
              placeholder="e.g. Make a recipe app"
              className="mb-3 w-full rounded-2xl border-2 border-[#ead8c2] bg-white px-4 py-3 text-[#6b5847] outline-none focus:border-leaf"
            />

            <label className="mb-1 block text-sm font-bold text-[#6b5847]">Any details? (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Context, constraints, what 'done' looks like…"
              rows={2}
              className="mb-4 w-full resize-none rounded-2xl border-2 border-[#ead8c2] bg-white px-4 py-3 text-sm text-[#6b5847] outline-none focus:border-leaf"
            />

            <div className="mb-5">
              <GranularitySlider value={granularity} onChange={setGranularity} />
            </div>

            {error && (
              <div className="mb-3 rounded-2xl bg-blush/50 px-4 py-2 text-sm text-[#9b4a5a]">{error}</div>
            )}

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-2xl border-2 border-[#ead8c2] py-3 font-bold text-[#9b8a78] transition hover:bg-[#f3e8d8]"
              >
                Cancel
              </button>
              <button
                onClick={submit}
                disabled={!title.trim() || loading}
                className="flex-1 rounded-2xl bg-gradient-to-b from-leaf to-sage py-3 font-extrabold text-white shadow-pop transition enabled:hover:brightness-105 enabled:active:translate-y-0.5 disabled:opacity-50"
              >
                {loading ? '🌱 Planting…' : 'Plant it 🌿'}
              </button>
            </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

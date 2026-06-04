import type { Granularity } from '../lib/types';

const LABELS: Record<Granularity, { name: string; hint: string; emoji: string }> = {
  1: { name: 'Gentle', hint: '3–4 big chunks', emoji: '🌱' },
  2: { name: 'Light', hint: '~5 steps', emoji: '🌿' },
  3: { name: 'Balanced', hint: '6–8 steps', emoji: '🌷' },
  4: { name: 'Detailed', hint: '9–12 steps', emoji: '🌻' },
  5: { name: 'Deep', hint: '12+ with sub-steps', emoji: '🌳' },
};

interface Props {
  value: Granularity;
  onChange: (g: Granularity) => void;
}

/** The "choose how much the AI breaks it down" control. */
export default function GranularitySlider({ value, onChange }: Props) {
  const meta = LABELS[value];
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between">
        <label className="text-sm font-bold text-[#6b5847]">How much should I break it down?</label>
        <span className="text-sm font-bold text-leaf">
          {meta.emoji} {meta.name} <span className="font-medium text-[#9b8a78]">· {meta.hint}</span>
        </span>
      </div>
      <input
        type="range"
        min={1}
        max={5}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as Granularity)}
        className="w-full accent-leaf cursor-pointer"
      />
      <div className="flex justify-between px-1 text-[11px] font-semibold text-[#a89684]">
        {([1, 2, 3, 4, 5] as Granularity[]).map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => onChange(g)}
            className={`transition ${g === value ? 'scale-125' : 'opacity-60 hover:opacity-100'}`}
          >
            {LABELS[g].emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

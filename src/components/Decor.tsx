import { useMemo } from 'react';
import { FIELD } from '../lib/layout';

/** Deterministic PRNG so the scattered detail is stable across reloads. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Item =
  | { kind: 'tuft'; x: number; y: number; s: number; c: string }
  | { kind: 'flower'; x: number; y: number; s: number; c: string }
  | { kind: 'pebble'; x: number; y: number; s: number };

const TUFT_GREENS = ['#9ed8af', '#8ccfa0', '#b6e3c2', '#7ec79b'];
const FLOWER_TINTS = ['#ffd7e0', '#fff0b8', '#dcd0ff', '#c9ecff', '#ffe3cf'];

/**
 * Ambient ground detail scattered across the whole field — grass tufts, tiny
 * wildflowers and pebbles. Memoised + static so it never re-renders on interaction.
 */
export default function Decor() {
  const items = useMemo<Item[]>(() => {
    const rnd = mulberry32(20240531);
    const out: Item[] = [];
    const pad = 40;
    for (let i = 0; i < 150; i++) {
      const x = pad + rnd() * (FIELD.w - pad * 2);
      const y = pad + rnd() * (FIELD.h - pad * 2);
      const roll = rnd();
      if (roll < 0.6) out.push({ kind: 'tuft', x, y, s: 0.7 + rnd() * 0.8, c: TUFT_GREENS[(rnd() * TUFT_GREENS.length) | 0] });
      else if (roll < 0.85) out.push({ kind: 'flower', x, y, s: 0.6 + rnd() * 0.7, c: FLOWER_TINTS[(rnd() * FLOWER_TINTS.length) | 0] });
      else out.push({ kind: 'pebble', x, y, s: 0.7 + rnd() * 0.9 });
    }
    return out;
  }, []);

  return (
    <g opacity={0.9}>
      {items.map((it, i) => {
        if (it.kind === 'tuft') {
          const w = 9 * it.s;
          return (
            <g
              key={i}
              className="sway"
              transform={`translate(${it.x} ${it.y})`}
              opacity={0.65}
              style={{ animationDelay: `${(i % 9) * -0.6}s`, animationDuration: `${4.5 + (i % 5) * 0.6}s` }}
            >
              <path d={`M${-w} 0 Q ${-w * 0.5} ${-12 * it.s} ${-w * 0.2} 0`} stroke={it.c} strokeWidth={2.2} fill="none" strokeLinecap="round" />
              <path d={`M0 0 Q 0 ${-15 * it.s} 0 0`} stroke={it.c} strokeWidth={2.2} fill="none" strokeLinecap="round" />
              <path d={`M${w * 0.2} 0 Q ${w * 0.5} ${-12 * it.s} ${w} 0`} stroke={it.c} strokeWidth={2.2} fill="none" strokeLinecap="round" />
            </g>
          );
        }
        if (it.kind === 'flower') {
          const r = 2.6 * it.s;
          return (
            <g key={i} transform={`translate(${it.x} ${it.y})`} opacity={0.8}>
              {[0, 72, 144, 216, 288].map((d) => (
                <circle key={d} cx={Math.cos((d * Math.PI) / 180) * r} cy={Math.sin((d * Math.PI) / 180) * r} r={r} fill={it.c} />
              ))}
              <circle cx={0} cy={0} r={r * 0.8} fill="#fff6d0" />
            </g>
          );
        }
        return <ellipse key={i} cx={it.x} cy={it.y} rx={5 * it.s} ry={3.2 * it.s} fill="#c9bfae" opacity={0.5} />;
      })}
    </g>
  );
}

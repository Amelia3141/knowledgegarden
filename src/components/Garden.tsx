import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGarden } from '../store/useGarden';
import { layoutGarden, FIELD } from '../lib/layout';
import { flatten, isThirsty } from '../lib/growth';
import { TIME_THEMES, SEASON_THEMES } from '../lib/ambience';
import Plant from './Plant';
import ProjectTree from './ProjectTree';
import ProjectLabel, { signWidth } from './ProjectLabel';
import BloomBurst from './BloomBurst';
import Decor from './Decor';

interface View {
  x: number;
  y: number;
  k: number;
}

// Distant rolling hills for the far parallax layer.
const FAR_HILLS = [
  { x: 300, y: 240, rx: 420, ry: 150, c: '#a9d8b6' },
  { x: 1250, y: 320, rx: 480, ry: 170, c: '#9fd2ad' },
  { x: 760, y: 140, rx: 520, ry: 160, c: '#b4ddbf' },
  { x: 520, y: 900, rx: 460, ry: 150, c: '#9ccfab' },
  { x: 1300, y: 950, rx: 440, ry: 150, c: '#a6d6b3' },
];

// Soft sunlight pools shining through unseen leaves — fixed positions, gentle drift.
const DAPPLES = [
  { x: 360, y: 280, r: 280 },
  { x: 1140, y: 420, r: 340 },
  { x: 760, y: 760, r: 300 },
  { x: 1320, y: 880, r: 240 },
];

const BUTTERFLIES = [
  { x: 300, y: 360, c: '#ffb3c6', delay: 0 },
  { x: 980, y: 300, c: '#bfa3ff', delay: 2.5 },
  { x: 1180, y: 720, c: '#ffd56b', delay: 1.2 },
];

function Butterfly({ x, y, c, delay }: { x: number; y: number; c: string; delay: number }) {
  return (
    <motion.g
      initial={{ x, y }}
      animate={{ x: [x, x + 70, x - 40, x + 20, x], y: [y, y - 50, y - 20, y - 70, y] }}
      transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut', delay }}
      pointerEvents="none"
    >
      <motion.g animate={{ scaleX: [1, 0.5, 1] }} transition={{ duration: 0.32, repeat: Infinity, ease: 'easeInOut' }}>
        <ellipse cx={-4} cy={0} rx={4.5} ry={6} fill={c} opacity={0.9} />
        <ellipse cx={4} cy={0} rx={4.5} ry={6} fill={c} opacity={0.9} />
        <ellipse cx={0} cy={0} rx={1.4} ry={6} fill="#6b5847" />
      </motion.g>
    </motion.g>
  );
}

export default function Garden() {
  const projects = useGarden((s) => s.projects);
  const selection = useGarden((s) => s.selection);
  const select = useGarden((s) => s.select);
  const cycle = useGarden((s) => s.cycleStatus);
  const justBloomed = useGarden((s) => s.justBloomed);
  const clearBloom = useGarden((s) => s.clearBloom);
  const justWatered = useGarden((s) => s.justWatered);
  const clearWatered = useGarden((s) => s.clearWatered);
  const setPosition = useGarden((s) => s.setPosition);
  const timeOfDay = useGarden((s) => s.timeOfDay);
  const season = useGarden((s) => s.season);
  const theme = TIME_THEMES[timeOfDay];
  const seasonTheme = SEASON_THEMES[season];

  const { positions, zones } = useMemo(() => layoutGarden(projects), [projects]);

  // Start centred on the middle of the field so the garden isn't off in a corner.
  const [view, setView] = useState<View>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1440;
    const h = typeof window !== 'undefined' ? window.innerHeight : 900;
    return { x: w / 2 - FIELD.w / 2, y: h / 2 - FIELD.h / 2, k: 1 };
  });
  const drag = useRef<{ x: number; y: number; vx: number; vy: number } | null>(null);
  const moved = useRef(false);

  const onWheel = (e: React.WheelEvent) => {
    // Zoom proportional to actual scroll amount (smooth on trackpads), toward the cursor.
    const rect = e.currentTarget.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;
    const dy = e.deltaY;
    setView((v) => {
      const factor = Math.exp(-dy * 0.0012);
      const k = Math.min(2.4, Math.max(0.45, v.k * factor));
      const ratio = k / v.k;
      return { k, x: cx - (cx - v.x) * ratio, y: cy - (cy - v.y) * ratio };
    });
  };
  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
    moved.current = false;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) moved.current = true;
    const nx = d.vx + dx;
    const ny = d.vy + dy;
    setView((v) => ({ ...v, x: nx, y: ny }));
  };
  const onPointerUp = () => {
    drag.current = null;
  };

  const allSubtasks = useMemo(() => projects.flatMap((p) => flatten(p.subtasks)), [projects]);

  // Project sign positions, nudged apart vertically so titles never overlap or hide.
  const labels = useMemo(() => {
    const arr = projects
      .map((pr) => {
        const pos = positions.get(pr.id);
        return pos ? { id: pr.id, project: pr, tx: pos.x, ty: pos.y, x: pos.x, y: pos.y + 42, w: signWidth(pr.title) } : null;
      })
      .filter((l): l is NonNullable<typeof l> => !!l);
    arr.sort((a, b) => a.y - b.y);
    const GAP = 50;
    const PAD_X = 14;
    for (let i = 0; i < arr.length; i++) {
      for (let j = 0; j < i; j++) {
        const a = arr[i];
        const b = arr[j];
        const horizontallyClose = Math.abs(a.x - b.x) < (a.w + b.w) / 2 + PAD_X;
        if (horizontallyClose && a.y < b.y + GAP) a.y = b.y + GAP;
      }
    }
    return arr;
  }, [projects, positions]);

  return (
    <svg
      className="h-full w-full touch-none select-none"
      style={{ background: theme.bg, transition: 'background 1.2s ease' }}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      onClick={() => {
        if (!moved.current) select(null);
      }}
    >
      <defs>
        <radialGradient id="dapple" cx="50%" cy="50%">
          <stop offset="0%" stopColor={theme.dapple} stopOpacity={theme.dappleOpacity} />
          <stop offset="100%" stopColor={theme.dapple} stopOpacity={0} />
        </radialGradient>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
      </defs>

      {/* far parallax layer: soft rolling hills that drift slowly behind everything */}
      <g transform={`translate(${view.x * 0.35} ${view.y * 0.35}) scale(${view.k})`}>
        {FAR_HILLS.map((h, i) => (
          <ellipse key={i} cx={h.x} cy={h.y} rx={h.rx} ry={h.ry} fill={h.c} opacity={0.4} filter="url(#soft)" />
        ))}
      </g>

      {/* mid parallax layer: warm light pooling on the grass */}
      <g transform={`translate(${view.x * 0.6} ${view.y * 0.6}) scale(${view.k})`}>
        {DAPPLES.map((d, i) => (
          <motion.circle
            key={i}
            cx={d.x}
            cy={d.y}
            r={d.r}
            fill="url(#dapple)"
            animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.05, 1] }}
            transition={{ duration: 9 + i * 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        ))}
      </g>

      {/* foreground world: beds, plants, trees — moves 1:1 with the pan */}
      <g transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>
        {/* one tended garden-bed patch per project */}
        {zones.map((z) => {
          const rx = z.radius * 0.92;
          const ry = z.radius * 0.66;
          return (
            <g key={z.id}>
              {/* darker grass rim for a raised-bed feel */}
              <ellipse cx={z.center.x} cy={z.center.y + 12} rx={rx * 1.08} ry={ry * 1.08} fill="#7cc593" opacity={0.22} filter="url(#soft)" />
              {/* soil */}
              <ellipse cx={z.center.x} cy={z.center.y} rx={rx} ry={ry} fill="#cdb18c" opacity={0.32} />
              {/* gentle project tint */}
              <ellipse cx={z.center.x} cy={z.center.y} rx={rx} ry={ry} fill={z.tint} opacity={0.22} />
              <ellipse cx={z.center.x} cy={z.center.y} rx={rx} ry={ry} fill="none" stroke="#fff7ec" strokeWidth={2.5} opacity={0.35} />
            </g>
          );
        })}

        {/* ambient ground detail */}
        <Decor />

        {/* seasonal ground wash (autumn warmth / winter snow) under the plants */}
        {seasonTheme.ground !== 'transparent' && (
          <rect x={-600} y={-600} width={FIELD.w + 1200} height={FIELD.h + 1200} fill={seasonTheme.ground} />
        )}

        {/* every subtask plant (behind the project tree) */}
        {allSubtasks.map((s) => {
          const pos = positions.get(s.id);
          if (!pos) return null;
          return (
            <Plant
              key={s.id}
              subtask={s}
              x={pos.x}
              y={pos.y}
              selected={selection?.kind === 'subtask' && selection.id === s.id}
              thirsty={isThirsty(s)}
              viewK={view.k}
              light={theme.light}
              onClick={() => {
                select({ kind: 'subtask', id: s.id });
                cycle(s.id);
              }}
              onDrag={(id, p) => setPosition(id, p)}
            />
          );
        })}

        {/* project trees in front of their sprouts so the tree always reads as the centrepiece */}
        {projects.map((p) => {
          const pos = positions.get(p.id);
          if (!pos) return null;
          return (
            <ProjectTree
              key={p.id}
              project={p}
              x={pos.x}
              y={pos.y}
              selected={selection?.kind === 'project' && selection.id === p.id}
              light={theme.light}
              season={seasonTheme}
              onClick={() => select({ kind: 'project', id: p.id })}
            />
          );
        })}

        {/* fluttering ambiance */}
        {BUTTERFLIES.map((b, i) => (
          <Butterfly key={i} {...b} />
        ))}

        {/* celebratory bursts */}
        {justBloomed.map((id) => {
          const pos = positions.get(id);
          if (!pos) return null;
          return <BloomBurst key={id} x={pos.x} y={pos.y} onDone={() => clearBloom(id)} />;
        })}
        {justWatered.map((id) => {
          const pos = positions.get(id);
          if (!pos) return null;
          return <BloomBurst key={`w-${id}`} x={pos.x} y={pos.y} variant="water" onDone={() => clearWatered(id)} />;
        })}

        {/* project signs on the very top so titles always stay readable */}
        {labels.map((l) => (
          <ProjectLabel
            key={l.id}
            project={l.project}
            x={l.x}
            y={l.y}
            selected={selection?.kind === 'project' && selection.id === l.id}
            onClick={() => select({ kind: 'project', id: l.id })}
          />
        ))}
      </g>
    </svg>
  );
}

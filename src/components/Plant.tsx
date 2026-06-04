import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { PlantType, Point, Stage, Status, Subtask } from '../lib/types';
import type { Light } from '../lib/ambience';
import { stageOf, STAGE_SCALE, colorForCategory } from '../lib/growth';

interface PlantProps {
  subtask: Subtask;
  x: number;
  y: number;
  selected: boolean;
  thirsty: boolean;
  /** Current zoom factor — needed to convert screen drag deltas into field units. */
  viewK: number;
  light: Light;
  onClick: () => void;
  onDrag: (id: string, pos: Point) => void;
}

/** Bloom flower colour by status — todo is muted, done is vivid + pastel. */
function topColor(category: string, status: Status): string {
  if (status === 'todo') return '#bcd6c4'; // muted sage for "not started"
  return colorForCategory(category);
}

function PlantArt({ type, stage, category, status }: { type: PlantType; stage: Stage; category: string; status: Status }) {
  const grown = stage === 'budding' || stage === 'bloom';
  const bloom = stage === 'bloom';
  const fill = topColor(category, status);
  const stem = '#6cc28a';

  // Tiny seed/sprout look for early stages — a nub + two leaves.
  if (stage === 'seed' || stage === 'sprout') {
    return (
      <g>
        <path d="M0 0 Q -1 -16 0 -22" stroke={stem} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        <ellipse cx={-7} cy={-16} rx={7} ry={4} fill={stem} transform="rotate(-28 -7 -16)" />
        <ellipse cx={7} cy={-20} rx={7} ry={4} fill="#84d0a0" transform="rotate(28 7 -20)" />
      </g>
    );
  }

  switch (type) {
    case 'mushroom':
      return (
        <g>
          <rect x={-5} y={-26} width={10} height={26} rx={5} fill="#fff3e0" />
          <path d={`M${-22 * (grown ? 1 : 0.7)} -26 Q 0 ${grown ? -58 : -44} ${22 * (grown ? 1 : 0.7)} -26 Z`} fill={fill} />
          {bloom && (
            <>
              <circle cx={-9} cy={-36} r={3.4} fill="#fff" opacity={0.85} />
              <circle cx={7} cy={-42} r={3} fill="#fff" opacity={0.85} />
              <circle cx={2} cy={-31} r={2.6} fill="#fff" opacity={0.85} />
            </>
          )}
        </g>
      );
    case 'succulent':
      return (
        <g>
          {[0, 60, 120, 180, 240, 300].map((deg, i) => (
            <ellipse
              key={i}
              cx={0}
              cy={-18}
              rx={6}
              ry={grown ? 17 : 12}
              fill={i % 2 ? '#9fd8b4' : '#7ec79b'}
              transform={`rotate(${deg} 0 -10)`}
            />
          ))}
          {bloom && <circle cx={0} cy={-22} r={6} fill={fill} />}
        </g>
      );
    case 'sapling':
      return (
        <g>
          <rect x={-4} y={-30} width={8} height={30} rx={4} fill="#a87c5a" />
          <circle cx={0} cy={-40} r={grown ? 22 : 15} fill={status === 'todo' ? '#bcd6c4' : '#7ec79b'} />
          <circle cx={-12} cy={-32} r={grown ? 13 : 9} fill="#9fd8b4" />
          <circle cx={12} cy={-34} r={grown ? 13 : 9} fill="#8ad0a3" />
          {bloom &&
            [[-10, -46], [9, -50], [0, -34], [-16, -38], [14, -42]].map(([cx, cy], i) => (
              <circle key={i} cx={cx} cy={cy} r={3.6} fill={fill} />
            ))}
        </g>
      );
    case 'flower':
    default:
      return (
        <g>
          <path d="M0 0 C -3 -22 3 -34 0 -46" stroke={stem} strokeWidth={4} fill="none" strokeLinecap="round" />
          <ellipse cx={-9} cy={-20} rx={9} ry={5} fill={stem} transform="rotate(-30 -9 -20)" />
          {grown ? (
            <g>
              {[0, 72, 144, 216, 288].map((deg, i) => (
                <ellipse key={i} cx={0} cy={-58} rx={7} ry={13} fill={fill} transform={`rotate(${deg} 0 -46)`} />
              ))}
              <circle cx={0} cy={-46} r={7} fill={bloom ? '#ffe9a8' : '#fff3d0'} />
            </g>
          ) : (
            <circle cx={0} cy={-48} r={8} fill={fill} />
          )}
        </g>
      );
  }
}

export default function Plant({ subtask, x, y, selected, thirsty, viewK, light, onClick, onDrag }: PlantProps) {
  const stage = stageOf(subtask.status);
  const scale = STAGE_SCALE[stage];
  const needsAttention = subtask.status === 'todo';

  // Drag-to-recluster: track the pointer and tell a tap apart from a drag.
  // The latest position lives in a ref so the commit on pointerup never races React state.
  const start = useRef<{ cx: number; cy: number; ox: number; oy: number } | null>(null);
  const draggedRef = useRef(false);
  const lastPos = useRef<Point | null>(null);
  const [drag, setDrag] = useState<Point | null>(null);
  const [hovered, setHovered] = useState(false);
  const px = drag?.x ?? x;
  const py = drag?.y ?? y;

  const onPointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    start.current = { cx: e.clientX, cy: e.clientY, ox: x, oy: y };
    draggedRef.current = false;
    lastPos.current = null;
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!start.current) return;
    const dx = (e.clientX - start.current.cx) / viewK;
    const dy = (e.clientY - start.current.cy) / viewK;
    if (Math.abs(dx) + Math.abs(dy) > 4 / viewK) draggedRef.current = true;
    const pos = { x: start.current.ox + dx, y: start.current.oy + dy };
    lastPos.current = pos;
    setDrag(pos);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    e.stopPropagation();
    if (draggedRef.current && lastPos.current) onDrag(subtask.id, lastPos.current);
    else onClick();
    start.current = null;
    lastPos.current = null;
    setDrag(null);
  };

  const droop = thirsty ? 7 : 0;
  const baseOpacity = thirsty ? 0.62 : 1;

  // Hover tooltip: the step title + what the next tap does.
  const HINT = {
    todo: { e: '🌱', t: 'tap to start' },
    doing: { e: '🌿', t: 'tap to mark done' },
    done: { e: '🌸', t: 'tap to reopen' },
  }[subtask.status];
  const label = subtask.title.length > 30 ? subtask.title.slice(0, 29) + '…' : subtask.title;
  const tipW = Math.max(78, label.length * 6.7 + 22);

  return (
    <g
      style={{ cursor: drag ? 'grabbing' : 'pointer' }}
      transform={`translate(${px} ${py})`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onClick={(e) => e.stopPropagation()}
    >
      {/* cast shadow — direction & length follow the time of day */}
      <ellipse cx={light.dx * scale * 0.6} cy={3} rx={16 * scale * light.len} ry={5 * scale} fill={light.shadow} />
      <g opacity={0.85}>
        <path d={`M${-10 * scale} 2 Q ${-7 * scale} ${-6 * scale} ${-5 * scale} 2`} stroke="#7ec79b" strokeWidth={2} fill="none" strokeLinecap="round" />
        <path d={`M${10 * scale} 2 Q ${7 * scale} ${-6 * scale} ${5 * scale} 2`} stroke="#8ad0a3" strokeWidth={2} fill="none" strokeLinecap="round" />
      </g>
      {selected && (
        <circle cx={0} cy={-26} r={46} fill="none" stroke="#ffb3c6" strokeWidth={3} strokeDasharray="6 7" opacity={0.9} />
      )}
      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={
          drag
            ? { opacity: baseOpacity, scale: scale * 1.12, rotate: 0 }
            : needsAttention
            ? { opacity: baseOpacity, scale, rotate: thirsty ? [droop - 1.5, droop + 1.5, droop - 1.5] : [-2.5, 2.5, -2.5] }
            : { opacity: baseOpacity, scale, rotate: [-1, 1, -1] }
        }
        transition={{
          opacity: { duration: 0.3 },
          scale: { type: 'spring', stiffness: 200, damping: 16 },
          rotate: { repeat: Infinity, duration: thirsty ? 5 : needsAttention ? 2.2 : 4.5, ease: 'easeInOut' },
        }}
      >
        <PlantArt type={subtask.plantType} stage={stage} category={subtask.category} status={subtask.status} />
      </motion.g>
      {thirsty && !drag && (
        <text x={14} y={-44} fontSize={16} pointerEvents="none">
          💧
        </text>
      )}

      {/* hover tooltip — counter-scaled so it stays a readable size at any zoom */}
      {hovered && !drag && (
        <g transform={`scale(${1 / viewK})`} pointerEvents="none">
          <g transform="translate(0 -86)">
            <rect x={-tipW / 2} y={-32} width={tipW} height={42} rx={11} fill="#5a4a3a" opacity={0.95} />
            <path d="M -7 8 L 0 16 L 7 8 Z" fill="#5a4a3a" opacity={0.95} />
            <text x={0} y={-14} textAnchor="middle" fontSize={12.5} fontWeight={800} fill="#fff7ec" style={{ fontFamily: 'Baloo 2, sans-serif' }}>
              {label}
            </text>
            <text x={0} y={2} textAnchor="middle" fontSize={9.5} fontWeight={700} fill="#bfe3ff" style={{ fontFamily: 'Baloo 2, sans-serif' }}>
              {HINT.e} {HINT.t}
            </text>
          </g>
        </g>
      )}
    </g>
  );
}

import { motion } from 'framer-motion';
import type { Project } from '../lib/types';
import type { Light, SeasonTheme } from '../lib/ambience';
import { progress, stageOfProgress, STAGE_SCALE } from '../lib/growth';

interface Props {
  project: Project;
  x: number;
  y: number;
  selected: boolean;
  light: Light;
  season: SeasonTheme;
  onClick: () => void;
}

// Canopy lobe positions reused for foliage + decoration scatter.
const LOBES = [
  { cx: 0, cy: -60, r: 32 },
  { cx: -24, cy: -50, r: 22 },
  { cx: 24, cy: -52, r: 22 },
  { cx: 0, cy: -82, r: 19 },
];
const ACCENTS = [[-18, -64], [16, -68], [0, -84], [-8, -50], [22, -56], [-24, -48]];

/** The big central plant for a whole project — grows continuously with progress. */
export default function ProjectTree({ project, x, y, selected, light, season, onClick }: Props) {
  const p = progress(project);
  const stage = stageOfProgress(p);
  const scale = STAGE_SCALE[stage] * 1.7;
  const [c0, c1, c2, c3] = season.canopy;

  return (
    <g
      transform={`translate(${x} ${y})`}
      style={{ cursor: 'pointer' }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <ellipse cx={light.dx * 0.8} cy={6} rx={30 * scale * light.len} ry={9 * scale} fill={light.shadow} />
      {selected && (
        <circle cx={0} cy={-44} r={78} fill="none" stroke="#ffb3c6" strokeWidth={4} strokeDasharray="9 9" opacity={0.9} />
      )}

      <motion.g
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale, rotate: [-1, 1, -1] }}
        transition={{
          opacity: { duration: 0.3 },
          scale: { type: 'spring', stiffness: 180, damping: 16 },
          rotate: { repeat: Infinity, duration: 6, ease: 'easeInOut' },
        }}
      >
        {/* trunk with a soft shaded side */}
        <rect x={-8} y={-46} width={16} height={52} rx={8} fill={season.trunk} />
        <rect x={1} y={-46} width={7} height={52} rx={3.5} fill={season.trunk} opacity={0.5} />

        {/* layered, seasonal canopy */}
        <circle cx={LOBES[0].cx} cy={LOBES[0].cy} r={LOBES[0].r} fill={c0} />
        <circle cx={LOBES[1].cx} cy={LOBES[1].cy} r={LOBES[1].r} fill={c1} />
        <circle cx={LOBES[2].cx} cy={LOBES[2].cy} r={LOBES[2].r} fill={c2} />
        <circle cx={LOBES[3].cx} cy={LOBES[3].cy} r={LOBES[3].r} fill={c3} />
        <circle cx={-10} cy={-72} r={13} fill={season.highlight} opacity={0.7} />

        {/* seasonal canopy decorations */}
        {season.accent &&
          ACCENTS.map(([cx, cy], i) =>
            season.accent!.kind === 'blossom' ? (
              <g key={i}>
                {[0, 72, 144, 216, 288].map((deg, j) => (
                  <ellipse key={j} cx={cx} cy={cy} rx={2.6} ry={4.6} fill={season.accent!.color} transform={`rotate(${deg} ${cx} ${cy})`} />
                ))}
                <circle cx={cx} cy={cy} r={2} fill="#fff3c4" />
              </g>
            ) : (
              <circle key={i} cx={cx} cy={cy} r={3.2} fill={season.accent!.color} />
            ),
          )}

        {/* winter snow caps sitting on the foliage */}
        {season.snowy &&
          LOBES.map((l, i) => (
            <path
              key={i}
              d={`M${l.cx - l.r * 0.8} ${l.cy - l.r * 0.45} A ${l.r} ${l.r} 0 0 1 ${l.cx + l.r * 0.8} ${l.cy - l.r * 0.45} Q ${l.cx} ${l.cy - l.r * 0.2} ${l.cx - l.r * 0.8} ${l.cy - l.r * 0.45} Z`}
              fill="#fbffff"
              opacity={0.92}
            />
          ))}
      </motion.g>
    </g>
  );
}

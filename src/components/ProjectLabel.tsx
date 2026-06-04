import type { Project } from '../lib/types';
import { progress } from '../lib/growth';

/** Width of a project's sign plaque (also used by the de-overlap layout). */
export function signWidth(title: string): number {
  return Math.max(98, Math.min(200, title.length * 8.4 + 36));
}

interface Props {
  project: Project;
  x: number;
  y: number;
  selected: boolean;
  onClick: () => void;
}

/** Wooden signpost with the project title + progress meter. Rendered on a top layer
 *  (above the plants) and laid out to avoid overlaps, so titles stay readable. */
export default function ProjectLabel({ project, x, y, selected, onClick }: Props) {
  const p = progress(project);
  const pct = Math.round(p * 100);
  const complete = p >= 1;
  const w = signWidth(project.title);
  const title = project.title.length > 24 ? project.title.slice(0, 23) + '…' : project.title;

  return (
    <g
      transform={`translate(${x} ${y})`}
      style={{ cursor: 'pointer' }}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
    >
      <g transform={`translate(${-w / 2} 0)`}>
        {selected && (
          <rect x={-4} y={-4} width={w + 8} height={48} rx={14} fill="none" stroke="#ffb3c6" strokeWidth={3} strokeDasharray="7 6" />
        )}
        {/* drop shadow for readability over the busy garden */}
        <rect x={0} y={3} width={w} height={40} rx={12} fill="rgba(80,60,40,0.22)" />
        <rect x={0} y={0} width={w} height={40} rx={12} fill="#caa074" />
        <rect x={3} y={3} width={w - 6} height={34} rx={9} fill="#fff7ec" />
        <text x={w / 2} y={16} textAnchor="middle" fontSize={12.5} fontWeight={800} fill="#6b5847" style={{ fontFamily: 'Baloo 2, sans-serif' }}>
          {title}
        </text>
        <rect x={10} y={24} width={w - 20} height={8} rx={4} fill="#eadfce" />
        <rect x={10} y={24} width={Math.max(8, (w - 20) * p)} height={8} rx={4} fill={complete ? '#ffb3c6' : '#6cc28a'} />
        <text x={w - 12} y={31} textAnchor="end" fontSize={7.5} fontWeight={800} fill={complete ? '#c97a92' : '#5a9e75'} style={{ fontFamily: 'Baloo 2, sans-serif' }}>
          {complete ? '🌸' : `${pct}%`}
        </text>
      </g>
    </g>
  );
}

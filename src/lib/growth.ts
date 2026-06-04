import type { Project, Stage, Status, Subtask, PlantType } from './types';

/** Flatten a subtask tree into a single list (parents + all descendants). */
export function flatten(subtasks: Subtask[]): Subtask[] {
  const out: Subtask[] = [];
  const walk = (s: Subtask) => {
    out.push(s);
    s.children?.forEach(walk);
  };
  subtasks.forEach(walk);
  return out;
}

/** Fraction of a project's subtasks that are done (0..1). Counts leaves + parents. */
export function progress(project: Project): number {
  const all = flatten(project.subtasks);
  if (all.length === 0) return 0;
  const done = all.filter((s) => s.status === 'done').length;
  return done / all.length;
}

/** A single subtask's plant stage. Glanceable: todo stays tiny, done blooms. */
export function stageOf(status: Status): Stage {
  switch (status) {
    case 'todo':
      return 'sprout';
    case 'doing':
      return 'budding';
    case 'done':
      return 'bloom';
  }
}

/** The project's central tree stage, scaled by overall progress. */
export function stageOfProgress(p: number): Stage {
  if (p <= 0) return 'seed';
  if (p < 0.34) return 'sprout';
  if (p < 0.67) return 'seedling';
  if (p < 1) return 'budding';
  return 'bloom';
}

/** Pixel scale for a plant at a given stage (used by Framer Motion tweens). */
export const STAGE_SCALE: Record<Stage, number> = {
  seed: 0.5,
  sprout: 0.72,
  seedling: 0.9,
  budding: 1.05,
  bloom: 1.22,
};

/** Cycle a status forward when a plant is clicked: todo → doing → done → todo. */
export function nextStatus(s: Status): Status {
  return s === 'todo' ? 'doing' : s === 'doing' ? 'done' : 'todo';
}

/** A todo left untouched this long starts looking parched and needs watering. */
export const THIRST_MS = 1000 * 60 * 60 * 18; // 18 hours

/** Is this step stalled — an unstarted task gathering dust? */
export function isThirsty(s: Subtask): boolean {
  return s.status === 'todo' && Date.now() - s.updatedAt > THIRST_MS;
}

/** The gentlest next step to suggest: the oldest stalled (or any) todo. Reduces overwhelm. */
export function suggestNext(subtasks: Subtask[]): Subtask | undefined {
  const todos = flatten(subtasks).filter((s) => s.status === 'todo');
  if (todos.length === 0) return undefined;
  return todos.slice().sort((a, b) => a.updatedAt - b.updatedAt)[0];
}

/** Deterministically assign a plant species to a category so a zone looks coherent. */
const SPECIES: PlantType[] = ['flower', 'mushroom', 'sapling', 'succulent', 'sprout'];
export function plantTypeForCategory(category: string): PlantType {
  let h = 0;
  for (let i = 0; i < category.length; i++) h = (h * 31 + category.charCodeAt(i)) >>> 0;
  return SPECIES[h % SPECIES.length];
}

/** Stable pastel hue per category, used for zone tints + project ribbons. */
export function colorForCategory(category: string): string {
  let h = 0;
  for (let i = 0; i < category.length; i++) h = (h * 37 + category.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `hsl(${hue} 70% 84%)`;
}

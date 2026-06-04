export type Status = 'todo' | 'doing' | 'done';

/** Visual growth stage of a plant — derived from status / progress, never stored. */
export type Stage = 'seed' | 'sprout' | 'seedling' | 'budding' | 'bloom';

export type PlantType = 'flower' | 'mushroom' | 'sapling' | 'succulent' | 'sprout';

export interface Subtask {
  id: string;
  projectId: string;
  title: string;
  note?: string;
  /** Short tag like "design" / "backend" — drives garden clustering + plant species. */
  category: string;
  status: Status;
  plantType: PlantType;
  /** Last time this step was created/touched — drives the "thirsty/stalled" nudge. */
  updatedAt: number;
  /** Manual position override (field coords) once the user drags the plant. */
  position?: Point;
  /** Optional nested steps, only produced at high granularity. */
  children?: Subtask[];
}

export interface Project {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  /** How finely the AI split it (1 Gentle … 5 Deep). */
  granularity: Granularity;
  subtasks: Subtask[];
}

export type Granularity = 1 | 2 | 3 | 4 | 5;

/** Raw shape returned by the AI breakdown tool (before we attach ids/plant types). */
export interface RawSubtask {
  title: string;
  category: string;
  children?: RawSubtask[];
}

export interface Point {
  x: number;
  y: number;
}

export type TimeOfDay = 'day' | 'golden' | 'dusk' | 'night';
export type Weather = 'clear' | 'rain' | 'snow' | 'petals';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

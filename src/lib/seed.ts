import type { Project, Status, Subtask } from './types';
import { plantTypeForCategory } from './growth';

const STALE_MS = 1000 * 60 * 60 * 30; // 30h ago → renders "thirsty" (needs watering)

interface SeedStep {
  title: string;
  category: string;
  status: Status;
  /** Leave a todo untouched so it shows up as thirsty in the demo. */
  thirsty?: boolean;
}

interface SeedProject {
  title: string;
  granularity: 1 | 2 | 3 | 4 | 5;
  steps: SeedStep[];
}

// A lived-in garden: a mix of bloomed, growing and stalled steps so new visitors
// immediately see what a full garden looks like — and that some plants want watering.
const SEED: SeedProject[] = [
  {
    title: 'Make a recipe app',
    granularity: 4,
    steps: [
      { title: 'List the features you actually want', category: 'research', status: 'done' },
      { title: 'Look at 2-3 recipe apps you like', category: 'research', status: 'done' },
      { title: 'Sketch the home and recipe screens', category: 'design', status: 'done' },
      { title: 'Pick colours and fonts', category: 'design', status: 'doing' },
      { title: 'Build the recipe list screen', category: 'build', status: 'doing' },
      { title: 'Add the "save a recipe" form', category: 'build', status: 'todo', thirsty: true },
      { title: 'Store recipes so they stay saved', category: 'backend', status: 'todo', thirsty: true },
      { title: 'Add a search bar', category: 'backend', status: 'todo', thirsty: true },
      { title: 'Test on your phone and tidy up', category: 'testing', status: 'todo' },
      { title: 'Make an icon and share it', category: 'launch', status: 'todo' },
    ],
  },
  {
    title: 'Plan birthday party',
    granularity: 3,
    steps: [
      { title: 'Pick a date that works', category: 'planning', status: 'done' },
      { title: 'Make a guest list', category: 'planning', status: 'done' },
      { title: 'Book or tidy the space', category: 'planning', status: 'doing' },
      { title: 'Plan the food and cake', category: 'food', status: 'doing' },
      { title: 'Send the invites', category: 'people', status: 'todo', thirsty: true },
      { title: 'Buy decorations', category: 'design', status: 'todo', thirsty: true },
      { title: 'Make a playlist', category: 'design', status: 'todo' },
    ],
  },
  {
    title: 'Write the essay',
    granularity: 3,
    steps: [
      { title: 'Re-read the question and underline keywords', category: 'research', status: 'done' },
      { title: 'Brain-dump every idea, messy is fine', category: 'research', status: 'doing' },
      { title: 'Pick your 3 main points', category: 'outline', status: 'todo', thirsty: true },
      { title: 'Write a rough intro', category: 'writing', status: 'todo', thirsty: true },
      { title: 'Draft the body paragraphs', category: 'writing', status: 'todo' },
      { title: 'Read it aloud and fix the clunky bits', category: 'editing', status: 'todo' },
    ],
  },
  {
    title: 'Do the laundry',
    granularity: 1,
    steps: [
      { title: 'Gather everything into one pile', category: 'chore', status: 'doing' },
      { title: 'Put a load on', category: 'chore', status: 'todo', thirsty: true },
      { title: 'Hang it up to dry', category: 'chore', status: 'todo', thirsty: true },
      { title: 'Fold and put away', category: 'chore', status: 'todo', thirsty: true },
    ],
  },
  {
    title: 'Clean my room',
    granularity: 2,
    steps: [
      { title: 'Clear the floor', category: 'tidying', status: 'done' },
      { title: 'Deal with the laundry chair', category: 'tidying', status: 'doing' },
      { title: 'Clear the desk', category: 'tidying', status: 'todo', thirsty: true },
      { title: 'Take out cups and rubbish', category: 'cleaning', status: 'todo', thirsty: true },
      { title: 'Quick hoover', category: 'cleaning', status: 'todo' },
    ],
  },
];

/** Build the starter projects (called once, for brand-new visitors only). */
export function seedProjects(): Project[] {
  const now = Date.now();
  let n = 0;
  const uid = () => `seed-${n++}`;

  return SEED.map((sp, pi) => {
    const projectId = `seed-p${pi}`;
    const subtasks: Subtask[] = sp.steps.map((st) => ({
      id: uid(),
      projectId,
      title: st.title,
      category: st.category,
      status: st.status,
      plantType: plantTypeForCategory(st.category),
      updatedAt: st.thirsty ? now - STALE_MS : now,
    }));
    return {
      id: projectId,
      title: sp.title,
      createdAt: now,
      granularity: sp.granularity,
      subtasks,
    };
  });
}

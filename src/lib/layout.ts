import type { Point, Project } from './types';
import { flatten } from './growth';

/** Field size in SVG units. The garden is laid out within this box and then pan/zoomed. */
export const FIELD = { w: 1600, h: 1100 };

const GOLDEN_ANGLE = 2.399963229728653; // ~137.5°, gives even, organic spacing

/** Deterministic 0..1 hash from a string seed → stable jitter across reloads. */
function rand(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h << 13;
  h ^= h >>> 17;
  h ^= h << 5;
  return ((h >>> 0) % 100000) / 100000;
}

/** A soft, stable pastel tint per project for its garden-bed patch. */
function tintForProject(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 37 + id.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360} 68% 82%)`;
}

export interface GardenLayout {
  /** subtask id (and project id for trees) → position */
  positions: Map<string, Point>;
  /** one garden bed per project */
  zones: { id: string; center: Point; radius: number; tint: string }[];
}

/**
 * Each project is its own garden patch: projects are spread across the field on a
 * golden-angle spiral so they never bunch up, the project's tree sits at the centre
 * of its patch, and its subtasks ring around it — grouped by category (same-category
 * steps land next to each other) so similar work still clusters within the project.
 * Positions are deterministic, so the garden is stable across reloads.
 */
export function layoutGarden(projects: Project[]): GardenLayout {
  const positions = new Map<string, Point>();
  const zones: GardenLayout['zones'] = [];
  const center: Point = { x: FIELD.w / 2, y: FIELD.h / 2 };
  const projectStep = 330;

  projects.forEach((project, pi) => {
    // 1. Patch home on a spiral out from the centre (first project sits in the middle).
    const angle = pi * GOLDEN_ANGLE;
    const radius = projectStep * Math.sqrt(pi);
    const home: Point = {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius * 0.78,
    };
    positions.set(project.id, home);

    // 2. Subtasks grouped by category (so same-category steps stay adjacent on the ring).
    const subs = flatten(project.subtasks).slice().sort((a, b) => a.category.localeCompare(b.category));
    const n = Math.max(1, subs.length);
    const patchR = 64 + Math.sqrt(n) * 30;

    subs.forEach((s, j) => {
      const a = j * GOLDEN_ANGLE + rand(s.id) * 0.7;
      // Ring around the tree: inner radius keeps plants off the trunk.
      const r = patchR * (0.36 + 0.64 * Math.sqrt((j + 0.4) / n));
      positions.set(s.id, {
        x: home.x + Math.cos(a) * r + (rand(s.id + 'x') - 0.5) * 22,
        y: home.y + Math.sin(a) * r * 0.82 + (rand(s.id + 'y') - 0.5) * 22,
      });
    });

    zones.push({ id: project.id, center: home, radius: patchR * 1.18, tint: tintForProject(project.id) });
  });

  // 3. Manual drag positions always win over the computed scatter.
  for (const project of projects) {
    for (const s of flatten(project.subtasks)) {
      if (s.position) positions.set(s.id, s.position);
    }
  }

  return { positions, zones };
}

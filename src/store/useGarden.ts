import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Granularity, Point, Project, RawSubtask, Season, Status, Subtask, TimeOfDay, Weather } from '../lib/types';
import { flatten, isThirsty, nextStatus, plantTypeForCategory, progress } from '../lib/growth';
import { playBloom, playPlant, playProjectComplete, playWater } from '../lib/sound';
import { seedProjects } from '../lib/seed';

const uid = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `id-${Math.random().toString(36).slice(2)}`;

/** Turn the AI's raw tree into stored Subtasks with ids + plant species. */
function materialize(raw: RawSubtask[], projectId: string): Subtask[] {
  return raw.map((r) => {
    const category = (r.category || 'misc').trim().toLowerCase();
    const sub: Subtask = {
      id: uid(),
      projectId,
      title: r.title,
      category,
      status: 'todo',
      plantType: plantTypeForCategory(category),
      updatedAt: Date.now(),
    };
    if (r.children?.length) sub.children = materialize(r.children, projectId);
    return sub;
  });
}

/** Recursively map over a subtask tree, applying fn where id matches. */
function mapTree(list: Subtask[], id: string, fn: (s: Subtask) => Subtask): Subtask[] {
  return list.map((s) => {
    if (s.id === id) return fn(s);
    if (s.children) return { ...s, children: mapTree(s.children, id, fn) };
    return s;
  });
}

/** Map over every node in a subtask tree. */
function mapTreeAll(list: Subtask[], fn: (s: Subtask) => Subtask): Subtask[] {
  return list.map((s) => {
    const mapped = fn(s);
    return mapped.children ? { ...mapped, children: mapTreeAll(mapped.children, fn) } : mapped;
  });
}

function removeFromTree(list: Subtask[], id: string): Subtask[] {
  return list
    .filter((s) => s.id !== id)
    .map((s) => (s.children ? { ...s, children: removeFromTree(s.children, id) } : s));
}

export interface Selection {
  kind: 'project' | 'subtask';
  id: string;
}

interface GardenState {
  projects: Project[];
  selection: Selection | null;
  muted: boolean;
  /** Scene ambience. */
  timeOfDay: TimeOfDay;
  weather: Weather;
  season: Season;
  focusMode: boolean;
  /** Whether the one-time starter garden has been planted (persisted). */
  seeded: boolean;
  /** Ids that just changed to done — drives the bloom flourish (transient, not persisted). */
  justBloomed: string[];
  /** Ids just watered — drives the perk-up sparkle (transient, not persisted). */
  justWatered: string[];

  addProject: (input: {
    title: string;
    description?: string;
    granularity: Granularity;
    subtasks: RawSubtask[];
  }) => string;
  setStatus: (subtaskId: string, status: Status) => void;
  cycleStatus: (subtaskId: string) => void;
  setPosition: (subtaskId: string, position: Point) => void;
  /** Refresh every thirsty (long-untouched) todo, returning the count watered. */
  waterStalled: () => number;
  renameSubtask: (subtaskId: string, title: string) => void;
  setSubtaskNote: (subtaskId: string, note: string) => void;
  addSubtask: (projectId: string, title: string, category?: string) => void;
  renameProject: (projectId: string, title: string) => void;
  deleteProject: (projectId: string) => void;
  deleteSubtask: (subtaskId: string) => void;
  select: (sel: Selection | null) => void;
  clearBloom: (id: string) => void;
  clearWatered: (id: string) => void;
  toggleMute: () => void;
  setTimeOfDay: (t: TimeOfDay) => void;
  setWeather: (w: Weather) => void;
  setSeason: (s: Season) => void;
  setFocusMode: (on: boolean) => void;
  /** Plant the starter garden for first-time visitors (no-op if they already have data). */
  loadSeedIfEmpty: () => void;
}

export const useGarden = create<GardenState>()(
  persist(
    (set, get) => ({
      projects: [],
      selection: null,
      muted: false,
      timeOfDay: 'day',
      weather: 'clear',
      season: 'summer',
      focusMode: false,
      seeded: false,
      justBloomed: [],
      justWatered: [],

      addProject: ({ title, description, granularity, subtasks }) => {
        const id = uid();
        const project: Project = {
          id,
          title: title.trim(),
          description: description?.trim() || undefined,
          createdAt: Date.now(),
          granularity,
          subtasks: materialize(subtasks, id),
        };
        set((s) => ({ projects: [...s.projects, project] }));
        if (!get().muted) playPlant();
        return id;
      },

      setStatus: (subtaskId, status) => {
        const before = get().projects.find((p) =>
          flatten(p.subtasks).some((s) => s.id === subtaskId),
        );
        const wasComplete = before ? progress(before) >= 1 : false;

        set((s) => ({
          projects: s.projects.map((p) => ({
            ...p,
            subtasks: mapTree(p.subtasks, subtaskId, (sub) => ({
              ...sub,
              status,
              updatedAt: Date.now(),
            })),
          })),
          justBloomed: status === 'done' ? [...s.justBloomed, subtaskId] : s.justBloomed,
        }));

        if (status === 'done' && !get().muted) {
          const after = get().projects.find((p) =>
            flatten(p.subtasks).some((s) => s.id === subtaskId),
          );
          if (after && !wasComplete && progress(after) >= 1) playProjectComplete();
          else playBloom();
        }
      },

      cycleStatus: (subtaskId) => {
        const current = get()
          .projects.flatMap((p) => flatten(p.subtasks))
          .find((s) => s.id === subtaskId);
        if (!current) return;
        get().setStatus(subtaskId, nextStatus(current.status));
      },

      setPosition: (subtaskId, position) =>
        set((s) => ({
          projects: s.projects.map((p) => ({
            ...p,
            subtasks: mapTree(p.subtasks, subtaskId, (sub) => ({ ...sub, position })),
          })),
        })),

      waterStalled: () => {
        const now = Date.now();
        const thirsty = get()
          .projects.flatMap((p) => flatten(p.subtasks))
          .filter(isThirsty)
          .map((s) => s.id);
        if (thirsty.length === 0) return 0;
        const ids = new Set(thirsty);
        set((s) => ({
          projects: s.projects.map((p) => ({
            ...p,
            subtasks: mapTreeAll(p.subtasks, (sub) =>
              ids.has(sub.id) ? { ...sub, updatedAt: now } : sub,
            ),
          })),
          justWatered: [...s.justWatered, ...thirsty],
        }));
        if (!get().muted) playWater();
        return thirsty.length;
      },

      renameSubtask: (subtaskId, title) =>
        set((s) => ({
          projects: s.projects.map((p) => ({
            ...p,
            subtasks: mapTree(p.subtasks, subtaskId, (sub) => ({ ...sub, title })),
          })),
        })),

      setSubtaskNote: (subtaskId, note) =>
        set((s) => ({
          projects: s.projects.map((p) => ({
            ...p,
            subtasks: mapTree(p.subtasks, subtaskId, (sub) => ({ ...sub, note: note || undefined })),
          })),
        })),

      addSubtask: (projectId, title, category) => {
        const cat = (category || 'misc').trim().toLowerCase();
        const sub: Subtask = {
          id: uid(),
          projectId,
          title: title.trim(),
          category: cat,
          status: 'todo',
          plantType: plantTypeForCategory(cat),
          updatedAt: Date.now(),
        };
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId ? { ...p, subtasks: [...p.subtasks, sub] } : p,
          ),
        }));
      },

      renameProject: (projectId, title) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === projectId ? { ...p, title } : p)),
        })),

      deleteProject: (projectId) =>
        set((s) => ({
          projects: s.projects.filter((p) => p.id !== projectId),
          selection: s.selection?.id === projectId ? null : s.selection,
        })),

      deleteSubtask: (subtaskId) =>
        set((s) => ({
          projects: s.projects.map((p) => ({
            ...p,
            subtasks: removeFromTree(p.subtasks, subtaskId),
          })),
          selection: s.selection?.id === subtaskId ? null : s.selection,
        })),

      select: (selection) => set({ selection }),
      clearBloom: (id) =>
        set((s) => ({ justBloomed: s.justBloomed.filter((b) => b !== id) })),
      clearWatered: (id) =>
        set((s) => ({ justWatered: s.justWatered.filter((w) => w !== id) })),
      toggleMute: () => set((s) => ({ muted: !s.muted })),
      setTimeOfDay: (timeOfDay) => set({ timeOfDay }),
      setWeather: (weather) => set({ weather }),
      setSeason: (season) => set({ season }),
      setFocusMode: (focusMode) => set({ focusMode }),
      loadSeedIfEmpty: () => {
        const s = get();
        if (!s.seeded && s.projects.length === 0) {
          set({ projects: seedProjects(), seeded: true });
        }
      },
    }),
    {
      name: 'bloom-garden',
      version: 1,
      partialize: (s) => ({
        projects: s.projects,
        muted: s.muted,
        timeOfDay: s.timeOfDay,
        weather: s.weather,
        season: s.season,
        seeded: s.seeded,
      }),
      // Backfill updatedAt on data saved before the "thirsty" feature existed.
      migrate: (persisted: unknown) => {
        const state = persisted as { projects?: Project[]; muted?: boolean };
        const fix = (list: Subtask[], created: number): Subtask[] =>
          (list ?? []).map((s) => ({
            ...s,
            updatedAt: s.updatedAt ?? created,
            children: s.children ? fix(s.children, created) : s.children,
          }));
        return {
          projects: (state.projects ?? []).map((p) => ({
            ...p,
            subtasks: fix(p.subtasks, p.createdAt ?? Date.now()),
          })),
          muted: state.muted ?? false,
        };
      },
    },
  ),
);

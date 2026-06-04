import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Status, Subtask } from '../lib/types';
import { useGarden } from '../store/useGarden';
import { flatten, progress } from '../lib/growth';
import { Spade, Plus } from './Icons';

const STATUS_META: Record<Status, { label: string; emoji: string; cls: string }> = {
  todo: { label: 'Not started', emoji: '🌱', cls: 'bg-[#eadfce] text-[#9b8a78]' },
  doing: { label: 'In progress', emoji: '🌿', cls: 'bg-sky text-[#3f6b8a]' },
  done: { label: 'Done', emoji: '🌸', cls: 'bg-blush text-[#9b4a5a]' },
};

// What the next tap does — labelled explicitly so the action is never vague.
const NEXT_ACTION: Record<Status, { label: string; to: Status; cls: string }> = {
  todo: { label: '▶ Start this', to: 'doing', cls: 'bg-gradient-to-b from-sky to-[#a9d6ff] text-[#3f6b8a]' },
  doing: { label: '✓ Mark as done', to: 'done', cls: 'bg-gradient-to-b from-leaf to-sage text-white' },
  done: { label: '↺ Reopen', to: 'todo', cls: 'bg-[#f0e6d6] text-[#9b8a78]' },
};

function SubtaskRow({ sub, depth }: { sub: Subtask; depth: number }) {
  const cycle = useGarden((s) => s.cycleStatus);
  const select = useGarden((s) => s.select);
  const selection = useGarden((s) => s.selection);
  const meta = STATUS_META[sub.status];
  const isSel = selection?.kind === 'subtask' && selection.id === sub.id;
  return (
    <div>
      <div
        className={`flex items-center gap-2 rounded-2xl px-3 py-2 transition ${isSel ? 'bg-butter/60' : 'hover:bg-[#f3e8d8]'}`}
        style={{ marginLeft: depth * 16 }}
      >
        <button
          onClick={() => cycle(sub.id)}
          title={`${meta.label} — click to ${NEXT_ACTION[sub.status].label.replace(/^[^ ]+ /, '')}`}
          className={`shrink-0 rounded-full px-2 py-1 text-xs font-bold ${meta.cls}`}
        >
          {meta.emoji}
        </button>
        <button
          onClick={() => select({ kind: 'subtask', id: sub.id })}
          className={`flex-1 text-left text-sm ${sub.status === 'done' ? 'text-[#a89684] line-through opacity-60' : 'text-[#6b5847]'}`}
        >
          {sub.title}
        </button>
        <span className="shrink-0 rounded-full bg-[#f0e6d6] px-2 py-0.5 text-[10px] font-semibold text-[#a89684]">
          {sub.category}
        </span>
      </div>
      {sub.children?.map((c) => (
        <SubtaskRow key={c.id} sub={c} depth={depth + 1} />
      ))}
    </div>
  );
}

export default function DetailDrawer() {
  const selection = useGarden((s) => s.selection);
  const projects = useGarden((s) => s.projects);
  const select = useGarden((s) => s.select);
  const deleteProject = useGarden((s) => s.deleteProject);
  const deleteSubtask = useGarden((s) => s.deleteSubtask);
  const setStatus = useGarden((s) => s.setStatus);
  const renameSubtask = useGarden((s) => s.renameSubtask);
  const setSubtaskNote = useGarden((s) => s.setSubtaskNote);
  const renameProject = useGarden((s) => s.renameProject);
  const addSubtask = useGarden((s) => s.addSubtask);

  // Inline-edit drafts.
  const [editProject, setEditProject] = useState(false);
  const [projectDraft, setProjectDraft] = useState('');
  const [editStep, setEditStep] = useState(false);
  const [stepDraft, setStepDraft] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const [newStep, setNewStep] = useState('');

  // Resolve the current selection to a project (and optionally a subtask).
  let project = null as ReturnType<typeof resolveProject>;
  let subtask: Subtask | undefined;
  function resolveProject() {
    if (!selection) return null;
    if (selection.kind === 'project') return projects.find((p) => p.id === selection.id) ?? null;
    for (const p of projects) {
      if (flatten(p.subtasks).some((s) => s.id === selection.id)) return p;
    }
    return null;
  }
  project = resolveProject();
  if (selection?.kind === 'subtask' && project) {
    subtask = flatten(project.subtasks).find((s) => s.id === selection.id);
  }

  // Reset edit modes whenever the selection changes.
  useEffect(() => {
    setEditProject(false);
    setEditStep(false);
  }, [selection?.id]);

  const open = !!project;
  const pct = project ? Math.round(progress(project) * 100) : 0;

  return (
    <AnimatePresence>
      {open && project && (
        <motion.aside
          className="woodgrain fixed right-4 top-4 bottom-4 z-40 flex w-[360px] max-w-[88vw] flex-col rounded-[28px] border border-white/60 bg-cream/95 p-5 shadow-soft backdrop-blur"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        >
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wide text-[#bba88f]">Project</p>
              {editProject ? (
                <input
                  autoFocus
                  value={projectDraft}
                  onChange={(e) => setProjectDraft(e.target.value)}
                  onBlur={() => {
                    if (projectDraft.trim()) renameProject(project!.id, projectDraft.trim());
                    setEditProject(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                    if (e.key === 'Escape') setEditProject(false);
                  }}
                  className="w-full rounded-xl border-2 border-leaf bg-white px-2 py-1 text-xl font-extrabold text-[#6b5847] outline-none"
                />
              ) : (
                <h2 className="flex items-center gap-1.5 text-xl font-extrabold leading-tight text-[#6b5847]">
                  <span className="truncate">{project.title}</span>
                  <button
                    onClick={() => {
                      setProjectDraft(project!.title);
                      setEditProject(true);
                    }}
                    title="Rename project"
                    className="shrink-0 text-[#bba88f] transition hover:text-leaf"
                  >
                    <Spade size={15} />
                  </button>
                </h2>
              )}
            </div>
            <button
              onClick={() => select(null)}
              className="shrink-0 rounded-full bg-[#f0e6d6] px-3 py-1 font-bold text-[#9b8a78] hover:bg-[#e7d8c3]"
            >
              ✕
            </button>
          </div>

          {project.description && (
            <p className="mb-3 rounded-2xl bg-white/70 px-3 py-2 text-sm text-[#7d6c5a]">{project.description}</p>
          )}

          <div className="mb-1 flex items-center justify-between text-sm font-bold text-[#6b5847]">
            <span>Garden progress</span>
            <span className="text-leaf">{pct}%</span>
          </div>
          <div className="mb-4 h-3 overflow-hidden rounded-full bg-[#eadfce]">
            <div className="h-full rounded-full bg-leaf transition-all" style={{ width: `${pct}%` }} />
          </div>

          {subtask && (
            <div className="mb-3 rounded-2xl border-2 border-butter bg-butter/30 p-3">
              <div className="mb-1 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wide text-[#bba88f]">Selected step</p>
                <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${STATUS_META[subtask.status].cls}`}>
                  {STATUS_META[subtask.status].emoji} {STATUS_META[subtask.status].label}
                </span>
              </div>

              {editStep ? (
                <div className="mb-2 space-y-2">
                  <input
                    autoFocus
                    value={stepDraft}
                    onChange={(e) => setStepDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Escape' && setEditStep(false)}
                    placeholder="Step title"
                    className="w-full rounded-xl border-2 border-leaf bg-white px-2 py-1.5 text-sm font-bold text-[#6b5847] outline-none"
                  />
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    placeholder="Add a note (optional)…"
                    rows={2}
                    className="w-full resize-none rounded-xl border-2 border-[#ead8c2] bg-white px-2 py-1.5 text-sm text-[#7d6c5a] outline-none focus:border-leaf"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (stepDraft.trim()) renameSubtask(subtask!.id, stepDraft.trim());
                        setSubtaskNote(subtask!.id, noteDraft.trim());
                        setEditStep(false);
                      }}
                      className="flex-1 rounded-xl bg-gradient-to-b from-leaf to-sage py-1.5 text-sm font-extrabold text-white shadow-pop"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditStep(false)}
                      className="rounded-xl bg-[#f0e6d6] px-3 py-1.5 text-sm font-bold text-[#9b8a78]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-1 flex items-start gap-1.5">
                    <p className="flex-1 font-bold text-[#6b5847]">{subtask.title}</p>
                    <button
                      onClick={() => {
                        setStepDraft(subtask!.title);
                        setNoteDraft(subtask!.note ?? '');
                        setEditStep(true);
                      }}
                      title="Edit step"
                      className="shrink-0 text-[#bba88f] transition hover:text-leaf"
                    >
                      <Spade size={15} />
                    </button>
                  </div>
                  {subtask.note && <p className="mb-2 text-sm text-[#9b8a78]">{subtask.note}</p>}
                </>
              )}

              {!editStep && (
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => setStatus(subtask!.id, NEXT_ACTION[subtask!.status].to)}
                    className={`flex-1 rounded-xl px-3 py-2 text-sm font-extrabold shadow-pop transition hover:brightness-105 active:translate-y-0.5 ${NEXT_ACTION[subtask.status].cls}`}
                  >
                    {NEXT_ACTION[subtask.status].label}
                  </button>
                  <button
                    onClick={() => deleteSubtask(subtask!.id)}
                    title="Remove this step"
                    className="rounded-xl bg-[#f0e6d6] px-3 py-2 text-sm font-bold text-[#9b8a78] transition hover:bg-blush/50"
                  >
                    🗑
                  </button>
                </div>
              )}
            </div>
          )}

          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-[#bba88f]">
            Steps ({flatten(project.subtasks).filter((s) => s.status === 'done').length}/{flatten(project.subtasks).length})
          </p>
          <div className="-mr-2 flex-1 space-y-0.5 overflow-y-auto pr-1">
            {project.subtasks.map((s) => (
              <SubtaskRow key={s.id} sub={s} depth={0} />
            ))}
          </div>

          {/* add your own step */}
          <div className="mt-2 flex items-center gap-1.5 rounded-2xl border-2 border-dashed border-[#e0d2bd] px-2 py-1.5">
            <Plus size={15} className="shrink-0 text-[#bba88f]" />
            <input
              value={newStep}
              onChange={(e) => setNewStep(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newStep.trim()) {
                  addSubtask(project!.id, newStep.trim());
                  setNewStep('');
                }
              }}
              placeholder="Add your own step…"
              className="flex-1 bg-transparent text-sm text-[#6b5847] outline-none placeholder:text-[#bba88f]"
            />
            {newStep.trim() && (
              <button
                onClick={() => {
                  addSubtask(project!.id, newStep.trim());
                  setNewStep('');
                }}
                className="shrink-0 rounded-lg bg-leaf px-2.5 py-1 text-xs font-extrabold text-white"
              >
                Plant
              </button>
            )}
          </div>

          <button
            onClick={() => deleteProject(project!.id)}
            className="mt-3 rounded-2xl border-2 border-blush py-2 text-sm font-bold text-[#9b4a5a] transition hover:bg-blush/40"
          >
            Uproot this project
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

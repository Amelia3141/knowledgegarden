import type { Granularity, RawSubtask } from './types';

export interface BreakdownRequest {
  title: string;
  description?: string;
  granularity: Granularity;
}

export interface BreakdownResponse {
  subtasks: RawSubtask[];
}

/** Ask the local proxy (which holds the API key) to break a project into subtasks. */
export async function breakdownTask(req: BreakdownRequest): Promise<RawSubtask[]> {
  const res = await fetch('/api/breakdown', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Breakdown failed (${res.status}). ${detail}`.trim());
  }
  const data = (await res.json()) as BreakdownResponse;
  if (!Array.isArray(data.subtasks)) throw new Error('Malformed breakdown response.');
  return data.subtasks;
}

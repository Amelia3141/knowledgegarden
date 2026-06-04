import type { VercelRequest, VercelResponse } from '@vercel/node';
import Anthropic from '@anthropic-ai/sdk';

// Vercel serverless version of the local Express proxy (server/index.ts).
// The API key stays server-side; the browser only ever talks to this function.

const MODEL = process.env.BLOOM_MODEL ?? 'claude-opus-4-8';

const GRANULARITY: Record<number, string> = {
  1: 'Give 3-4 broad chunks. Keep it gentle and low-pressure. No nesting.',
  2: 'Give about 5 subtasks. No nesting.',
  3: 'Give 6-8 subtasks covering the whole project. No nesting.',
  4: 'Give 9-12 specific subtasks spanning the full lifecycle. No nesting.',
  5: 'Give 12+ subtasks spanning the full lifecycle, and nest 2-4 concrete sub-steps inside the larger ones via "children".',
};

const SUBTASK_TOOL: Anthropic.Tool = {
  name: 'submit_breakdown',
  description: 'Return the project broken into manageable subtasks.',
  input_schema: {
    type: 'object',
    properties: {
      subtasks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string', description: 'A single concrete, startable action.' },
            category: {
              type: 'string',
              description: 'One or two lowercase words grouping similar work, e.g. "design", "backend", "research", "testing", "launch".',
            },
            children: {
              type: 'array',
              description: 'Optional finer sub-steps (only when asked to nest).',
              items: {
                type: 'object',
                properties: { title: { type: 'string' }, category: { type: 'string' } },
                required: ['title', 'category'],
              },
            },
          },
          required: ['title', 'category'],
        },
      },
    },
    required: ['subtasks'],
  },
};

const SYSTEM = `You break projects down for people with ADHD. Rules:
- Cover the ENTIRE scope/lifecycle of the project, not just the first few steps (e.g. for "make an app": research, design/UI, backend, data, testing, polish, launch).
- Each subtask is ONE concrete, startable, low-friction action — something you could begin in the next few minutes.
- Use short, encouraging, plain language. No jargon, no overwhelming detail.
- Tag every subtask with a consistent "category" so similar work groups together. Reuse the same category word across related subtasks.
- Always answer by calling the submit_breakdown tool.`;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { title, description, granularity } = req.body ?? {};
  if (!title || typeof title !== 'string') return res.status(400).json({ error: 'Missing "title".' });
  if (!process.env.ANTHROPIC_API_KEY) return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set.' });

  const g = Math.min(5, Math.max(1, Number(granularity) || 3));
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      tools: [SUBTASK_TOOL],
      tool_choice: { type: 'tool', name: 'submit_breakdown' },
      messages: [
        {
          role: 'user',
          content: `Project: ${title}\n${description ? `Details: ${description}\n` : ''}Granularity: ${GRANULARITY[g]}`,
        },
      ],
    });
    const toolUse = msg.content.find((b) => b.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') return res.status(502).json({ error: 'Model did not return a breakdown.' });
    return res.json(toolUse.input);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[breakdown]', message);
    return res.status(500).json({ error: message });
  }
}

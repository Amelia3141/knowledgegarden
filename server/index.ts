import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const PORT = Number(process.env.PORT ?? 8787);
const MODEL = process.env.BLOOM_MODEL ?? 'claude-opus-4-8';

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/** How finely to split, keyed by the granularity slider (1 Gentle … 5 Deep). */
const GRANULARITY: Record<number, string> = {
  1: 'Give 3-4 broad chunks. Keep it gentle and low-pressure. No nesting.',
  2: 'Give about 5 subtasks. No nesting.',
  3: 'Give 6-8 subtasks covering the whole project. No nesting.',
  4: 'Give 9-12 specific subtasks spanning the full lifecycle. No nesting.',
  5: 'Give 12+ subtasks spanning the full lifecycle, and nest 2-4 concrete sub-steps inside the larger ones via "children".',
};

// Tool schema mirrors the client RawSubtask shape — forcing tool use guarantees
// valid, parseable output (the model retries internally on a schema mismatch).
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
                properties: {
                  title: { type: 'string' },
                  category: { type: 'string' },
                },
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

app.post('/api/breakdown', async (req, res) => {
  const { title, description, granularity } = req.body ?? {};
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Missing "title".' });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set on the server.' });
  }
  const g = Math.min(5, Math.max(1, Number(granularity) || 3));

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
          content: `Project: ${title}
${description ? `Details: ${description}\n` : ''}Granularity: ${GRANULARITY[g]}`,
        },
      ],
    });

    const toolUse = msg.content.find((b) => b.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      return res.status(502).json({ error: 'Model did not return a breakdown.' });
    }
    return res.json(toolUse.input);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[breakdown]', message);
    return res.status(500).json({ error: message });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true, model: MODEL }));

app.listen(PORT, () => {
  console.log(`🌱 Bloom proxy listening on http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('⚠️  ANTHROPIC_API_KEY is not set — copy .env.example to .env and add your key.');
  }
});

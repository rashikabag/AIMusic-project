import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateLoop } from '../server/services/ollama.js';
import { setCors } from './_lib/cors.js';

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) as {
    prompt?: string;
    model?: string;
  };
  const prompt = body?.prompt?.trim();
  if (!prompt || prompt.length > 500) {
    res.status(400).json({ error: 'prompt required (1–500 chars)' });
    return;
  }

  try {
    const result = await generateLoop(prompt, body.model);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'generation failed' });
  }
}

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getPresetsPayload } from '../server/lib/presets.js';
import { setCors } from './_lib/cors.js';

export default function handler(req: VercelRequest, res: VercelResponse): void {
  setCors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  res.status(200).json(getPresetsPayload());
}

import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { PresetsPayload } from './types.js';
import { generateLoop } from './services/ollama.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 8000;

function resolvePresetsPath(): string {
  const candidates = [
    path.join(__dirname, 'data', 'presets.json'),
    path.join(__dirname, '..', '..', 'server', 'data', 'presets.json'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  throw new Error('presets.json not found');
}

const presetFile = JSON.parse(readFileSync(resolvePresetsPath(), 'utf-8')) as {
  presets: PresetsPayload['presets'];
  museumEras: PresetsPayload['museumEras'];
};

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '16kb' }));

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'wavecraft-daw' });
});

app.get('/historical-presets', (_req: Request, res: Response) => {
  const payload: PresetsPayload = {
    presets: presetFile.presets,
    museumEras: presetFile.museumEras,
    meta: {
      count: presetFile.presets.length,
      airGapped: true,
      description: 'Static synthesis history corpus — no external API',
    },
  };
  res.json(payload);
});

app.post('/generate-loop', async (req: Request, res: Response) => {
  const body = req.body as { prompt?: string; model?: string };
  const prompt = body?.prompt?.trim();
  if (!prompt || prompt.length > 500) {
    res.status(400).json({ error: 'prompt required (1–500 chars)' });
    return;
  }
  try {
    const result = await generateLoop(prompt, body.model);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'generation failed' });
  }
});

const clientDistCandidates = [
  path.join(__dirname, '..', 'client'),
  path.join(__dirname, '..', '..', 'dist', 'client'),
];
const clientDist = clientDistCandidates.find((p) => existsSync(path.join(p, 'index.html')));
if (process.env.NODE_ENV === 'production' && clientDist) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, '127.0.0.1', () => {
  console.log(`WaveCraft API → http://127.0.0.1:${PORT}`);
});

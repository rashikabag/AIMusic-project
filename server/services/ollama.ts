import type { GenerateLoopResponse, TrackGrid } from '../types.js';

const OLLAMA_BASE = 'http://127.0.0.1:11434';
const OLLAMA_MODELS = ['llama3.1', 'mistral', 'llama3', 'llama3.2'] as const;

function emptyGrid(): TrackGrid {
  return { bass: Array(16).fill(0), pad: Array(16).fill(0), lead: Array(16).fill(0), fx: Array(16).fill(0) };
}

function clampBpm(value: number): number {
  return Math.max(60, Math.min(200, Math.floor(value)));
}

function extractJsonBlock(text: string): Record<string, unknown> | null {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed) as Record<string, unknown>;
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (!match) return null;
    try {
      return JSON.parse(match[0]) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}

function normalizeTracks(raw: Record<string, unknown>): TrackGrid {
  const tracks = (raw.tracks as Record<string, unknown> | undefined) ?? raw;
  const result = emptyGrid();
  (Object.keys(result) as (keyof TrackGrid)[]).forEach((name) => {
    const arr = tracks[name as string];
    if (Array.isArray(arr)) {
      result[name] = [...arr, ...Array(16).fill(0)].slice(0, 16).map((x) => (Number(x) ? 1 : 0));
    }
  });
  return result;
}

export function fallbackPattern(prompt: string): { bpm: number; tracks: TrackGrid } {
  const p = prompt.toLowerCase();
  let bpm = 128;
  const tracks = emptyGrid();

  if (['slow', 'ballad', 'ambient', 'kraftwerk'].some((k) => p.includes(k))) {
    bpm = 90;
    tracks.pad = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
    tracks.bass = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0];
  } else if (['house', 'techno', '909', 'dance'].some((k) => p.includes(k))) {
    bpm = 128;
    tracks.bass = [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0];
    tracks.fx = [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0];
    tracks.lead = [0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0];
  } else if (['hip', 'trap', '808', 'sub'].some((k) => p.includes(k))) {
    bpm = 140;
    tracks.bass = [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0];
    tracks.fx = [1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1];
  } else if (['pop', 'funk', 'thriller', 'prince'].some((k) => p.includes(k))) {
    bpm = 118;
    tracks.bass = [1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0];
    tracks.lead = [0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1];
    tracks.pad = [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0];
  } else {
    for (let i = 0; i < 16; i++) {
      if (i % 4 === 0) tracks.bass[i] = 1;
      if (i % 8 === 4) tracks.lead[i] = 1;
      if (i % 2 === 0) tracks.fx[i] = 1;
    }
  }

  return { bpm, tracks };
}

async function resolveOllamaModel(preferred?: string): Promise<string> {
  if (preferred) return preferred;
  try {
    const resp = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(5000) });
    if (!resp.ok) throw new Error('tags failed');
    const data = (await resp.json()) as { models?: { name: string }[] };
    const names = (data.models ?? []).map((m) => m.name.split(':')[0]);
    for (const candidate of OLLAMA_MODELS) {
      if (names.some((n) => n.includes(candidate))) return candidate;
    }
    if (names.length) return names[0];
  } catch (err) {
    console.warn('Could not list Ollama models:', err);
  }
  return OLLAMA_MODELS[0];
}

async function generateViaOllama(prompt: string, model: string): Promise<{ bpm: number; tracks: TrackGrid } | null> {
  const system =
    'You are a music sequencer assistant. Output ONLY valid JSON, no markdown. ' +
    'Schema: {"bpm":120,"tracks":{"bass":[16 ints 0/1],"pad":[...],"lead":[...],"fx":[...]}}';
  const user =
    `Create a 16-step loop for genre/mood: ${prompt}. ` +
    'Each track array must have exactly 16 values (0 or 1). BPM between 60 and 200.';

  const resp = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      stream: false,
      format: 'json',
    }),
    signal: AbortSignal.timeout(120_000),
  });

  if (!resp.ok) throw new Error(`Ollama HTTP ${resp.status}`);
  const data = (await resp.json()) as { message?: { content?: string } };
  const parsed = extractJsonBlock(data.message?.content ?? '');
  if (!parsed) return null;
  return {
    bpm: clampBpm(Number(parsed.bpm ?? 120)),
    tracks: normalizeTracks(parsed),
  };
}

export async function generateLoop(
  prompt: string,
  modelOverride?: string,
): Promise<GenerateLoopResponse> {
  const model = await resolveOllamaModel(modelOverride);
  let source: GenerateLoopResponse['source'] = 'ollama';
  let result: { bpm: number; tracks: TrackGrid } | null = null;

  try {
    result = await generateViaOllama(prompt, model);
  } catch (err) {
    console.warn('Ollama generation failed, using local fallback:', err);
    source = 'local-fallback';
  }

  if (!result) {
    result = fallbackPattern(prompt);
    source = 'local-fallback';
  }

  return {
    bpm: result.bpm,
    tracks: result.tracks,
    source,
    model: source === 'ollama' ? model : null,
    prompt,
  };
}

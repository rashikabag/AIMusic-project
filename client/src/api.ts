import { API_BASE } from './constants';
import type { HistoricalPreset, MuseumEra, PatternPayload, TrackGrid } from './types';

export interface PresetsResponse {
  presets: HistoricalPreset[];
  museumEras: Record<string, MuseumEra>;
}

export interface GenerateLoopResponse extends PatternPayload {
  source: string;
  model?: string | null;
  prompt: string;
}

export async function fetchPresets(): Promise<PresetsResponse> {
  const res = await fetch(`${API_BASE}/historical-presets`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<PresetsResponse>;
}

export async function generateLoop(prompt: string): Promise<GenerateLoopResponse> {
  const res = await fetch(`${API_BASE}/generate-loop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<GenerateLoopResponse>;
}

export type { TrackGrid };

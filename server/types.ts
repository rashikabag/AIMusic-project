export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle';
export type TrackName = 'bass' | 'pad' | 'lead' | 'fx';
export type EraId = '1970s-analog' | '1980s-roland' | '1990s-fm';

export interface SynthParams {
  waveform: Waveform;
  frequency: number;
  cutoff: number;
  resonance: number;
  stutterRate: number;
}

export interface TrackGrid {
  bass: number[];
  pad: number[];
  lead: number[];
  fx: number[];
}

export interface ChallengeStep {
  id: string;
  field: keyof SynthParams;
  target: string | number;
  instruction: string;
  theory: string;
}

export interface HistoricalPreset {
  id: string;
  name: string;
  year: number;
  artist: string;
  producer: string;
  hardware: string;
  era: EraId;
  track: TrackName;
  description: string;
  targets: SynthParams;
  tolerances: Partial<Record<keyof SynthParams, number>>;
  steps: ChallengeStep[];
  successSequence: { bpm: number; tracks: TrackGrid };
}

export interface MuseumBaseline {
  bpm: number;
  activeTrack: TrackName;
  params: SynthParams;
  tracks: TrackGrid;
}

export interface MuseumEra {
  title: string;
  baseline: MuseumBaseline;
}

export interface GenerateLoopRequest {
  prompt: string;
  model?: string;
}

export interface GenerateLoopResponse {
  bpm: number;
  tracks: TrackGrid;
  source: 'ollama' | 'local-fallback';
  model?: string | null;
  prompt: string;
}

export interface PresetsPayload {
  presets: HistoricalPreset[];
  museumEras: Record<EraId, MuseumEra>;
  meta: {
    count: number;
    airGapped: boolean;
    description: string;
  };
}

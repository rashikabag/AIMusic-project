/// <reference types="vite/client" />

export type Waveform = 'sine' | 'square' | 'sawtooth' | 'triangle';
export type TrackName = 'bass' | 'pad' | 'lead' | 'fx';
export type TabId = 'daw' | 'museum' | 'game';
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

export interface MuseumEra {
  title: string;
  baseline: {
    bpm: number;
    activeTrack: TrackName;
    params: SynthParams;
    tracks: TrackGrid;
  };
}

export interface PatternPayload {
  bpm?: number;
  tracks?: TrackGrid;
}

export interface AppState {
  activeTab: TabId;
  activeTrack: TrackName;
  bpm: number;
  isPlaying: boolean;
  currentStep: number;
  tracks: TrackGrid;
  params: Record<TrackName, SynthParams>;
  presets: HistoricalPreset[];
  museumEras: Partial<Record<EraId, MuseumEra>>;
  game: {
    active: boolean;
    preset: HistoricalPreset | null;
    stepIndex: number;
    completed: string[];
  };
}

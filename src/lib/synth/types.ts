export type Waveform = 'sine' | 'triangle' | 'sawtooth' | 'square' | 'noise';
export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch';
export type LfoShape = 'sine' | 'triangle' | 'square' | 'sawtooth';
export type LfoDestination = 'filter' | 'pitch' | 'amplitude' | 'pan';
export type NavSection =
  | 'tutor'
  | 'lessons'
  | 'presets'
  | 'playground'
  | 'ear-training'
  | 'settings';

export interface AdsrParams {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

export interface SynthParams {
  oscillator: {
    waveform: Waveform;
    octave: number;
    fineTune: number;
    unison: number;
    voices: number;
    detune: number;
    stereoWidth: number;
  };
  mixer: {
    oscVolume: number;
    noiseVolume: number;
    subOsc: number;
  };
  filter: {
    type: FilterType;
    cutoff: number;
    resonance: number;
    drive: number;
    keyTracking: number;
  };
  envelope: AdsrParams;
  lfo: {
    rate: number;
    depth: number;
    shape: LfoShape;
    destination: LfoDestination;
  };
  effects: {
    delay: number;
    reverb: number;
    chorus: number;
    distortion: number;
    compressor: number;
    eqLow: number;
    eqMid: number;
    eqHigh: number;
  };
  master: {
    volume: number;
    glide: number;
    polyMode: boolean;
  };
}

export interface CoachMessage {
  id: string;
  text: string;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface LessonStep {
  id: string;
  instruction: string;
  hint: string;
  validate: (params: SynthParams) => boolean;
  theory: string;
}

export interface Lesson {
  id: string;
  title: string;
  description: string;
  category: string;
  xp: number;
  steps: LessonStep[];
}

export interface ChallengeTarget {
  id: string;
  name: string;
  description: string;
  target: Partial<SynthParams>;
  weights: {
    oscillator: number;
    filter: number;
    envelope: number;
    effects: number;
  };
}

export interface EarTrainingQuestion {
  id: string;
  type: 'waveform' | 'filter' | 'envelope';
  prompt: string;
  options: string[];
  correct: string;
  synthSnapshot: Partial<SynthParams>;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export const DEFAULT_SYNTH_PARAMS: SynthParams = {
  oscillator: {
    waveform: 'sawtooth',
    octave: 0,
    fineTune: 0,
    unison: 1,
    voices: 1,
    detune: 10,
    stereoWidth: 0.5,
  },
  mixer: {
    oscVolume: 0.75,
    noiseVolume: 0,
    subOsc: 0.2,
  },
  filter: {
    type: 'lowpass',
    cutoff: 8000,
    resonance: 1,
    drive: 0,
    keyTracking: 0.5,
  },
  envelope: {
    attack: 0.01,
    decay: 0.3,
    sustain: 0.6,
    release: 0.4,
  },
  lfo: {
    rate: 2,
    depth: 0,
    shape: 'sine',
    destination: 'filter',
  },
  effects: {
    delay: 0,
    reverb: 0.15,
    chorus: 0,
    distortion: 0,
    compressor: 0.3,
    eqLow: 0,
    eqMid: 0,
    eqHigh: 0,
  },
  master: {
    volume: 0.7,
    glide: 0,
    polyMode: true,
  },
};

export const FIRST_MIDI = 21;
export const LAST_MIDI = 108;
export const KEY_COUNT = LAST_MIDI - FIRST_MIDI + 1;

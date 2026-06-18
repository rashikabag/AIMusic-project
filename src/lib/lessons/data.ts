import type { ChallengeTarget, Lesson, SynthParams } from '../synth/types';
import { DEFAULT_SYNTH_PARAMS } from '../synth/types';

export { DEFAULT_SYNTH_PARAMS };

export const LESSONS: Lesson[] = [
  {
    id: 'build-bass',
    title: 'Build a Bass',
    description: 'Craft a punchy sub bass from scratch using classic subtractive techniques.',
    category: 'Sound Design',
    xp: 150,
    steps: [
      {
        id: 's1',
        instruction: 'Step 1: Choose Saw waveform for rich harmonics.',
        hint: 'Saw stacks harmonics — perfect raw material for bass.',
        validate: (p) => p.oscillator.waveform === 'sawtooth',
        theory: 'Saw waves contain all integer harmonics, giving analog bass its signature buzz.',
      },
      {
        id: 's2',
        instruction: 'Step 2: Lower cutoff below 600 Hz.',
        hint: 'Drag the cutoff slider left — remove harsh highs.',
        validate: (p) => p.filter.cutoff < 600,
        theory: 'Filtering highs leaves the fundamental and low partials — the sub body of bass.',
      },
      {
        id: 's3',
        instruction: 'Step 3: Increase resonance to at least 3.',
        hint: 'A modest resonance bump adds Moog-style character.',
        validate: (p) => p.filter.resonance >= 3,
        theory: 'Resonance emphasizes the cutoff frequency — the classic squelch.',
      },
      {
        id: 's4',
        instruction: 'Step 4: Short attack (< 0.05s) and moderate sustain.',
        hint: 'Fast attack = punchy, percussive bass.',
        validate: (p) => p.envelope.attack < 0.05 && p.envelope.sustain > 0.3,
        theory: 'Short attack lets the transient cut through; sustain holds the body.',
      },
    ],
  },
  {
    id: 'warm-pad',
    title: 'Warm Pad',
    description: 'Create an evolving ambient pad with slow attack and reverb.',
    category: 'Sound Design',
    xp: 120,
    steps: [
      {
        id: 'p1',
        instruction: 'Step 1: Select Sine or Triangle waveform.',
        hint: 'Softer waveforms = smoother pads.',
        validate: (p) => p.oscillator.waveform === 'sine' || p.oscillator.waveform === 'triangle',
        theory: 'Fewer harmonics mean a softer starting point before filtering.',
      },
      {
        id: 'p2',
        instruction: 'Step 2: Attack above 0.5 seconds.',
        hint: 'Long attack creates a swell.',
        validate: (p) => p.envelope.attack >= 0.5,
        theory: 'Slow attack is the hallmark of pad sounds — they bloom into existence.',
      },
      {
        id: 'p3',
        instruction: 'Step 3: Reverb above 0.4.',
        hint: 'Space and depth come from reverb.',
        validate: (p) => p.effects.reverb >= 0.4,
        theory: 'Reverb places the sound in a virtual space — essential for ambient textures.',
      },
    ],
  },
  {
    id: 'pluck-lead',
    title: 'Pluck Lead',
    description: 'Design a snappy lead synth for melodies.',
    category: 'Sound Design',
    xp: 130,
    steps: [
      {
        id: 'l1',
        instruction: 'Step 1: Square waveform for hollow character.',
        hint: 'Square = odd harmonics, vocal-like.',
        validate: (p) => p.oscillator.waveform === 'square',
        theory: 'Square waves emphasize odd harmonics — clarinet-like timbre.',
      },
      {
        id: 'l2',
        instruction: 'Step 2: Open cutoff above 4000 Hz.',
        hint: 'Brightness helps leads cut through a mix.',
        validate: (p) => p.filter.cutoff > 4000,
        theory: 'High cutoff preserves harmonics for melodic clarity.',
      },
      {
        id: 'l3',
        instruction: 'Step 3: Low sustain (< 0.3) for pluck.',
        hint: 'Plucks decay quickly — low sustain.',
        validate: (p) => p.envelope.sustain < 0.3,
        theory: 'Low sustain mimics a plucked string that fades naturally.',
      },
    ],
  },
];

export const CHALLENGES: ChallengeTarget[] = [
  {
    id: 'acid-bass',
    name: 'Acid Bass',
    description: 'Recreate a squelchy TB-303 style bass.',
    target: {
      oscillator: { waveform: 'sawtooth', octave: -1, fineTune: 0, unison: 1, voices: 1, detune: 10, stereoWidth: 0.5 },
      filter: { type: 'lowpass', cutoff: 400, resonance: 8, drive: 0.3, keyTracking: 0.7 },
      envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 },
    },
    weights: { oscillator: 25, filter: 40, envelope: 25, effects: 10 },
  },
  {
    id: 'supersaw-lead',
    name: 'Supersaw Lead',
    description: 'Bright trance lead with open filter.',
    target: {
      oscillator: { waveform: 'sawtooth', octave: 0, fineTune: 0, unison: 4, voices: 4, detune: 15, stereoWidth: 0.8 },
      filter: { type: 'lowpass', cutoff: 6000, resonance: 2, drive: 0, keyTracking: 0.3 },
      envelope: { attack: 0.02, decay: 0.4, sustain: 0.7, release: 0.3 },
    },
    weights: { oscillator: 30, filter: 30, envelope: 20, effects: 20 },
  },
];

export const LEARNING_PATH = [
  'Waveforms',
  'Filters',
  'ADSR',
  'LFO',
  'Effects',
  'Sound Design',
  'Advanced Modulation',
  'Preset Creation',
];

export const FACTORY_PRESETS: { name: string; tag: string; params: SynthParams }[] = [
  { name: 'Init', tag: 'Default', params: DEFAULT_SYNTH_PARAMS },
  {
    name: '80s Lead',
    tag: 'Retro',
    params: {
      ...DEFAULT_SYNTH_PARAMS,
      oscillator: { waveform: 'square', octave: 0, fineTune: 0, unison: 2, voices: 2, detune: 12, stereoWidth: 0.7 },
      filter: { type: 'lowpass', cutoff: 3500, resonance: 4, drive: 0.1, keyTracking: 0.6 },
      effects: { delay: 0.25, reverb: 0.3, chorus: 0.4, distortion: 0, compressor: 0.4, eqLow: 2, eqMid: 0, eqHigh: 3 },
    },
  },
  {
    name: 'Cyberpunk Bass',
    tag: 'Dark',
    params: {
      ...DEFAULT_SYNTH_PARAMS,
      oscillator: { waveform: 'sawtooth', octave: -1, fineTune: -5, unison: 1, voices: 1, detune: 8, stereoWidth: 0.3 },
      mixer: { oscVolume: 0.85, noiseVolume: 0.1, subOsc: 0.5 },
      filter: { type: 'lowpass', cutoff: 280, resonance: 6, drive: 0.5, keyTracking: 0.8 },
      envelope: { attack: 0.005, decay: 0.15, sustain: 0.2, release: 0.2 },
      lfo: { rate: 0.5, depth: 0.3, shape: 'square', destination: 'filter' },
      effects: { delay: 0.1, reverb: 0.1, chorus: 0, distortion: 0.4, compressor: 0.6, eqLow: 4, eqMid: -2, eqHigh: 2 },
      master: { volume: 0.75, glide: 0, polyMode: false },
    },
  },
  {
    name: 'Dream Pad',
    tag: 'Ambient',
    params: {
      ...DEFAULT_SYNTH_PARAMS,
      oscillator: { waveform: 'sine', octave: 0, fineTune: 0, unison: 3, voices: 3, detune: 20, stereoWidth: 1 },
      mixer: { oscVolume: 0.6, noiseVolume: 0.15, subOsc: 0.3 },
      filter: { type: 'lowpass', cutoff: 2000, resonance: 0.5, drive: 0, keyTracking: 0.2 },
      envelope: { attack: 1.2, decay: 0.8, sustain: 0.8, release: 1.5 },
      lfo: { rate: 0.2, depth: 0.15, shape: 'sine', destination: 'filter' },
      effects: { delay: 0.35, reverb: 0.7, chorus: 0.5, distortion: 0, compressor: 0.2, eqLow: 1, eqMid: 0, eqHigh: -1 },
      master: { volume: 0.6, glide: 0.1, polyMode: true },
    },
  },
];

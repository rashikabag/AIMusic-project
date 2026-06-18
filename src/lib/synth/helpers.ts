import type { SynthParams } from './types';

export const PARAMETER_HELP: Record<string, {
  title: string;
  definition: string;
  why: string;
  sound: string;
  analogy: string;
}> = {
  waveform: {
    title: 'Waveform',
    definition: 'The raw shape of the oscillator cycle before filtering.',
    why: 'It defines the harmonic content — the DNA of your timbre.',
    sound: 'Sine is pure, saw is bright, square is hollow, triangle is soft.',
    analogy: 'Like choosing a raw ingredient before cooking — flour vs spice.',
  },
  cutoff: {
    title: 'Filter Cutoff',
    definition: 'The frequency above or below which the filter attenuates signal.',
    why: 'It sculpts brightness and warmth — the most expressive synth control.',
    sound: 'Lower cutoff = darker, muffled; higher = brighter, sharper.',
    analogy: 'Like opening or closing a window — more light or more shade.',
  },
  resonance: {
    title: 'Resonance',
    definition: 'Emphasizes frequencies near the cutoff point.',
    why: 'Adds character, squelch, and vocal-like peaks.',
    sound: 'High resonance creates whistling peaks and acid bass tones.',
    analogy: 'Boosting one spice in a recipe until it sings.',
  },
  attack: {
    title: 'Attack',
    definition: 'Time for the sound to reach peak level after a key press.',
    why: 'Defines whether a sound plucks, swells, or hits instantly.',
    sound: 'Short attack = percussive; long = pad-like swell.',
    analogy: 'How quickly you turn up a volume knob after pressing play.',
  },
  decay: {
    title: 'Decay',
    definition: 'Time to fall from peak to sustain level.',
    why: 'Shapes the body of the note after the initial transient.',
    sound: 'Long decay on bass adds weight; short keeps it tight.',
    analogy: 'How fast echo fades in a room after a clap.',
  },
  sustain: {
    title: 'Sustain',
    definition: 'Level held while the key remains pressed.',
    why: 'Determines how full the held note feels.',
    sound: 'Low sustain = pluck; high = organ-like hold.',
    analogy: 'How loud you keep singing while holding a note.',
  },
  release: {
    title: 'Release',
    definition: 'Time to fade to silence after key release.',
    why: 'Controls tail length and space in a mix.',
    sound: 'Long release creates ambience; short keeps mixes tight.',
    analogy: 'Reverb tail after you stop speaking.',
  },
  lfoRate: {
    title: 'LFO Rate',
    definition: 'Speed of the low-frequency modulation oscillator.',
    why: 'Creates movement — vibrato, wobble, tremolo.',
    sound: 'Slow rate = evolving pads; fast = laser zaps.',
    analogy: 'How fast you wiggle a flashlight to make patterns.',
  },
  lfoDepth: {
    title: 'LFO Depth',
    definition: 'Amount of modulation applied to the destination.',
    why: 'Controls how obvious the movement is.',
    sound: 'Deep LFO on filter = classic dub wobble.',
    analogy: 'How far you turn the steering wheel — subtle or dramatic.',
  },
};

export function formatSynthContext(params: SynthParams): string {
  return JSON.stringify(params, null, 2);
}

export function scoreChallengeMatch(
  current: SynthParams,
  target: Partial<SynthParams>,
  weights: { oscillator: number; filter: number; envelope: number; effects: number },
): { oscillator: number; filter: number; envelope: number; effects: number; overall: number } {
  const oscScore = target.oscillator?.waveform
    ? current.oscillator.waveform === target.oscillator.waveform
      ? 100
      : 0
    : 80;

  const filterCutoffTarget = target.filter?.cutoff ?? current.filter.cutoff;
  const filterResTarget = target.filter?.resonance ?? current.filter.resonance;
  const cutoffDiff = Math.abs(current.filter.cutoff - filterCutoffTarget);
  const resDiff = Math.abs(current.filter.resonance - filterResTarget);
  const filterScore = clampScore(100 - cutoffDiff / 100 - resDiff * 5);

  const envScore = target.envelope
    ? clampScore(
        100 -
          Math.abs(current.envelope.attack - (target.envelope.attack ?? 0.01)) * 200 -
          Math.abs(current.envelope.release - (target.envelope.release ?? 0.4)) * 50,
      )
    : 75;

  const fxScore = clampScore(
    100 -
      Math.abs(current.effects.reverb - (target.effects?.reverb ?? 0)) * 80 -
      Math.abs(current.effects.delay - (target.effects?.delay ?? 0)) * 80,
  );

  const overall =
    (oscScore * weights.oscillator +
      filterScore * weights.filter +
      envScore * weights.envelope +
      fxScore * weights.effects) /
    (weights.oscillator + weights.filter + weights.envelope + weights.effects);

  return {
    oscillator: Math.round(oscScore),
    filter: Math.round(filterScore),
    envelope: Math.round(envScore),
    effects: Math.round(fxScore),
    overall: Math.round(overall),
  };
}

function clampScore(v: number): number {
  return Math.max(0, Math.min(100, v));
}

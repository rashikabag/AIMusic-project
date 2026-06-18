'use client';

import * as Tone from 'tone';
import type { FilterType, LfoDestination, LfoShape, SynthParams, Waveform } from './types';

let engineInstance: SynthEngine | null = null;

export function getSynthEngine(): SynthEngine {
  if (!engineInstance) engineInstance = new SynthEngine();
  return engineInstance;
}

function mapWaveform(w: Waveform): Exclude<Waveform, 'noise'> {
  if (w === 'noise') return 'sawtooth';
  return w;
}

export class SynthEngine {
  private initialized = false;
  private poly!: Tone.PolySynth<Tone.Synth>;
  private noise!: Tone.Noise;
  private noiseGain!: Tone.Gain;
  private subOsc!: Tone.Oscillator;
  private subGain!: Tone.Gain;
  private filter!: Tone.Filter;
  private lfo!: Tone.LFO;
  private lfoDepth!: Tone.Gain;
  private drive!: Tone.Distortion;
  private chorus!: Tone.Chorus;
  private delay!: Tone.FeedbackDelay;
  private reverb!: Tone.Reverb;
  private compressor!: Tone.Compressor;
  private eq!: Tone.EQ3;
  private masterGain!: Tone.Gain;
  private analyser!: Tone.Analyser;
  private waveform!: Tone.Waveform;
  private fft!: Tone.FFT;
  private params: SynthParams | null = null;

  async init(): Promise<void> {
    if (this.initialized) return;
    await Tone.start();

    this.masterGain = new Tone.Gain(0.7).toDestination();
    this.analyser = new Tone.Analyser('waveform', 1024);
    this.waveform = new Tone.Waveform(1024);
    this.fft = new Tone.FFT(256);

    this.compressor = new Tone.Compressor(-24, 4);
    this.eq = new Tone.EQ3(0, 0, 0);
    this.reverb = new Tone.Reverb({ decay: 2.5, wet: 0.15 });
    this.delay = new Tone.FeedbackDelay('8n', 0.25);
    this.chorus = new Tone.Chorus(4, 2.5, 0.5);
    this.drive = new Tone.Distortion(0);

    this.filter = new Tone.Filter({ type: 'lowpass', frequency: 8000, Q: 1 });
    this.lfo = new Tone.LFO({ frequency: 2, type: 'sine', min: 200, max: 8000 });
    this.lfoDepth = new Tone.Gain(0);

    this.noise = new Tone.Noise('white');
    this.noiseGain = new Tone.Gain(0);
    this.subOsc = new Tone.Oscillator({ frequency: 55, type: 'sine' });
    this.subGain = new Tone.Gain(0);

    this.poly = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sawtooth' },
      envelope: { attack: 0.01, decay: 0.3, sustain: 0.6, release: 0.4 },
    });
    this.poly.maxPolyphony = 16;

    this.poly.connect(this.filter);
    this.noise.connect(this.noiseGain);
    this.noiseGain.connect(this.filter);
    this.subOsc.connect(this.subGain);
    this.subGain.connect(this.filter);

    this.filter.connect(this.drive);
    this.drive.connect(this.chorus);
    this.chorus.connect(this.delay);
    this.delay.connect(this.reverb);
    this.reverb.connect(this.eq);
    this.eq.connect(this.compressor);
    this.compressor.connect(this.masterGain);
    this.masterGain.connect(this.analyser);
    this.masterGain.connect(this.waveform);
    this.masterGain.connect(this.fft);

    this.lfo.connect(this.lfoDepth);
    this.lfoDepth.connect(this.filter.frequency);
    this.lfo.start();

    this.subOsc.start();
    this.noise.start();

    this.initialized = true;
  }

  applyParams(params: SynthParams): void {
    this.params = params;
    this.poly.set({
      oscillator: { type: mapWaveform(params.oscillator.waveform) },
      envelope: params.envelope,
      detune: params.oscillator.fineTune,
    });
    this.poly.volume.value = Tone.gainToDb(params.mixer.oscVolume);
    this.poly.maxPolyphony = params.master.polyMode ? 16 : 1;
    (this.poly as Tone.PolySynth<Tone.Synth> & { portamento: number }).portamento = params.master.glide * 0.5;

    this.noiseGain.gain.rampTo(params.mixer.noiseVolume * 0.3, 0.05);
    this.subGain.gain.rampTo(params.mixer.subOsc * 0.4, 0.05);

    this.filter.type = params.filter.type as FilterType;
    this.filter.frequency.rampTo(params.filter.cutoff, 0.05);
    this.filter.Q.value = params.filter.resonance;
    this.drive.distortion = params.filter.drive;

    this.lfo.frequency.value = params.lfo.rate;
    this.lfo.type = params.lfo.shape as LfoShape;
    this.lfoDepth.gain.rampTo(params.lfo.depth * 4000, 0.05);
    this.applyLfoDestination(params.lfo.destination, params.filter.cutoff);

    this.delay.wet.rampTo(params.effects.delay, 0.05);
    this.reverb.wet.rampTo(params.effects.reverb, 0.05);
    this.chorus.wet.rampTo(params.effects.chorus, 0.05);
    this.drive.wet.rampTo(params.effects.distortion, 0.05);
    this.compressor.threshold.value = -24 + params.effects.compressor * 12;
    this.eq.low.value = params.effects.eqLow;
    this.eq.mid.value = params.effects.eqMid;
    this.eq.high.value = params.effects.eqHigh;

    this.masterGain.gain.rampTo(params.master.volume, 0.05);
  }

  private applyLfoDestination(dest: LfoDestination, cutoff: number): void {
    this.lfo.disconnect();
    this.lfoDepth.disconnect();
    this.lfo.connect(this.lfoDepth);
    switch (dest) {
      case 'filter':
        this.lfo.min = Math.max(80, cutoff * 0.2);
        this.lfo.max = cutoff * 1.5;
        this.lfoDepth.connect(this.filter.frequency);
        break;
      case 'pitch':
        this.lfo.min = -50;
        this.lfo.max = 50;
        break;
      case 'amplitude':
        this.lfo.min = 0;
        this.lfo.max = 0.5;
        this.lfoDepth.connect(this.masterGain.gain);
        break;
      default:
        this.lfoDepth.connect(this.filter.frequency);
    }
  }

  noteOn(midi: number, velocity = 100, time?: number): void {
    if (!this.initialized || !this.params) return;
    const t = time ?? Tone.now();
    const freq = Tone.Frequency(midi + this.params.oscillator.octave * 12, 'midi').toFrequency();
    this.poly.triggerAttack(freq, t, velocity / 127);
    this.subOsc.frequency.rampTo(freq / 2, 0.02);
  }

  noteOff(midi: number, time?: number): void {
    if (!this.initialized || !this.params) return;
    const t = time ?? Tone.now();
    const freq = Tone.Frequency(midi + this.params.oscillator.octave * 12, 'midi').toFrequency();
    this.poly.triggerRelease(freq, t);
  }

  getAnalyser(): Tone.Analyser {
    return this.analyser;
  }

  getWaveform(): Tone.Waveform {
    return this.waveform;
  }

  getFFT(): Tone.FFT {
    return this.fft;
  }

  getParams(): SynthParams | null {
    return this.params;
  }
}

import { TRACKS } from './constants';
import type { AppState, SynthParams, TrackName } from './types';

export interface AudioRuntime {
  ctx: AudioContext | null;
  master: GainNode | null;
  analyser: AnalyserNode | null;
  filters: Partial<Record<TrackName, BiquadFilterNode>>;
  schedulerTimer: ReturnType<typeof setInterval> | null;
  nextStepTime: number;
  scheduleAhead: number;
}

export function createAudioRuntime(): AudioRuntime {
  return {
    ctx: null,
    master: null,
    analyser: null,
    filters: {},
    schedulerTimer: null,
    nextStepTime: 0,
    scheduleAhead: 0.1,
  };
}

export function ensureAudio(state: AppState, audio: AudioRuntime, onScopeReady: () => void): void {
  if (audio.ctx) return;
  const ctx = new AudioContext();
  const master = ctx.createGain();
  master.gain.value = 0.35;
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048;
  master.connect(analyser);
  analyser.connect(ctx.destination);

  const filters: Partial<Record<TrackName, BiquadFilterNode>> = {};
  TRACKS.forEach((t) => {
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = state.params[t].cutoff;
    f.Q.value = state.params[t].resonance;
    f.connect(master);
    filters[t] = f;
  });

  audio.ctx = ctx;
  audio.master = master;
  audio.analyser = analyser;
  audio.filters = filters;
  onScopeReady();
}

export function updateFilters(audio: AudioRuntime, track: TrackName, params: SynthParams): void {
  const f = audio.filters[track];
  if (!f || !audio.ctx) return;
  f.frequency.setTargetAtTime(params.cutoff, audio.ctx.currentTime, 0.02);
  f.Q.setTargetAtTime(params.resonance, audio.ctx.currentTime, 0.02);
}

export function playNote(audio: AudioRuntime, track: TrackName, params: SynthParams, time: number): void {
  const ctx = audio.ctx;
  const filter = audio.filters[track];
  if (!ctx || !filter) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = params.waveform;
  osc.frequency.setValueAtTime(params.frequency, time);

  const dur = track === 'pad' ? 0.4 : track === 'bass' ? 0.15 : 0.12;
  gain.gain.setValueAtTime(0, time);
  gain.gain.linearRampToValueAtTime(track === 'pad' ? 0.15 : 0.35, time + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

  osc.connect(gain);
  gain.connect(filter);
  osc.start(time);
  osc.stop(time + dur + 0.05);

  if (params.stutterRate > 0 && track === 'fx') {
    for (let i = 1; i <= params.stutterRate; i++) {
      const o2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      o2.type = params.waveform;
      o2.frequency.value = params.frequency * (1 + i * 0.05);
      const t = time + i * 0.04;
      g2.gain.setValueAtTime(0, t);
      g2.gain.linearRampToValueAtTime(0.2, t + 0.005);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      o2.connect(g2);
      g2.connect(filter);
      o2.start(t);
      o2.stop(t + 0.06);
    }
  }
}

export function startScope(canvas: HTMLCanvasElement, analyser: AnalyserNode): void {
  const ctx2d = canvas.getContext('2d');
  if (!ctx2d) return;
  const buf = new Uint8Array(analyser.fftSize);

  const draw = (): void => {
    requestAnimationFrame(draw);
    const w = (canvas.width = canvas.clientWidth * devicePixelRatio);
    const h = (canvas.height = canvas.clientHeight * devicePixelRatio);
    analyser.getByteTimeDomainData(buf);
    ctx2d.fillStyle = '#000';
    ctx2d.fillRect(0, 0, w, h);
    ctx2d.lineWidth = 2 * devicePixelRatio;
    ctx2d.strokeStyle = '#22d3ee';
    ctx2d.shadowColor = '#22d3ee';
    ctx2d.shadowBlur = 12;
    ctx2d.beginPath();
    const slice = w / buf.length;
    for (let i = 0; i < buf.length; i++) {
      const y = (buf[i] / 128) * (h / 2);
      const x = i * slice;
      if (i === 0) ctx2d.moveTo(x, y);
      else ctx2d.lineTo(x, y);
    }
    ctx2d.stroke();
  };
  draw();
}

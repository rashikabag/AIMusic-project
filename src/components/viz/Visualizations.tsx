'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';
import { getSynthEngine } from '@/lib/synth/engine';

export function Oscilloscope() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number;
    const engine = getSynthEngine();

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const w = (canvas.width = canvas.clientWidth * devicePixelRatio);
      const h = (canvas.height = canvas.clientHeight * devicePixelRatio);
      const wf = engine.getWaveform().getValue();
      ctx.fillStyle = '#0a0a0b';
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 2 * devicePixelRatio;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      const slice = w / wf.length;
      for (let i = 0; i < wf.length; i++) {
        const y = ((wf[i] + 1) / 2) * h;
        i === 0 ? ctx.moveTo(i * slice, y) : ctx.lineTo(i * slice, y);
      }
      ctx.stroke();
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="glass-panel p-3 h-full flex flex-col">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Oscilloscope</span>
      <canvas ref={canvasRef} className="flex-1 w-full rounded-lg bg-black/60 min-h-[80px]" />
    </div>
  );
}

export function SpectrumAnalyzer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf: number;
    const engine = getSynthEngine();

    const draw = () => {
      raf = requestAnimationFrame(draw);
      const w = (canvas.width = canvas.clientWidth * devicePixelRatio);
      const h = (canvas.height = canvas.clientHeight * devicePixelRatio);
      const fft = engine.getFFT().getValue();
      ctx.fillStyle = '#0a0a0b';
      ctx.fillRect(0, 0, w, h);
      const barW = w / fft.length;
      for (let i = 0; i < fft.length; i++) {
        const db = fft[i];
        const norm = Math.max(0, (db + 100) / 100);
        const barH = norm * h;
        const hue = 180 + (i / fft.length) * 60;
        ctx.fillStyle = `hsla(${hue}, 80%, 55%, 0.85)`;
        ctx.fillRect(i * barW, h - barH, barW - 1, barH);
      }
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="glass-panel p-3 h-full flex flex-col">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Spectrum</span>
      <canvas ref={canvasRef} className="flex-1 w-full rounded-lg bg-black/60 min-h-[80px]" />
    </div>
  );
}

export function AdsrGraph({ attack, decay, sustain, release }: {
  attack: number; decay: number; sustain: number; release: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = (canvas.width = canvas.clientWidth * devicePixelRatio);
    const h = (canvas.height = canvas.clientHeight * devicePixelRatio);
    ctx.clearRect(0, 0, w, h);
    const total = attack + decay + 0.5 + release;
    const ax = (attack / total) * w * 0.8;
    const dx = ax + (decay / total) * w * 0.8;
    const sx = dx + w * 0.15;
    const rx = sx + (release / total) * w * 0.8;
    const sy = h * (1 - sustain);
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 2 * devicePixelRatio;
    ctx.shadowColor = '#f97316';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.lineTo(ax, 4);
    ctx.lineTo(dx, sy);
    ctx.lineTo(sx, sy);
    ctx.lineTo(rx, h);
    ctx.stroke();
  }, [attack, decay, sustain, release]);

  return (
    <div className="glass-panel p-3 flex flex-col">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">ADSR</span>
      <canvas ref={canvasRef} className="w-full h-16 rounded-lg bg-black/40" />
    </div>
  );
}

export function FrequencyResponse({ cutoff, resonance }: { cutoff: number; resonance: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = (canvas.width = canvas.clientWidth * devicePixelRatio);
    const h = (canvas.height = canvas.clientHeight * devicePixelRatio);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = '#14b8a6';
    ctx.lineWidth = 2 * devicePixelRatio;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const freq = 20 * Math.pow(1000, x / w);
      const norm = freq / cutoff;
      let mag = 1 / Math.sqrt(1 + Math.pow(norm, 4));
      if (norm > 0.9 && norm < 1.1) mag += resonance * 0.08 * Math.exp(-Math.pow(norm - 1, 2) * 20);
      const y = h - mag * h * 0.85;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }, [cutoff, resonance]);

  return (
    <div className="glass-panel p-3 flex flex-col">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">Filter Response</span>
      <canvas ref={canvasRef} className="w-full h-16 rounded-lg bg-black/40" />
    </div>
  );
}

export function LfoAnimation({ rate, depth, shape }: { rate: number; depth: number; shape: string }) {
  return (
    <div className="glass-panel p-3 flex flex-col">
      <span className="text-[10px] uppercase tracking-widest text-zinc-500 mb-2">LFO · {shape}</span>
      <div className="h-16 rounded-lg bg-black/40 relative overflow-hidden">
        <motion.div
          className="absolute inset-y-0 w-1 bg-accent-blue shadow-glow"
          animate={{ left: ['0%', '100%'] }}
          transition={{ duration: Math.max(0.2, 2 / rate), repeat: Infinity, ease: 'linear' }}
          style={{ opacity: 0.4 + depth * 0.6 }}
        />
        <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          <motion.path
            d="M0,32 Q25,8 50,32 T100,32"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            animate={{ d: ['M0,32 Q25,8 50,32 T100,32', 'M0,32 Q25,56 50,32 T100,32', 'M0,32 Q25,8 50,32 T100,32'] }}
            transition={{ duration: Math.max(0.2, 2 / rate), repeat: Infinity }}
            style={{ opacity: 0.3 + depth * 0.7 }}
          />
        </svg>
      </div>
    </div>
  );
}

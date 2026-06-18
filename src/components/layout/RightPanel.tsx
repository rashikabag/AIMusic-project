'use client';

import { useSynthStore } from '@/lib/store/synth-store';
import {
  Oscilloscope, SpectrumAnalyzer, AdsrGraph, FrequencyResponse, LfoAnimation,
} from '@/components/viz/Visualizations';

export function RightPanel() {
  const params = useSynthStore((s) => s.params);
  const hoveredParam = useSynthStore((s) => s.hoveredParam);

  return (
    <aside className="hidden xl:flex flex-col gap-2 w-64 shrink-0 overflow-y-auto max-h-[calc(100vh-64px)]">
      <Oscilloscope />
      <SpectrumAnalyzer />
      <AdsrGraph {...params.envelope} />
      <FrequencyResponse cutoff={params.filter.cutoff} resonance={params.filter.resonance} />
      <LfoAnimation rate={params.lfo.rate} depth={params.lfo.depth} shape={params.lfo.shape} />

      <div className="glass-panel p-3">
        <span className="text-[10px] uppercase tracking-widest text-zinc-500">Active Parameter</span>
        <div className="mt-2 font-mono text-xs text-accent-teal">
          {hoveredParam ?? 'Hover a control'}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-1 text-[10px] text-zinc-500">
          <span>Wave: {params.oscillator.waveform}</span>
          <span>Cut: {Math.round(params.filter.cutoff)}Hz</span>
          <span>Res: {params.filter.resonance.toFixed(1)}</span>
          <span>Atk: {params.envelope.attack.toFixed(2)}s</span>
        </div>
      </div>
    </aside>
  );
}

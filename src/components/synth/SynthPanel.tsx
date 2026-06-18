'use client';

import { useSynthStore } from '@/lib/store/synth-store';
import type { Waveform, FilterType, LfoShape, LfoDestination } from '@/lib/synth/types';
import { ParamSlider } from '@/components/ui/param-slider';
import { SynthSection } from '@/components/synth/SynthSection';

const WAVEFORMS: Waveform[] = ['sine', 'triangle', 'sawtooth', 'square', 'noise'];
const FILTERS: FilterType[] = ['lowpass', 'highpass', 'bandpass', 'notch'];
const LFO_SHAPES: LfoShape[] = ['sine', 'triangle', 'square', 'sawtooth'];
const LFO_DEST: LfoDestination[] = ['filter', 'pitch', 'amplitude', 'pan'];

export function SynthPanel() {
  const params = useSynthStore((s) => s.params);
  const updateOsc = useSynthStore((s) => s.updateOscillator);
  const updateMixer = useSynthStore((s) => s.updateMixer);
  const updateFilter = useSynthStore((s) => s.updateFilter);
  const updateEnv = useSynthStore((s) => s.updateEnvelope);
  const updateLfo = useSynthStore((s) => s.updateLfo);
  const updateFx = useSynthStore((s) => s.updateEffects);
  const updateMaster = useSynthStore((s) => s.updateMaster);
  const setHoveredParam = useSynthStore((s) => s.setHoveredParam);

  const hover = (key: string | null) => setHoveredParam(key);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto max-h-[calc(100vh-280px)] pr-1">
      <SynthSection title="Oscillator" accent="orange">
        <div className="flex flex-wrap gap-1.5">
          {WAVEFORMS.map((w) => (
            <button
              key={w}
              type="button"
              onMouseEnter={() => hover('waveform')}
              onMouseLeave={() => hover(null)}
              onClick={() => updateOsc({ waveform: w })}
              className={`px-2.5 py-1 rounded-lg text-[11px] capitalize transition-all ${
                params.oscillator.waveform === w
                  ? 'bg-accent-orange/20 text-accent-orange border border-accent-orange/50'
                  : 'bg-zinc-800/60 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {w === 'sawtooth' ? 'Saw' : w}
            </button>
          ))}
        </div>
        <ParamSlider label="Octave" paramKey="octave" value={params.oscillator.octave} min={-2} max={2} step={1} onChange={(v) => updateOsc({ octave: v })} onHover={hover} />
        <ParamSlider label="Fine Tune" paramKey="fineTune" value={params.oscillator.fineTune} min={-100} max={100} step={1} onChange={(v) => updateOsc({ fineTune: v })} onHover={hover} />
        <ParamSlider label="Unison" paramKey="unison" value={params.oscillator.unison} min={1} max={8} step={1} onChange={(v) => updateOsc({ unison: v })} onHover={hover} />
        <ParamSlider label="Detune" paramKey="detune" value={params.oscillator.detune} min={0} max={50} step={1} onChange={(v) => updateOsc({ detune: v })} onHover={hover} />
        <ParamSlider label="Stereo Width" paramKey="stereoWidth" value={params.oscillator.stereoWidth} min={0} max={1} onChange={(v) => updateOsc({ stereoWidth: v })} onHover={hover} />
      </SynthSection>

      <SynthSection title="Mixer" accent="teal">
        <ParamSlider label="Osc Volume" paramKey="oscVolume" value={params.mixer.oscVolume} min={0} max={1} onChange={(v) => updateMixer({ oscVolume: v })} onHover={hover} />
        <ParamSlider label="Noise" paramKey="noiseVolume" value={params.mixer.noiseVolume} min={0} max={1} onChange={(v) => updateMixer({ noiseVolume: v })} onHover={hover} />
        <ParamSlider label="Sub Osc" paramKey="subOsc" value={params.mixer.subOsc} min={0} max={1} onChange={(v) => updateMixer({ subOsc: v })} onHover={hover} />
      </SynthSection>

      <SynthSection title="Filter" accent="blue">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => updateFilter({ type: f })}
              className={`px-2 py-1 rounded-lg text-[10px] capitalize ${
                params.filter.type === f ? 'bg-accent-blue/20 text-accent-blue border border-accent-blue/40' : 'bg-zinc-800/60 text-zinc-500'
              }`}
            >
              {f.replace('pass', ' Pass')}
            </button>
          ))}
        </div>
        <ParamSlider label="Cutoff" paramKey="cutoff" value={params.filter.cutoff} min={80} max={15000} step={10} unit=" Hz" onChange={(v) => updateFilter({ cutoff: v })} onHover={hover} />
        <ParamSlider label="Resonance" paramKey="resonance" value={params.filter.resonance} min={0} max={15} step={0.1} onChange={(v) => updateFilter({ resonance: v })} onHover={hover} />
        <ParamSlider label="Drive" paramKey="drive" value={params.filter.drive} min={0} max={1} onChange={(v) => updateFilter({ drive: v })} onHover={hover} />
        <ParamSlider label="Key Track" paramKey="keyTracking" value={params.filter.keyTracking} min={0} max={1} onChange={(v) => updateFilter({ keyTracking: v })} onHover={hover} />
      </SynthSection>

      <SynthSection title="Envelope ADSR" accent="orange">
        <ParamSlider label="Attack" paramKey="attack" value={params.envelope.attack} min={0.001} max={3} onChange={(v) => updateEnv({ attack: v })} onHover={hover} />
        <ParamSlider label="Decay" paramKey="decay" value={params.envelope.decay} min={0.01} max={3} onChange={(v) => updateEnv({ decay: v })} onHover={hover} />
        <ParamSlider label="Sustain" paramKey="sustain" value={params.envelope.sustain} min={0} max={1} onChange={(v) => updateEnv({ sustain: v })} onHover={hover} />
        <ParamSlider label="Release" paramKey="release" value={params.envelope.release} min={0.01} max={5} onChange={(v) => updateEnv({ release: v })} onHover={hover} />
      </SynthSection>

      <SynthSection title="LFO" accent="teal">
        <div className="flex flex-wrap gap-1">
          {LFO_SHAPES.map((s) => (
            <button key={s} type="button" onClick={() => updateLfo({ shape: s })} className={`px-2 py-0.5 rounded text-[10px] capitalize ${params.lfo.shape === s ? 'text-accent-teal bg-accent-teal/10' : 'text-zinc-500'}`}>{s}</button>
          ))}
        </div>
        <ParamSlider label="Rate" paramKey="lfoRate" value={params.lfo.rate} min={0.1} max={20} onChange={(v) => updateLfo({ rate: v })} onHover={hover} />
        <ParamSlider label="Depth" paramKey="lfoDepth" value={params.lfo.depth} min={0} max={1} onChange={(v) => updateLfo({ depth: v })} onHover={hover} />
        <select
          value={params.lfo.destination}
          onChange={(e) => updateLfo({ destination: e.target.value as LfoDestination })}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs text-zinc-300"
        >
          {LFO_DEST.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
      </SynthSection>

      <SynthSection title="Effects" accent="blue">
        <ParamSlider label="Delay" paramKey="delay" value={params.effects.delay} min={0} max={1} onChange={(v) => updateFx({ delay: v })} onHover={hover} />
        <ParamSlider label="Reverb" paramKey="reverb" value={params.effects.reverb} min={0} max={1} onChange={(v) => updateFx({ reverb: v })} onHover={hover} />
        <ParamSlider label="Chorus" paramKey="chorus" value={params.effects.chorus} min={0} max={1} onChange={(v) => updateFx({ chorus: v })} onHover={hover} />
        <ParamSlider label="Distortion" paramKey="distortion" value={params.effects.distortion} min={0} max={1} onChange={(v) => updateFx({ distortion: v })} onHover={hover} />
        <ParamSlider label="Compressor" paramKey="compressor" value={params.effects.compressor} min={0} max={1} onChange={(v) => updateFx({ compressor: v })} onHover={hover} />
        <ParamSlider label="EQ Low" paramKey="eqLow" value={params.effects.eqLow} min={-12} max={12} step={0.5} onChange={(v) => updateFx({ eqLow: v })} onHover={hover} />
        <ParamSlider label="EQ Mid" paramKey="eqMid" value={params.effects.eqMid} min={-12} max={12} step={0.5} onChange={(v) => updateFx({ eqMid: v })} onHover={hover} />
        <ParamSlider label="EQ High" paramKey="eqHigh" value={params.effects.eqHigh} min={-12} max={12} step={0.5} onChange={(v) => updateFx({ eqHigh: v })} onHover={hover} />
      </SynthSection>

      <SynthSection title="Master" accent="orange">
        <ParamSlider label="Volume" paramKey="volume" value={params.master.volume} min={0} max={1} onChange={(v) => updateMaster({ volume: v })} onHover={hover} />
        <ParamSlider label="Glide" paramKey="glide" value={params.master.glide} min={0} max={1} onChange={(v) => updateMaster({ glide: v })} onHover={hover} />
        <button
          type="button"
          onClick={() => updateMaster({ polyMode: !params.master.polyMode })}
          className={`w-full py-2 rounded-xl text-xs font-medium ${params.master.polyMode ? 'bg-accent-teal/20 text-accent-teal' : 'bg-zinc-800 text-zinc-400'}`}
        >
          {params.master.polyMode ? 'Polyphonic' : 'Monophonic'}
        </button>
      </SynthSection>
    </div>
  );
}

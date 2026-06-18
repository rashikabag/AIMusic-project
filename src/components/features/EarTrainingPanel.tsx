'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getSynthEngine } from '@/lib/synth/engine';
import { useSynthStore } from '@/lib/store/synth-store';
import { useUserStore } from '@/lib/store/synth-store';
import { Button } from '@/components/ui/button';
import type { Waveform, SynthParams } from '@/lib/synth/types';
import { DEFAULT_SYNTH_PARAMS } from '@/lib/synth/types';

const QUESTIONS = [
  { type: 'waveform' as const, prompt: 'Which waveform do you hear?', options: ['sine', 'sawtooth', 'square', 'triangle'], answer: 'sawtooth' as Waveform },
  { type: 'waveform' as const, prompt: 'Identify the waveform', options: ['sine', 'square', 'sawtooth', 'noise'], answer: 'square' as Waveform },
  { type: 'filter' as const, prompt: 'Is the filter open or closed?', options: ['Open (bright)', 'Closed (dark)'], answer: 'Closed (dark)' },
  { type: 'envelope' as const, prompt: 'Attack character?', options: ['Instant/pluck', 'Slow swell'], answer: 'Instant/pluck' },
];

function snapshotForAnswer(type: string, answer: string): SynthParams {
  const p = { ...DEFAULT_SYNTH_PARAMS, oscillator: { ...DEFAULT_SYNTH_PARAMS.oscillator }, filter: { ...DEFAULT_SYNTH_PARAMS.filter }, envelope: { ...DEFAULT_SYNTH_PARAMS.envelope } };
  if (type === 'waveform') p.oscillator.waveform = answer as Waveform;
  if (type === 'filter') p.filter.cutoff = answer.includes('Closed') ? 400 : 8000;
  if (type === 'envelope') p.envelope.attack = answer.includes('Instant') ? 0.005 : 1.2;
  return p;
}

export function EarTrainingPanel() {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const loadPreset = useSynthStore((s) => s.loadPreset);
  const engineReady = useSynthStore((s) => s.engineReady);
  const recordEarTraining = useUserStore((s) => s.recordEarTraining);
  const addXp = useUserStore((s) => s.addXp);
  const score = useUserStore((s) => s.earTrainingScore);

  const q = QUESTIONS[qIndex % QUESTIONS.length];

  const playQuestion = () => {
    if (!engineReady) return;
    const snap = snapshotForAnswer(q.type, q.answer);
    loadPreset(snap);
    setTimeout(() => {
      getSynthEngine().noteOn(60, 100);
      setTimeout(() => getSynthEngine().noteOff(60), 800);
    }, 100);
  };

  useEffect(() => {
    playQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex, engineReady]);

  const submit = (opt: string) => {
    setSelected(opt);
    const correct =
      (q.type === 'waveform' && opt === q.answer) ||
      (q.type === 'filter' && opt === q.answer) ||
      (q.type === 'envelope' && opt === q.answer);
    recordEarTraining(correct);
    if (correct) addXp(25);
    setFeedback(correct ? '✓ Correct!' : `✗ Answer: ${q.answer}`);
  };

  const accuracy = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;

  return (
    <div className="glass-panel p-6 max-w-lg mx-auto space-y-4">
      <h2 className="font-display text-xl font-bold text-accent-teal">Ear Training</h2>
      <p className="text-sm text-zinc-400">Accuracy: {accuracy}% ({score.correct}/{score.total})</p>
      <Button variant="outline" size="sm" onClick={playQuestion}>▶ Play Sound Again</Button>
      <p className="text-lg font-medium">{q.prompt}</p>
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => submit(opt)}
            disabled={!!selected}
            className={`p-3 rounded-xl text-sm border transition-all capitalize ${
              selected === opt
                ? opt === q.answer || (q.type !== 'waveform' && opt === q.answer)
                  ? 'border-accent-teal bg-accent-teal/10'
                  : 'border-red-500/50 bg-red-500/10'
                : 'border-zinc-700 hover:border-accent-teal'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {feedback && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-accent-orange">
          {feedback}
          <Button size="sm" className="ml-3" onClick={() => { setSelected(null); setFeedback(null); setQIndex((i) => i + 1); }}>
            Next
          </Button>
        </motion.p>
      )}
    </div>
  );
}

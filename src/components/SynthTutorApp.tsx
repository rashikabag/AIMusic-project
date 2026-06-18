'use client';

import { useEffect, useRef } from 'react';
import { TopNav } from '@/components/layout/TopNav';
import { LeftPanel } from '@/components/layout/LeftPanel';
import { CenterPanel } from '@/components/layout/CenterPanel';
import { RightPanel } from '@/components/layout/RightPanel';
import { PianoKeyboard } from '@/components/keyboard/PianoKeyboard';
import { getSynthEngine } from '@/lib/synth/engine';
import { useSynthStore } from '@/lib/store/synth-store';
import { useUserStore } from '@/lib/store/synth-store';
import type { SynthParams } from '@/lib/synth/types';

export function SynthTutorApp() {
  const params = useSynthStore((s) => s.params);
  const setEngineReady = useSynthStore((s) => s.setEngineReady);
  const addCoachMessage = useSynthStore((s) => s.addCoachMessage);
  const checkStreak = useUserStore((s) => s.checkStreak);
  const prevParams = useRef<SynthParams>(params);
  const coachTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    checkStreak();
  }, [checkStreak]);

  useEffect(() => {
    const init = async () => {
      const engine = getSynthEngine();
      await engine.init();
      engine.applyParams(params);
      setEngineReady(true);
    };
    init();
  }, [setEngineReady]);

  useEffect(() => {
    if (!useSynthStore.getState().engineReady) return;
    getSynthEngine().applyParams(params);

    const prev = prevParams.current;
    const changed = findChangedParam(prev, params);
    if (changed) {
      clearTimeout(coachTimer.current);
      coachTimer.current = setTimeout(async () => {
        try {
          const res = await fetch('/api/ai/coach', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              paramName: changed.key,
              oldValue: changed.oldVal,
              newValue: changed.newVal,
              synthParams: params,
            }),
          });
          const data = await res.json();
          if (data.feedback && !data.error) {
            addCoachMessage({ id: crypto.randomUUID(), text: data.feedback, timestamp: Date.now() });
          }
        } catch {
          /* coach is optional */
        }
      }, 800);
    }
    prevParams.current = params;
  }, [params, addCoachMessage]);

  return (
    <div className="h-screen flex flex-col">
      <TopNav />
      <div className="flex-1 flex gap-3 p-3 min-h-0 overflow-hidden">
        <LeftPanel />
        <CenterPanel />
        <RightPanel />
      </div>
      <div className="px-3 pb-3 shrink-0">
        <PianoKeyboard />
      </div>
    </div>
  );
}

function findChangedParam(
  prev: SynthParams,
  next: SynthParams,
): { key: string; oldVal: unknown; newVal: unknown } | null {
  const sections = ['oscillator', 'mixer', 'filter', 'envelope', 'lfo', 'effects', 'master'] as const;
  for (const sec of sections) {
    for (const [k, v] of Object.entries(next[sec])) {
      if ((prev[sec] as Record<string, unknown>)[k] !== v) {
        return { key: `${sec}.${k}`, oldVal: (prev[sec] as Record<string, unknown>)[k], newVal: v };
      }
    }
  }
  return null;
}

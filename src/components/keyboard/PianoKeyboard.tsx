'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { cn, midiToNote } from '@/lib/utils';
import { FIRST_MIDI, LAST_MIDI } from '@/lib/synth/types';
import { getSynthEngine } from '@/lib/synth/engine';
import { useSynthStore } from '@/lib/store/synth-store';
import { useUserStore } from '@/lib/store/synth-store';

const QWERTY_MAP: Record<string, number> = {
  z: 48, s: 49, x: 50, d: 51, c: 52, v: 53, g: 54, b: 55, h: 56, n: 57, j: 58, m: 59,
  ',': 60, l: 61, '.': 62, ';': 63, '/': 64, q: 72, '2': 73, w: 74, '3': 75, e: 76,
  r: 77, '5': 78, t: 79, '6': 80, y: 81, '7': 82, u: 83, i: 84, '9': 85, o: 86,
  '0': 87, p: 88, '-': 89, '=': 90,
};

const BLACK_OFFSETS = new Set([1, 3, 6, 8, 10]);

export function PianoKeyboard() {
  const activeNotes = useSynthStore((s) => s.activeNotes);
  const sustainPedal = useSynthStore((s) => s.sustainPedal);
  const setActiveNote = useSynthStore((s) => s.setActiveNote);
  const removeActiveNote = useSynthStore((s) => s.removeActiveNote);
  const setSustainPedal = useSynthStore((s) => s.setSustainPedal);
  const engineReady = useSynthStore((s) => s.engineReady);
  const unlockAchievement = useUserStore((s) => s.unlockAchievement);

  const keys = useMemo(() => {
    const arr: { midi: number; isBlack: boolean }[] = [];
    for (let midi = FIRST_MIDI; midi <= LAST_MIDI; midi++) {
      arr.push({ midi, isBlack: BLACK_OFFSETS.has(midi % 12) });
    }
    return arr;
  }, []);

  const noteOn = useCallback(
    (midi: number, velocity = 100) => {
      if (!engineReady) return;
      getSynthEngine().noteOn(midi, velocity);
      setActiveNote(midi, velocity);
      unlockAchievement('first-note');
    },
    [engineReady, setActiveNote, unlockAchievement],
  );

  const noteOff = useCallback(
    (midi: number) => {
      if (!engineReady || sustainPedal) return;
      getSynthEngine().noteOff(midi);
      removeActiveNote(midi);
    },
    [engineReady, sustainPedal, removeActiveNote],
  );

  useEffect(() => {
    const down = new Set<number>();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const midi = QWERTY_MAP[e.key.toLowerCase()];
      if (midi && !down.has(midi)) {
        down.add(midi);
        noteOn(midi, 90);
      }
      if (e.code === 'Space') {
        e.preventDefault();
        setSustainPedal(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const midi = QWERTY_MAP[e.key.toLowerCase()];
      if (midi) {
        down.delete(midi);
        if (!sustainPedal) {
          getSynthEngine().noteOff(midi);
          removeActiveNote(midi);
        }
      }
      if (e.code === 'Space') {
        setSustainPedal(false);
        down.forEach((m) => {
          getSynthEngine().noteOff(m);
          removeActiveNote(m);
        });
        down.clear();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [noteOn, sustainPedal, setSustainPedal, removeActiveNote]);

  useEffect(() => {
    if (!engineReady) return;
    const onMidi = (e: MIDIMessageEvent) => {
      const [status, note, velocity] = e.data ?? [];
      if (!status || note === undefined) return;
      const cmd = status >> 4;
      if (cmd === 9 && velocity > 0) noteOn(note, velocity);
      else if (cmd === 8 || (cmd === 9 && velocity === 0)) noteOff(note);
    };
    navigator.requestMIDIAccess?.().then((access) => {
      access.inputs.forEach((input) => input.addEventListener('midimessage', onMidi));
    });
  }, [engineReady, noteOn, noteOff]);

  return (
    <div className="glass-panel p-3 overflow-x-auto">
      <div className="flex items-end min-w-max h-32 relative px-2">
        {keys.filter((k) => !k.isBlack).map(({ midi }) => {
          const active = activeNotes.has(midi);
          const vel = activeNotes.get(midi) ?? 0;
          return (
            <button
              key={midi}
              type="button"
              className={cn(
                'relative w-5 sm:w-6 h-28 rounded-b-md border border-zinc-700 mx-px transition-all duration-75',
                'bg-gradient-to-b from-zinc-200 to-zinc-400 hover:from-white',
                active && 'key-pressed from-accent-teal to-teal-700 border-accent-teal shadow-glow',
              )}
              style={{ opacity: active ? 0.7 + (vel / 127) * 0.3 : 1 }}
              onMouseDown={() => noteOn(midi)}
              onMouseUp={() => noteOff(midi)}
              onMouseLeave={() => noteOff(midi)}
              onTouchStart={(e) => { e.preventDefault(); noteOn(midi); }}
              onTouchEnd={() => noteOff(midi)}
              aria-label={midiToNote(midi)}
            />
          );
        })}
        <div className="absolute inset-x-0 top-0 h-20 pointer-events-none">
          {keys.filter((k) => k.isBlack).map(({ midi }) => {
            const whiteIndex = keys.filter((k) => !k.isBlack && k.midi < midi).length;
            const active = activeNotes.has(midi);
            return (
              <button
                key={midi}
                type="button"
                style={{ left: `${whiteIndex * 25 - 8}px` }}
                className={cn(
                  'pointer-events-auto absolute w-4 sm:w-5 h-16 rounded-b-md bg-zinc-900 border border-zinc-700 z-10',
                  active && 'bg-accent-orange border-accent-orange shadow-glow-orange',
                )}
                onMouseDown={() => noteOn(midi)}
                onMouseUp={() => noteOff(midi)}
                onTouchStart={(e) => { e.preventDefault(); noteOn(midi); }}
                onTouchEnd={() => noteOff(midi)}
                aria-label={midiToNote(midi)}
              />
            );
          })}
        </div>
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-zinc-600 px-1">
        <span>QWERTY + Z row · MIDI · Mouse · Touch</span>
        <button
          type="button"
          onClick={() => setSustainPedal(!sustainPedal)}
          className={cn('px-2 py-0.5 rounded', sustainPedal ? 'bg-accent-orange/30 text-accent-orange' : 'hover:bg-zinc-800')}
        >
          Sustain {sustainPedal ? 'ON' : 'OFF'}
        </button>
      </div>
    </div>
  );
}

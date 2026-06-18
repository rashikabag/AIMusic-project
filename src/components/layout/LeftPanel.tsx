'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2 } from 'lucide-react';
import { useSynthStore } from '@/lib/store/synth-store';
import { useUserStore } from '@/lib/store/synth-store';
import { PARAMETER_HELP } from '@/lib/synth/helpers';
import { LESSONS, LEARNING_PATH, CHALLENGES } from '@/lib/lessons/data';
import { scoreChallengeMatch } from '@/lib/synth/helpers';
import { Button } from '@/components/ui/button';
import type { Lesson } from '@/lib/synth/types';

export function LeftPanel() {
  const section = useSynthStore((s) => s.activeSection);
  const chatMessages = useSynthStore((s) => s.chatMessages);
  const coachMessages = useSynthStore((s) => s.coachMessages);
  const hoveredParam = useSynthStore((s) => s.hoveredParam);
  const params = useSynthStore((s) => s.params);
  const addChatMessage = useSynthStore((s) => s.addChatMessage);
  const completedLessons = useUserStore((s) => s.completedLessons);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [lessonStep, setLessonStep] = useState(0);
  const [challengeId, setChallengeId] = useState<string | null>(null);

  const help = hoveredParam ? PARAMETER_HELP[hoveredParam] ?? PARAMETER_HELP.cutoff : null;

  const sendChat = async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    addChatMessage({ id: crypto.randomUUID(), role: 'user', content: msg, timestamp: Date.now() });
    setLoading(true);
    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, synthParams: params }),
      });
      const data = await res.json();
      addChatMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.error ?? data.reply,
        timestamp: Date.now(),
      });
    } catch {
      addChatMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Could not reach AI tutor. Check GROQ_API_KEY in .env.local',
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  const challenge = CHALLENGES.find((c) => c.id === challengeId);
  const scores = challenge ? scoreChallengeMatch(params, challenge.target, challenge.weights) : null;

  return (
    <aside className="glass-panel flex flex-col h-full overflow-hidden w-full lg:w-72 xl:w-80 shrink-0">
      {(section === 'tutor' || section === 'playground') && (
        <>
          <div className="p-3 border-b border-zinc-800">
            <h2 className="font-display text-sm font-semibold text-accent-teal">AI Tutor</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {chatMessages.map((m) => (
              <div
                key={m.id}
                className={`text-xs leading-relaxed p-2.5 rounded-xl ${
                  m.role === 'user' ? 'bg-accent-teal/10 text-zinc-200 ml-4' : 'bg-zinc-800/60 text-zinc-300 mr-2'
                }`}
              >
                {m.content}
              </div>
            ))}
            {coachMessages.slice(-3).map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-[11px] p-2 rounded-lg bg-accent-orange/10 text-accent-orange border border-accent-orange/20"
              >
                🎛 {m.text}
              </motion.div>
            ))}
          </div>
          <div className="p-3 border-t border-zinc-800 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendChat()}
              placeholder="Why does this sound dull?"
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs outline-none focus:border-accent-teal"
            />
            <Button size="sm" variant="accent" onClick={sendChat} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </>
      )}

      {section === 'lessons' && (
        <div className="p-3 overflow-y-auto flex-1 space-y-3">
          <h2 className="font-display text-sm font-semibold text-accent-orange">Learning Path</h2>
          <div className="space-y-1">
            {LEARNING_PATH.map((step, i) => (
              <div key={step} className="flex items-center gap-2 text-[11px] text-zinc-500">
                <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px]">{i + 1}</span>
                {step}
              </div>
            ))}
          </div>
          <hr className="border-zinc-800" />
          {!activeLesson ? (
            LESSONS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => { setActiveLesson(l); setLessonStep(0); }}
                className="w-full text-left p-3 rounded-xl bg-zinc-800/40 hover:bg-zinc-800 border border-zinc-700/50 transition-all"
              >
                <div className="text-sm font-medium">{l.title}</div>
                <div className="text-[10px] text-zinc-500 mt-1">{l.description}</div>
                {completedLessons.includes(l.id) && <span className="text-accent-teal text-[10px]">✓ Complete</span>}
              </button>
            ))
          ) : (
            <LessonRunner
              lesson={activeLesson}
              step={lessonStep}
              onBack={() => setActiveLesson(null)}
              onAdvance={() => setLessonStep((s) => s + 1)}
            />
          )}
        </div>
      )}

      {section === 'presets' && (
        <div className="p-3 text-xs text-zinc-500">Use the Presets panel in the center to browse and generate AI presets.</div>
      )}

      {section === 'ear-training' && (
        <div className="p-3 text-xs text-zinc-500">Ear training module is in the center panel when this tab is active.</div>
      )}

      {section === 'settings' && (
        <div className="p-3 text-xs text-zinc-400 space-y-2">
          <p>Add <code className="text-accent-teal">GROQ_API_KEY</code> to .env.local</p>
          <p>Get a free key at console.groq.com</p>
        </div>
      )}

      {help && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="m-3 p-3 rounded-xl bg-accent-blue/10 border border-accent-blue/20 text-[11px] space-y-1"
          >
            <strong className="text-accent-blue">{help.title}</strong>
            <p className="text-zinc-400">{help.definition}</p>
            <p className="text-zinc-500 italic">{help.analogy}</p>
          </motion.div>
        </AnimatePresence>
      )}

      {section === 'playground' && (
        <div className="p-3 border-t border-zinc-800">
          <h3 className="text-xs font-semibold text-zinc-400 mb-2">Challenge Mode</h3>
          <select
            value={challengeId ?? ''}
            onChange={(e) => setChallengeId(e.target.value || null)}
            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-2 py-1.5 text-xs mb-2"
          >
            <option value="">Select challenge...</option>
            {CHALLENGES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {scores && (
            <div className="grid grid-cols-2 gap-1 text-[10px]">
              <span>Osc: {scores.oscillator}%</span>
              <span>Filt: {scores.filter}%</span>
              <span>Env: {scores.envelope}%</span>
              <span>Fx: {scores.effects}%</span>
              <span className="col-span-2 text-accent-teal font-bold">Overall: {scores.overall}%</span>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}

function LessonRunner({
  lesson,
  step,
  onBack,
  onAdvance,
}: {
  lesson: Lesson;
  step: number;
  onBack: () => void;
  onAdvance: () => void;
}) {
  const params = useSynthStore((s) => s.params);
  const completeLesson = useUserStore((s) => s.completeLesson);
  const unlockAchievement = useUserStore((s) => s.unlockAchievement);
  const current = lesson.steps[step];
  const done = current && current.validate(params);

  if (!current) {
    return (
      <div className="text-center space-y-2">
        <p className="text-accent-teal font-semibold">🎉 Lesson Complete!</p>
        <Button size="sm" onClick={onBack}>Back to lessons</Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button type="button" onClick={onBack} className="text-[10px] text-zinc-500 hover:text-zinc-300">← Back</button>
      <h3 className="font-display text-sm">{lesson.title}</h3>
      <p className={`text-xs p-2 rounded-lg border ${done ? 'border-accent-teal/50 bg-accent-teal/10 text-accent-teal' : 'border-zinc-700 text-zinc-400'}`}>
        {done ? '✓ ' : '→ '}{current.instruction}
      </p>
      <p className="text-[10px] text-zinc-600">{current.hint}</p>
      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-[11px] text-accent-orange italic mb-2">{current.theory}</p>
          <Button
            size="sm"
            variant="accent"
            onClick={() => {
              if (step + 1 >= lesson.steps.length) {
                completeLesson(lesson.id, lesson.xp);
                if (lesson.id === 'build-bass') unlockAchievement('bass-builder');
                unlockAchievement('first-lesson');
              }
              onAdvance();
            }}
          >
            {step + 1 >= lesson.steps.length ? 'Finish' : 'Next Step'}
          </Button>
        </motion.div>
      )}
    </div>
  );
}

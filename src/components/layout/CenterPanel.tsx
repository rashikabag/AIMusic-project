'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Sparkles, Loader2 } from 'lucide-react';
import { FACTORY_PRESETS } from '@/lib/lessons/data';
import { useSynthStore } from '@/lib/store/synth-store';
import { useUserStore } from '@/lib/store/synth-store';
import { Button } from '@/components/ui/button';
import { SynthPanel } from '@/components/synth/SynthPanel';
import { EarTrainingPanel } from '@/components/features/EarTrainingPanel';

export function CenterPanel() {
  const section = useSynthStore((s) => s.activeSection);
  const loadPreset = useSynthStore((s) => s.loadPreset);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchLoading, setMatchLoading] = useState(false);
  const unlockAchievement = useUserStore((s) => s.unlockAchievement);
  const achievements = useUserStore((s) => s.achievements);

  const generatePreset = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/ai/preset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (data.params) {
        loadPreset(data.params);
        unlockAchievement('preset-pro');
      }
    } finally {
      setLoading(false);
    }
  };

  const soundMatch = async (file: File) => {
    setMatchLoading(true);
    try {
      const fd = new FormData();
      fd.append('audio', file);
      fd.append('description', `Uploaded sample: ${file.name}`);
      const res = await fetch('/api/ai/sound-match', { method: 'POST', body: fd });
      const data = await res.json();
      if (data.params) loadPreset(data.params);
    } finally {
      setMatchLoading(false);
    }
  };

  if (section === 'ear-training') {
    return (
      <main className="flex-1 min-w-0 overflow-hidden">
        <EarTrainingPanel />
      </main>
    );
  }

  return (
    <main className="flex-1 min-w-0 flex flex-col gap-3 overflow-hidden">
      {(section === 'presets' || section === 'tutor') && (
        <div className="glass-panel p-4 space-y-3 shrink-0">
          <h2 className="font-display text-sm font-semibold text-accent-orange flex items-center gap-2">
            <Sparkles className="w-4 h-4" /> AI Preset Generator
          </h2>
          <div className="flex gap-2">
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Make an 80s synth lead..."
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm outline-none focus:border-accent-orange"
            />
            <Button variant="accent" onClick={generatePreset} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {['80s synth lead', 'cyberpunk bass', 'dreamy ambient pad'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPrompt(p)}
                className="text-[10px] px-2 py-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-accent-orange"
              >
                {p}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-zinc-800">
            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer hover:text-accent-teal">
              <Upload className="w-4 h-4" />
              {matchLoading ? 'Analyzing...' : 'Sound Match — upload sample'}
              <input
                type="file"
                accept="audio/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && soundMatch(e.target.files[0])}
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {FACTORY_PRESETS.map((p) => (
              <button
                key={p.name}
                type="button"
                onClick={() => loadPreset(p.params)}
                className="px-3 py-1.5 rounded-xl text-xs bg-zinc-800/60 border border-zinc-700 hover:border-accent-teal transition-all"
              >
                {p.name} <span className="text-zinc-600">· {p.tag}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {section === 'settings' && (
        <div className="glass-panel p-6 space-y-4">
          <h2 className="font-display text-lg font-semibold">Achievements</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {achievements.map((a) => (
              <motion.div
                key={a.id}
                className={`p-3 rounded-xl border text-center ${a.unlocked ? 'border-accent-teal/40 bg-accent-teal/5' : 'border-zinc-800 opacity-40'}`}
                whileHover={{ scale: 1.02 }}
              >
                <div className="text-2xl">{a.icon}</div>
                <div className="text-xs font-medium mt-1">{a.title}</div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 overflow-hidden">
        <SynthPanel />
      </div>
    </main>
  );
}

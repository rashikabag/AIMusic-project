'use client';

import { motion } from 'framer-motion';
import {
  BookOpen, Ear, FlaskConical, MessageSquare, Music2, Settings, Sparkles, Wrench,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NavSection } from '@/lib/synth/types';
import { useSynthStore } from '@/lib/store/synth-store';
import { useUserStore } from '@/lib/store/synth-store';

const NAV: { id: NavSection; label: string; icon: React.ElementType }[] = [
  { id: 'tutor', label: 'AI Tutor', icon: MessageSquare },
  { id: 'lessons', label: 'Lessons', icon: BookOpen },
  { id: 'presets', label: 'Presets', icon: Sparkles },
  { id: 'playground', label: 'Playground', icon: Wrench },
  { id: 'ear-training', label: 'Ear Training', icon: Ear },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function TopNav() {
  const active = useSynthStore((s) => s.activeSection);
  const setActive = useSynthStore((s) => s.setActiveSection);
  const level = useUserStore((s) => s.level);
  const xp = useUserStore((s) => s.xp);
  const streak = useUserStore((s) => s.streak);

  return (
    <header className="glass border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between gap-4 shrink-0">
      <div className="flex items-center gap-3">
        <motion.div
          className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-orange via-accent-teal to-accent-blue flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
        >
          <Music2 className="w-5 h-5 text-white" />
        </motion.div>
        <div>
          <h1 className="font-display font-bold text-lg tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            AI Synth Tutor
          </h1>
          <p className="text-[10px] text-zinc-500">Interactive synthesis learning · Groq AI</p>
        </div>
      </div>

      <nav className="hidden lg:flex items-center gap-1">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setActive(id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all',
              active === id
                ? 'bg-accent-teal/15 text-accent-teal border border-accent-teal/30 shadow-glow'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50',
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </nav>

      <div className="flex items-center gap-3 text-xs">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <FlaskConical className="w-3.5 h-3.5 text-accent-orange" />
          <span className="text-zinc-400">Lv.{level}</span>
          <span className="text-accent-teal">{xp} XP</span>
        </div>
        {streak > 0 && (
          <span className="text-accent-orange font-medium">🔥 {streak}d</span>
        )}
      </div>
    </header>
  );
}

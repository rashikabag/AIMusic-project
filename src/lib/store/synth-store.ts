'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Achievement,
  ChatMessage,
  CoachMessage,
  NavSection,
  SynthParams,
} from '@/lib/synth/types';
import { DEFAULT_SYNTH_PARAMS } from '@/lib/synth/types';

interface SynthStore {
  params: SynthParams;
  activeNotes: Map<number, number>;
  sustainPedal: boolean;
  engineReady: boolean;
  activeSection: NavSection;
  chatMessages: ChatMessage[];
  coachMessages: CoachMessage[];
  hoveredParam: string | null;
  setParams: (partial: Partial<SynthParams> | ((p: SynthParams) => SynthParams)) => void;
  updateOscillator: (partial: Partial<SynthParams['oscillator']>) => void;
  updateMixer: (partial: Partial<SynthParams['mixer']>) => void;
  updateFilter: (partial: Partial<SynthParams['filter']>) => void;
  updateEnvelope: (partial: Partial<SynthParams['envelope']>) => void;
  updateLfo: (partial: Partial<SynthParams['lfo']>) => void;
  updateEffects: (partial: Partial<SynthParams['effects']>) => void;
  updateMaster: (partial: Partial<SynthParams['master']>) => void;
  setActiveNote: (midi: number, velocity: number) => void;
  removeActiveNote: (midi: number) => void;
  clearActiveNotes: () => void;
  setSustainPedal: (on: boolean) => void;
  setEngineReady: (ready: boolean) => void;
  setActiveSection: (section: NavSection) => void;
  addChatMessage: (msg: ChatMessage) => void;
  addCoachMessage: (msg: CoachMessage) => void;
  setHoveredParam: (key: string | null) => void;
  loadPreset: (params: SynthParams) => void;
}

export const useSynthStore = create<SynthStore>((set) => ({
  params: DEFAULT_SYNTH_PARAMS,
  activeNotes: new Map(),
  sustainPedal: false,
  engineReady: false,
  activeSection: 'playground',
  chatMessages: [
    {
      id: 'welcome',
      role: 'assistant',
      content:
        "Welcome to AI Synth Tutor! I'm your production coach. Ask me anything about your current patch — I'll reference your exact knob settings.",
      timestamp: Date.now(),
    },
  ],
  coachMessages: [],
  hoveredParam: null,
  setParams: (partial) =>
    set((s) => ({
      params: typeof partial === 'function' ? partial(s.params) : { ...s.params, ...partial },
    })),
  updateOscillator: (partial) =>
    set((s) => ({ params: { ...s.params, oscillator: { ...s.params.oscillator, ...partial } } })),
  updateMixer: (partial) =>
    set((s) => ({ params: { ...s.params, mixer: { ...s.params.mixer, ...partial } } })),
  updateFilter: (partial) =>
    set((s) => ({ params: { ...s.params, filter: { ...s.params.filter, ...partial } } })),
  updateEnvelope: (partial) =>
    set((s) => ({ params: { ...s.params, envelope: { ...s.params.envelope, ...partial } } })),
  updateLfo: (partial) =>
    set((s) => ({ params: { ...s.params, lfo: { ...s.params.lfo, ...partial } } })),
  updateEffects: (partial) =>
    set((s) => ({ params: { ...s.params, effects: { ...s.params.effects, ...partial } } })),
  updateMaster: (partial) =>
    set((s) => ({ params: { ...s.params, master: { ...s.params.master, ...partial } } })),
  setActiveNote: (midi, velocity) =>
    set((s) => {
      const next = new Map(s.activeNotes);
      next.set(midi, velocity);
      return { activeNotes: next };
    }),
  removeActiveNote: (midi) =>
    set((s) => {
      const next = new Map(s.activeNotes);
      next.delete(midi);
      return { activeNotes: next };
    }),
  clearActiveNotes: () => set({ activeNotes: new Map() }),
  setSustainPedal: (on) => set({ sustainPedal: on }),
  setEngineReady: (ready) => set({ engineReady: ready }),
  setActiveSection: (section) => set({ activeSection: section }),
  addChatMessage: (msg) => set((s) => ({ chatMessages: [...s.chatMessages, msg] })),
  addCoachMessage: (msg) =>
    set((s) => ({ coachMessages: [...s.coachMessages.slice(-8), msg] })),
  setHoveredParam: (key) => set({ hoveredParam: key }),
  loadPreset: (params) => set({ params }),
}));

interface UserStore {
  xp: number;
  level: number;
  streak: number;
  lastVisit: string | null;
  completedLessons: string[];
  achievements: Achievement[];
  earTrainingScore: { correct: number; total: number };
  addXp: (amount: number) => void;
  completeLesson: (id: string, xp: number) => void;
  recordEarTraining: (correct: boolean) => void;
  unlockAchievement: (id: string) => void;
  checkStreak: () => void;
}

const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  { id: 'first-note', title: 'First Key', description: 'Play your first note', icon: '🎹', unlocked: false },
  { id: 'first-lesson', title: 'Student', description: 'Complete a lesson', icon: '📚', unlocked: false },
  { id: 'bass-builder', title: 'Bass Builder', description: 'Complete Build a Bass lesson', icon: '🔊', unlocked: false },
  { id: 'ear-trained', title: 'Golden Ear', description: '80% ear training accuracy', icon: '👂', unlocked: false },
  { id: 'preset-pro', title: 'Preset Pro', description: 'Generate an AI preset', icon: '✨', unlocked: false },
  { id: 'challenge-ace', title: 'Challenge Ace', description: 'Score 90+ on a challenge', icon: '🏆', unlocked: false },
];

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      xp: 0,
      level: 1,
      streak: 0,
      lastVisit: null,
      completedLessons: [],
      achievements: DEFAULT_ACHIEVEMENTS,
      earTrainingScore: { correct: 0, total: 0 },
      addXp: (amount) =>
        set((s) => {
          const xp = s.xp + amount;
          return { xp, level: Math.floor(xp / 500) + 1 };
        }),
      completeLesson: (id, xp) =>
        set((s) => {
          if (s.completedLessons.includes(id)) return s;
          return {
            completedLessons: [...s.completedLessons, id],
            xp: s.xp + xp,
            level: Math.floor((s.xp + xp) / 500) + 1,
          };
        }),
      recordEarTraining: (correct) =>
        set((s) => {
          const earTrainingScore = {
            correct: s.earTrainingScore.correct + (correct ? 1 : 0),
            total: s.earTrainingScore.total + 1,
          };
          const accuracy =
            earTrainingScore.total > 0 ? earTrainingScore.correct / earTrainingScore.total : 0;
          const achievements = s.achievements.map((a) =>
            a.id === 'ear-trained' && accuracy >= 0.8 && earTrainingScore.total >= 5
              ? { ...a, unlocked: true }
              : a,
          );
          return { earTrainingScore, achievements };
        }),
      unlockAchievement: (id) =>
        set((s) => ({
          achievements: s.achievements.map((a) => (a.id === id ? { ...a, unlocked: true } : a)),
        })),
      checkStreak: () => {
        const today = new Date().toISOString().slice(0, 10);
        const { lastVisit, streak } = get();
        if (lastVisit === today) return;
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        set({
          lastVisit: today,
          streak: lastVisit === yesterday ? streak + 1 : 1,
        });
      },
    }),
    { name: 'ai-synth-tutor-user' },
  ),
);

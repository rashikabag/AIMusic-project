# AI Synth Tutor

Premium interactive synthesizer learning platform with a virtual subtractive synth, real-time visualizations, and **Groq AI** tutoring.

## Stack

- **Next.js 15** (App Router) — frontend + API routes
- **TypeScript** · **Tailwind CSS** · **Framer Motion**
- **Tone.js** + Web Audio API
- **Groq** (`llama-3.3-70b-versatile`) for AI tutor, coach, presets, sound matching
- **Zustand** for synth + gamification state

## Quick start

```bash
npm install
cp .env.example .env.local
# Add your free Groq API key from https://console.groq.com
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy free on Vercel

1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) → import repo
3. Add environment variable: `GROQ_API_KEY`
4. Deploy (Next.js auto-detected)

## Features

| Feature | Description |
|---------|-------------|
| **Virtual Synth** | Oscillator, mixer, filter, ADSR, LFO, effects, master |
| **88-key Keyboard** | Mouse, QWERTY, MIDI, touch, sustain pedal |
| **Visualizations** | Oscilloscope, spectrum, ADSR, filter response, LFO |
| **AI Tutor** | Chat with Groq — answers use your live synth settings |
| **Live Coach** | Real-time feedback as you tweak parameters |
| **Lessons** | Step-by-step validated challenges (Build a Bass, etc.) |
| **Challenge Mode** | Recreate target sounds, scored by AI logic |
| **Preset Generator** | Natural language → full synth patch via Groq |
| **Sound Match** | Upload audio → estimated preset |
| **Ear Training** | Waveform / filter / envelope quizzes |
| **Gamification** | XP, levels, streaks, achievements |

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes (for AI) | Free at [console.groq.com](https://console.groq.com) |

## Project structure

```
src/
  app/           Next.js pages + API routes (/api/ai/*)
  components/    UI, synth, keyboard, visualizations
  lib/           Synth engine, Groq client, lessons, stores
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Production server |

# WaveCraft DAW — Synth Evolution Edition

100% local interactive Micro-DAW and synthesis sandbox (TypeScript).

## Stack

- **Frontend:** Vite + TypeScript + Web Audio API (`client/`)
- **Backend:** Express (local dev) + Vercel Serverless Functions (production)
- **AI loops:** Local Ollama when self-hosted; smart fallback on Vercel free tier

## Quick start (local)

```bash
npm install
npm run dev
```

- **UI:** http://127.0.0.1:5173
- **API:** http://127.0.0.1:8000

## Deploy free on Vercel

### 1. Push this repo to GitHub

Already at [github.com/rashikabag/AIMusic-project](https://github.com/rashikabag/AIMusic-project).

### 2. Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Click **Import** next to `AIMusic-project`.
3. Vercel reads `vercel.json` automatically:
   - **Build command:** `npm run build:vercel`
   - **Output directory:** `dist/client`
4. Click **Deploy** (Hobby plan is free).

Your app will be live at `https://your-project.vercel.app`.

### What works on Vercel (free)

| Feature | Vercel | Local `npm run dev` |
|---------|--------|---------------------|
| Micro-DAW + Web Audio | ✅ Browser-only | ✅ |
| Museum + presets | ✅ `/api/historical-presets` | ✅ |
| Preset Builder Game | ✅ | ✅ |
| AI loop generator | ✅ Fallback patterns | ✅ Ollama + fallback |

**Important:** Vercel cannot run Ollama (no local GPU/process). The AI drawer uses built-in genre-aware fallback patterns on Vercel — still free, no API keys.

### Optional: remote Ollama

If you host Ollama elsewhere (e.g. a VPS or [Ollama cloud tunnel](https://ollama.com)), add a Vercel env var:

| Variable | Example |
|----------|---------|
| `OLLAMA_BASE_URL` | `https://your-ollama-host.example.com` |

Project → **Settings** → **Environment Variables** → redeploy.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Local API + Vite dev server |
| `npm run build:vercel` | Build static frontend for Vercel |
| `npm run build` | Full local production build |
| `npm start` | Local Express production server |

## Project layout

```
client/          Vite frontend (TypeScript)
server/          Shared logic (presets, Ollama client)
api/             Vercel serverless routes
vercel.json      Vercel build + API rewrites
```

## Optional: Ollama (local only)

```bash
ollama pull llama3.1
```

Then run `npm run dev` — `/generate-loop` calls your local Ollama at `127.0.0.1:11434`.

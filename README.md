# WaveCraft DAW — Synth Evolution Edition

100% local, air-gapped interactive Micro-DAW and synthesis sandbox (TypeScript).

## Stack

- **Frontend:** Vite + TypeScript + Web Audio API (`client/`)
- **Backend:** Express + TypeScript + local Ollama (`server/`)

## Quick start

```bash
npm install
npm run dev
```

- **UI:** http://127.0.0.1:5173
- **API:** http://127.0.0.1:8000

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start API + Vite dev server |
| `npm run dev:server` | Express API only (:8000) |
| `npm run dev:client` | Vite frontend only (:5173) |
| `npm run build` | Build client + compile server |
| `npm start` | Production server (serves built client) |

## Optional: Ollama

For AI loop generation via the prompt drawer:

```bash
ollama pull llama3.1
```

If Ollama is offline, the API uses a deterministic local fallback pattern.

## Project layout

```
client/          Vite frontend (TypeScript)
server/          Express API + historical presets JSON
server/data/     Static preset corpus
```

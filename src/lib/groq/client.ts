import Groq from 'groq-sdk';
import type { SynthParams } from '../synth/types';
import { formatSynthContext } from '../synth/helpers';

const MODEL = 'llama-3.3-70b-versatile';

function getClient(): Groq {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY is not configured');
  return new Groq({ apiKey });
}

export async function groqChat(
  systemPrompt: string,
  userMessage: string,
  synthParams?: SynthParams,
): Promise<string> {
  const client = getClient();
  const contextBlock = synthParams
    ? `\n\nCurrent synth settings:\n${formatSynthContext(synthParams)}`
    : '';

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      { role: 'system', content: systemPrompt + contextBlock },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.7,
    max_tokens: 800,
  });

  return completion.choices[0]?.message?.content ?? 'No response generated.';
}

export async function groqJson<T>(
  systemPrompt: string,
  userMessage: string,
  synthParams?: SynthParams,
): Promise<T> {
  const client = getClient();
  const contextBlock = synthParams
    ? `\n\nCurrent synth settings:\n${formatSynthContext(synthParams)}`
    : '';

  const completion = await client.chat.completions.create({
    model: MODEL,
    messages: [
      {
        role: 'system',
        content:
          systemPrompt +
          contextBlock +
          '\nRespond with valid JSON only. No markdown fences.',
      },
      { role: 'user', content: userMessage },
    ],
    temperature: 0.4,
    max_tokens: 2000,
    response_format: { type: 'json_object' },
  });

  const raw = completion.choices[0]?.message?.content ?? '{}';
  return JSON.parse(raw) as T;
}

export const TUTOR_SYSTEM = `You are an expert synthesizer tutor and music producer inside "AI Synth Tutor".
Explain concepts clearly for beginners while referencing the user's ACTUAL current synth parameter values.
Be concise (2-4 paragraphs max), encouraging, and practical. Use analogies when helpful.
When suggesting changes, name specific parameters and direction (increase/decrease).`;

export const COACH_SYSTEM = `You are a real-time synth sound design coach. Given a parameter change, explain in ONE short sentence
what sonic effect it will have. Be specific and educational. Max 25 words.`;

export const PRESET_SYSTEM = `You are a synthesizer preset designer. Given a natural language prompt, output a complete SynthParams JSON object
matching this schema:
{
  "oscillator": { "waveform": "sine|triangle|sawtooth|square|noise", "octave": -2 to 2, "fineTune": -100 to 100, "unison": 1-8, "voices": 1-8, "detune": 0-50, "stereoWidth": 0-1 },
  "mixer": { "oscVolume": 0-1, "noiseVolume": 0-1, "subOsc": 0-1 },
  "filter": { "type": "lowpass|highpass|bandpass|notch", "cutoff": 80-15000, "resonance": 0-15, "drive": 0-1, "keyTracking": 0-1 },
  "envelope": { "attack": 0.001-3, "decay": 0.01-3, "sustain": 0-1, "release": 0.01-5 },
  "lfo": { "rate": 0.1-20, "depth": 0-1, "shape": "sine|triangle|square|sawtooth", "destination": "filter|pitch|amplitude|pan" },
  "effects": { "delay": 0-1, "reverb": 0-1, "chorus": 0-1, "distortion": 0-1, "compressor": 0-1, "eqLow": -12 to 12, "eqMid": -12 to 12, "eqHigh": -12 to 12 },
  "master": { "volume": 0-1, "glide": 0-1, "polyMode": true|false }
}`;

export const SOUND_MATCH_SYSTEM = `You are an audio analysis assistant. Given a description of an uploaded audio sample,
estimate the closest synthesizer settings as SynthParams JSON (same schema as preset generator).
Also include "confidence": 0-100 and "analysis": "brief description".`;

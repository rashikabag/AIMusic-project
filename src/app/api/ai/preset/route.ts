import { NextRequest, NextResponse } from 'next/server';
import { groqJson, PRESET_SYSTEM } from '@/lib/groq/client';
import type { SynthParams } from '@/lib/synth/types';
import { DEFAULT_SYNTH_PARAMS } from '@/lib/synth/types';

export async function POST(req: NextRequest) {
  try {
    const { prompt } = (await req.json()) as { prompt: string };
    if (!prompt?.trim()) {
      return NextResponse.json({ error: 'Prompt required' }, { status: 400 });
    }
    const result = await groqJson<{ params: SynthParams; name: string; description: string }>(
      PRESET_SYSTEM,
      `Create a synth preset for: "${prompt}". Return JSON: { "name": "...", "description": "...", "params": { ...full SynthParams } }`,
    );
    return NextResponse.json({
      name: result.name ?? 'AI Preset',
      description: result.description ?? prompt,
      params: { ...DEFAULT_SYNTH_PARAMS, ...result.params },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Preset generation failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { groqJson, SOUND_MATCH_SYSTEM } from '@/lib/groq/client';
import type { SynthParams } from '@/lib/synth/types';
import { DEFAULT_SYNTH_PARAMS } from '@/lib/synth/types';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('audio') as File | null;
    const description = (formData.get('description') as string) || '';

    let analysisPrompt = description;
    if (file) {
      analysisPrompt += `\nUploaded file: ${file.name}, type: ${file.type}, size: ${file.size} bytes.`;
      analysisPrompt +=
        ' Based on typical characteristics of this filename/type, estimate synth settings.';
    }

    if (!analysisPrompt.trim()) {
      return NextResponse.json({ error: 'Audio file or description required' }, { status: 400 });
    }

    const result = await groqJson<{
      params: SynthParams;
      confidence: number;
      analysis: string;
    }>(SOUND_MATCH_SYSTEM, analysisPrompt);

    return NextResponse.json({
      params: { ...DEFAULT_SYNTH_PARAMS, ...result.params },
      confidence: result.confidence ?? 70,
      analysis: result.analysis ?? 'Estimated patch from audio characteristics.',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Sound match failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

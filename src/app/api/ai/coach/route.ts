import { NextRequest, NextResponse } from 'next/server';
import { COACH_SYSTEM, groqChat } from '@/lib/groq/client';
import type { SynthParams } from '@/lib/synth/types';

export async function POST(req: NextRequest) {
  try {
    const { paramName, oldValue, newValue, synthParams } = (await req.json()) as {
      paramName: string;
      oldValue: unknown;
      newValue: unknown;
      synthParams: SynthParams;
    };
    const message = `Parameter "${paramName}" changed from ${JSON.stringify(oldValue)} to ${JSON.stringify(newValue)}. Explain the sonic impact.`;
    const feedback = await groqChat(COACH_SYSTEM, message, synthParams);
    return NextResponse.json({ feedback });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Coach request failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

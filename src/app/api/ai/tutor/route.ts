import { NextRequest, NextResponse } from 'next/server';
import { groqChat, TUTOR_SYSTEM } from '@/lib/groq/client';
import type { SynthParams } from '@/lib/synth/types';

export async function POST(req: NextRequest) {
  try {
    const { message, synthParams } = (await req.json()) as {
      message: string;
      synthParams: SynthParams;
    };
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }
    const reply = await groqChat(TUTOR_SYSTEM, message, synthParams);
    return NextResponse.json({ reply });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'AI request failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

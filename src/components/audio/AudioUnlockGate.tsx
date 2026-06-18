'use client';

import { motion } from 'framer-motion';
import { Volume2, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { getSynthEngine } from '@/lib/synth/engine';
import { useSynthStore } from '@/lib/store/synth-store';
import { Button } from '@/components/ui/button';

export function AudioUnlockGate({ children }: { children: React.ReactNode }) {
  const engineReady = useSynthStore((s) => s.engineReady);
  const setEngineReady = useSynthStore((s) => s.setEngineReady);
  const params = useSynthStore((s) => s.params);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const unlock = async () => {
    setLoading(true);
    setError(null);
    try {
      const engine = getSynthEngine();
      await engine.init();
      engine.applyParams(params);
      await engine.ensureRunning();
      // Audible confirmation blip so user knows audio works
      engine.noteOn(60, 80);
      setTimeout(() => engine.noteOff(60), 120);
      setEngineReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not start audio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {children}
      {!engineReady && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
        >
          <div className="glass-panel p-8 max-w-md mx-4 text-center space-y-4">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-accent-orange via-accent-teal to-accent-blue flex items-center justify-center">
              <Volume2 className="w-7 h-7 text-white" />
            </div>
            <h2 className="font-display text-xl font-bold">Enable Audio Engine</h2>
            <p className="text-sm text-zinc-400">
              Browsers require a tap or click before playing sound. This is required on Vercel and all
              deployed sites — not a bug in your synth.
            </p>
            <Button variant="accent" size="lg" onClick={unlock} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2 inline" />
                  Starting…
                </>
              ) : (
                '▶ Start Audio & Synth'
              )}
            </Button>
            {error && <p className="text-xs text-red-400">{error}</p>}
          </div>
        </motion.div>
      )}
    </>
  );
}

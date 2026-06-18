'use client';

import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

interface ParamSliderProps {
  label: string;
  paramKey: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
  onHover?: (key: string | null) => void;
}

export function ParamSlider({
  label,
  paramKey,
  value,
  min,
  max,
  step = 0.01,
  unit = '',
  onChange,
  onHover,
}: ParamSliderProps) {
  return (
    <div
      className="space-y-1.5 group"
      onMouseEnter={() => onHover?.(paramKey)}
      onMouseLeave={() => onHover?.(null)}
    >
      <div className="flex justify-between text-[11px]">
        <span className="text-zinc-400 group-hover:text-accent-teal transition-colors">{label}</span>
        <span className="text-zinc-500 font-mono">
          {value < 1 && value > 0 ? value.toFixed(2) : Math.round(value * 100) / 100}
          {unit}
        </span>
      </div>
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center"
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => onChange(v)}
      >
        <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-zinc-800">
          <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-accent-teal to-accent-blue rounded-full" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-3.5 w-3.5 rounded-full border-2 border-accent-teal bg-zinc-900 shadow-glow focus:outline-none hover:scale-110 transition-transform" />
      </SliderPrimitive.Root>
    </div>
  );
}

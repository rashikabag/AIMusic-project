'use client';

import { cn } from '@/lib/utils';

interface SectionProps {
  title: string;
  accent?: 'orange' | 'teal' | 'blue';
  children: React.ReactNode;
  className?: string;
}

export function SynthSection({ title, accent = 'teal', children, className }: SectionProps) {
  const accentClass = {
    orange: 'text-accent-orange border-accent-orange/30',
    teal: 'text-accent-teal border-accent-teal/30',
    blue: 'text-accent-blue border-accent-blue/30',
  }[accent];

  return (
    <div className={cn('glass-panel p-4 space-y-3', className)}>
      <h3 className={cn('font-display text-xs font-semibold uppercase tracking-widest border-b pb-2', accentClass)}>
        {title}
      </h3>
      {children}
    </div>
  );
}

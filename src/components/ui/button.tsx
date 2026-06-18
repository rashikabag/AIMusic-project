import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'accent' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'md', ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center rounded-xl font-medium transition-all duration-200 disabled:opacity-50',
        variant === 'default' && 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100',
        variant === 'ghost' && 'hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-100',
        variant === 'accent' &&
          'bg-gradient-to-r from-accent-orange via-accent-teal to-accent-blue text-white shadow-glow hover:opacity-90',
        variant === 'outline' && 'border border-zinc-700 hover:border-accent-teal text-zinc-300',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-6 py-3 text-base',
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

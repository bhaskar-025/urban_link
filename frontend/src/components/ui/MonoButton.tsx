import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger';
  fullWidth?: boolean;
}

export const MonoButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', fullWidth, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-semibold text-xs transition-all duration-200 px-5 py-2.5 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]",
          fullWidth && "w-full",
          variant === 'primary' && "bg-[#6032db] text-white hover:bg-[#5024c9] shadow-sm hover:shadow-[#6032db]/25 border border-transparent",
          variant === 'secondary' && "bg-white text-slate-800 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-2xs",
          variant === 'accent' && "bg-[#e8f6fd] text-[#0284c7] hover:bg-[#d5effd] border border-sky-200",
          variant === 'danger' && "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100",
          variant === 'ghost' && "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-transparent",
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);
MonoButton.displayName = 'MonoButton';

import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
}

export const MonoInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, id, ...props }, ref) => {
    const inputId = id || Math.random().toString(36).substring(7);
    return (
      <div className="flex flex-col gap-1.5 w-full font-sans">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2.5 px-3.5 text-xs text-slate-800 placeholder:text-slate-400 focus:border-[#6032db] focus:bg-white focus:ring-4 focus:ring-[#6032db]/10 focus:outline-none transition-all duration-200",
            className
          )}
          {...props}
        />
        {helperText && (
          <span className="text-[10px] text-slate-400 font-medium">{helperText}</span>
        )}
      </div>
    );
  }
);
MonoInput.displayName = 'MonoInput';

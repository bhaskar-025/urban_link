import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  inverted?: boolean;
}

export const MonoCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, inverted, children, ...props }, ref) => {
    return (
      <div 
        ref={ref}
        className={cn(
          "p-6 border border-slate-100 bg-white rounded-2xl transition-all duration-300 shadow-2xs hover:shadow-md",
          inverted && "bg-[#6032db] text-white border-transparent",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
MonoCard.displayName = 'MonoCard';

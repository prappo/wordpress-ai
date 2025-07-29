import { FC } from 'react';
import { cn } from '@/lib/utils';

interface LoadingDotsProps {
  className?: string;
  text?: string;
}

export const LoadingDots: FC<LoadingDotsProps> = ({ className, text = "Thinking..." }) => {
  return (
    <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
      <div className="flex gap-1">
        <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
        <div className="h-2 w-2 animate-bounce rounded-full bg-current" />
      </div>
      <span className="italic">{text}</span>
    </div>
  );
}; 
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface FactorCardProps {
  name: string;
  value: string | number;
  unit?: string;
  status: 'normal' | 'warning' | 'critical';
  description: string;
  className?: string;
}

export function FactorCard({ 
  name, 
  value, 
  unit, 
  status, 
  description,
  className 
}: FactorCardProps) {
  const statusConfig = {
    normal: {
      emoji: '🟢',
      label: 'Normal',
      borderClass: 'border-success/30',
      glowClass: 'hover:glow-success',
      badgeClass: 'bg-success/20 text-success',
    },
    warning: {
      emoji: '🟡',
      label: 'Warning',
      borderClass: 'border-warning/30',
      glowClass: 'hover:glow-warning',
      badgeClass: 'bg-warning/20 text-warning',
    },
    critical: {
      emoji: '🔴',
      label: 'Critical',
      borderClass: 'border-destructive/30',
      glowClass: 'hover:glow-destructive',
      badgeClass: 'bg-destructive/20 text-destructive',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className={cn(
        'relative rounded-lg border bg-card p-4 transition-all duration-300',
        'hover:scale-[1.02] hover:-translate-y-0.5',
        config.borderClass,
        config.glowClass,
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-medium text-muted-foreground truncate">
              {name}
            </h3>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                  <Info className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <p className="text-sm">{description}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-semibold font-mono animate-value-update">
              {value}
            </span>
            {unit && (
              <span className="text-sm text-muted-foreground">{unit}</span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xl" role="img" aria-label={config.label}>
            {config.emoji}
          </span>
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', config.badgeClass)}>
            {config.label}
          </span>
        </div>
      </div>
    </div>
  );
}

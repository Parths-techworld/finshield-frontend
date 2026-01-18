import React from 'react';

interface BiometricGridProps {
  data: {
    typingWPM: number;
    keystrokeInterval: number;
    keystrokeVariance: number;
    backspaceCount: number;
  };
}

export const BiometricGrid: React.FC<BiometricGridProps> = ({ data }) => {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{data.typingWPM}</div>
        <div className="text-sm text-muted-foreground">WPM</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{data.keystrokeInterval}ms</div>
        <div className="text-sm text-muted-foreground">Keystroke Interval</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{data.keystrokeVariance}ms</div>
        <div className="text-sm text-muted-foreground">Variance</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-primary">{data.backspaceCount}</div>
        <div className="text-sm text-muted-foreground">Backspaces</div>
      </div>
    </div>
  );
};
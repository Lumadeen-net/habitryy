import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import { cn } from '../lib/utils';

interface ConfettiEffectProps {
  active: boolean;
  onComplete?: () => void;
  duration?: number;
  width?: number;
  height?: number;
  className?: string;
  numberOfPieces?: number;
  run?: boolean;
}

export const ConfettiEffect: React.FC<ConfettiEffectProps> = ({ 
  active, 
  onComplete, 
  duration = 1500,
  width: propWidth,
  height: propHeight,
  className,
  numberOfPieces = 60,
  run = true
}) => {
  const windowSize = useWindowSize();
  const [recycle, setRecycle] = useState(false);
  
  useEffect(() => {
    if (active) {
      setRecycle(true);
      const stopTimer = setTimeout(() => {
        setRecycle(false);
      }, duration);

      const completeTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, duration + 1000); // Allow time for pieces to fall

      return () => {
        clearTimeout(stopTimer);
        clearTimeout(completeTimer);
      };
    }
  }, [active, duration, onComplete]);

  if (!active && !recycle) return null;

  return (
    <div 
      className={cn(
        "pointer-events-none absolute inset-0 overflow-visible",
        className
      )}
      style={{ zIndex: 50 }}
    >
      <Confetti
        width={propWidth ?? windowSize.width}
        height={propHeight ?? windowSize.height}
        recycle={recycle}
        run={run}
        numberOfPieces={recycle ? numberOfPieces : 0}
        gravity={0.3}
        friction={0.99}
        initialVelocityY={10}
        colors={['#6366f1', '#818cf8', '#4f46e5', '#f43f5e', '#fb7185', '#10b981', '#fbbf24']}
      />
    </div>
  );
};

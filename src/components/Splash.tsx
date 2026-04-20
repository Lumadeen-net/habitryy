import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface SplashProps {
  onFinish: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onFinish }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2500); // 2.5 seconds total display time
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#5B3DF5]">
      {/* Animated Gradient Background */}
      <div 
        className="absolute inset-0 z-0 bg-gradient-to-br from-[#5B3DF5] via-[#6D5CFF] to-[#8B7CFF] animate-gradient-shift"
        style={{ backgroundSize: '200% 200%' }}
      />

      {/* Blurred Background Image */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        <img 
          src="https://picsum.photos/seed/happy/800/1200?blur=10"
          alt=""
          className="absolute -right-20 -bottom-20 w-[80%] h-auto opacity-[0.12] blur-2xl rotate-12 scale-125 pointer-events-none select-none"
          referrerPolicy="no-referrer"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-6">
        {/* Logo Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative mb-8"
        >
          {/* Logo Glow */}
          <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full scale-150 animate-pulse-slow" />
          
          {/* Minimalist Logo SVG */}
          <svg 
            width="80" 
            height="80" 
            viewBox="0 0 100 100" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="drop-shadow-2xl"
          >
            {/* 4-Point Star */}
            <path 
              d="M50 10L58 42L90 50L58 58L50 90L42 58L10 50L42 42L50 10Z" 
              fill="white"
            />
            {/* Small Plus icon (top-right) */}
            <rect x="75" y="20" width="12" height="2" rx="1" fill="white" />
            <rect x="80" y="15" width="2" height="12" rx="1" fill="white" />
            
            {/* Small Circle (bottom-left) */}
            <circle cx="25" cy="75" r="4" fill="white" />
          </svg>
        </motion.div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="space-y-2"
        >
          <h1 className="text-5xl font-black tracking-tighter text-white">
            HABITRY
          </h1>
          <p className="text-white/90 text-sm font-light tracking-[0.2em] uppercase">
            Discipline Made Simple
          </p>
        </motion.div>
      </div>

      {/* Decorative Bottom Line */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/20 rounded-full" />
    </div>
  );
};

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, ArrowRight } from 'lucide-react';
import { Habit } from '../store/useHabitStore';
import { ConfettiEffect } from './ConfettiEffect';

interface CompletionModalProps {
  habit: Habit | null;
  onClose: () => void;
}

const MOTIVATIONAL_MESSAGES = [
  "You've built a powerful new foundation for your future.",
  "Consistency is the hallmark of champions. You nailed it!",
  "A new version of you has been unlocked today.",
  "Small wins every day lead to massive transformations.",
  "You proved to yourself that you can stick to your goals.",
  "This is just the beginning of your incredible journey."
];

export const CompletionModal: React.FC<CompletionModalProps> = ({ habit, onClose }) => {
  const message = React.useMemo(() => 
    MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)],
  []);

  if (!habit) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-6 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-zinc-950/90 backdrop-blur-xl"
        />

        {/* Animated Background Glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none"
        />

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 40 }}
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
          className="relative bg-white dark:bg-zinc-900 w-full max-w-lg rounded-[2.5rem] p-8 md:p-12 text-center shadow-2xl border border-zinc-100 dark:border-zinc-800"
        >
          <div className="absolute -top-12 left-1/2 -translate-x-1/2">
            <motion.div
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 bg-gradient-to-br from-amber-400 to-orange-600 rounded-3xl shadow-2xl flex items-center justify-center"
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>
          </div>

          <div className="mt-8 space-y-6">
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-center gap-2 text-indigo-600 dark:text-indigo-400 font-black uppercase tracking-[0.2em] text-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>Habit Mastered</span>
                <Sparkles className="w-4 h-4" />
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight">
                🎉 You Did It!
              </h2>
            </div>

            <p className="text-zinc-500 dark:text-zinc-400 text-lg font-medium leading-relaxed">
              You've successfully completed <span className="text-zinc-900 dark:text-white font-bold">"{habit.name}"</span> for {habit.duration} days straight.
            </p>

            <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl border border-zinc-100 dark:border-zinc-800 italic text-zinc-600 dark:text-zinc-300 font-medium">
              "{message}"
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-3 text-lg"
            >
              <span>Continue Journey</span>
              <ArrowRight className="w-6 h-6" />
            </motion.button>
          </div>
        </motion.div>

        {/* Confetti burst for completion */}
        <ConfettiEffect active={true} duration={5000} />
      </div>
    </AnimatePresence>
  );
};

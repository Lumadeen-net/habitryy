import React, { useState, useRef } from 'react';
import { Habit, useHabitStore } from '../store/useHabitStore';
import { calculateStreak, getCompletionPercentage, isDayCheckable, getDayDate, getCurrentHabitDay } from '../utils/habitUtils';
import { CheckCircle2, Circle, Flame, Trash2, ChevronRight, Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';
import { ConfettiEffect } from './ConfettiEffect';

interface HabitCardProps {
  habit: Habit;
  onClick: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onClick }) => {
  const deleteHabit = useHabitStore((state) => state.deleteHabit);
  const toggleCheckIn = useHabitStore((state) => state.toggleCheckIn);
  const [showLocalConfetti, setShowLocalConfetti] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  
  const streak = calculateStreak(habit);
  const percentage = getCompletionPercentage(habit);

  // Get real-time current day (1-indexed)
  const currentDay = getCurrentHabitDay(habit);
  const isTodayCheckable = isDayCheckable(habit, currentDay);
  const isTodayCompleted = habit.checkIns.some(c => c.day === currentDay);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this habit?')) {
      deleteHabit(habit.id);
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isTodayCheckable) {
      if (!isTodayCompleted) {
        setShowLocalConfetti(false); // Reset if already showing
        setTimeout(() => setShowLocalConfetti(true), 0);
      }
      toggleCheckIn(habit.id, currentDay);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className="group relative bg-white dark:bg-zinc-900 p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-xl border border-zinc-100 dark:border-zinc-800 transition-all cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={cn(
              "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full",
              habit.type === 'build' 
                ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
            )}>
              {habit.type}
            </span>
            <span className={cn(
              "px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full",
              habit.status === 'completed' 
                ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
            )}>
              {habit.status}
            </span>
            {habit.reminder?.enabled && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded-full text-[10px] font-bold">
                <Bell className="w-3 h-3" />
                <span>{habit.reminder.time}</span>
              </div>
            )}
          </div>
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors line-clamp-1">
            {habit.name}
          </h3>
        </div>
        <button
          onClick={handleDelete}
          className="p-2 md:opacity-0 md:group-hover:opacity-100 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg text-rose-500 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-orange-500">
            <Flame className="w-5 h-5 fill-current" />
            <span className="font-bold text-xl">{streak}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter leading-none">Streak</span>
            <span className="text-xs text-zinc-400 font-medium">Days</span>
          </div>
        </div>
        
        <div className="text-right">
          <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-tighter leading-none mb-1">Progress</span>
          <span className="font-bold text-lg text-white">{percentage}%</span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="w-full h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            className={cn(
              "h-full rounded-full transition-all duration-1000",
              habit.type === 'build' ? "bg-indigo-500" : "bg-rose-500"
            )}
          />
        </div>
        
        <div className="flex justify-between items-center relative" ref={buttonRef}>
          <motion.button
            layout
            initial={false}
            animate={isTodayCompleted ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ 
              duration: 0.4,
              ease: "backOut",
              times: [0, 0.3, 1]
            }}
            whileHover={isTodayCheckable && !isTodayCompleted ? { scale: 1.02, y: -2 } : {}}
            whileTap={isTodayCheckable && !isTodayCompleted ? { scale: 0.98 } : {}}
            onClick={handleToggle}
            disabled={!isTodayCheckable && !isTodayCompleted}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-black transition-all z-10",
              isTodayCompleted
                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none"
                : isTodayCheckable
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300"
                  : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 cursor-not-allowed"
            )}
          >
            {isTodayCompleted ? (
              <>
                <motion.div
                  initial={{ rotate: -180, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </motion.div>
                <span>Completed Today</span>
              </>
            ) : (
              <>
                <Circle className="w-5 h-5 opacity-40 group-hover:opacity-100 transition-opacity" />
                <span>Check-in Day {currentDay}</span>
              </>
            )}
          </motion.button>

          {/* Local Confetti Burst */}
          {buttonRef.current && showLocalConfetti && (
            <div className="absolute inset-0 z-50 pointer-events-none">
              <ConfettiEffect
                active={showLocalConfetti}
                onComplete={() => setShowLocalConfetti(false)}
                duration={1500}
                width={buttonRef.current.offsetWidth}
                height={400} // Increased height for better upward pop
                numberOfPieces={80}
                className="absolute -top-60 left-0 right-0"
              />
            </div>
          )}

          <div className="ml-3 p-2 text-zinc-300 dark:text-zinc-700 group-hover:text-zinc-400 dark:group-hover:text-zinc-500 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

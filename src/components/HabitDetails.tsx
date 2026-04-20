import React from 'react';
import { Habit, useHabitStore } from '../store/useHabitStore';
import { X, CheckCircle2, Circle, Calendar, Info, Flame, Target, Bell, Clock, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { isDayCheckable, getDayDate, calculateStreak, getCompletionPercentage, getCurrentHabitDay } from '../utils/habitUtils';
import { cn } from '../lib/utils';
import { ReminderConfig } from '../store/useHabitStore';
import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

interface HabitDetailsProps {
  habit: Habit | null;
  onClose: () => void;
}

export const HabitDetails: React.FC<HabitDetailsProps> = ({ habit, onClose }) => {
  const toggleCheckIn = useHabitStore((state) => state.toggleCheckIn);
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const [isEditingReminder, setIsEditingReminder] = useState(false);

  if (!habit) return null;

  const handleToggleReminder = () => {
    const isEnabled = habit.reminder?.enabled ?? false;
    updateHabit(habit.id, {
      reminder: isEnabled 
        ? { ...habit.reminder!, enabled: false }
        : { enabled: true, time: '09:00', frequency: 'daily' }
    });
  };

  const streak = calculateStreak(habit);
  const percentage = getCompletionPercentage(habit);

  const days = Array.from({ length: habit.duration }, (_, i) => i + 1);

  return (
    <AnimatePresence>
      {habit && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden max-h-[95vh] md:max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 relative shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 md:top-6 md:right-6 p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-zinc-500" />
              </button>

              <div className="flex items-center gap-3 mb-2">
                <span className={cn(
                  "px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full",
                  habit.type === 'build' 
                    ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
                    : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400"
                )}>
                  {habit.type} Habit
                </span>
                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">
                  Started {getDayDate(habit.startDate, 1)}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white mb-3 md:mb-4 pr-10">
                {habit.name}
              </h2>
              
              {habit.description && (
                <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 shrink-0" />
                  {habit.description}
                </p>
              )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3 md:gap-4 p-4 md:p-8 bg-page-bg/50 dark:bg-zinc-800/50 shrink-0">
              <div className="bg-white dark:bg-zinc-900 p-3 md:p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col items-center text-center">
                <Flame className="w-5 h-5 md:w-6 md:h-6 text-orange-500 mb-1" />
                <span className="text-xl md:text-2xl font-black text-white">{streak}</span>
                <span className="text-[8px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Current Streak</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-3 md:p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col items-center text-center">
                <Target className="w-5 h-5 md:w-6 md:h-6 text-indigo-500 mb-1" />
                <span className="text-xl md:text-2xl font-black text-white">{percentage}%</span>
                <span className="text-[8px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Completion</span>
              </div>
              <div className="bg-white dark:bg-zinc-900 p-3 md:p-4 rounded-2xl shadow-sm border border-zinc-100 dark:border-zinc-800 flex flex-col items-center text-center">
                <Calendar className="w-5 h-5 md:w-6 md:h-6 text-emerald-500 mb-1" />
                <span className="text-xl md:text-2xl font-black text-white">{habit.duration}</span>
                <span className="text-[8px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Day Goal</span>
              </div>
            </div>

            {/* Reminder Section */}
            <div className="px-6 md:px-8 py-4 border-b border-zinc-100 dark:border-zinc-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-xl transition-colors",
                    habit.reminder?.enabled 
                      ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                      : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                  )}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Reminder Settings</h4>
                    <p className="text-[10px] text-zinc-500 font-medium">
                      {habit.reminder?.enabled 
                        ? `${habit.reminder.time} • ${habit.reminder.frequency.charAt(0).toUpperCase() + habit.reminder.frequency.slice(1)}`
                        : "No reminders set"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleToggleReminder}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
                    habit.reminder?.enabled
                      ? "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 hover:bg-rose-100"
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 dark:shadow-none"
                  )}
                >
                  {habit.reminder?.enabled ? "Disable" : "Enable"}
                </button>
              </div>

              <AnimatePresence>
                {habit.reminder?.enabled && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid grid-cols-2 gap-4 mt-6 mb-2">
                      <div className="space-y-2">
                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          <Clock className="w-3 h-3" /> Set Time
                        </label>
                        <input
                          type="time"
                          value={habit.reminder.time}
                          onChange={(e) => updateHabit(habit.id, { 
                            reminder: { ...habit.reminder!, time: e.target.value } 
                          })}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          <RefreshCw className="w-3 h-3" /> Frequency
                        </label>
                        <select
                          value={habit.reminder.frequency}
                          onChange={(e) => updateHabit(habit.id, { 
                            reminder: { ...habit.reminder!, frequency: e.target.value as ReminderConfig['frequency'] } 
                          })}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-indigo-500 outline-none appearance-none"
                        >
                          <option value="daily">Daily</option>
                          <option value="weekdays">Weekdays</option>
                          <option value="weekends">Weekends</option>
                        </select>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Day Grid */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 no-scrollbar">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Journey Timeline</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Missed</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-[10px] font-bold text-zinc-400 uppercase">Done</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-10 gap-2 md:gap-3">
                {days.map((day) => {
                  const isCompleted = habit.checkIns.some((c) => c.day === day);
                  const checkable = isDayCheckable(habit, day);
                  const currentDay = getCurrentHabitDay(habit);
                  const isMissed = !isCompleted && day < currentDay;
                  const isFuture = day > currentDay;
                  
                  return (
                    <motion.button
                      key={day}
                      whileHover={checkable ? { scale: 1.05 } : {}}
                      whileTap={checkable ? { scale: 0.95 } : {}}
                      onClick={() => checkable && toggleCheckIn(habit.id, day)}
                      disabled={!checkable}
                      className={cn(
                        "aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all border-2",
                        isCompleted
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none"
                          : checkable
                            ? "bg-white dark:bg-zinc-900 border-indigo-500 text-indigo-600 shadow-lg shadow-indigo-100 dark:shadow-none ring-2 ring-indigo-500/20"
                            : isMissed
                              ? "bg-rose-50 dark:bg-rose-900/10 border-rose-200 dark:border-rose-900/30 text-rose-500"
                              : "bg-zinc-50 dark:bg-zinc-800/50 border-zinc-100 dark:border-zinc-800 text-zinc-300 dark:text-zinc-600 cursor-not-allowed"
                      )}
                    >
                      <span className="text-[8px] font-bold opacity-60">D{day}</span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 mt-0.5" />
                      ) : isMissed ? (
                        <AlertCircle className="w-4 h-4 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 mt-0.5 opacity-20" />
                      )}
                      
                      {checkable && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-white dark:border-zinc-900 animate-pulse" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 md:p-6 bg-page-bg/50 dark:bg-zinc-800/50 border-t border-zinc-100 dark:border-zinc-800 flex justify-center shrink-0">
              <p className="text-[10px] md:text-xs text-zinc-400 font-medium italic">
                "Consistency is the key to transformation."
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

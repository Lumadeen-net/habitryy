import React, { useState } from 'react';
import { useHabitStore, HabitType, ReminderConfig } from '../store/useHabitStore';
import { X, Plus, Target, Ban, Bell, Clock, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface HabitFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HabitForm: React.FC<HabitFormProps> = ({ isOpen, onClose }) => {
  const addHabit = useHabitStore((state) => state.addHabit);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<HabitType>('build');
  const [duration, setDuration] = useState(21);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('09:00');
  const [reminderFrequency, setReminderFrequency] = useState<ReminderConfig['frequency']>('daily');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addHabit({
      name,
      description,
      type,
      duration,
      startDate: new Date(startDate).toISOString(),
      reminder: reminderEnabled ? {
        enabled: true,
        time: reminderTime,
        frequency: reminderFrequency
      } : undefined
    });

    setName('');
    setDescription('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center shrink-0">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">New Habit</h2>
                <p className="text-xs text-zinc-500 font-medium">Set a new goal for yourself</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                  Habit Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Morning Meditation"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why do you want to do this?"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white resize-none h-24 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setType('build')}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    type === 'build'
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                      : 'border-zinc-100 dark:border-zinc-800 text-zinc-500'
                  }`}
                >
                  <Target className="w-6 h-6" />
                  <span className="font-bold text-sm">Build Habit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType('quit')}
                  className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 transition-all ${
                    type === 'quit'
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400'
                      : 'border-zinc-100 dark:border-zinc-800 text-zinc-500'
                  }`}
                >
                  <Ban className="w-6 h-6" />
                  <span className="font-bold text-sm">Quit Habit</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Duration
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="20"
                      max="60"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-bold"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-bold">Days</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-bold"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => setReminderEnabled(!reminderEnabled)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                    reminderEnabled
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-zinc-100 dark:border-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      reminderEnabled ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-400"
                    )}>
                      <Bell className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-sm text-zinc-900 dark:text-white">Reminders</p>
                      <p className="text-xs text-zinc-500">Get notified to stay on track</p>
                    </div>
                  </div>
                  <div className={cn(
                    "w-10 h-6 rounded-full relative transition-colors",
                    reminderEnabled ? "bg-indigo-600" : "bg-zinc-300 dark:bg-zinc-700"
                  )}>
                    <motion.div
                      animate={{ x: reminderEnabled ? 16 : 4 }}
                      className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm"
                    />
                  </div>
                </button>

                <AnimatePresence>
                  {reminderEnabled && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Time
                          </label>
                          <input
                            type="time"
                            value={reminderTime}
                            onChange={(e) => setReminderTime(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-bold"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Frequency
                          </label>
                          <select
                            value={reminderFrequency}
                            onChange={(e) => setReminderFrequency(e.target.value as ReminderConfig['frequency'])}
                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white font-bold appearance-none"
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

              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-200 dark:shadow-none transition-all transform active:scale-[0.98] mt-4"
              >
                Create Habit
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

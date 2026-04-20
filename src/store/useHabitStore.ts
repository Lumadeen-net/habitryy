import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export type HabitType = 'build' | 'quit';
export type HabitStatus = 'active' | 'completed' | 'failed';

export interface ReminderConfig {
  enabled: boolean;
  time: string; // "HH:mm"
  frequency: 'daily' | 'weekdays' | 'weekends';
}

export interface CheckIn {
  id?: string;
  day: number;
  date: string; // ISO string
  completed: boolean;
}

export interface Habit {
  id: string;
  user_id?: string;
  name: string;
  description?: string;
  type: HabitType;
  duration: number;
  startDate: string; // ISO string
  checkIns: CheckIn[];
  status: HabitStatus;
  createdAt: string;
  reminder?: ReminderConfig;
}

interface HabitState {
  habits: Habit[];
  loading: boolean;
  completedHabit: Habit | null;
  setCompletedHabit: (habit: Habit | null) => void;
  setHabits: (habits: Habit[]) => void;
  fetchHabits: () => Promise<void>;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'checkIns' | 'status'>) => Promise<void>;
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>;
  deleteHabit: (id: string) => Promise<void>;
  toggleCheckIn: (habitId: string, day: number) => Promise<void>;
  setLoading: (loading: boolean) => void;
}

export const useHabitStore = create<HabitState>()(
  persist(
    (set, get) => ({
      habits: [],
      loading: false,
      completedHabit: null,
      setCompletedHabit: (habit) => set({ completedHabit: habit }),
      setHabits: (habits) => set({ habits }),
      setLoading: (loading) => set({ loading }),
      
      fetchHabits: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          set({ loading: true });
          const { data: habitsData, error } = await supabase
            .from('habits')
            .select(`
              *,
              check_ins (*)
            `)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('Supabase Error:', error.message);
            throw error;
          }

          const formattedHabits: Habit[] = habitsData.map((h: any) => ({
            id: h.id,
            user_id: h.user_id,
            name: h.name,
            description: h.description,
            type: h.type,
            duration: h.duration,
            startDate: h.start_date,
            status: h.status,
            createdAt: h.created_at,
            checkIns: h.check_ins.map((c: any) => ({
              id: c.id,
              day: c.day,
              date: c.date,
              completed: c.completed
            })),
            reminder: h.reminder
          }));
          set({ habits: formattedHabits });
        } catch (err: any) {
          console.error('Network Error:', err.message);
          if (err.message === 'Failed to fetch') {
            alert('Could not connect to the database. Please check your Supabase URL and API Key in the Secrets panel.');
          }
        } finally {
          set({ loading: false });
        }
      },

      addHabit: async (habitData) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          
          // If not logged in, fallback to local (for now)
          if (!user) {
            const newHabit: Habit = {
              ...habitData,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
              checkIns: [],
              status: 'active',
            };
            set((state) => ({ habits: [newHabit, ...state.habits] }));
            return;
          }

          const { data, error } = await supabase
            .from('habits')
            .insert([{
              user_id: user.id,
              name: habitData.name,
              description: habitData.description,
              type: habitData.type,
              duration: habitData.duration,
              start_date: habitData.startDate,
              status: 'active',
              reminder: habitData.reminder
            }])
            .select()
            .single();

          if (error) {
            console.error('Error adding habit:', error);
            let errorMessage = error.message;
            if (error.code === '23503') {
              errorMessage = 'Database Error: Your user profile was not found. Please ensure you ran the "handle_new_user" trigger SQL in Supabase.';
            }
            alert(`Failed to add habit: ${errorMessage}`);
            return;
          }

          const newHabit: Habit = {
            ...habitData,
            id: data.id,
            user_id: data.user_id,
            createdAt: data.created_at,
            checkIns: [],
            status: 'active',
          };
          set((state) => ({ habits: [newHabit, ...state.habits] }));
        } catch (err: any) {
          console.error('Unexpected error adding habit:', err);
          alert(`An unexpected error occurred: ${err.message}`);
        }
      },

      updateHabit: async (id, updates) => {
        const { error } = await supabase
          .from('habits')
          .update({
            name: updates.name,
            description: updates.description,
            status: updates.status,
            reminder: updates.reminder
          })
          .eq('id', id);

        if (error) console.error('Error updating habit:', error);

        set((state) => ({
          habits: state.habits.map((h) => (h.id === id ? { ...h, ...updates } : h)),
        }));
      },

      deleteHabit: async (id) => {
        const { error } = await supabase.from('habits').delete().eq('id', id);
        if (error) console.error('Error deleting habit:', error);

        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        }));
      },

      toggleCheckIn: async (habitId, day) => {
        const habit = get().habits.find(h => h.id === habitId);
        if (!habit) return;

        const existingCheckIn = habit.checkIns.find((c) => c.day === day);
        
        if (existingCheckIn) {
          // Remove check-in
          const { error } = await supabase
            .from('check_ins')
            .delete()
            .eq('habit_id', habitId)
            .eq('day', day);
          
          if (error) {
            console.error('Error removing check-in:', error);
            return;
          }
        } else {
          // Add check-in
          const { error } = await supabase
            .from('check_ins')
            .insert([{
              habit_id: habitId,
              day,
              date: new Date().toISOString(),
              completed: true
            }]);

          if (error) {
            console.error('Error adding check-in:', error);
            return;
          }
        }

        // Update local state
        set((state) => {
          let newlyCompletedHabit: Habit | null = null;
          const updatedHabits = state.habits.map((h) => {
            if (h.id !== habitId) return h;
            const newCheckIns = existingCheckIn 
              ? h.checkIns.filter(c => c.day !== day)
              : [...h.checkIns, { day, date: new Date().toISOString(), completed: true }];
            
            const isCompleted = newCheckIns.length === h.duration;
            const updatedHabit: Habit = { 
              ...h, 
              checkIns: newCheckIns, 
              status: (isCompleted ? 'completed' : 'active') as HabitStatus 
            };
            
            // If it just became completed
            if (isCompleted && h.status !== 'completed') {
              newlyCompletedHabit = updatedHabit as Habit;
            }

            return updatedHabit;
          });

          return {
            habits: updatedHabits,
            completedHabit: newlyCompletedHabit || state.completedHabit
          };
        });
      },
    }),
    {
      name: 'habit-flow-storage',
      partialize: (state) => ({}), // No longer persisting theme state
    }
  )
);

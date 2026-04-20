import { useState, useMemo, useEffect } from 'react';
import { useHabitStore } from './store/useHabitStore';
import { HabitCard } from './components/HabitCard';
import { HabitForm } from './components/HabitForm';
import { HabitDetails } from './components/HabitDetails';
import { Auth } from './components/Auth';
import { ConfettiEffect } from './components/ConfettiEffect';
import { CompletionModal } from './components/CompletionModal';
import { Splash } from './components/Splash';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { ProfilePage } from './components/ProfilePage';
import { Plus, LayoutGrid, Search, Sparkles, User, Loader2, AlertCircle, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { supabase } from './lib/supabase';
import { reminderService } from './services/reminderService';

export default function App() {
  const { 
    habits, 
    loading, 
    completedHabit,
    fetchHabits,
    setCompletedHabit,
    setHabits
  } = useHabitStore();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    reminderService.start();
    return () => reminderService.stop();
  }, []);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          if (session?.user) {
            console.log('Session found on mount:', session.user.email);
            setUser(session.user);
            await fetchHabits();
          } else {
            console.log('No session found on mount');
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) setAuthLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, session?.user?.email);
      
      if (mounted) {
        setUser(session?.user ?? null);
        setAuthLoading(false);
        
        if (session?.user) {
          fetchHabits();
        } else if (event === 'SIGNED_OUT') {
          useHabitStore.getState().setHabits([]);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [fetchHabits]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleRequestNotification = async () => {
    const granted = await reminderService.requestPermission();
    if (granted) {
      setNotificationPermission('granted');
    } else {
      setNotificationPermission('denied');
    }
  };

  const selectedHabit = useMemo(
    () => habits.find((h) => h.id === selectedHabitId) || null,
    [habits, selectedHabitId]
  );

  const filteredHabits = useMemo(() => {
    return habits
      .filter((h) => {
        if (filter === 'active') return h.status === 'active';
        if (filter === 'completed') return h.status === 'completed';
        return true;
      })
      .filter((h) => h.name.toLowerCase().includes(search.toLowerCase()));
  }, [habits, filter, search]);

  if (showSplash) {
    return <Splash onFinish={() => setShowSplash(false)} />;
  }

  if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
    return (
      <div className="dark min-h-screen flex items-center justify-center p-4 bg-zinc-950">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800 text-center">
          <div className="inline-flex p-3 bg-rose-100 dark:bg-rose-900/30 rounded-2xl mb-4">
            <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
          </div>
          <h2 className="text-2xl font-black text-zinc-900 dark:text-white mb-2">Configuration Missing</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6">
            Supabase API keys are not detected. Please add <strong>VITE_SUPABASE_URL</strong> and <strong>VITE_SUPABASE_ANON_KEY</strong> to the <strong>Secrets</strong> panel in AI Studio Settings.
          </p>
          <div className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-left text-xs font-mono text-zinc-600 dark:text-zinc-400 overflow-x-auto">
            1. Click the gear icon (Settings)<br />
            2. Open "Secrets"<br />
            3. Add your keys<br />
            4. Refresh the page
          </div>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="dark min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-zinc-500 font-medium tracking-tight">Initializing HABITRY...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Auth onSuccess={() => fetchHabits()} />} />
      </Routes>
    );
  }

  const Dashboard = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      {/* Welcome Message */}
      <div className="mb-8">
        <p className="text-zinc-400 font-medium">
          Welcome back, <span className="text-white font-black">{user.user_metadata?.full_name || user.email?.split('@')[0]}</span>!
        </p>
        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight mt-1">
          Your Daily Progress
        </h2>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search habits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white shadow-sm"
          />
        </div>
        <div className="flex bg-white dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto no-scrollbar w-full md:w-auto">
          <div className="flex min-w-max w-full">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "flex-1 px-6 py-2 rounded-xl text-sm font-bold capitalize transition-all whitespace-nowrap",
                  filter === f
                    ? "bg-indigo-600 text-white shadow-md"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Habit Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
          <p className="text-zinc-500 font-medium">Syncing with database...</p>
        </div>
      ) : filteredHabits.length > 0 ? (
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                onClick={() => setSelectedHabitId(habit.id)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-20 h-20 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mb-4">
            <LayoutGrid className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
            No habits found
          </h3>
          <p className="text-zinc-500 dark:text-zinc-400 max-w-xs">
            {search ? "Try searching for something else or clear the filters." : "Start your journey by creating your first habit today!"}
          </p>
          {!search && (
            <button
              onClick={() => setIsFormOpen(true)}
              className="mt-6 text-indigo-600 font-bold hover:underline"
            >
              Create your first habit →
            </button>
          )}
        </motion.div>
      )}
    </div>
  );

  return (
    <Routes>
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/" element={
        <div className="dark min-h-screen transition-colors duration-300 pb-24 md:pb-8 bg-zinc-950 text-white">
          {/* Sticky Header */}
          <header className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-1.5 md:p-2 bg-indigo-600 rounded-lg md:rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                  <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h1 className="text-xl md:text-2xl font-black text-white tracking-tight">
                  HABIT<span className="text-indigo-600">RY</span>
                </h1>
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                {notificationPermission === 'granted' ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => reminderService.sendTestNotification()}
                    className="hidden sm:flex items-center gap-2 px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg md:rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-indigo-600 transition-all text-[10px] font-black uppercase tracking-widest shadow-sm"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Test Alerts</span>
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleRequestNotification}
                    className={cn(
                      "hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg md:rounded-xl border shadow-sm transition-all text-[10px] font-black uppercase tracking-widest",
                      notificationPermission === 'denied'
                        ? "bg-rose-50 dark:bg-rose-900/20 border-rose-100 dark:border-rose-800 text-rose-500"
                        : "bg-amber-50 dark:bg-amber-900/20 border-amber-100 dark:border-amber-800 text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/40"
                    )}
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>{notificationPermission === 'denied' ? 'Alerts Blocked' : 'Enable Alerts'}</span>
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsFormOpen(true)}
                  className="hidden md:flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all transform"
                >
                  <Plus className="w-5 h-5" />
                  <span>New Habit</span>
                </motion.button>

                <Link
                  to="/profile"
                  className="p-2 md:p-3 bg-zinc-900 rounded-lg md:rounded-xl border border-zinc-800 text-zinc-400 hover:text-white transition-all shadow-sm"
                  title="Profile"
                >
                  <User className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </header>

          <Dashboard />

          {/* Mobile Floating Action Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsFormOpen(true)}
            className="md:hidden fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center transform transition-transform"
          >
            <Plus className="w-8 h-8" />
          </motion.button>

          {/* Modals */}
          <HabitForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />
          <HabitDetails habit={selectedHabit} onClose={() => setSelectedHabitId(null)} />
          
          {/* Animation Effects */}
          <CompletionModal 
            habit={completedHabit} 
            onClose={() => setCompletedHabit(null)} 
          />
        </div>
      } />
    </Routes>
  );
}

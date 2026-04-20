import React from 'react';
import { useHabitStore } from '../store/useHabitStore';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { User, LogOut, ChevronLeft, Calendar, Award, Clock, Flame, CheckCircle2, History } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { calculateStreak, getCompletionPercentage } from '../utils/habitUtils';
import { cn } from '../lib/utils';

export const ProfilePage: React.FC = () => {
  const { habits, setHabits } = useHabitStore();
  const [user, setUser] = React.useState<any>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setHabits([]);
    navigate('/');
  };

  const totalHabits = habits.length;
  const completedHabits = habits.filter(h => h.status === 'completed').length;
  const activeHabits = habits.filter(h => h.status === 'active').length;
  
  const bestStreak = Math.max(0, ...habits.map(h => calculateStreak(h)));

  if (!user) return null;

  return (
    <div className="dark min-h-screen bg-zinc-950 text-white pb-20">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group">
            <div className="p-2 bg-zinc-900 rounded-xl group-hover:bg-zinc-800 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </div>
            <span className="font-bold text-sm tracking-tight uppercase">Dashboard</span>
          </Link>
          <h1 className="text-sm font-black uppercase tracking-widest text-zinc-500">My Profile</h1>
          <div className="w-9" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* User Card */}
        <div className="bg-zinc-900/50 rounded-3xl p-8 border border-zinc-800 mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <User className="w-40 h-40" />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-6 relative">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20">
              <User className="w-12 h-12 text-white" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black tracking-tight mb-1">
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </h2>
              <p className="text-zinc-500 font-medium">{user.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                <span className="px-3 py-1 bg-zinc-800 text-zinc-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-zinc-700">
                  Member since {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <StatBox 
            icon={<Award className="w-5 h-5 text-indigo-400" />} 
            value={totalHabits} 
            label="Total Journeys" 
          />
          <StatBox 
            icon={<CheckCircle2 className="w-5 h-5 text-emerald-400" />} 
            value={completedHabits} 
            label="Journeys Mastered" 
          />
          <StatBox 
            icon={<Flame className="w-5 h-5 text-orange-400" />} 
            value={bestStreak} 
            label="Best Streak" 
          />
          <StatBox 
            icon={<Clock className="w-5 h-5 text-zinc-400" />} 
            value={activeHabits} 
            label="In Progress" 
          />
        </div>

        {/* Habit History */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-5 h-5 text-zinc-500" />
            <h3 className="text-lg font-black tracking-tight uppercase text-zinc-400 text-sm tracking-widest font-bold">Journey History</h3>
          </div>

          <div className="space-y-4">
            {habits.length === 0 ? (
              <div className="p-8 border-2 border-dashed border-zinc-800 rounded-3xl text-center">
                <p className="text-zinc-500 font-medium italic">No journey history yet. Start your first journey today!</p>
              </div>
            ) : (
              habits.map(habit => (
                <div 
                  key={habit.id}
                  className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className={cn(
                        "px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider rounded-full",
                        habit.status === 'completed' 
                          ? "bg-emerald-900/30 text-emerald-400"
                          : "bg-amber-900/30 text-amber-400"
                      )}>
                        {habit.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-lg">{habit.name}</h4>
                    <p className="text-xs text-zinc-500 font-medium">
                      Started {new Date(habit.startDate).toLocaleDateString()} • {habit.duration} Day goal
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-black text-white">{getCompletionPercentage(habit)}%</div>
                    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Completion</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-16 pt-8 border-t border-zinc-900">
          <button
            onClick={handleLogout}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-rose-950/30 hover:bg-rose-950/50 text-rose-500 border border-rose-900/50 font-black rounded-2xl transition-all active:scale-95"
          >
            <LogOut className="w-5 h-5" />
            <span>Sign Out from HABITRY</span>
          </button>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ icon, value, label }: { icon: React.ReactNode, value: number, label: string }) => (
  <div className="bg-zinc-900 p-5 rounded-2xl border border-zinc-800 flex flex-col items-center text-center">
    <div className="mb-2">{icon}</div>
    <div className="text-2xl font-black text-white">{value}</div>
    <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter leading-none mt-1">{label}</div>
  </div>
);

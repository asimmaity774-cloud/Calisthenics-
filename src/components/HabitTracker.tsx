import React, { useState, useEffect, useMemo } from "react";
import { Check, Plus, Trash2, Edit2, Play, Pause, ListTodo, Activity, Flame, Calendar as CalIcon, Settings, X, PlusCircle, Bot, Sparkles } from "lucide-react";
import { Storage } from "../lib/storage";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion, AnimatePresence } from "motion/react";

export interface Habit {
  id: string;
  title: string;
  icon: string;
  color: string;
  frequency: "daily" | "weekly" | "monthly";
  streak: number;
  longestStreak: number;
  completedDates: string[]; // YYYY-MM-DD
  createdAt: number;
  isPaused: boolean;
}

const HABIT_COLORS = [
  "bg-blue-500", "bg-emerald-500", "bg-rose-500", 
  "bg-gold", "bg-purple-500", "bg-cyan-500", "bg-orange-500"
];

const HABIT_ICONS = ["Droplet", "Dumbbell", "Brain", "Book", "Moon", "Salad", "Footprints", "Flame"];

const ParticleBurst = () => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {[...Array(8)].map((_, i) => {
        const angle = (i * 45 * Math.PI) / 180;
        const tx = Math.cos(angle) * 30;
        const ty = Math.sin(angle) * 30;
        
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ x: tx, y: ty, scale: 1.5, opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-gold rounded-full -ml-[3px] -mt-[3px]"
          />
        );
      })}
    </div>
  );
};

export function HabitTracker() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [celebratingIds, setCelebratingIds] = useState<Set<string>>(new Set());
  const [animatingIds, setAnimatingIds] = useState<Set<string>>(new Set());
  const [newHabit, setNewHabit] = useState<Partial<Habit>>({
    title: "",
    color: "bg-emerald-500",
    frequency: "daily",
    icon: "Dumbbell",
  });

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = async () => {
    const data = await Storage.getData("calisthenics_habits");
    if (data && data.items) {
      setHabits(data.items);
    } else {
      // Default example habits
      const defaults: Habit[] = [
        { id: "h1", title: "Drink 3L Water", icon: "Droplet", color: "bg-blue-500", frequency: "daily", streak: 0, longestStreak: 0, completedDates: [], createdAt: Date.now(), isPaused: false },
        { id: "h2", title: "Morning Mobility", icon: "Dumbbell", color: "bg-gold", frequency: "daily", streak: 0, longestStreak: 0, completedDates: [], createdAt: Date.now(), isPaused: false }
      ];
      setHabits(defaults);
      Storage.saveData("calisthenics_habits", { items: defaults });
    }
  };

  const saveHabits = async (newHabits: Habit[]) => {
    setHabits(newHabits);
    await Storage.saveData("calisthenics_habits", { items: newHabits });
  };

  const getTodayStr = () => {
    return new Date().toISOString().split('T')[0];
  };

  const toggleHabitCompletion = (id: string) => {
    const today = getTodayStr();
    const updated = habits.map(h => {
      if (h.id === id) {
        const isCompletedToday = h.completedDates.includes(today);
        let newDates = [...h.completedDates];
        let newStreak = h.streak;
        
        if (isCompletedToday) {
          newDates = newDates.filter(d => d !== today);
          newStreak = Math.max(0, newStreak - 1);
        } else {
          newDates.push(today);
          newStreak += 1;
          
          if (newStreak > 7) {
            setCelebratingIds(prev => {
              const next = new Set(prev);
              next.add(id);
              return next;
            });
            setTimeout(() => {
              setCelebratingIds(prev => {
                const next = new Set(prev);
                next.delete(id);
                return next;
              });
            }, 2000);
          }
          
          setAnimatingIds(prev => {
            const next = new Set(prev);
            next.add(id);
            return next;
          });
          setTimeout(() => {
            setAnimatingIds(prev => {
              const next = new Set(prev);
              next.delete(id);
              return next;
            });
          }, 500);
        }
        
        return {
          ...h,
          completedDates: newDates,
          streak: newStreak,
          longestStreak: Math.max(h.longestStreak, newStreak)
        };
      }
      return h;
    });
    saveHabits(updated);
  };

  const removeHabit = (id: string) => {
    const updated = habits.filter(h => h.id !== id);
    saveHabits(updated);
  };

  const handleCreate = () => {
    if (!newHabit.title) return;
    if (isEditing) {
      const updated = habits.map(h => {
        if (h.id === isEditing) {
          return {
            ...h,
            title: newHabit.title || h.title,
            frequency: (newHabit.frequency as any) || h.frequency,
          };
        }
        return h;
      });
      saveHabits(updated);
      setIsEditing(null);
    } else {
      const habit: Habit = {
        id: "habit_" + Date.now().toString(),
        title: newHabit.title,
        icon: newHabit.icon || "Dumbbell",
        color: newHabit.color || "bg-emerald-500",
        frequency: (newHabit.frequency as any) || "daily",
        streak: 0,
        longestStreak: 0,
        completedDates: [],
        createdAt: Date.now(),
        isPaused: false
      };
      saveHabits([...habits, habit]);
    }
    setIsCreating(false);
    setNewHabit({ title: "", color: "bg-emerald-500", frequency: "daily", icon: "Dumbbell" });
  };

  const openEdit = (habit: Habit) => {
    setNewHabit({ title: habit.title, frequency: habit.frequency });
    setIsEditing(habit.id);
    setIsCreating(true);
  };

  const togglePause = (id: string) => {
    const updated = habits.map(h => {
      if (h.id === id) {
        return { ...h, isPaused: !h.isPaused };
      }
      return h;
    });
    saveHabits(updated);
  };

  const generateAIInsights = () => {
    if (habits.length === 0) return "No habits to analyze yet. Initiate your first protocol to get AI recommendations.";
    
    const activeHabits = habits.filter(h => !h.isPaused);
    if (activeHabits.length === 0) return "All habits are currently paused. Resume them to build momentum.";

    const strugglingHabits = activeHabits.filter(h => h.streak === 0 && h.longestStreak > 0);
    const perfectHabits = activeHabits.filter(h => h.streak > 3);
    const newHabits = activeHabits.filter(h => h.longestStreak === 0 && h.completedDates.length === 0);

    const completionPct = activeHabits.length === 0 ? 0 : Math.round((activeHabits.filter(h => h.completedDates.includes(getTodayStr())).length / activeHabits.length) * 100);

    if (strugglingHabits.length > 0) {
      return `Missed patterns detected in: ${strugglingHabits.map(h => h.title).join(", ")}. Consider scaling down the difficulty or pairing them with an established routine.`;
    }

    if (perfectHabits.length === activeHabits.length && activeHabits.length > 0) {
      return "Absolute consistency mode active. All protocols are maintaining streaks. You might be ready to increase the progressive overload or add a new challenge.";
    }

    if (completionPct === 100) {
       return "Perfect daily execution so far. Maintain this frequency to reinforce the neuroplasticity of these habits.";
    }

    if (newHabits.length > 0) {
      return `New protocol initialized: ${newHabits[0].title}. Focus solely on showing up for this specific habit for the next 4 days. Intensity < Consistency.`;
    }

    return "Keep up the daily momentum. Consistency over time yields exponential physical and mental adaptations.";
  };

  const todayStr = getTodayStr();
  const completedTodayCount = habits.filter(h => !h.isPaused && h.completedDates.includes(todayStr)).length;
  const activeHabitsCount = habits.filter(h => !h.isPaused).length;
  const completionPercentage = activeHabitsCount === 0 ? 0 : Math.round((completedTodayCount / activeHabitsCount) * 100);

  const chartData = useMemo(() => {
    const data = [];
    const active = habits.filter(h => !h.isPaused);
    if (active.length === 0) return [];
    
    // Generate last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
      const completed = active.filter(h => h.completedDates.includes(dateStr)).length;
      const pct = Math.round((completed / active.length) * 100);
      data.push({
        date: dateStr,
        day: dayName,
        completion: pct
      });
    }
    return data;
  }, [habits]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        
        <div className="flex-1 bg-neutral-950/60 border border-dark-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-6 border-b border-dark-border pb-4">
            <div className="flex items-center gap-3">
              <ListTodo className="h-6 w-6 text-gold" />
              <h3 className="font-bebas text-2xl tracking-wide text-white">HABIT PROTOCOLS</h3>
            </div>
            <button 
              onClick={() => setIsCreating(true)}
              className="bg-gold/20 hover:bg-gold/30 text-gold p-2 rounded-lg transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="bg-neutral-950 border border-dark-border rounded-lg p-3 text-center">
              <span className="font-bebas text-3xl text-white block">{activeHabitsCount}</span>
              <span className="font-condensed text-[10px] font-bold text-neutral-400 tracking-wider block uppercase">Active Habits</span>
            </div>
            <div className="bg-neutral-950 border border-dark-border rounded-lg p-3 text-center">
              <span className="font-bebas text-3xl text-emerald-400 block">{completedTodayCount}</span>
              <span className="font-condensed text-[10px] font-bold text-neutral-400 tracking-wider block uppercase">Done Today</span>
            </div>
            <div className="bg-neutral-950 border border-dark-border rounded-lg p-3 text-center relative overflow-hidden">
              <div
                className="absolute bottom-0 left-0 h-1 bg-gold transition-all duration-1000"
                style={{ width: `${completionPercentage}%` }}
              />
              <span className="font-bebas text-3xl text-gold block">{completionPercentage}%</span>
              <span className="font-condensed text-[10px] font-bold text-neutral-400 tracking-wider block uppercase">Completion</span>
            </div>
          </div>

          {/* AI Optimizer Panel */}
          <div className="bg-neutral-900 border border-gold/30 rounded-xl p-4 mb-8 shadow-[0_0_15px_rgba(252,211,77,0.05)] relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gold via-fire to-gold opacity-80" />
            <div className="flex items-center gap-2 mb-2 pl-2">
              <Bot className="w-5 h-5 text-gold" />
              <h4 className="font-bebas text-xl text-white tracking-wider flex items-center gap-1.5">
                AI HABIT OPTIMIZER <Sparkles className="w-3.5 h-3.5 text-fire" />
              </h4>
            </div>
            <p className="text-sm font-condensed text-neutral-300 leading-relaxed pl-2">
              {generateAIInsights()}
            </p>
          </div>

          {/* Monthly Consistency Chart */}
          {chartData.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="h-5 w-5 text-emerald-500" />
                <h4 className="font-condensed font-bold text-neutral-400 tracking-widest uppercase text-xs">
                  Monthly Consistency (30 Days)
                </h4>
              </div>
              <div className="h-48 w-full bg-neutral-950 border border-dark-border rounded-xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorCompletion" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="day" 
                      stroke="#525252"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={20}
                    />
                    <YAxis 
                      hide={true} 
                      domain={[0, 100]}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderRadius: '8px' }}
                      itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                      labelStyle={{ color: '#a3a3a3', fontSize: '12px' }}
                      formatter={(value: number) => [`${value}%`, 'Completed']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="completion" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorCompletion)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Habit List */}
          <div className="space-y-3">
            {habits.length === 0 && (
              <div className="text-center py-8 text-neutral-500 font-condensed tracking-wider uppercase text-sm border border-dashed border-dark-border rounded-xl">
                No habits defined. Initiate protocol creation.
              </div>
            )}
            {habits.map(habit => {
              const isDone = habit.completedDates.includes(todayStr);
              return (
                <div 
                  key={habit.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${animatingIds.has(habit.id) ? "animate-habit-complete" : ""} ${
                    isDone 
                      ? "bg-neutral-900 border-emerald-500/30" 
                      : "bg-neutral-950 border-dark-border hover:border-gold/30"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <button
                        onClick={() => toggleHabitCompletion(habit.id)}
                        className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                          isDone 
                            ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" 
                            : "border-neutral-700 text-neutral-600 hover:border-gold hover:text-gold"
                        }`}
                      >
                        <Check className={`w-5 h-5 ${isDone ? "opacity-100" : "opacity-0"}`} />
                      </button>
                      <AnimatePresence>
                        {celebratingIds.has(habit.id) && (
                          <>
                            <motion.div 
                              initial={{ scale: 0, opacity: 1 }}
                              animate={{ scale: 2, opacity: 0 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.8, ease: "easeOut" }}
                              className="absolute inset-0 rounded-full border-2 border-gold bg-gold/20 pointer-events-none"
                            />
                            <ParticleBurst />
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                    <div>
                      <h4 className={`font-condensed font-bold text-lg tracking-wider uppercase transition-colors ${isDone ? "text-emerald-400 line-through opacity-70" : "text-white"}`}>
                        {habit.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-neutral-500 font-condensed font-bold tracking-wider">
                        <span className="flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-fire" /> Streak: {habit.streak}
                        </span>
                        <span>•</span>
                        <span className="uppercase text-[10px]">{habit.frequency}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => togglePause(habit.id)}
                      className="p-2 text-neutral-600 hover:text-gold transition-colors rounded-lg hover:bg-gold/10"
                      title={habit.isPaused ? "Resume" : "Pause"}
                    >
                      {habit.isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                    </button>
                    <button 
                      onClick={() => openEdit(habit)}
                      className="p-2 text-neutral-600 hover:text-blue-500 transition-colors rounded-lg hover:bg-blue-500/10"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => removeHabit(habit.id)}
                      className="p-2 text-neutral-600 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Create Modal overlay */}
          {isCreating && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
              <div className="bg-neutral-900 border border-dark-border rounded-xl w-full max-w-md p-6 relative shadow-2xl">
                <button 
                  onClick={() => {
                    setIsCreating(false);
                    setIsEditing(null);
                    setNewHabit({ title: "", color: "bg-emerald-500", frequency: "daily", icon: "Dumbbell" });
                  }}
                  className="absolute top-4 right-4 text-neutral-500 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <h3 className="font-bebas text-2xl text-white mb-6">
                  {isEditing ? "EDIT HABIT" : "NEW HABIT PROTOCOL"}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block font-condensed font-bold text-neutral-400 tracking-wider text-xs mb-2">HABIT NAME</label>
                    <input 
                      type="text" 
                      value={newHabit.title}
                      onChange={e => setNewHabit({...newHabit, title: e.target.value})}
                      placeholder="e.g. Meditate for 10 mins"
                      className="w-full bg-neutral-950 border border-dark-border rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold placeholder:text-neutral-700 font-condensed text-lg"
                    />
                  </div>
                  
                  <div>
                    <label className="block font-condensed font-bold text-neutral-400 tracking-wider text-xs mb-2">FREQUENCY</label>
                    <div className="flex gap-2">
                      {["daily", "weekly", "monthly"].map(freq => (
                        <button
                          key={freq}
                          onClick={() => setNewHabit({...newHabit, frequency: freq as any})}
                          className={`flex-1 py-2 rounded-lg font-condensed font-bold uppercase tracking-wider text-sm border ${
                            newHabit.frequency === freq
                              ? "bg-gold/20 border-gold/50 text-gold"
                              : "bg-neutral-950 border-dark-border text-neutral-500"
                          }`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleCreate}
                    disabled={!newHabit.title}
                    className="w-full py-4 mt-4 bg-gold text-black rounded-lg font-bebas text-xl tracking-wider hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isEditing ? "SAVE UPDATES" : "INITIALIZE HABIT"}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Flame, Target, Zap, Shield, Star, Crown } from 'lucide-react';

interface TrophyCaseProps {
  onClose: () => void;
  myStats: {
    workouts: number;
    habits: number;
    streak: number;
    points: number;
  };
}

const ALL_TROPHIES = [
  { id: 'first_workout', name: 'First Blood', description: 'Complete your first workout.', icon: Target, condition: (s: any) => s.workouts >= 1, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  { id: 'streak_7', name: '7-Day Warrior', description: 'Hit a 7-day streak.', icon: Flame, condition: (s: any) => s.streak >= 7, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  { id: 'streak_30', name: 'Unstoppable Force', description: 'Hit a 30-day streak.', icon: Zap, condition: (s: any) => s.streak >= 30, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  { id: 'sets_100', name: 'Centurion', description: 'Complete 100 workouts.', icon: Shield, condition: (s: any) => s.workouts >= 100, color: 'text-zinc-300', bg: 'bg-zinc-300/10', border: 'border-zinc-300/30' },
  { id: 'habits_50', name: 'Discipline', description: 'Check off 50 habits.', icon: Star, condition: (s: any) => s.habits >= 50, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  { id: 'score_10k', name: 'Elite Status', description: 'Reach 10,000 points.', icon: Crown, condition: (s: any) => s.points >= 10000, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  { id: 'score_50k', name: 'Legend', description: 'Reach 50,000 points.', icon: Trophy, condition: (s: any) => s.points >= 50000, color: 'text-gold', bg: 'bg-gold/10', border: 'border-gold/30' },
];

export function TrophyCase({ onClose, myStats }: TrophyCaseProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl bg-neutral-950 border border-dark-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        <div className="p-4 border-b border-dark-border flex items-center justify-between bg-neutral-900/50">
          <div className="flex items-center gap-3">
            <div className="bg-gold/20 p-2 rounded-lg border border-gold/30">
              <Trophy className="h-5 w-5 text-gold" />
            </div>
            <div>
              <h2 className="font-bebas text-xl text-white tracking-widest">TROPHY CASE</h2>
              <p className="text-[10px] text-neutral-400 font-condensed tracking-widest uppercase">Your Achievements</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white transition-colors rounded-lg hover:bg-neutral-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ALL_TROPHIES.map((trophy) => {
              const earned = trophy.condition(myStats);
              const Icon = trophy.icon;
              
              return (
                <div 
                  key={trophy.id}
                  className={`relative p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all duration-300 ${
                    earned 
                      ? `${trophy.bg} ${trophy.border}` 
                      : 'bg-neutral-900 border-dark-border opacity-50 grayscale'
                  }`}
                >
                  <div className={`p-4 rounded-full mb-3 ${earned ? trophy.bg : 'bg-neutral-800'}`}>
                    <Icon className={`w-8 h-8 ${earned ? trophy.color : 'text-neutral-500'}`} />
                  </div>
                  
                  <h3 className={`font-bebas text-lg tracking-wider mb-1 ${earned ? 'text-white' : 'text-neutral-400'}`}>
                    {trophy.name}
                  </h3>
                  <p className="text-xs text-neutral-500 font-condensed tracking-wider">
                    {trophy.description}
                  </p>
                  
                  {earned && (
                    <div className="absolute top-2 right-2">
                       <span className={`text-[8px] px-1.5 py-0.5 rounded border ${trophy.border} ${trophy.color} font-bold uppercase`}>
                         Earned
                       </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

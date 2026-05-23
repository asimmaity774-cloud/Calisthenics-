import React, { useState, useEffect, useMemo } from "react";
import { User, Activity, AlertCircle, Save, Stethoscope, ChevronRight, Award, Shield, Flame, Star, Zap, Crown, Check } from "lucide-react";
import { Storage } from "../lib/storage";
import { TECHNIQUE_DRILLS } from "../data";

const INJURY_ZONES = [
  "Neck", "Shoulders", "Elbows", "Wrists",
  "Lower Back", "Hips", "Knees", "Ankles"
];

const ACHIEVEMENTS = [
  { id: "first_step", title: "First Step", days: 1, icon: Star, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  { id: "warrior_7", title: "7-Day Warrior", days: 7, icon: Shield, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  { id: "habit_21", title: "21-Day Habit", days: 21, icon: Zap, color: "text-cyan-500", bg: "bg-cyan-500/10", border: "border-cyan-500/30" },
  { id: "iron_30", title: "Iron Will", days: 30, icon: Flame, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/30" },
  { id: "unstoppable_50", title: "Unstoppable", days: 50, icon: Award, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/30" },
  { id: "legend_100", title: "100-Day Legend", days: 100, icon: Crown, color: "text-gold", bg: "bg-gold/10", border: "border-gold/30" },
];

export function UserProfileSettings() {
  const [injuries, setInjuries] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [currentStreak, setCurrentStreak] = useState(0);

  useEffect(() => {
    Storage.getData("calisthenics_user_profile").then(profile => {
      if (profile && profile.injuries) {
        setInjuries(profile.injuries);
      }
    });
    
    Storage.getData("calisthenics_streak_v1").then(streak => {
      if (streak) {
        setCurrentStreak(parseInt(streak, 10));
      }
    });
  }, []);

  const toggleInjury = (zone: string) => {
    setInjuries(prev => 
      prev.includes(zone) ? prev.filter(z => z !== zone) : [...prev, zone]
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    const existing = await Storage.getData("calisthenics_user_profile") || {};
    await Storage.saveData("calisthenics_user_profile", {
      ...existing,
      injuries
    });
    // Brief visual feedback
    setTimeout(() => setIsSaving(false), 600);
  };

  const recommendedDrills = useMemo(() => {
    if (injuries.length === 0) return [];
    
    // Find drills where targetMuscle matches any of the flagged injuries
    return TECHNIQUE_DRILLS.filter(drill => {
      return injuries.some(injury => drill.targetMuscle.includes(injury));
    }).slice(0, 4); // Limit to top 4 recommendations
  }, [injuries]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        
        <div className="flex-1 bg-neutral-950/60 border border-dark-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 border-b border-dark-border pb-3">
            <Activity className="h-5 w-5 text-rose-500" />
            <h3 className="font-bebas text-xl tracking-wide text-white">INJURY PROFILE</h3>
          </div>
          
          <p className="text-sm text-neutral-400 mb-6">
            Flag any active injuries or sensitive joints. The AI Coach will automatically adapt your exercises and suggest low-impact alternatives to protect these areas.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {INJURY_ZONES.map(zone => {
              const isActive = injuries.includes(zone);
              return (
                <button
                  key={zone}
                  onClick={() => toggleInjury(zone)}
                  className={`
                    p-3 rounded-lg border text-sm font-condensed font-bold tracking-wider uppercase transition-all
                    ${isActive 
                      ? "bg-rose-500/20 border-rose-500/50 text-rose-400" 
                      : "bg-neutral-900 border-dark-border/50 text-neutral-500 hover:bg-neutral-800 hover:text-neutral-300"
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    {zone}
                    {isActive && <AlertCircle className="w-3.5 h-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full sm:w-auto px-6 py-3 bg-neutral-900 border border-dark-border rounded-lg hover:bg-neutral-800 text-sm font-condensed font-bold tracking-widest uppercase transition-colors flex items-center justify-center gap-2 text-neutral-300 touch-manipulation disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSaving ? "SAVED" : "SAVE PROFILE"}
          </button>

        </div>

      </div>

      {/* Achievements Section */}
      <div className="bg-neutral-950/60 border border-gold/30 rounded-xl p-5 relative overflow-hidden shadow-[0_0_15px_rgba(252,211,77,0.05)]">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-gold via-fire to-gold opacity-80" />
        
        <div className="flex items-center gap-2 mb-4 border-b border-dark-border pb-3 pl-2">
          <Award className="h-5 w-5 text-gold" />
          <h3 className="font-bebas text-xl tracking-wide text-white uppercase flex items-center gap-2">
            WARRIOR ACHIEVEMENTS
          </h3>
        </div>
        
        <p className="text-xs text-neutral-400 mb-6 pl-2">
          Unlock exclusive badges by maintaining your daily training and habit streaks. Consistency is the ultimate weapon.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pl-2">
          {ACHIEVEMENTS.map(achievement => {
            const isUnlocked = currentStreak >= achievement.days;
            const Icon = achievement.icon;
            
            return (
              <div 
                key={achievement.id}
                className={`relative p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                  isUnlocked 
                    ? `bg-neutral-900 ${achievement.border} shadow-[inset_0_0_15px_rgba(255,255,255,0.02)]` 
                    : "bg-neutral-950/50 border-dark-border opacity-50 grayscale"
                }`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isUnlocked ? achievement.bg : "bg-neutral-900"}`}>
                  <Icon className={`w-6 h-6 ${isUnlocked ? achievement.color : "text-neutral-600"}`} />
                </div>
                <h4 className={`font-condensed font-bold uppercase tracking-wider text-sm mb-1 ${isUnlocked ? "text-white" : "text-neutral-500"}`}>
                  {achievement.title}
                </h4>
                <p className="text-[10px] font-condensed tracking-widest text-neutral-500 uppercase">
                  {achievement.days} Day Streak
                </p>
                {isUnlocked && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-neutral-900 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 text-black" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended Recovery Drills */}
      {recommendedDrills.length > 0 && (
        <div className="bg-neutral-950 border border-emerald-900/50 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
          
          <div className="flex items-center gap-2 mb-4 border-b border-dark-border pb-3">
            <Stethoscope className="h-5 w-5 text-emerald-500" />
            <h3 className="font-bebas text-xl tracking-wide text-white uppercase">Recommended Recovery Drills</h3>
          </div>
          
          <p className="text-xs text-neutral-400 mb-5">
            Based on your flagged injury zones, we recommend incorporating these mobility drills into your warmup or rest days.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedDrills.map(drill => (
              <div key={drill.id} className="bg-neutral-900 p-4 rounded-lg border border-dark-border flex flex-col justify-between group hover:border-emerald-500/30 transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-condensed font-bold text-emerald-400 tracking-wider uppercase text-sm">{drill.name}</h4>
                    <span className="text-[9px] px-2 py-0.5 rounded font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {drill.targetMuscle}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-3">
                    {drill.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-dark-border/50 text-xs text-neutral-500 flex items-center justify-between">
                  <span>Level: {drill.difficulty}</span>
                  <ChevronRight className="w-4 h-4 text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { NutritionProfile, DailyIntake } from "../types";
import { Scale, Target, Droplet, Flame, Sparkles, Plus, RotateCcw, Drumstick, RefreshCw, Footprints } from "lucide-react";

interface NutritionCalculatorProps {
  onProfileUpdated?: (profile: NutritionProfile) => void;
}

export default function NutritionCalculator({ onProfileUpdated }: NutritionCalculatorProps) {
  // Load initial settings or provide smart defaults
  const [weight, setWeight] = useState<number>(75);
  const [weightUnit, setWeightUnit] = useState<"kg" | "lbs">("kg");
  const [height, setHeight] = useState<number>(178);
  const [goal, setGoal] = useState<"shred" | "lean_bulk" | "pure_strength">("shred");
  const [activityLevel, setActivityLevel] = useState<"active" | "extreme">("active");

  const [profile, setProfile] = useState<NutritionProfile | null>(null);

  // Daily tracker logged values (saved to localStorage under today's date key)
  const getTodayDateString = () => {
    const d = new Date();
    return d.toISOString().split("T")[0];
  };

  const [todayLog, setTodayLog] = useState<DailyIntake>({
    date: getTodayDateString(),
    calories: 0,
    protein: 0,
    water: 0,
    steps: 0
  });

  // Calculate targets dynamically
  const calculateMacros = () => {
    let wKg = weightUnit === "lbs" ? weight * 0.453592 : weight;
    
    // Quick, effective calisthenics rule of thumb calorie targets
    let multiplier = 30; // pure strength baseline
    if (goal === "shred") multiplier = 26;
    if (goal === "lean_bulk") multiplier = 36;
    
    let baseCalories = Math.round(wKg * multiplier);
    
    // Activity factor adjustment
    if (activityLevel === "extreme") {
      baseCalories += 400; // Calisthenics beast mode burns heavy energy
    } else {
      baseCalories += 150; // Active run + 2hr routines
    }
    
    // Rigid Protein targets for muscle fiber restoration (2.2g per kg bodyweight)
    const proteinTarget = Math.round(wKg * 2.2);
    
    // Fast fats target (1.0g per kg bodyweight to shield shoulder/wrist tendons)
    const fatTarget = Math.round(wKg * 0.95);
    
    // Remaining calories are allocated to high performance carbs
    const proteinCalories = proteinTarget * 4;
    const fatCalories = fatTarget * 9;
    const remainingCalories = Math.max(0, baseCalories - (proteinCalories + fatCalories));
    const carbTarget = Math.round(remainingCalories / 4);

    // Dynamic water targets (min 4L plus extra per bodyweight)
    const waterTargetLiters = Math.max(4.0, Number((wKg * 0.05 + 0.5).toFixed(1)));

    const newProfile: NutritionProfile = {
      weight,
      weightUnit,
      height,
      goal,
      activityLevel,
      calories: baseCalories,
      protein: proteinTarget,
      carbs: carbTarget,
      fat: fatTarget,
      water: Math.round(waterTargetLiters * 1000), // target in ml
      steps: activityLevel === "extreme" ? 15000 : 10000
    };

    setProfile(newProfile);
    if (onProfileUpdated) {
      onProfileUpdated(newProfile);
    }
  };

  // Run calculation on change of parameters
  useEffect(() => {
    calculateMacros();
  }, [weight, weightUnit, height, goal, activityLevel]);

  // Load intake logs
  useEffect(() => {
    const todayStr = getTodayDateString();
    const storedLS = localStorage.getItem(`calisthenics_nutrition_${todayStr}`);
    if (storedLS) {
      try {
        const parsed = JSON.parse(storedLS);
        setTodayLog({ ...parsed, steps: parsed.steps || 0 });
      } catch (e) {
        console.error("Failed loading nutrition log:", e);
      }
    } else {
      setTodayLog({
        date: todayStr,
        calories: 0,
        protein: 0,
        water: 0,
        steps: 0
      });
    }
  }, []);

  // Save intake logs
  const saveTodayLog = (newLog: DailyIntake) => {
    setTodayLog(newLog);
    localStorage.setItem(`calisthenics_nutrition_${newLog.date}`, JSON.stringify(newLog));
  };

  const addWater = (ml: number) => {
    const nextLog = { ...todayLog, water: todayLog.water + ml };
    saveTodayLog(nextLog);
  };

  const addMeal = (proteinG: number, kcal: number) => {
    const nextLog = { 
      ...todayLog, 
      protein: todayLog.protein + proteinG,
      calories: todayLog.calories + kcal 
    };
    saveTodayLog(nextLog);
  };

  const resetTracker = () => {
    if (window.confirm("Format today tracker? All recorded intake targets will be set back to zero.")) {
      const resetLog = {
        date: getTodayDateString(),
        calories: 0,
        protein: 0,
        water: 0,
        steps: 0
      };
      saveTodayLog(resetLog);
    }
  };

  const addSteps = (count: number) => {
    const nextLog = { ...todayLog, steps: todayLog.steps + count };
    saveTodayLog(nextLog);
  };

  if (!profile) return null;

  return (
    <div id="nutrition-panel-wrapper" className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      
      {/* 1. INPUT FORM & CALCULATOR */}
      <div className="lg:col-span-2 bg-dark-card border border-dark-border rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4 border-b border-dark-border pb-3">
            <Scale className="h-5 w-5 text-gold" />
            <h3 className="font-bebas text-xl tracking-wide text-white">
              WARRIOR MACRO CALCULATOR
            </h3>
          </div>

          <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
            Standard calisthenics demands massive relative strength. Enter your metrics to optimize your Power-to-Weight matrix dynamically.
          </p>

          <div className="space-y-4">
            
            {/* Weight Row */}
            <div>
              <label id="lbl-weight" className="font-condensed text-xs font-bold tracking-wider text-neutral-300 block mb-1.5 uppercase">
                Current Body Weight ({weightUnit})
              </label>
              <div className="flex gap-2">
                <input
                  id="input-weight"
                  type="number"
                  min="30"
                  max="200"
                  value={weight}
                  onChange={(e) => setWeight(Math.max(1, Number(e.target.value)))}
                  className="flex-1 min-h-[48px] bg-neutral-900 border border-dark-border rounded-lg py-3 px-4 sm:py-2 sm:px-3 text-base sm:text-sm text-white focus:outline-none focus:border-gold tracking-wide"
                />
                <button
                  id="toggle-unit"
                  type="button"
                  onClick={() => {
                    if (weightUnit === "kg") {
                      setWeightUnit("lbs");
                      setWeight(Math.round(weight * 2.20462));
                    } else {
                      setWeightUnit("kg");
                      setWeight(Math.round(weight / 2.20462));
                    }
                  }}
                  className="min-h-[48px] px-4 sm:px-3 rounded-lg bg-neutral-950 border border-dark-border hover:bg-neutral-800 text-sm sm:text-xs font-bold text-neutral-300 uppercase transition touch-manipulation"
                >
                  {weightUnit === "kg" ? "KG → LBS" : "LBS → KG"}
                </button>
              </div>
            </div>

            {/* Height Row */}
            <div>
              <label id="lbl-height" className="font-condensed text-xs font-bold tracking-wider text-neutral-300 block mb-1.5 uppercase">
                Active Height (cm)
              </label>
              <input
                id="input-height"
                type="number"
                min="100"
                max="250"
                value={height}
                onChange={(e) => setHeight(Math.max(1, Number(e.target.value)))}
                className="w-full min-h-[48px] bg-neutral-900 border border-dark-border rounded-lg py-3 px-4 sm:py-2 sm:px-3 text-base sm:text-sm text-white focus:outline-none focus:border-gold tracking-wide"
              />
            </div>

            {/* Target Goal Selector */}
            <div>
              <label id="lbl-goal" className="font-condensed text-xs font-bold tracking-wider text-neutral-300 block mb-1.5 uppercase">
                Combat Warrior Goal
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { key: "shred", label: "SHRED", desc: "Deficit" },
                  { key: "pure_strength", label: "STRENGTH", desc: "Recycle" },
                  { key: "lean_bulk", label: "LEAN BULK", desc: "Hypertrophy" }
                ].map((g) => (
                  <button
                    key={g.key}
                    id={`btn-goal-${g.key}`}
                    type="button"
                    onClick={() => setGoal(g.key as any)}
                    className={`min-h-[56px] sm:min-h-[48px] p-2 rounded-lg border text-center transition flex flex-col justify-center items-center touch-manipulation ${
                      goal === g.key
                        ? "bg-gold/15 border-gold text-gold"
                        : "bg-neutral-950 border-dark-border hover:bg-neutral-900 text-neutral-400"
                    }`}
                  >
                    <span className="font-condensed text-[11px] font-extrabold tracking-wider">{g.label}</span>
                    <span className="text-[9px] opacity-75">{g.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Activity Level Selector */}
            <div>
              <label id="lbl-activity" className="font-condensed text-xs font-bold tracking-wider text-neutral-300 block mb-1.5 uppercase">
                Energy Output Protocol
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="btn-activity-active"
                  type="button"
                  onClick={() => setActivityLevel("active")}
                  className={`min-h-[56px] sm:min-h-[48px] p-3 sm:p-2 rounded-lg border text-left transition touch-manipulation ${
                    activityLevel === "active"
                      ? "bg-accent2/15 border-accent2 text-accent2"
                      : "bg-neutral-950 border-dark-border hover:bg-neutral-900 text-neutral-400"
                  }`}
                >
                  <span className="font-condensed text-xs font-extrabold block tracking-wider">ACTIVE ROUTINE</span>
                  <span className="text-[10px] opacity-80 block mt-0.5">3K run + regular reps</span>
                </button>
                <button
                  id="btn-activity-extreme"
                  type="button"
                  onClick={() => setActivityLevel("extreme")}
                  className={`min-h-[56px] sm:min-h-[48px] p-3 sm:p-2 rounded-lg border text-left transition touch-manipulation ${
                    activityLevel === "extreme"
                      ? "bg-fire/15 border-fire text-fire"
                      : "bg-neutral-950 border-dark-border hover:bg-neutral-900 text-neutral-400"
                  }`}
                >
                  <span className="font-condensed text-xs font-extrabold block tracking-wider">BEAST WARRIOR</span>
                  <span className="text-[10px] opacity-80 block mt-0.5">+Heavy manual load</span>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Informative Disclaimer */}
        <div className="mt-6 p-3 bg-neutral-950/80 border border-dark-border/40 rounded-lg text-[10px] text-neutral-500 leading-relaxed">
          <span className="text-fire font-bold block mb-1">PRO-LEVEL ADVICE:</span>
          Calisthenics athletes prioritize power-to-weight ratio. A lighter abdomen dramatically opens capacity on Advanced skills like Handstands or Dragon Flags. Optimize calories meticulously.
        </div>

      </div>

      {/* 2. DYNAMIC NUTRITION TARGETS RESULTS */}
      <div className="lg:col-span-3 space-y-4">
        
        {/* Output macro targets exactly matching the user's styled look */}
        <div>
          <div className="flex justify-between items-center mb-2.5">
            <span className="font-condensed text-xs font-bold uppercase tracking-widest text-fire">
              CALCULATED TARGET MARGINS
            </span>
            <span className="font-bebas text-xs text-neutral-400 bg-neutral-950 border border-dark-border/60 px-2 py-0.5 rounded uppercase">
              Formulated for {weight} {weightUnit}
            </span>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            id="nutrition-grid-panel" 
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative z-10"
          >
            
            {/* Calories Card */}
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-dark-card border border-dark-border rounded-lg p-3 text-center transition-colors hover:bg-neutral-900/60 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-fire" />
              <Flame className="h-4 w-4 text-fire mx-auto mb-1 group-hover:scale-110 transition shrink-0" />
              <motion.span 
                key={profile.calories}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                id="target-calories" 
                className="font-bebas text-2xl text-white block"
              >
                {profile.calories}
              </motion.span>
              <span className="font-condensed text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                TARGET KCAL
              </span>
            </motion.div>

            {/* Protein Card */}
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-dark-card border border-dark-border rounded-lg p-3 text-center transition-colors hover:bg-neutral-900/60 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gold" />
              <Drumstick className="h-4 w-4 text-gold mx-auto mb-1 group-hover:scale-110 transition shrink-0" />
              <motion.span 
                key={profile.protein}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                id="target-protein" 
                className="font-bebas text-2xl text-gold block"
              >
                {profile.protein}g
              </motion.span>
              <span className="font-condensed text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                PROTEIN (2.2g/kg)
              </span>
            </motion.div>

            {/* Carbs Card */}
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-dark-card border border-dark-border rounded-lg p-3 text-center transition-colors hover:bg-neutral-900/60 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-accent2" />
              <Sparkles className="h-4 w-4 text-accent2 mx-auto mb-1 group-hover:scale-110 transition shrink-0" />
              <motion.span 
                key={profile.carbs}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                id="target-carbs" 
                className="font-bebas text-2xl text-accent2 block"
              >
                {profile.carbs}g
              </motion.span>
              <span className="font-condensed text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                CARB ENERGY
              </span>
            </motion.div>

            {/* Water Card */}
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-dark-card border border-dark-border rounded-lg p-3 text-center transition-colors hover:bg-neutral-900/60 relative overflow-hidden group"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-sky-500" />
              <Droplet className="h-4 w-4 text-sky-500 mx-auto mb-1 group-hover:scale-110 transition shrink-0" />
              <motion.span 
                key={profile.water}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                id="target-water" 
                className="font-bebas text-2xl text-sky-500 block"
              >
                {(profile.water / 1000).toFixed(1)}L
              </motion.span>
              <span className="font-condensed text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                FLUID BALANCE
              </span>
            </motion.div>

            {/* Steps Card */}
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }}
              className="bg-dark-card border border-dark-border rounded-lg p-3 text-center transition-colors hover:bg-neutral-900/60 relative overflow-hidden group col-span-2 sm:col-span-4"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-green-500" />
              <Footprints className="h-4 w-4 text-green-500 mx-auto mb-1 group-hover:scale-110 transition shrink-0" />
              <motion.span 
                key={profile.steps}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                id="target-steps" 
                className="font-bebas text-2xl text-green-500 block"
              >
                {profile.steps.toLocaleString()}
              </motion.span>
              <span className="font-condensed text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
                DAILY STEPS TARGET
              </span>
            </motion.div>

          </motion.div>
        </div>

        {/* 3. INTERACTIVE INTAKE TRACKER FOR REALTIME WARRIORS */}
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <div className="flex justify-between items-center mb-4 pb-2 border-b border-dark-border">
            <h4 className="font-bebas text-lg text-white tracking-wider flex items-center gap-1.5">
              <span>●</span> DAILY COMBAT INTAKE LOGGER
            </h4>
            <button
              id="logger-reset"
              onClick={resetTracker}
              className="min-h-[44px] px-3 sm:px-2 text-neutral-500 hover:text-rose-500 text-xs sm:text-[10px] font-condensed tracking-widest uppercase transition flex items-center justify-center gap-1.5 touch-manipulation hover:bg-neutral-900 rounded-lg"
              title="Reset today metrics"
            >
              <RotateCcw className="h-4 w-4 sm:h-3 sm:w-3" /> RESET
            </button>
          </div>

          <div className="space-y-4">
            
            {/* Calories Tracker Bar */}
            <div>
              <div className="flex justify-between items-end text-xs mb-1.5">
                <span className="font-condensed font-extrabold tracking-wider text-neutral-400">ENERGY TRACKER</span>
                <span className="font-mono text-xs">
                  <span className="text-white font-bold">{todayLog.calories}</span> / {profile.calories} kcal
                </span>
              </div>
              <div className="h-2.5 bg-neutral-900 border border-dark-border rounded-full overflow-hidden">
                <div 
                  className="bg-fire h-full rounded-full transition-all duration-305"
                  style={{ width: `${Math.min(100, (todayLog.calories / profile.calories) * 100)}%` }}
                />
              </div>
            </div>

            {/* Protein Tracker Bar */}
            <div>
              <div className="flex justify-between items-end text-xs mb-1.5">
                <span className="font-condensed font-extrabold tracking-wider text-neutral-400">PROTEIN COMPLIANCE</span>
                <span className="font-mono text-xs">
                  <span className="text-gold font-bold">{todayLog.protein}g</span> / {profile.protein}g
                </span>
              </div>
              <div className="h-2.5 bg-neutral-900 border border-dark-border rounded-full overflow-hidden">
                <div 
                  className="bg-gold h-full rounded-full transition-all duration-305"
                  style={{ width: `${Math.min(100, (todayLog.protein / profile.protein) * 100)}%` }}
                />
              </div>
            </div>

            {/* Water Tracker Bar */}
            <div>
              <div className="flex justify-between items-end text-xs mb-1.5">
                <span className="font-condensed font-extrabold tracking-wider text-neutral-400">WATER CAP</span>
                <span className="font-mono text-xs">
                  <span className="text-emerald-400 font-bold">{(todayLog.water / 1000).toFixed(2)}L</span> / {(profile.water / 1000).toFixed(1)}L
                </span>
              </div>
              <div className="h-2.5 bg-neutral-900 border border-dark-border rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-400 h-full rounded-full transition-all duration-305"
                  style={{ width: `${Math.min(100, (todayLog.water / profile.water) * 100)}%` }}
                />
              </div>
            </div>

            {/* Steps Tracker Bar */}
            <div>
              <div className="flex justify-between items-end text-xs mb-1.5">
                <span className="font-condensed font-extrabold tracking-wider text-neutral-400">STEPS TRACKER</span>
                <span className="font-mono text-xs">
                  <span className="text-green-500 font-bold">{todayLog.steps.toLocaleString()}</span> / {profile.steps.toLocaleString()}
                </span>
              </div>
              <div className="h-2.5 bg-neutral-900 border border-dark-border rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 h-full rounded-full transition-all duration-305"
                  style={{ width: `${Math.min(100, (todayLog.steps / profile.steps) * 100)}%` }}
                />
              </div>
            </div>

          </div>

          {/* Quick Logging Adders */}
          <div className="mt-5 pt-4 border-t border-dark-border/40 grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Steps Quick Loggers */}
            <div className="sm:col-span-2">
              <span className="text-[10px] font-condensed tracking-wider font-extrabold text-neutral-400 block mb-2 uppercase">
                LOG STEPS
              </span>
              <div className="flex gap-1.5">
                {[
                  { label: "+1K Steps", val: 1000 },
                  { label: "+2K Steps", val: 2000 },
                  { label: "+5K Steps", val: 5000 }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    id={`quick-steps-${item.val}`}
                    onClick={() => addSteps(item.val)}
                    className="flex-1 min-h-[44px] py-2 px-1 rounded-lg bg-neutral-950 hover:bg-neutral-900 border border-dark-border text-xs sm:text-[10px] text-neutral-300 font-condensed tracking-wider font-bold transition hover:border-green-500 touch-manipulation"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Water Quick Loggers */}
            <div>
              <span className="text-[10px] font-condensed tracking-wider font-extrabold text-neutral-400 block mb-2 uppercase">
                LOG FLUID INTAKE
              </span>
              <div className="flex gap-1.5">
                {[
                  { label: "+250ml Glass", val: 250 },
                  { label: "+500ml Flask", val: 500 },
                  { label: "+1L Jug", val: 1000 }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    id={`quick-water-${item.val}`}
                    onClick={() => addWater(item.val)}
                    className="flex-1 min-h-[44px] py-2 px-1 rounded-lg bg-neutral-950 hover:bg-neutral-900 border border-dark-border text-xs sm:text-[10px] text-neutral-300 font-condensed tracking-wider font-bold transition hover:border-sky-500 touch-manipulation"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Protein / Nutrition Quick Loggers */}
            <div>
              <span className="text-[10px] font-condensed tracking-wider font-extrabold text-neutral-400 block mb-2 uppercase">
                LOG WARRIOR FOOD
              </span>
              <div className="flex gap-1.5">
                {[
                  { label: "Shake (30g P, 180 kcal)", p: 30, c: 180 },
                  { label: "Protein Meal (45g P, 480 kcal)", p: 45, c: 480 }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    id={`quick-food-${idx}`}
                    onClick={() => addMeal(item.p, item.c)}
                    className="flex-1 min-h-[44px] py-2 px-1 rounded-lg bg-neutral-950 hover:bg-neutral-900 border border-dark-border text-xs sm:text-[10px] text-neutral-300 font-condensed tracking-wider font-bold transition hover:border-gold touch-manipulation"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

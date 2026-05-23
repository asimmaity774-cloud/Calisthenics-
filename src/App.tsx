import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { WEEKLY_PLAN, WARRIOR_RULES } from "./data";
import { WorkoutDay, WorkoutProgress, HistoryLog, Exercise } from "./types";
import RestTimer from "./components/RestTimer";
import WarmupTimer from "./components/WarmupTimer";
import NutritionCalculator from "./components/NutritionCalculator";
import TechniqueDrills from "./components/TechniqueDrills";
import ProgressHistory from "./components/ProgressHistory";
import { AICoachChat } from "./components/AICoachChat";
import { UserProfileSettings } from "./components/UserProfileSettings";
import { HabitTracker } from "./components/HabitTracker";
import { LeaderboardSystem } from "./components/LeaderboardSystem";
import { LoginButton } from "./components/LoginButton";
import { SyncStatusIndicator } from "./components/SyncStatusIndicator";
import { SplashScreen } from "./components/SplashScreen";
import { Storage } from "./lib/storage";

// Lucide icon components
import { 
  BarChart2, 
  Flame, 
  Dumbbell, 
  ShieldAlert, 
  BookOpen, 
  Clock, 
  Zap, 
  RotateCcw, 
  CheckCircle, 
  HelpCircle, 
  Check, 
  ChevronRight, 
  Activity, 
  ChevronDown, 
  Trophy,
  Coffee,
  Bot,
  Share2,
  ListTodo,
  User,
  PlayCircle
} from "lucide-react";

export default function App() {
  // --- STATES & MOUNT SETUP ---
  const [activeDayId, setActiveDayId] = useState<string>("day-1");
  const [difficulty, setDifficulty] = useState<"recruit" | "warrior" | "beast">("warrior");
  const [historyLogs, setHistoryLogs] = useState<HistoryLog[]>([]);
  const [dayProgressMap, setDayProgressMap] = useState<{ [dayId: string]: WorkoutProgress }>({});
  const [streak, setStreak] = useState<number>(0);
  
  // Active timing states
  const [activeRestTimer, setActiveRestTimer] = useState<{
    initialSeconds: number;
    exerciseName: string;
    setNumber: number;
  } | null>(null);
  const [showWarmupTimer, setShowWarmupTimer] = useState<boolean>(false);
  const [workoutStartTime, setWorkoutStartTime] = useState<number | null>(null);
  const [activeBentoTab, setActiveBentoTab] = useState<"nutrition" | "technique" | "rules" | "history" | "ai" | "profile" | "habits" | "leaderboard">("leaderboard");
  const [userWeeklyPlan, setUserWeeklyPlan] = useState<WorkoutDay[]>(WEEKLY_PLAN);
  const [challengeInfo, setChallengeInfo] = useState<{ dayId: string, time: number | null } | null>(null);

  // Timer reference for current workout timer display
  const [liveDuration, setLiveDuration] = useState<number>(0);

  // Load state on mount
  useEffect(() => {
    // 0. Parse Challenge Deep Links
    const searchParams = new URLSearchParams(window.location.search);
    const challengeDay = searchParams.get('challengeDay');
    const challengeTime = searchParams.get('challengeTime');
    
    if (challengeDay) {
      setActiveDayId(challengeDay);
      setChallengeInfo({ 
        dayId: challengeDay, 
        time: challengeTime ? parseInt(challengeTime, 10) : null 
      });
      // Optionally clean up URL without fully reloading
      window.history.replaceState({}, '', window.location.pathname);
    }
    // We must load all data async
    const loadStorage = async () => {
      // 0. Custom AI Plan
      const storedPlan = await Storage.getData("calisthenics_weekly_plan_v1");
      if (storedPlan) {
        setUserWeeklyPlan(storedPlan);
      }
      
      // 1. History Logs
      const storedHistory = await Storage.getData("calisthenics_warrior_history_v1");
      if (storedHistory) {
        setHistoryLogs(storedHistory);
      }

      // 2. Day Progress map
      const storedProgress = await Storage.getData("calisthenics_progress_v1");
      if (storedProgress) {
        setDayProgressMap(storedProgress);
      }

      // 3. Streak
      const storedStreak = await Storage.getData("calisthenics_streak_v1");
      if (storedStreak) {
        setStreak(parseInt(storedStreak, 10));
      }

      // 4. Difficulty setting
      const storedDiff = await Storage.getData("calisthenics_difficulty_v1");
      if (storedDiff && (storedDiff === "recruit" || storedDiff === "warrior" || storedDiff === "beast")) {
        setDifficulty(storedDiff);
      }
    };
    
    loadStorage();

    // Set workout start time
    setWorkoutStartTime(Date.now());
  }, []);

  // Live workout timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (workoutStartTime) {
        setLiveDuration(Math.floor((Date.now() - workoutStartTime) / 1000));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [workoutStartTime]);

  // Retrieve current active day from dataset
  const currentDay = userWeeklyPlan.find((d) => d.id === activeDayId) || userWeeklyPlan[0];

  // Initialize progress state for a day if empty
  const getOrInitDayProgress = (dayId: string): WorkoutProgress => {
    if (dayProgressMap[dayId]) {
      return dayProgressMap[dayId];
    }
    
    // Setup clean state structure for the chosen day
    const targetDay = userWeeklyPlan.find((d) => d.id === dayId)!;
    
    const exerciseSets: { [name: string]: boolean[] } = {};
    targetDay.exercises.forEach((ex) => {
      exerciseSets[ex.name] = new Array(ex.setsCount).fill(false);
    });

    const coreSets: { [name: string]: boolean[] } = {};
    if (targetDay.core) {
      targetDay.core.forEach((ex) => {
        coreSets[ex.name] = new Array(ex.setsCount).fill(false);
      });
    }

    return {
      dayId,
      warmupCompleted: false,
      exerciseSetsCompleted: exerciseSets,
      coreSetsCompleted: coreSets,
      finisherCompleted: false,
      isFullyCompleted: false
    };
  };

  const updateProgress = (dayId: string, item: WorkoutProgress) => {
    const nextMap = { ...dayProgressMap, [dayId]: item };
    setDayProgressMap(nextMap);
    Storage.saveData("calisthenics_progress_v1", nextMap);
  };

  // Switch and start tracker for a specific focus day
  const handleSelectDay = (dayId: string) => {
    setActiveDayId(dayId);
    setWorkoutStartTime(Date.now());
    setLiveDuration(0);
  };

  // Change reps difficulty setting
  const handleChangeDifficulty = (level: "recruit" | "warrior" | "beast") => {
    setDifficulty(level);
    Storage.saveData("calisthenics_difficulty_v1", level);
  };

  // Render Scaled Rep Count based on standard calisthenics scaling rules
  const getScaledRepText = (exercise: Exercise): string => {
    const rawText = exercise.repsText;
    
    // Skip if reps is MAX or duration hold (e.g. 45s)
    if (rawText.toLowerCase().includes("max") || rawText.toLowerCase().includes("s") || rawText.toLowerCase().includes("m")) {
      return rawText;
    }
    
    // Extract base number
    const num = parseInt(rawText, 10);
    if (isNaN(num)) return rawText;

    const separator = rawText.replace(String(num), "");

    let factor = 1.0;
    if (difficulty === "recruit") factor = 0.65; // Recruit performs 35% less reps for form building
    if (difficulty === "beast") factor = 1.35; // Beast warrior adds 35% reps challenge

    const scaled = Math.max(1, Math.round(num * factor));
    return `${scaled}${separator}`;
  };

  // Check off a single set of an exercise or core move
  const handleToggleSet = (exerciseName: string, setIndex: number, isCore: boolean = false) => {
    const prog = getOrInitDayProgress(activeDayId);
    
    const setGroup = isCore ? prog.coreSetsCompleted : prog.exerciseSetsCompleted;
    if (!setGroup[exerciseName]) {
      // Lazy init array in case it didn't structure
      const targetDay = userWeeklyPlan.find((d) => d.id === activeDayId)!;
      const tEx = (isCore ? targetDay.core : targetDay.exercises)?.find((ex) => ex.name === exerciseName);
      const setsCount = tEx ? tEx.setsCount : 4;
      setGroup[exerciseName] = new Array(setsCount).fill(false);
    }

    const currentVal = setGroup[exerciseName][setIndex];
    setGroup[exerciseName][setIndex] = !currentVal;

    // Trigger REST TIMER on complete (if they checked off a set successfully)
    if (!currentVal) {
      // Find out rest duration: rest is 60s for standard exercises, 90s for hard, 30s for recovery
      let restTime = 60;
      if (activeDayId === "day-6") restTime = 45; // Full body circuit is rest-restricted!
      if (activeDayId === "day-7") restTime = 30; // Active rest

      setActiveRestTimer({
        initialSeconds: restTime,
        exerciseName,
        setNumber: setIndex
      });
    }

    // Auto calculate if everything is done to check day
    updateProgress(activeDayId, { ...prog });
  };

  // Manual Check warm up or pre-workout run
  const handleToggleWarmup = () => {
    const prog = getOrInitDayProgress(activeDayId);
    prog.warmupCompleted = !prog.warmupCompleted;
    updateProgress(activeDayId, { ...prog });
  };

  // Toggle absolute finisher state
  const handleToggleFinisher = () => {
    const prog = getOrInitDayProgress(activeDayId);
    prog.finisherCompleted = !prog.finisherCompleted;
    updateProgress(activeDayId, { ...prog });
  };

  // Trigger workout summary and persist log to history
  const handleSaveWorkoutCompletion = () => {
    const prog = getOrInitDayProgress(activeDayId);
    
    // Check if progress is completed
    const dayData = userWeeklyPlan.find((d) => d.id === activeDayId)!;
    
    // Confirm if not empty
    if (!prog.warmupCompleted) {
      if (!window.confirm("You haven't tracked completing the mandatory 3KM pre-workout warmup run or dynamic stretch! Complete workout collection anyway?")) {
        return;
      }
    }

    // Finish Workout Duration calculation
    const durationSec = liveDuration || 900; // default 15 mins if unset

    // Record Streak calculation
    let newStreak = streak;
    const todayStr = new Date().toISOString().split("T")[0];
    
    if (historyLogs.length === 0) {
      newStreak = 1;
    } else {
      // Compare yesterday date
      const lastLog = historyLogs[0]; // descending logs sorting
      try {
        const lastDate = lastLog.completedAt.split("T")[0];
        
        const lastD = new Date(lastDate);
        const currentD = new Date(todayStr);
        const diffDays = Math.floor((currentD.getTime() - lastD.getTime()) / (1000 * 65 * 60 * 24));
        
        if (diffDays === 0) {
          // Worked today already, keep streak
          newStreak = streak || 1;
        } else if (diffDays === 1) {
          // Worked yesterday, increment streak
          newStreak = (streak || 0) + 1;
        } else {
          // Streak broken
          newStreak = 1;
        }
      } catch (e) {
        newStreak = (streak || 0) + 1;
      }
    }

    // Create a new History Item
    const newLog: HistoryLog = {
      id: `log-${Date.now()}`,
      dayId: activeDayId,
      dayNumber: dayData.number,
      dayName: dayData.name,
      completedAt: new Date().toISOString(),
      durationSeconds: durationSec,
      streakAtCompletion: newStreak
    };

    const nextLogs = [newLog, ...historyLogs];
    setHistoryLogs(nextLogs);
    Storage.saveData("calisthenics_warrior_history_v1", nextLogs);

    setStreak(newStreak);
    Storage.saveData("calisthenics_streak_v1", newStreak.toString());

    // Update progress state to Fully completed!
    prog.isFullyCompleted = true;
    prog.completedAt = new Date().toISOString();
    updateProgress(activeDayId, { ...prog });

    // Open logs sheet automatically to celebrate progress
    setActiveBentoTab("history");

    // Play synthesized voice alert trigger
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const s = new SpeechSynthesisUtterance("Congratulations calisthenics warrior! Day complete. Streak tracked perfectly!");
      window.speechSynthesis.speak(s);
    }
    
    alert(`WORKOUT SECURED! Day 0${dayData.number} successfully defeated. Streak recorded: ${newStreak} Days.`);
  };

  // Reset all records to start clean
  const handleClearHistory = () => {
    if (window.confirm("CRITICAL PROTOCOL: Are you sure you want to completely erase your 7-Day compliance progress and logged combat metrics? This operation is irreversible.")) {
      Storage.removeData("calisthenics_warrior_history_v1");
      Storage.removeData("calisthenics_progress_v1");
      Storage.removeData("calisthenics_streak_v1");
      setHistoryLogs([]);
      setDayProgressMap({});
      setStreak(0);
      alert("Warrior databases formatted. All logs set back to ground zero.");
    }
  };

  // Check progress ratios for preview cards
  const getDayCompletionsCount = (dayId: string) => {
    const prog = dayProgressMap[dayId];
    if (!prog) return { fraction: "0%", count: 0, total: 1, isFull: false };
    
    const dayData = userWeeklyPlan.find((d) => d.id === dayId)!;
    let checkedSets = 0;
    let totalSets = 0;

    dayData.exercises.forEach((ex) => {
      totalSets += ex.setsCount;
      const setsArr = prog.exerciseSetsCompleted[ex.name] || [];
      checkedSets += setsArr.filter(Boolean).length;
    });

    if (dayData.core) {
      dayData.core.forEach((ex) => {
        totalSets += ex.setsCount;
        const setsArr = prog.coreSetsCompleted[ex.name] || [];
        checkedSets += setsArr.filter(Boolean).length;
      });
    }

    const isFull = (checkedSets === totalSets) && prog.finisherCompleted;
    const fraction = totalSets > 0 ? `${Math.round((checkedSets / totalSets) * 100)}%` : "0%";

    return {
      fraction,
      count: checkedSets,
      total: totalSets,
      isFull: isFull || prog.isFullyCompleted
    };
  };

  // Reset current selection's state (clear work but keep logs)
  const handleResetCurrentProgress = () => {
    if (window.confirm("Standardize progress? Reset all checkmarks for this active day?")) {
      const resetMap = { ...dayProgressMap };
      delete resetMap[activeDayId];
      setDayProgressMap(resetMap);
      Storage.saveData("calisthenics_progress_v1", resetMap);
    }
  };

  // Time formatting utility
  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const activeProgress = getOrInitDayProgress(activeDayId);

  // Derived state: count how many days are fully completed in the current run
  const completedDaysCount = userWeeklyPlan.filter(day => {
    return dayProgressMap[day.id]?.isFullyCompleted;
  }).length;

  const handleUpdatePlan = (newPlan: WorkoutDay[]) => {
    setUserWeeklyPlan(newPlan);
    Storage.saveData("calisthenics_weekly_plan_v1", newPlan);
  };

  const handleChallengeFriend = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('challengeDay', activeDayId);
    if (activeProgress.isFullyCompleted && liveDuration > 0) {
      url.searchParams.set('challengeTime', liveDuration.toString());
    }
    
    const title = `Challenge: Beat my ${currentDay.name} workout!`;
    const text = `I challenge you to beat my performance on the ${currentDay.name} routine. Can you do it?`;
    
    if (navigator.share && navigator.canShare) {
      try {
        await navigator.share({ title, text, url: url.toString() });
      } catch (e) {
        console.error("Share failed", e);
      }
    } else {
      navigator.clipboard.writeText(url.toString());
      alert("Challenge link copied to clipboard: " + url.toString());
    }
  };

  return (
    <div id="main-calisthenics-app" className="min-h-screen bg-dark-bg text-stone-100 font-sans p-4 md:p-8 selection:bg-fire selection:text-white relative">
      <SyncStatusIndicator />
      <div className="absolute top-4 right-4 z-50">
        <LoginButton />
      </div>
      
      {/* BACKGROUND FLOATING ACCENT AMBANCE COLOURED ORBS */}
      <div className="absolute top-10 left-[8%] w-80 h-80 bg-fire/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-20 right-[8%] w-[32rem] h-[32rem] bg-accent2/5 rounded-full blur-[120px] pointer-events-none" />

      {/* RENDER DYNAMIC FLOATING REST TIMER IF POPUP TRIGGERED */}
      {activeRestTimer && (
        <RestTimer
          key={`${activeRestTimer.exerciseName}-${activeRestTimer.setNumber}`}
          initialSeconds={activeRestTimer.initialSeconds}
          exerciseName={activeRestTimer.exerciseName}
          setNumber={activeRestTimer.setNumber}
          onClose={() => setActiveRestTimer(null)}
        />
      )}

      {/* RENDER FLOATING MULTI-STEP 2MIN DYNAMIC WARM-UP MODAL */}
      {showWarmupTimer && (
        <WarmupTimer
          onComplete={() => {
            setShowWarmupTimer(false);
            const prog = getOrInitDayProgress(activeDayId);
            prog.warmupCompleted = true;
            updateProgress(activeDayId, { ...prog });
          }}
          onClose={() => setShowWarmupTimer(false)}
        />
      )}

      {challengeInfo && (
        <div className="max-w-6xl mx-auto mb-6 mt-8 md:mt-2 relative z-10">
          <div className="bg-gold/10 border border-gold/40 rounded-xl p-4 flex items-center justify-between shadow-[0_0_20px_rgba(252,211,77,0.15)] animate-[pulse_3s_ease-in-out_infinite]">
            <div className="flex items-center gap-4">
              <div className="bg-gold/20 p-2 rounded-full border border-gold/40">
                <Trophy className="h-5 w-5 text-gold" />
              </div>
              <div>
                <h4 className="text-white font-condensed font-bold uppercase tracking-wider text-base">
                  You've been challenged!
                </h4>
                <p className="text-gold/90 text-[11px] md:text-sm mt-0.5">
                  Finish this workout {challengeInfo.time ? `in under ${formatTime(challengeInfo.time)}` : "and prove your strength"}.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setChallengeInfo(null)}
              className="text-gold/60 hover:text-gold transition-colors text-xs uppercase font-condensed font-bold tracking-widest px-3 py-1.5 border border-transparent hover:border-gold/30 rounded"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-8 relative">
        
        {/* 1. HERO BRAND HEADER SPLASH */}
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center pt-16 pb-16 relative rounded-3xl overflow-hidden border border-dark-border/40 shadow-[0_0_50px_rgba(220,38,38,0.1)]"
        >
          {/* Animated Background Image */}
          <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.25 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src="https://storage.googleapis.com/mweb-prod-us-central1/5n7t92o2mdf0x26onx3x826p4/8b3c3735-3004-44ed-bf36-547dfb6efde3"
            alt="Workout background"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover z-0 mix-blend-screen"
          />
          <div className="absolute inset-0 z-0 bg-gradient-to-t from-dark-bg via-dark-bg/60 to-dark-bg/20" />
          
          <div className="relative z-10 px-4 flex flex-col items-center">
            
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="font-condensed text-[11px] font-extrabold tracking-[0.35em] text-fire uppercase block mt-2 mb-2 drop-shadow-md"
            >
              ZERO EQUIPMENT · ABSOLUTE LEVERAGE · METICULOUS CONSISTENCY
            </motion.span>
            
            <motion.h1 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.7, type: "spring", stiffness: 100 }}
              className="font-bebas text-6xl md:text-8xl leading-none tracking-tight text-white mb-2 selection:text-stone-900 drop-shadow-lg"
            >
              EXTREME <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-fire to-gold drop-shadow-none">CALISTHENICS</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="font-condensed text-md md:text-lg font-bold tracking-[0.3em] text-neutral-300 uppercase mt-2 drop-shadow-md"
            >
              7 — Day Warrior Bodyweight Plan
            </motion.p>
          </div>
        </motion.header>

        {/* COMPREHENSIVE SUB HEADER DIVIDER */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-dark-border to-transparent" />
          <div className="w-2.5 h-2.5 rounded-full bg-fire shadow-[0_0_12px_var(--color-fire)]" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-dark-border to-transparent" />
        </div>

        {/* 2. SYSTEM CONTROL GRID (Pre-workout Run & Difficulty Scaling) */}
        <section id="system-controls" className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Daily Pre-Workout compliance panel */}
          <div className="md:col-span-8 bg-gradient-to-br from-fire/15 to-fire/5 border border-fire/30 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-4 items-start sm:items-center">
              <span className="text-2xl h-12 w-12 rounded-lg bg-fire/20 border border-fire/30 flex items-center justify-center text-fire shrink-0 font-bold">
                🏃
              </span>
              <div>
                <span className="font-condensed text-[10px] font-bold tracking-widest text-fire uppercase block">
                  Mandatory Warmup Protocol
                </span>
                <span className="font-condensed text-lg md:text-xl font-extrabold text-white block tracking-wide">
                  3KM PRE-WORKOUT CARDIO RUN
                </span>
                <p className="text-xs text-neutral-400 mt-0.5 leading-relaxed">
                  Required daily before bodyweight loading. Taps cellular ATP reserves and distributes joint fluids.
                </p>
              </div>
            </div>

            <div className="flex gap-2 w-full sm:w-auto self-stretch sm:self-center justify-end">
              <button
                id="btn-warmup-timer"
                onClick={() => setShowWarmupTimer(true)}
                className="min-h-[48px] py-3 px-4 sm:py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-dark-border text-sm sm:text-xs text-white font-condensed font-extrabold tracking-wider uppercase transition flex items-center gap-1.5 touch-manipulation"
              >
                <Clock className="h-3.5 w-3.5 text-fire" /> 2M ROTATIONS
              </button>
              
              <button
                id="btn-warmup-run-toggle"
                onClick={handleToggleWarmup}
                className={`flex-1 sm:flex-none min-h-[48px] py-3 px-4 sm:py-2.5 rounded-lg font-condensed font-extrabold tracking-wider text-sm sm:text-xs transition uppercase flex items-center justify-center gap-1.5 border touch-manipulation ${
                  activeProgress.warmupCompleted
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-fire border-fire hover:bg-fire/85 text-white"
                }`}
              >
                {activeProgress.warmupCompleted ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> SECURED
                  </>
                ) : (
                  "MARK 3K DONE"
                )}
              </button>
            </div>
          </div>

          {/* GLOBAL BEAST MODE DIFFICULTY SCALER */}
          <div className="md:col-span-4 bg-dark-card border border-dark-border rounded-xl p-5 flex flex-col justify-between">
            <div className="flex justify-between items-center mb-2">
              <span className="font-condensed text-[10px] font-bold tracking-widest text-gold uppercase block">
                DIFFICULTY SCALER MODULE
              </span>
              <span className="text-stone-500 font-mono text-[10px] uppercase">
                ACTIVE MODE: {difficulty}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-1">
              {[
                { key: "recruit", label: "RECRUIT", color: "hover:border-blue-500/40 text-blue-400" },
                { key: "warrior", label: "WARRIOR", color: "hover:border-gold/40 text-gold" },
                { key: "beast", label: "BEAST TIER", color: "hover:border-fire/40 text-fire" }
              ].map((lvl) => {
                const isActive = difficulty === lvl.key;
                return (
                  <button
                    key={lvl.key}
                    id={`btn-diff-${lvl.key}`}
                    onClick={() => handleChangeDifficulty(lvl.key as any)}
                    className={`min-h-[52px] py-3 px-2 sm:py-2 sm:px-1 rounded-lg text-center transition flex flex-col justify-center items-center border uppercase text-xs sm:text-[10px] font-condensed font-extrabold tracking-widest touch-manipulation ${
                      isActive
                        ? lvl.key === "recruit"
                          ? "bg-blue-500/10 border-blue-500/40 text-blue-300"
                          : lvl.key === "warrior"
                            ? "bg-gold/15 border-gold/40 text-gold"
                            : "bg-fire/20 border-fire/50 text-fire"
                        : "bg-neutral-950 border-dark-border text-stone-500 hover:bg-neutral-900"
                    }`}
                  >
                    <span>{lvl.label}</span>
                    <span className="text-[8px] opacity-75">
                      {lvl.key === "recruit" ? "-35% reps" : lvl.key === "warrior" ? "100% reps" : "+35% reps"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </section>

        {/* 3. WORKOUT WEEK TIMELINE GRID (7 Days selector cards) */}
        <section id="weekly-overview" className="space-y-3">
          
          {/* OVERALL PLAN PROGRESS BAR */}
          <div className="mb-4 bg-neutral-950 border border-dark-border rounded-xl p-4 shadow-lg shadow-black/20">
            <div className="flex justify-between items-end mb-2.5">
               <span className="font-condensed font-extrabold tracking-wider text-neutral-400 uppercase text-[11px]">
                 7-DAY WARRIOR PLAN PROGRESS
               </span>
               <span className="font-mono text-emerald-400 font-bold text-[11px]">
                  {completedDaysCount} / 7 DAYS COMPLETED
               </span>
            </div>
            <div className="h-2 w-full bg-neutral-900 border border-dark-border/50 rounded-full overflow-hidden relative">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${(completedDaysCount / 7) * 100}%` }}
                 transition={{ duration: 1.2, ease: "easeOut" }}
                 className="absolute top-0 left-0 h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.8)]"
               />
            </div>
          </div>

          <div className="flex justify-between items-center px-1">
            <span className="font-condensed text-xs font-bold uppercase tracking-wider text-neutral-400">
              TRAINING MATRIX WEEK TIMELINE
            </span>
            <span className="font-condensed text-xs text-neutral-500 uppercase">
              Click Focus day to begin tracking
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {userWeeklyPlan.map((day) => {
              const { fraction, count, total, isFull } = getDayCompletionsCount(day.id);
              const isActive = day.id === activeDayId;

              const getCardBorderClass = (type: string) => {
                if (isActive) return "border-fire shadow-[0_4px_24px_rgba(255,69,0,0.15)] bg-neutral-900";
                return "border-dark-border hover:border-neutral-700 bg-dark-card";
              };

              const getAccentHeaderBar = (type: string) => {
                switch (type) {
                  case "fire": return "from-fire to-gold";
                  case "blue": return "from-accent2 to-blue-500";
                  case "gold": return "from-gold to-orange-500";
                  default: return "from-neutral-700 to-neutral-500";
                }
              };

              return (
                <motion.button
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * day.number, duration: 0.4 }}
                  key={day.id}
                  id={`btn-day-card-${day.number}`}
                  onClick={() => handleSelectDay(day.id)}
                  className={`relative text-left rounded-xl border p-4 transition-colors duration-200 overflow-hidden group flex flex-col justify-between h-32 ${getCardBorderClass(day.badgeType)}`}
                >
                  {/* Accent Header Line */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getAccentHeaderBar(day.badgeType)}`} />

                  {/* Add an animated subtle image inside the active card for extra polish */}
                  <AnimatePresence>
                    {isActive && (
                      <motion.img 
                        initial={{ opacity: 0, scale: 1.2 }}
                        animate={{ opacity: 0.15, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        src={`https://picsum.photos/seed/workout-${day.number}/400/300?grayscale=1`}
                        alt="Workout detail"
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover z-0 mix-blend-overlay pointer-events-none"
                      />
                    )}
                  </AnimatePresence>

                  <div className="relative z-10">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-[9px] font-bold text-stone-500">
                        DAY 0{day.number}
                      </span>
                      {isFull && (
                        <motion.div 
                          initial={{ scale: 0 }} 
                          animate={{ scale: 1 }} 
                          transition={{ type: "spring" }}
                        >
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        </motion.div>
                      )}
                    </div>
                    <h3 className="font-bebas text-lg leading-tight tracking-wide text-white group-hover:text-fire transition">
                      {day.name}
                    </h3>
                  </div>

                  <div className="mt-3 relative z-10">
                    <span className="text-[10px] font-mono text-stone-400 uppercase tracking-tight block">
                      {day.category}
                    </span>
                    
                    {/* Progress tracking indicator */}
                    <div className="flex justify-between items-center mt-1.5">
                      <span className="text-[9px] font-condensed tracking-wider font-extrabold text-neutral-500 uppercase">
                        Sets Checked
                      </span>
                      <span className={`font-mono text-[10px] font-extrabold ${isFull ? "text-emerald-400" : "text-gold"}`}>
                        {isFull ? "SECURED" : `${count}/${total}`}
                      </span>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </section>

        {/* 4. DETAILS DRILL MATRIX & WORKOUT CONTROLLERS (ACTIVE MODE DRAWER) */}
        <section id="active-day-matrix" className="bg-dark-card border border-dark-border rounded-xl overflow-hidden p-6 relative">
          
          {/* Subtle fire top accent stripe */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-fire via-gold to-accent2" />

          {/* Panel Top Heading info */}
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6 pb-5 border-b border-dark-border">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm tracking-widest font-bold text-fire">
                  DAY 0{currentDay.number} COMPLIANCE PANEL
                </span>
                <span className="px-2 py-0.5 rounded text-[9px] font-condensed font-bold bg-fire/15 text-fire uppercase tracking-widest border border-fire/20">
                  {currentDay.category}
                </span>
                {activeProgress.isFullyCompleted && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-condensed font-bold bg-emerald-500/10 text-emerald-400 uppercase tracking-widest border border-emerald-500/20">
                    DEFEATED LOGGED
                  </span>
                )}
              </div>
              
              <h2 className="font-bebas text-4xl text-white tracking-wide mt-1.5">
                {currentDay.name} WORKOUT SHEET
              </h2>
            </div>

            {/* Timers and dynamic reset block */}
            <div className="flex items-center gap-4 text-xs">
              <div className="bg-neutral-950 border border-dark-border rounded-lg px-4 py-2 flex items-center gap-2.5">
                <Clock className="h-4 w-4 text-neutral-500 rotate-12" />
                <div className="text-left font-mono">
                  <span className="text-[9px] uppercase font-condensed tracking-wider text-neutral-400 block mb-0.5">Workout Running</span>
                  <span id="workout-timer-clock" className="text-white text-md font-extrabold">
                    {formatTime(liveDuration)}
                  </span>
                </div>
              </div>

              <button
                id="btn-active-reset"
                onClick={handleResetCurrentProgress}
                className="min-w-[44px] min-h-[44px] py-3 px-4 sm:py-2.5 sm:px-3 rounded-lg border border-dark-border/60 hover:border-rose-500 hover:bg-neutral-900 bg-neutral-950 text-xs sm:text-[10px] text-neutral-400 hover:text-rose-500 font-condensed font-bold uppercase tracking-wider transition duration-150 touch-manipulation"
                title="Wipe checklists for this day"
              >
                CLEAR REPS
              </button>

              <button
                onClick={handleChallengeFriend}
                className="min-w-[44px] min-h-[44px] py-3 px-4 sm:py-2.5 sm:px-3 rounded-lg border border-gold/40 hover:border-gold hover:bg-gold/10 bg-neutral-950 text-xs sm:text-[10px] text-gold font-condensed font-bold uppercase tracking-wider transition duration-150 touch-manipulation flex items-center gap-2"
                title="Challenge a friend with this routine"
              >
                <Share2 className="w-3.5 h-3.5 hidden sm:block" />
                CHALLENGE
              </button>
            </div>
          </div>

          {/* DAY CARD FORM - REST & RECOVER CONDITIONAL BODY */}
          {currentDay.id === "day-7" ? (
            <div id="rest-day-active-panel" className="text-center py-10 max-w-lg mx-auto">
              <Coffee className="h-16 w-16 text-neutral-600 mx-auto mb-4 animate-[bounce_8s_infinite]" />
              <h3 className="font-bebas text-3xl text-white tracking-wide">
                ACTIVE RECOVERY PROTOCOL DECLARED
              </h3>
              <p className="text-xs text-neutral-300 leading-relaxed mt-2.5">
                Warrior training breaks fibers, which are reconstituted during high-intensity rest periods. Dedicate today to extensive mobility flow, muscular stretching, and active walking. Squeeze light contraction in standard plank holds to align structural joints.
              </p>
              
              <div className="text-left mt-8 space-y-4">
                <span className="font-condensed text-[10px] font-bold tracking-widest text-fire block uppercase text-center">
                  Mandatory Reinvigorative Drills
                </span>

                {currentDay.exercises.map((ex, index) => {
                  const isChecked = activeProgress.exerciseSetsCompleted[ex.name]?.[0];
                  return (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover="hover"
                      transition={{ delay: 0.1 * index, duration: 0.3 }}
                      key={index}
                      id={`rest-drill-${index}`}
                      className="group relative overflow-hidden flex items-center justify-between p-3.5 bg-neutral-950 border border-dark-border rounded-lg"
                    >
                      {/* 🖼️ Hover Image Reveal */}
                      <motion.img 
                        variants={{
                          hover: { opacity: 0.15, scale: 1.05 }
                        }}
                        initial={{ opacity: 0, scale: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        src={`https://picsum.photos/seed/${ex.name.replace(/\s+/g, '')}recovery/800/150?grayscale=1`}
                        alt="recovery drill background"
                        referrerPolicy="no-referrer"
                        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none mix-blend-overlay"
                      />
                      <div className="relative z-10 flex flex-col items-start gap-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-condensed font-bold text-sm text-stone-200">
                            {ex.name}
                          </h4>
                          {ex.video_url && (
                            <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 transition-colors" title="View video demonstration">
                              <PlayCircle className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                        <span className="text-[10px] font-condensed text-neutral-500 font-semibold uppercase tracking-wider block">
                          Duration target: {ex.sets}
                        </span>
                      </div>
                      <button
                        id={`btn-check-rest-${index}`}
                        onClick={() => handleToggleSet(ex.name, 0)}
                        className={`min-h-[44px] h-11 sm:h-7 px-4 sm:px-3 rounded-lg sm:rounded border text-xs sm:text-[10px] font-condensed font-extrabold uppercase tracking-widest transition duration-150 flex items-center justify-center touch-manipulation relative z-10 ${
                          isChecked
                            ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-400"
                            : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-white"
                        }`}
                      >
                        {isChecked ? "COMPLETED" : "MARK DONE"}
                      </button>
                    </motion.div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-dark-border flex justify-center">
                <button
                  id="btn-declare-rest-completed"
                  onClick={handleSaveWorkoutCompletion}
                  className="min-h-[52px] py-4 sm:py-3 px-8 rounded-lg bg-emerald-500 border border-emerald-500 hover:bg-emerald-400 text-stone-950 font-condensed font-extrabold tracking-widest text-base sm:text-sm uppercase transition flex items-center gap-1.5 touch-manipulation"
                >
                  <CheckCircle className="h-4 w-4" /> SECURE RECOVERY DAY
                </button>
              </div>

            </div>
          ) : (
            // REGULAR TRAIN DAY ACTIVE WORKOUT LISTS
            <div id="regular-train-active-panel" className="space-y-6">
              
              {/* Exercises Table Rows */}
              <div>
                <span className="font-condensed text-xs font-bold tracking-widest text-fire block mb-3 uppercase">
                  PRIMARY STRENGTH ANCHORS ({currentDay.exercises.length} EXERCISES)
                </span>

                {/* Exercises list wrapper */}
                <div className="space-y-3">
                  {currentDay.exercises.map((ex, idx) => {
                    const progressSets = activeProgress.exerciseSetsCompleted[ex.name] || new Array(ex.setsCount).fill(false);
                    const isAllDone = progressSets.every(Boolean);

                    return (
                      <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover="hover"
                        transition={{ delay: 0.1 * idx, duration: 0.4 }}
                        key={idx}
                        id={`exercise-card-row-${idx}`}
                        className={`group relative overflow-hidden bg-neutral-950/80 border rounded-xl p-4 transition-colors duration-150 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                          isAllDone ? "border-emerald-500/20 bg-emerald-500/50" : "border-dark-border"
                        }`}
                      >
                        {/* 🖼️ Hover Image Reveal */}
                        <motion.img 
                          variants={{
                            hover: { opacity: 0.15, scale: 1.05 }
                          }}
                          initial={{ opacity: 0, scale: 1 }}
                          transition={{ duration: 0.4, ease: "easeOut" }}
                          src={`https://picsum.photos/seed/${ex.name.replace(/\s+/g, '')}calisthenics/800/200?grayscale=1`}
                          alt="exercise background"
                          referrerPolicy="no-referrer"
                          className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none mix-blend-overlay"
                        />
                        
                        {/* Muscle/Move Info info */}
                        <div className="flex-1 relative z-10">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-neutral-900 border border-dark-border text-[10px] font-bold text-neutral-400 flex items-center justify-center font-mono">
                              0{idx+1}
                            </span>
                            <h4 className="font-bebas text-xl text-stone-100 tracking-wide">
                              {ex.name}
                            </h4>
                            {ex.video_url && (
                              <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 transition-colors ml-1" title="View video demonstration">
                                <PlayCircle className="w-5 h-5" />
                              </a>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2.5 mt-1.5 font-condensed">
                            <span className="text-xs text-neutral-400">
                              Base: <strong className="text-white font-medium">{ex.sets}</strong>
                            </span>
                            <span className="text-neutral-600">•</span>
                            <span className="text-xs text-neutral-400">
                              Scaled reps: <strong className="text-gold font-bold">{getScaledRepText(ex)}</strong>
                            </span>
                          </div>
                        </div>

                        {/* Interactive set boxes clicking */}
                        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto self-stretch md:self-center justify-start md:justify-end relative z-10">
                          <span className="text-[10px] font-condensed text-neutral-500 font-extrabold tracking-widest uppercase md:mr-1">
                            CHECK COMPLETED SETS:
                          </span>
                          
                          <div className="flex gap-1.5">
                            {progressSets.map((done, setIdx) => (
                              <button
                                key={setIdx}
                                id={`btn-check-set-${idx}-${setIdx}`}
                                onClick={() => handleToggleSet(ex.name, setIdx, false)}
                                className={`w-11 h-11 sm:w-8 sm:h-8 rounded-lg border font-mono text-sm sm:text-xs font-bold transition flex items-center justify-center touch-manipulation ${
                                  done
                                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                    : "bg-neutral-900 border-neutral-800 hover:border-neutral-500 text-stone-400"
                                }`}
                                title={`Mark set ${setIdx + 1} finalized`}
                              >
                                {done ? <Check className="h-3.5 w-3.5" /> : setIdx + 1}
                              </button>
                            ))}
                          </div>
                        </div>

                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Core exercises block */}
              {currentDay.core && currentDay.core.length > 0 && (
                <div>
                  <span className="font-condensed text-xs font-bold tracking-widest text-gold block mb-3 uppercase">
                    ⚡ EXTREME ANTERIOR CORE ENGINE
                  </span>

                  <div className="space-y-3">
                    {currentDay.core.map((ex, idx) => {
                      const progressSets = activeProgress.coreSetsCompleted[ex.name] || new Array(ex.setsCount).fill(false);
                      const isAllDone = progressSets.every(Boolean);

                      return (
                        <motion.div 
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          whileHover="hover"
                          transition={{ delay: 0.1 * idx, duration: 0.4 }}
                          key={idx}
                          id={`core-card-row-${idx}`}
                          className={`group relative overflow-hidden bg-neutral-950/80 border rounded-xl p-4 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                            isAllDone ? "border-emerald-500/20 bg-emerald-500/50" : "border-dark-border"
                          }`}
                        >
                          {/* 🖼️ Hover Image Reveal */}
                          <motion.img 
                            variants={{
                              hover: { opacity: 0.15, scale: 1.05 }
                            }}
                            initial={{ opacity: 0, scale: 1 }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                            src={`https://picsum.photos/seed/${ex.name.replace(/\s+/g, '')}core/800/200?grayscale=1`}
                            alt="core exercise background"
                            referrerPolicy="no-referrer"
                            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none mix-blend-overlay"
                          />
                          
                          <div className="flex-1 relative z-10">
                            <div className="flex items-center gap-2">
                              <h4 className="font-bebas text-xl text-stone-200 tracking-wide">
                                {ex.name}
                              </h4>
                              {ex.video_url && (
                                <a href={ex.video_url} target="_blank" rel="noopener noreferrer" className="text-emerald-500 hover:text-emerald-400 transition-colors ml-1" title="View video demonstration">
                                  <PlayCircle className="w-5 h-5" />
                                </a>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 font-condensed">
                              <span className="text-xs text-neutral-400">Target config: <strong className="text-white font-medium">{ex.sets}</strong></span>
                              <span className="text-neutral-600">•</span>
                              <span className="text-xs text-neutral-400">Scaled target: <strong className="text-gold font-bold">{getScaledRepText(ex)}</strong></span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 relative z-10">
                            {progressSets.map((done, setIdx) => (
                              <button
                                key={setIdx}
                                id={`btn-check-core-${idx}-${setIdx}`}
                                onClick={() => handleToggleSet(ex.name, setIdx, true)}
                                className={`w-11 h-11 sm:w-8 sm:h-8 rounded-lg border font-mono text-sm sm:text-xs font-bold transition flex items-center justify-center touch-manipulation ${
                                  done
                                    ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                    : "bg-neutral-900 border-neutral-850 hover:border-neutral-700 text-stone-400"
                                }`}
                                title={`Mark core set ${setIdx + 1} finalized`}
                              >
                                {done ? <Check className="h-3.5 w-3.5" /> : setIdx + 1}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Day 6 Brutal Circuits notes display */}
              {currentDay.circuitRounds && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.4 }}
                  className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-xl"
                >
                  <span className="font-bebas text-lg text-orange-400 block tracking-wider">
                    ⚡ CIRCUIT MODE ACTIVE: {currentDay.circuitRounds}
                  </span>
                  <p className="text-xs text-neutral-300 mt-1 leading-relaxed">
                    Perform this as an intense sequential cycle. Run 1 set of each exercise consecutively. Rest exactly 45 to 60 seconds at the end of every complete round. Complete 8 full rounds total for a true biochemical full body metabolic overhaul! Touch each block sets button to register round progression.
                  </p>
                </motion.div>
              )}

              {/* Finisher Block interactive section */}
              {currentDay.finisher && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover="hover"
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="group relative overflow-hidden bg-gradient-to-r from-fire/10 to-transparent border border-fire/20 rounded-xl p-5"
                >
                  {/* 🖼️ Hover Image Reveal */}
                  <motion.img 
                    variants={{
                      hover: { opacity: 0.2, scale: 1.05 }
                    }}
                    initial={{ opacity: 0, scale: 1 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    src={`https://picsum.photos/seed/burnout/800/200?grayscale=1`}
                    alt="finisher burnout background"
                    referrerPolicy="no-referrer"
                    className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none mix-blend-overlay"
                  />
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                    <div>
                      <span className="font-condensed text-[10px] font-bold tracking-widest text-fire uppercase block">
                        HIGH FATIGUE BURNOUT PHASE
                      </span>
                      <h4 className="font-bebas text-2xl text-white tracking-wide mt-1">
                        🔥 {currentDay.finisher.label}: {currentDay.finisher.text}
                      </h4>
                      <p className="text-xs text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                        The ultimate threshold builder. Perform at peak physical output to overload muscle metabolic fiber receptors before closing down the focus session!
                      </p>
                    </div>

                    <button
                      id="btn-finisher-complete"
                      onClick={handleToggleFinisher}
                      className={`min-h-[48px] w-full sm:w-auto py-3 px-5 rounded-lg font-condensed font-extrabold tracking-widest text-sm sm:text-xs transition uppercase touch-manipulation ${
                        activeProgress.finisherCompleted
                          ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400"
                          : "bg-gradient-to-r from-fire to-orange-500 hover:from-fire/90 border border-fire text-stone-950 uppercase"
                      }`}
                    >
                      {activeProgress.finisherCompleted ? "FINISHER COMPLETED" : "MARK FINISHER DONE"}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Complete workout button sheet */}
              <div className="pt-6 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left text-xs text-neutral-500 leading-normal max-w-md">
                  Ensure all checklists and sets are checked off securely in strict biomechanical form for genuine tracker analytics metrics records.
                </div>
                
                <button
                  id="btn-complete-workout"
                  onClick={handleSaveWorkoutCompletion}
                  className="min-h-[52px] w-full sm:w-auto py-4 sm:py-3.5 px-8 rounded-lg bg-emerald-400 hover:bg-emerald-350 border border-emerald-400 font-condensed font-extrabold tracking-widest text-base sm:text-sm text-stone-950 uppercase shadow-lg shadow-emerald-400/10 hover:shadow-emerald-400/20 transition flex items-center justify-center gap-2 touch-manipulation"
                >
                  <Trophy className="h-4.5 w-4.5 fill-current" /> SECURE COMBAT DEFEATED
                </button>
              </div>

            </div>
          )}

        </section>

        {/* 5. MULTI PANEL BENTO SECTIONS (Tabs layout for Clean separation) */}
        <section id="bento-panels" className="space-y-4">
          
          {/* Tabs Selector buttons */}
          <div className="flex border-b border-dark-border/60 overflow-x-auto gap-2 text-stone-400">
            {[
              { id: "leaderboard", label: "GLOBAL RANKING", icon: Trophy },
              { id: "ai", label: "AI COACH", icon: Bot },
              { id: "habits", label: "HABIT TRACKER", icon: ListTodo },
              { id: "profile", label: "INJURY PROFILE", icon: User },
              { id: "nutrition", label: "MACRO CALCULATOR", icon: Flame },
              { id: "technique", label: "TECHNIQUE HUB", icon: BookOpen },
              { id: "rules", label: "WARRIOR RULES", icon: ShieldAlert },
              { id: "history", label: "STREAKS & LOGS", icon: BarChart2 }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = tab.id === activeBentoTab;
              return (
                <button
                  key={tab.id}
                  id={`btn-tab-${tab.id}`}
                  onClick={() => setActiveBentoTab(tab.id as any)}
                  className={`min-h-[52px] py-4 px-5 sm:py-3 sm:px-4 rounded-t-lg font-condensed font-extrabold tracking-wider text-sm sm:text-xs transition duration-150 flex items-center gap-2 whitespace-nowrap uppercase touch-manipulation ${
                    isActive
                      ? "text-white border-b-2 border-fire bg-neutral-900"
                      : "hover:text-stone-200 hover:bg-neutral-950"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-fire" : "text-stone-500"}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Dynamic Content display based on tab state */}
          <div className="bg-dark-card border border-dark-border/80 rounded-xl p-5">
            {activeBentoTab === "nutrition" && (
              <NutritionCalculator />
            )}
            
            {activeBentoTab === "technique" && (
              <TechniqueDrills />
            )}

            {activeBentoTab === "ai" && (
              <AICoachChat currentPlan={userWeeklyPlan} onUpdatePlan={handleUpdatePlan} />
            )}

            {activeBentoTab === "leaderboard" && (
              <LeaderboardSystem />
            )}

            {activeBentoTab === "habits" && (
              <HabitTracker />
            )}

            {activeBentoTab === "profile" && (
              <UserProfileSettings />
            )}

            {activeBentoTab === "rules" && (
              <div id="rules-grid-wrapper" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {WARRIOR_RULES.map((rule, index) => (
                  <div key={index} id={`rule-box-${index}`} className="bg-neutral-950/60 border border-dark-border rounded-xl p-4 flex gap-3">
                    <span className="w-6 h-6 rounded-full bg-fire/10 text-fire border border-fire/20 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5 font-mono">
                      0{index + 1}
                    </span>
                    <div>
                      <h4 className="font-condensed font-bold tracking-wide text-md text-stone-100 uppercase">
                        {rule.title}
                      </h4>
                      <p className="text-xs text-neutral-400 leading-relaxed mt-1">
                        {rule.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeBentoTab === "history" && (
              <ProgressHistory
                logs={historyLogs}
                streak={streak}
                onClearLogs={handleClearHistory}
              />
            )}
          </div>

        </section>

        {/* 6. POLISHED HIGH CONTRAST FOOTER */}
        <footer className="text-center pt-10 pb-12">
          <div className="h-px bg-gradient-to-r from-transparent via-dark-border to-transparent mb-6" />
          <span className="font-bebas text-3xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-fire to-gold selection:text-neutral-900 block">
            DEATH TO WEAKNESS
          </span>
          <p className="font-condensed text-[10px] tracking-widest text-stone-500 uppercase mt-2">
            STRICT MECHANICAL GRAVITY PROTOCOLS · DESIGNED FOR CALISTHENICS NOMADS
          </p>
        </footer>

      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, ChevronRight, Check, X, RotateCcw, Volume2, VolumeX } from "lucide-react";

interface WarmupTimerProps {
  onComplete: () => void;
  onClose: () => void;
}

interface WarmupStep {
  name: string;
  duration: number; // in seconds
  cue: string;
}

const WARMUP_STEPS: WarmupStep[] = [
  { name: "Arm Circles & Rotations", duration: 20, cue: "Big circles forward, then reverse halfway. Keep shoulders relaxed." },
  { name: "Hip Rotations & Swings", duration: 20, cue: "Draw massive circles with your hips. 10s clockwise, 10s counter-clockwise." },
  { name: "Torso Twists (Spine stretch)", duration: 20, cue: "Keep heels glued to the floor, stretch arms sideways, rotate looking behind." },
  { name: "Leg Swings (Left & Right)", duration: 20, cue: "Hold a wall or chair. Swing each leg forward/backward to stretch hamstrings and flexors." },
  { name: "Deep Squat Internal Rotations", duration: 20, cue: "Drop into your deepest squat. Press knees outward with elbows, rotate spine." },
  { name: "Scapular Shrugs (Plank position)", duration: 20, cue: "Push floor away in a plank, sink chest down without bending arms to warm your lats." }
];

export default function WarmupTimer({ onComplete, onClose }: WarmupTimerProps) {
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(WARMUP_STEPS[0].duration);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const activeStep = WARMUP_STEPS[activeStepIndex];

  // Helper sound synthesis
  const playBeep = (freq: number, duration: number, type: OscillatorType = "sine") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.12, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("AudioContext failed:", e);
    }
  };

  const speakVoice = (text: string) => {
    if (!soundEnabled) return;
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const speech = new SpeechSynthesisUtterance(text);
        speech.rate = 1.05;
        window.speechSynthesis.speak(speech);
      }
    } catch (e) {
      console.warn("Voice speech failed:", e);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      speakVoice(`Start ${activeStep.name}. ${activeStep.cue}`);
    }
  }, [activeStepIndex, isPlaying]);

  useEffect(() => {
    if (isPlaying && timeLeft > 0) {
      countdownIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleStepComplete();
            return 0;
          }
          if (prev <= 4) {
            playBeep(400, 0.08, "sine");
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    }

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isPlaying, timeLeft, activeStepIndex]);

  const handleStepComplete = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    
    if (activeStepIndex < WARMUP_STEPS.length - 1) {
      playBeep(700, 0.4, "triangle");
      const nextIdx = activeStepIndex + 1;
      setActiveStepIndex(nextIdx);
      setTimeLeft(WARMUP_STEPS[nextIdx].duration);
    } else {
      playBeep(900, 0.8, "triangle");
      speakVoice("Warrior Warm-up complete! You are primed closely. Let's attack the workout.");
      onComplete();
    }
  };

  const skipStep = () => {
    if (activeStepIndex < WARMUP_STEPS.length - 1) {
      const nextIdx = activeStepIndex + 1;
      setActiveStepIndex(nextIdx);
      setTimeLeft(WARMUP_STEPS[nextIdx].duration);
    } else {
      onComplete();
    }
  };

  const resetWarmup = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setActiveStepIndex(0);
    setTimeLeft(WARMUP_STEPS[0].duration);
    setIsPlaying(false);
  };

  const progressPct = (timeLeft / activeStep.duration) * 100;
  const overallProgressPct = ((activeStepIndex + (activeStep.duration - timeLeft) / activeStep.duration) / WARMUP_STEPS.length) * 100;

  return (
    <div id="warmup-timer-modal" className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-dark-card border border-dark-border rounded-xl shadow-2xl p-6 relative overflow-hidden">
        
        {/* Border Top Accent line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-right from-fire via-gold to-accent2" />

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <span className="font-condensed text-xs font-bold tracking-widest text-fire text-left block">
              PHASE 01: NON-NEGOTABLE WARM-UP
            </span>
            <h3 className="font-bebas text-2xl tracking-wide text-white mt-0.5">
              2 MIN DYNAMIC ROTATIONS
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              id="warmup-sound-toggle"
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playBeep(500, 0.1);
              }}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-dark-border bg-neutral-900 text-neutral-400 hover:text-white touch-manipulation"
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 text-rose-500" />}
            </button>
            <button
              id="warmup-close"
              onClick={onClose}
              className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border border-dark-border bg-neutral-900 text-neutral-400 hover:text-white touch-manipulation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Total Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-[10px] uppercase font-condensed tracking-wider text-neutral-400 mb-1.5">
            <span>Overall Warmup Progress</span>
            <span>Step {activeStepIndex + 1} of {WARMUP_STEPS.length}</span>
          </div>
          <div className="h-1 bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
            <div 
              className="bg-fire h-full transition-all duration-300" 
              style={{ width: `${overallProgressPct}%` }}
            />
          </div>
        </div>

        {/* Main Display panel */}
        <div className="bg-black/40 border border-dark-border rounded-xl p-8 mb-6 relative">
          
          <div className="text-center">
            <span className="font-bebas text-sm text-gold tracking-widest uppercase">
              ACTIVE DRILL
            </span>
            <h4 id="warmup-drill-name" className="font-bebas text-3xl text-white mt-1 leading-tight tracking-wide">
              {activeStep.name}
            </h4>
            
            {/* Countdown string */}
            <div id="warmup-countdown" className="font-bebas text-7xl font-bold tracking-tight text-white my-4 tabular-nums">
              {timeLeft}s
            </div>

            {/* Circular progress visual or styled description block */}
            <div className="px-4 py-2 bg-neutral-900/40 rounded-lg inline-block text-xs text-neutral-300 border border-neutral-850 max-w-sm">
              <span className="text-fire font-bold uppercase block tracking-wider text-[10px] mb-1">Warrior Cue</span>
              {activeStep.cue}
            </div>
          </div>
        </div>

        {/* Stepper Timeline List */}
        <div className="grid grid-cols-6 gap-1 mb-6">
          {WARMUP_STEPS.map((step, idx) => (
            <div 
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx < activeStepIndex 
                  ? "bg-fire" 
                  : idx === activeStepIndex 
                    ? "bg-gold animate-pulse" 
                    : "bg-neutral-800"
              }`}
              title={step.name}
            />
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex gap-2 sm:gap-3 mt-4">
          <button
            id="warmup-btn-reset"
            onClick={resetWarmup}
            className="min-h-[52px] min-w-[52px] sm:px-4 sm:py-3 rounded-lg border border-dark-border bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition flex items-center justify-center touch-manipulation"
            title="Restart from beginning"
          >
            <RotateCcw className="h-5 w-5 sm:h-4 sm:w-4" />
          </button>

          <button
            id="warmup-btn-play-pause"
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex-1 min-h-[52px] py-3 rounded-lg flex items-center justify-center gap-2 font-condensed font-extrabold tracking-widest text-base sm:text-sm transition uppercase border touch-manipulation ${
              isPlaying 
                ? "bg-neutral-800 border-neutral-700 hover:bg-neutral-700 text-white" 
                : "bg-fire border-fire hover:bg-fire/85 text-white shadow-lg shadow-fire/20"
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="h-5 w-5 sm:h-4 sm:w-4 fill-current animate-pulse" /> PAUSE
              </>
            ) : (
              <>
                <Play className="h-5 w-5 sm:h-4 sm:w-4 fill-current" /> START
              </>
            )}
          </button>

          <button
            id="warmup-btn-skip"
            onClick={skipStep}
            className="min-h-[52px] px-4 py-3 sm:px-4 sm:py-3 rounded-lg border border-dark-border bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition font-condensed text-sm sm:text-xs font-bold tracking-wider touch-manipulation"
          >
            {activeStepIndex === WARMUP_STEPS.length - 1 ? "FINISH" : "SKIP"}
          </button>
        </div>

        {/* Bottom manual bypass */}
        <div className="mt-5 text-center">
          <button
            id="warmup-btn-instant-complete"
            onClick={onComplete}
            className="min-h-[44px] px-4 text-[11px] sm:text-[10px] font-condensed tracking-widest text-neutral-500 hover:text-fire transition uppercase font-semibold touch-manipulation"
          >
            BYPASS TIMED WARM-UP & MARK COMPLETED
          </button>
        </div>
      </div>
    </div>
  );
}

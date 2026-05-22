import React, { useEffect, useState, useRef } from "react";
import { Play, Pause, RotateCcw, Plus, Minus, X, Volume2, VolumeX } from "lucide-react";

interface RestTimerProps {
  key?: string;
  initialSeconds: number;
  exerciseName: string;
  setNumber: number;
  onClose: () => void;
}

export default function RestTimer({ initialSeconds, exerciseName, setNumber, onClose }: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(initialSeconds);
  const [isActive, setIsActive] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Web Audio Context for a high-intensity workout synth beep
  const playBeep = (freq: number, duration: number, type: OscillatorType = "sine") => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gainNode.gain.setValueAtTime(0.15, ctx.currentTime);
      
      // fade out smoothly
      gainNode.gain.exponentialRampToValueAtTime(0.00001, ctx.currentTime + duration);
      
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("AudioContext failed:", e);
    }
  };

  // Text-To-Speech for supreme warrior motivation
  const speakVoice = (text: string) => {
    if (!soundEnabled) return;
    try {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel(); // stop current speech
        const speech = new SpeechSynthesisUtterance(text);
        speech.rate = 1.05;
        window.speechSynthesis.speak(speech);
      }
    } catch (e) {
      console.warn("TTS failed:", e);
    }
  };

  useEffect(() => {
    // Initial Rest Notification Voice
    speakVoice(`Rest initiated. Next up: set ${setNumber + 1} of ${exerciseName}`);
  }, [exerciseName, setNumber]);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            playBeep(880, 0.8, "triangle"); // High final buzzer beep
            speakVoice("Rest complete! Back to the grind.");
            return 0;
          }
          // Tick sound in the final 3 seconds
          if (prev <= 4) {
            playBeep(440, 0.1, "sine");
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const add15s = () => setTimeLeft((prev) => prev + 15);
  const subtract15s = () => setTimeLeft((prev) => Math.max(0, prev - 15));
  const restartTimer = () => {
    setTimeLeft(initialSeconds);
    setIsActive(true);
    speakVoice("Timer restarted.");
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = (timeLeft / initialSeconds) * 100;

  return (
    <div 
      id="rest-timer-floating"
      className="fixed bottom-6 right-6 z-50 w-80 bg-black/95 border-2 border-fire rounded-xl shadow-2xl p-4 text-white overflow-hidden backdrop-blur-md animate-fade-in transition-all"
    >
      {/* Dynamic Background Fire Glow */}
      <div className="absolute -bottom-10 -right-10 w-24 h-24 bg-fire/20 rounded-full blur-[30px]" />
      
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <span className="font-condensed text-xs font-bold uppercase tracking-wider text-fire">
            REST ENGINE ACTIVE
          </span>
          <h4 className="font-bebas text-lg tracking-wide leading-tight mt-0.5 truncate max-w-[180px]">
            {exerciseName}
          </h4>
          <p className="text-[10px] text-muted-foreground">
            Preparing for Set {setNumber + 2} (Done with Set {setNumber + 1})
          </p>
        </div>
        
        <div className="flex gap-2">
          <button 
            id="toggle-timer-sound"
            onClick={() => {
              setSoundEnabled(!soundEnabled);
              playBeep(600, 0.15);
            }}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition touch-manipulation"
            title={soundEnabled ? "Mute audio" : "Unmute audio"}
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 text-rose-500" />}
          </button>
          
          <button 
            id="close-rest-timer"
            onClick={onClose}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition touch-manipulation"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Progress Circle & Counter */}
      <div className="relative flex flex-col items-center justify-center my-4 py-1">
        <div className="font-bebas text-6xl font-bold tracking-tight text-white mb-1 tabular-nums">
          {minutes.toString().padStart(2, "0")}:{seconds.toString().padStart(2, "0")}
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-neutral-900 h-1.5 rounded-full overflow-hidden border border-neutral-800">
          <div 
            className="bg-gradient-to-right from-fire to-gold h-full rounded-full transition-all duration-1000"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-5 gap-1.5">
        <button 
          id="btn-rest-minus"
          onClick={subtract15s}
          className="col-span-1 min-h-[48px] p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 flex justify-center items-center text-sm sm:text-xs text-neutral-300 font-bold transition duration-150 touch-manipulation"
          title="-15 Seconds"
        >
          -15s
        </button>
        
        <button 
          id="btn-rest-toggle"
          onClick={toggleTimer}
          className={`col-span-3 min-h-[48px] py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 text-sm sm:text-xs font-bold font-condensed tracking-wider transition duration-150 uppercase touch-manipulation ${
            isActive 
              ? "bg-zinc-800 border border-neutral-700 hover:bg-neutral-700 text-white" 
              : "bg-fire hover:bg-fire/90 text-white border border-fire"
          }`}
        >
          {isActive ? (
            <>
              <Pause className="h-4 w-4 fill-current relative -top-[1px]" /> PAUSE REST
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current relative -top-[1px]" /> RESUME REST
            </>
          )}
        </button>

        <button 
          id="btn-rest-plus"
          onClick={add15s}
          className="col-span-1 min-h-[48px] p-2 rounded-lg bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 flex justify-center items-center text-sm sm:text-xs text-neutral-300 font-bold transition duration-150 touch-manipulation"
          title="+15 Seconds"
        >
          +15s
        </button>
      </div>

      <div className="mt-3 flex justify-between gap-2">
        <button
          id="btn-rest-restart"
          onClick={restartTimer}
          className="flex-1 min-h-[44px] py-2 px-3 rounded-lg bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 flex items-center justify-center gap-1.5 text-xs sm:text-[10px] font-condensed font-bold tracking-widest uppercase transition text-neutral-400 hover:text-white touch-manipulation"
        >
          <RotateCcw className="h-3.5 w-3.5" /> RESTART
        </button>
        <button
          id="btn-rest-skip"
          onClick={onClose}
          className="flex-1 min-h-[44px] py-2 px-3 rounded-lg bg-fire/15 hover:bg-fire/25 border border-fire/30 hover:border-fire/50 flex items-center justify-center text-xs sm:text-[10px] font-condensed font-bold tracking-widest uppercase transition text-fire touch-manipulation"
        >
          SKIP REST →
        </button>
      </div>
    </div>
  );
}

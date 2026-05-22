import React from "react";
import { HistoryLog } from "../types";
import { Award, Zap, Calendar, Trash2, Clock, CheckCircle } from "lucide-react";

interface ProgressHistoryProps {
  logs: HistoryLog[];
  onClearLogs: () => void;
  streak: number;
}

export default function ProgressHistory({ logs, onClearLogs, streak }: ProgressHistoryProps) {
  
  // Format seconds to high fidelity readable string (e.g. 14 mins 30 secs)
  const formatDuration = (totalSec: number) => {
    if (totalSec < 60) return `${totalSec}s`;
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (e) {
      return dateStr;
    }
  };

  // Build a tiny visual calendar overview of the 7 Days
  // Group logs by dayNumber keys to see what was checked
  const completedDayNumbers = new Set(logs.map((l) => l.dayNumber));

  return (
    <div id="progress-history-wrapper" className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* 1. STREAK & SUMMARY PANEL */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4 border-b border-dark-border pb-3">
            <Zap className="h-5 w-5 text-fire" />
            <h3 className="font-bebas text-xl tracking-wide text-white">
              WARRIOR ANALYTICS
            </h3>
          </div>

          <div className="space-y-4">
            
            {/* Active Streak Count */}
            <div className="bg-neutral-950 border border-dark-border/60 rounded-lg p-4 text-center relative overflow-hidden">
              <div className="absolute -right-5 -bottom-5 opacity-5 pointer-events-none">
                <Zap className="h-24 w-24 text-fire fill-current" />
              </div>
              <span id="streak-counter" className="font-bebas text-5xl text-fire font-bold block leading-none">
                {streak}
              </span>
              <span className="font-condensed text-[10px] font-extrabold tracking-widest text-neutral-400 uppercase mt-2 block">
                CURRENT WARRIOR STREAK (DAYS)
              </span>
              <p className="text-[10px] text-neutral-500 mt-1">
                Train consecutive days without breaking flow!
              </p>
            </div>

            {/* Overall stats */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-neutral-950 border border-dark-border/40 rounded-lg p-3 text-center">
                <span id="total-workouts" className="font-bebas text-3xl text-white block">
                  {logs.length}
                </span>
                <span className="font-condensed text-[9px] font-bold text-neutral-400 tracking-wider block uppercase">
                  TOTAL COMPLETED
                </span>
              </div>
              
              <div className="bg-neutral-950 border border-dark-border/40 rounded-lg p-3 text-center">
                <span id="program-percentage" className="font-bebas text-3xl text-gold block">
                  {Math.round((completedDayNumbers.size / 7) * 100)}%
                </span>
                <span className="font-condensed text-[9px] font-bold text-neutral-400 tracking-wider block uppercase">
                  PLAN COMPLETION
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic Motivation advice based on consistency */}
        <div className="mt-6 p-3 bg-neutral-950/60 border border-dark-border/40 rounded-lg">
          <span className="text-gold font-condensed text-[10px] uppercase font-bold tracking-wider block mb-1">
            WARRIOR MEDAL METRIC
          </span>
          <p className="text-[11px] text-neutral-400 leading-normal">
            {streak === 0 
              ? "Stand up. Prepare your running shoes. Day 1 is waiting." 
              : streak < 3 
                ? "Initiation complete. Tendons are swelling. Maintain standard posture!" 
                : "Hypertrophy threshold breached! You are executing beast level calisthenics."}
          </p>
        </div>

      </div>

      {/* 2. PLAN COMPLIANCE CHECKER */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4 border-b border-dark-border pb-3">
            <Calendar className="h-5 w-5 text-accent2" />
            <h3 className="font-bebas text-xl tracking-wide text-white">
              7-DAY CHECKLIST PROGRESS WEEK
            </h3>
          </div>

          <p className="text-xs text-neutral-400 mb-4">
            Review your weekly compliance grid. Complete all 7 days for ultimate certification.
          </p>

          <div className="space-y-2">
            {[1, 2, 3, 4, 5, 6, 7].map((num) => {
              const isDone = completedDayNumbers.has(num);
              
              const getDayDesc = (n: number) => {
                switch(n) {
                  case 1: return "Shoulders";
                  case 2: return "Posterior";
                  case 3: return "Legs";
                  case 4: return "Chest & Tris";
                  case 5: return "Posterior+";
                  case 6: return "Full Body";
                  default: return "Active Rest";
                }
              };

              return (
                <div 
                  key={num}
                  id={`checklist-grid-day-${num}`}
                  className={`flex items-center justify-between p-2 rounded-lg border text-sm transition ${
                    isDone 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300" 
                      : "bg-neutral-950/60 border-dark-border text-neutral-400 w-full"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-xs font-bold text-neutral-500">D0{num}</span>
                    <span className="font-condensed font-bold tracking-wider uppercase text-white">
                      {getDayDesc(num)}
                    </span>
                  </div>
                  
                  {isDone ? (
                    <span className="flex items-center gap-1 text-[10px] font-condensed font-bold tracking-wider text-emerald-400 uppercase">
                      <CheckCircle className="h-3.5 w-3.5" /> DRILL DEFEATED
                    </span>
                  ) : (
                    <span className="text-[10px] font-condensed tracking-wider font-bold text-neutral-600 uppercase">
                      INCOMPLETE
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 text-center">
          <span className="text-[9px] font-condensed tracking-widest text-neutral-500 uppercase">
            Consistency Bypasses Genetics
          </span>
        </div>
      </div>

      {/* 3. HISTORIAL ACTIVITY LOGS */}
      <div className="bg-dark-card border border-dark-border rounded-xl p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4 border-b border-dark-border pb-3">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-gold" />
              <h3 className="font-bebas text-xl tracking-wide text-white">
                WARRIOR LOGS
              </h3>
            </div>
            
            {logs.length > 0 && (
              <button
                id="btn-clear-history"
                onClick={onClearLogs}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-500 hover:text-rose-500 transition rounded-lg hover:bg-neutral-900 touch-manipulation"
                title="Wipe workout logs"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {logs.length === 0 ? (
              <div className="text-center py-10 text-neutral-500">
                <Award className="h-8 w-8 text-neutral-700 mx-auto mb-2" />
                <p className="font-condensed text-xs font-bold tracking-wide uppercase">No Battles Fought Yet</p>
                <p className="text-[10px] text-neutral-600 mt-1 max-w-xs mx-auto">
                  Complete your first workout to record metrics and calculate streak counts!
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div 
                  key={log.id} 
                  id={`workout-log-${log.id}`}
                  className="bg-neutral-950 border border-dark-border rounded-lg p-3 text-xs flex justify-between items-center hover:border-neutral-700 transition"
                >
                  <div>
                    <span className="font-condensed text-[10px] font-bold text-fire uppercase block tracking-wider">
                      DAY 0{log.dayNumber} · {log.dayName}
                    </span>
                    <span className="text-[10px] text-neutral-500 font-mono mt-0.5 block">
                      {formatDate(log.completedAt)}
                    </span>
                  </div>

                  <div className="text-right flex flex-col items-end">
                    <span className="font-condensed text-neutral-300 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3 text-neutral-500" />
                      {formatDuration(log.durationSeconds)}
                    </span>
                    <span className="text-[9px] text-gold font-condensed font-semibold tracking-wider block mt-0.5">
                      ★ STREAK: {log.streakAtCompletion}D
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {logs.length > 0 && (
          <div className="mt-4 pt-4 border-t border-dark-border/40 text-center">
            <span className="text-[10px] text-neutral-500 font-medium">
              Showing last {logs.length} completions
            </span>
          </div>
        )}
      </div>

    </div>
  );
}

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TECHNIQUE_DRILLS } from "../data";
import { TechniqueDrill } from "../types";
import { BookOpen, Star, AlertTriangle, ChevronRight, HelpCircle, Trophy } from "lucide-react";

export default function TechniqueDrills() {
  const [activeDrillId, setActiveDrillId] = useState<string>(TECHNIQUE_DRILLS[0].id);
  const activeDrill = TECHNIQUE_DRILLS.find((d) => d.id === activeDrillId) || TECHNIQUE_DRILLS[0];

  const getDifficultyBadgeColor = (diff: string) => {
    switch (diff) {
      case "Beginner": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "Intermediate": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "Advanced": return "bg-fire/15 text-fire border-fire/20";
      case "Beast": return "bg-gold/15 text-gold border-gold/20";
      default: return "bg-neutral-800 text-neutral-400 border-neutral-700";
    }
  };

  return (
    <div id="rechnique-hub-container" className="bg-dark-card border border-dark-border rounded-xl overflow-hidden relative">
      <div className="border-b border-dark-border bg-neutral-950 p-4 flex items-center gap-2.5 relative z-10">
        <BookOpen className="h-5 w-5 text-fire" />
        <div>
          <h3 className="font-bebas text-xl text-white tracking-wide">
            WARRIOR TECHNIQUE DETAILED PROGRESSION HUB
          </h3>
          <p className="text-[10px] uppercase font-condensed tracking-widest text-neutral-400">
            Learn Regressions & strict form cues for extreme calisthenics postures
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 relative z-10">
        
        {/* Left column list of exercises */}
        <div className="border-r border-dark-border p-3 space-y-2 bg-neutral-950/20 col-span-1">
          <span className="text-[10px] font-condensed tracking-wider font-extrabold text-neutral-500 uppercase block px-1 mb-2">
            Select Advanced Skill
          </span>
          
          {TECHNIQUE_DRILLS.map((drill) => {
            const isActive = drill.id === activeDrillId;
            return (
              <button
                key={drill.id}
                id={`btn-drill-select-${drill.id}`}
                onClick={() => setActiveDrillId(drill.id)}
                className={`min-h-[52px] w-full text-left py-3 px-4 sm:p-2.5 rounded-lg border transition-all flex items-center justify-between group touch-manipulation ${
                  isActive 
                    ? "bg-fire/10 border-fire/30 text-white" 
                    : "bg-neutral-900/40 border-dark-border hover:bg-neutral-900 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <div>
                  <h4 className="font-bebas text-md tracking-wide">
                    {drill.name}
                  </h4>
                  <span className="text-[9px] font-condensed tracking-widest text-neutral-500 uppercase">
                    {drill.targetMuscle}
                  </span>
                </div>
                <ChevronRight className={`h-4 w-4 text-neutral-600 transition-transform ${isActive ? "translate-x-1 text-fire" : "group-hover:translate-x-0.5"}`} />
              </button>
            );
          })}
        </div>

        {/* Right column details of chosen drill - ANIMATED */}
        <div className="md:col-span-2 p-5 bg-neutral-950/40 flex flex-col justify-between relative overflow-hidden">
          
          {/* Animated background image specific to the active drill */}
          <AnimatePresence mode="popLayout">
            <motion.img
              key={`bg-${activeDrill.id}`}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6 }}
              src={`https://picsum.photos/seed/${activeDrill.name.replace(/\s+/g, '')}/800/600?grayscale=1`}
              alt="Technique background"
              referrerPolicy="no-referrer"
              className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none mix-blend-overlay"
            />
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeDrill.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 w-full h-full flex flex-col justify-between"
            >
              <div>
                
                {/* Header info */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-dark-border pb-3 mb-4">
                  <div>
                    <h4 id="drill-name" className="font-bebas text-2xl text-white tracking-wide">
                      {activeDrill.name}
                    </h4>
                    <p className="text-xs text-neutral-400 mt-0.5">
                      Target: <strong className="text-white font-medium">{activeDrill.targetMuscle}</strong>
                    </p>
                  </div>
                  <span id="drill-difficulty" className={`px-2.5 py-0.5 rounded text-[10px] font-condensed font-bold border uppercase tracking-widest ${getDifficultyBadgeColor(activeDrill.difficulty)}`}>
                    {activeDrill.difficulty} SKILL
                  </span>
                </div>

                {/* Drill description */}
                <p id="drill-desc" className="text-xs text-neutral-300 leading-relaxed mb-5">
                  {activeDrill.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  {/* Regressional Steps list */}
                  <div className="bg-neutral-950/60 border border-dark-border/60 rounded-lg p-3.5 backdrop-blur-sm">
                    <span className="flex items-center gap-1.5 font-condensed text-[10px] font-extrabold tracking-wider text-fire mb-2 uppercase">
                      <Star className="h-3 w-3 fill-current" /> PROGRESSIVE REGRESSION STEPS
                    </span>
                    
                    <ol id="drill-regs-list" className="space-y-2">
                      {activeDrill.regressionSteps.map((step, idx) => (
                        <motion.li 
                          key={idx}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * idx }}
                          className="flex items-start gap-2.5"
                        >
                          <span className="w-5 h-5 rounded-full bg-neutral-900 border border-dark-border flex items-center justify-center text-[10px] font-bold text-fire shrink-0 mt-0.5 font-mono">
                            0{idx + 1}
                          </span>
                          <span className="text-xs text-neutral-300">
                            {step}
                          </span>
                        </motion.li>
                      ))}
                    </ol>
                  </div>

                  {/* Training Cues */}
                  <div className="bg-neutral-950/60 border border-dark-border/60 rounded-lg p-3.5 backdrop-blur-sm">
                    <span className="flex items-center gap-1.5 font-condensed text-[10px] font-extrabold tracking-wider text-gold mb-2 uppercase">
                      <Trophy className="h-3 w-3 fill-current" /> STRICT WARRIOR CUES
                    </span>
                    
                    <ul id="drill-cues-list" className="space-y-2.5">
                      {activeDrill.keyCues.map((cue, idx) => (
                        <motion.li 
                          key={idx}
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.1 * idx }}
                          className="flex items-start gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                          <span className="text-xs text-neutral-300">
                            {cue}
                          </span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>

                </div>

              </div>

              {/* Tips notification */}
              <div className="mt-6 p-3 bg-neutral-900/60 border border-dark-border/40 rounded-lg text-xs flex gap-2.5 items-start backdrop-blur-sm">
                <AlertTriangle className="h-4 w-4 text-fire shrink-0 mt-0.5" />
                <div>
                  <span className="text-fire font-condensed text-[10px] font-extrabold tracking-wider uppercase block mb-0.5">
                    MIND-MUSCLE SYNERGY TIP
                  </span>
                  <p id="drill-tips" className="text-[11px] text-neutral-400 leading-normal">
                    {activeDrill.tips}
                  </p>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>
        </div>

      </div>

    </div>
  );
}

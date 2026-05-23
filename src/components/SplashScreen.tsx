import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 3500);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden"
    >
      {/* Background Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-fire/10 via-black to-black opacity-60 mix-blend-screen pointer-events-none" />
      
      {/* Center Group */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center pointer-events-none"
      >
        <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden mb-8 shadow-[0_0_80px_rgba(220,38,38,0.3)] border border-red-500/20">
            <img 
              src="https://storage.googleapis.com/mweb-prod-us-central1/5n7t92o2mdf0x26onx3x826p4/0c00de51-789a-41f2-be66-8fde03a891fa" 
              alt="Calisthenics Warrior Logo"
              className="w-full h-full object-cover mix-blend-screen"
            />
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 1 }}
          className="text-4xl md:text-5xl font-bebas tracking-[0.2em] text-white uppercase drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]"
        >
          Calisthenics
        </motion.h1>
        
        <motion.h2
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1.2, duration: 1 }}
           className="text-fire font-condensed tracking-[0.4em] text-sm md:text-base mt-2 uppercase"
        >
          Warrior Protocol
        </motion.h2>

        <motion.div 
           initial={{ width: 0 }}
           animate={{ width: "120px" }}
           transition={{ delay: 1, duration: 1.5, ease: "easeInOut" }}
           className="h-[1px] bg-gradient-to-r from-transparent via-fire to-transparent mt-8 opacity-50"
        />
        
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1.8, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
           className="mt-6 text-[10px] font-condensed tracking-[0.5em] text-neutral-500 uppercase"
        >
          Awakening the Dragon...
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

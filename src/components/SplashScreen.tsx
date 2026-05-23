import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    // 3 seconds splash screen
    const timer = setTimeout(() => {
      onComplete();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: "easeInOut" } }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden"
    >
      {/* Background Image (Biohazard/Glitch Theme) */}
      <div 
        className="absolute inset-0 opacity-40 mix-blend-screen scale-110 pointer-events-none"
        style={{
          backgroundImage: `url('https://storage.googleapis.com/mweb-prod-us-central1/5n7t92o2mdf0x26onx3x826p4/8b3c3735-3004-44ed-bf36-547dfb6efde3')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(2px)',
        }}
      />
      {/* Dark overlay to make text pop */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/30 pointer-events-none" />
      
      {/* Center Logo Group */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center pointer-events-none"
      >
        <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden mb-8 shadow-[0_0_80px_rgba(220,38,38,0.5)]">
            <img 
              src="https://storage.googleapis.com/mweb-prod-us-central1/5n7t92o2mdf0x26onx3x826p4/0c00de51-789a-41f2-be66-8fde03a891fa" 
              alt="App Logo"
              className="w-full h-full object-cover mix-blend-screen"
            />
        </div>
        
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-4xl md:text-6xl font-bebas tracking-[0.2em] text-white uppercase drop-shadow-[0_0_15px_rgba(220,38,38,0.8)]"
        >
          Calisthenics
        </motion.h1>
        
        <motion.h2
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1, duration: 1 }}
           className="text-fire font-condensed tracking-[0.4em] text-sm md:text-base mt-2 uppercase drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]"
        >
          Warrior Protocol
        </motion.h2>

        <motion.div 
           initial={{ width: 0 }}
           animate={{ width: "160px" }}
           transition={{ delay: 0.8, duration: 2, ease: "easeInOut" }}
           className="h-0.5 bg-gradient-to-r from-transparent via-fire to-transparent mt-12 rounded-full opacity-70"
        />
        
        <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           transition={{ delay: 1.5, duration: 1, repeat: Infinity, repeatType: 'reverse' }}
           className="mt-6 text-[10px] font-condensed tracking-[0.5em] text-neutral-500 uppercase"
        >
          Initializing...
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

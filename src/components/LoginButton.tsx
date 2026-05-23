import React, { useState, useEffect } from "react";
import { User, LogIn, LogOut } from "lucide-react";
import { auth, googleProvider, signInWithPopup, signOut, onAuthStateChanged } from "../lib/firebase";
import { Storage } from "../lib/storage";

export function LoginButton() {
  const [user, setUser] = useState(auth.currentUser);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u);
    });
    return unsub;
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      
      // Auto-restore on login
      setIsRestoring(true);
      await Storage.restoreBackup().catch(e => console.error("Restore failed:", e));
      setIsRestoring(false);
      
      // Trigger a refresh of the page or state if needed
      window.location.reload();
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    window.location.reload();
  };

  if (user) {
     return (
       <div className="flex items-center gap-3">
         <span className="text-xs font-mono text-neutral-400 max-w-[100px] truncate">{user.email}</span>
         {isRestoring ? (
           <span className="text-xs font-condensed tracking-wider text-blue-400 animate-pulse uppercase">Restoring...</span>
         ) : null}
         <button 
           onClick={handleLogout}
           className="p-2 bg-neutral-900 border border-dark-border rounded-lg hover:bg-neutral-800 transition"
           title="Sign Out"
         >
           <LogOut className="w-4 h-4 text-neutral-400" />
         </button>
       </div>
     );
  }

  return (
    <button 
      onClick={handleLogin}
      className="flex items-center gap-2 px-3 py-1.5 bg-neutral-900 border border-dark-border rounded-lg hover:border-emerald-500/50 hover:text-emerald-400 transition group touch-manipulation"
    >
      <LogIn className="w-4 h-4 text-neutral-400 group-hover:text-emerald-400" />
      <span className="text-xs font-condensed font-bold tracking-widest uppercase text-neutral-300">Login / Sync</span>
    </button>
  );
}

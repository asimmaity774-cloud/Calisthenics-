import React, { useState, useEffect } from "react";
import { Cloud, CloudOff, RefreshCw, CheckCircle2 } from "lucide-react";
import { auth } from "../lib/firebase";
import { getQueue, Storage } from "../lib/storage";

export function SyncStatusIndicator() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queueLength, setQueueLength] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const checkQueue = async () => {
      const q = await getQueue();
      setQueueLength(q.length);
    };

    // Check periodically or handle events 
    const interval = setInterval(() => {
       checkQueue();
       // Also attempt to sync if queue exists and we're online
       if (navigator.onLine && queueLength > 0 && !isSyncing) {
         setIsSyncing(true);
         Storage.triggerSync().finally(() => {
           setIsSyncing(false);
           checkQueue();
         });
       }
    }, 3000);
    
    checkQueue();
    
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [queueLength, isSyncing]);

  if (!auth.currentUser) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-neutral-900 border border-dark-border px-3 py-1.5 rounded-full shadow-lg text-[10px] font-condensed tracking-widest uppercase">
      {!isOnline ? (
        <>
          <CloudOff className="w-3.5 h-3.5 text-red-500" />
          <span className="text-red-500 font-bold">Offline</span>
          {queueLength > 0 && <span className="text-neutral-500 ml-1">({queueLength} Pending)</span>}
        </>
      ) : queueLength > 0 || isSyncing ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 text-blue-400 animate-spin" />
          <span className="text-blue-400 font-bold">Syncing {queueLength} files</span>
        </>
      ) : (
        <>
          <Cloud className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-emerald-500 font-bold">Backed Up</span>
        </>
      )}
    </div>
  );
}

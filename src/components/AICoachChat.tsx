import React, { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { Send, User as UserIcon, Bot, Dumbbell, Activity, CheckCircle, RefreshCw } from "lucide-react";
import { WorkoutDay } from "../types";
import { Storage } from "../lib/storage";

interface Message {
  role: "user" | "model";
  text: string;
}

interface AICoachChatProps {
  currentPlan: WorkoutDay[];
  onUpdatePlan: (newPlan: WorkoutDay[]) => void;
}

export function AICoachChat({ currentPlan, onUpdatePlan }: AICoachChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load chat history if any (could save to storage)
  useEffect(() => {
    Storage.getData("calisthenics_ai_chat_history").then(history => {
      if (history) {
        setMessages(history);
      } else {
        setMessages([
          { 
            role: "model", 
            text: "Welcome to your personal AI Calisthenics Coach. Need to adapt your plan, scale exercises, or deal with an injury? Just tell me what's going on and I'll adjust your 7-day protocol immediately." 
          }
        ]);
      }
    });
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      Storage.saveData("calisthenics_ai_chat_history", messages, false);
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput("");
    
    const newMessages: Message[] = [...messages, { role: "user", text: userText }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      // In a real app we might pass userProfile like age/weight. For now we pass null or fetch it.
      const userProfile = await Storage.getData("calisthenics_user_profile") || {};

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: newMessages,
          currentPlan: currentPlan,
          userProfile
        })
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const replyStr = data.text || "";
      const newPlan = data.newPlan;

      setMessages(prev => [...prev, {
        role: "model",
        text: newPlan ? `${replyStr}\n\n*YOUR WORKOUT PLAN HAS BEEN DYNAMICALLY UPDATED* ✅` : replyStr 
      }]);

      if (newPlan && Array.isArray(newPlan) && newPlan.length > 0) {
        onUpdatePlan(newPlan);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: "model",
        text: "System Error. My connection to the central database failed. Check your network or try again."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    if (confirm("Clear your AI Coach history?")) {
      const reset = [{ role: "model", text: "Chat history cleared. How can we optimize your training today?" as any }];
      setMessages(reset);
      Storage.saveData("calisthenics_ai_chat_history", reset, false);
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[70vh] bg-neutral-950 border border-dark-border rounded-xl shadow-xl overflow-hidden relative">
      
      {/* Header */}
      <div className="bg-neutral-900 border-b border-dark-border px-4 py-3 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/20 rounded-md">
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-condensed font-bold uppercase tracking-wider text-sm">AI Training Coach</h3>
            <span className="text-[10px] text-emerald-500 font-bold block uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Online
            </span>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 hover:bg-neutral-800 rounded-lg transition text-neutral-400 hover:text-white"
          title="Reset Chat"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-neutral-950 to-neutral-900 custom-scrollbar"
      >
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} w-full`}
          >
            <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              
              <div className="shrink-0 pt-1">
                {msg.role === "user" ? (
                  <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center border border-dark-border">
                    <UserIcon className="h-4 w-4 text-neutral-300" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center border border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                    <Bot className="h-4 w-4 text-neutral-950" />
                  </div>
                )}
              </div>

              <div className={`p-3.5 rounded-2xl text-sm ${
                msg.role === "user" 
                  ? "bg-neutral-800 text-stone-100 rounded-tr-sm border border-neutral-700" 
                  : "bg-neutral-900 text-emerald-50 rounded-tl-sm border border-dark-border shadow-md"
              }`}>
                {msg.text.split("\n").map((line, lineIdx) => (
                   <p key={lineIdx} className={lineIdx > 0 ? "mt-2" : ""}>{line}</p>
                ))}
              </div>

            </div>
          </motion.div>
        ))}

        {isLoading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start w-full">
            <div className="flex gap-3 max-w-[85%] flex-row">
              <div className="shrink-0 pt-1">
                <div className="w-8 h-8 rounded-full bg-emerald-500/50 flex items-center justify-center border border-emerald-400 border-dashed animate-[spin_4s_linear_infinite]">
                  <Bot className="h-4 w-4 text-neutral-950" />
                </div>
              </div>
              <div className="p-3.5 rounded-2xl bg-neutral-900 border border-dark-border rounded-tl-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0ms" }}/>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "150ms" }}/>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }}/>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-3 bg-neutral-900 border-t border-dark-border shrink-0 z-10">
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="relative flex items-center"
        >
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder="e.g., Replace my tricep exercises, I have elbow pain..."
            className="w-full bg-neutral-950 border border-dark-border rounded-full py-3 pl-4 pr-12 text-sm focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-neutral-600 disabled:opacity-50"
          />
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-emerald-500 text-neutral-950 rounded-full hover:bg-emerald-400 transition disabled:opacity-50 disabled:hover:bg-emerald-500"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

    </div>
  );
}

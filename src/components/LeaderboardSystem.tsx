import React, { useState, useEffect } from "react";
import { Trophy, Medal, Crown, Star, Users, Globe, ChevronUp, ChevronDown, Activity, Flame, Award } from "lucide-react";
import { Storage } from "../lib/storage";
import { TrophyCase } from "./TrophyCase";
import { AnimatePresence } from "motion/react";

interface LeaderboardUser {
  id: string;
  name: string;
  points: number;
  workouts: number;
  habits: number;
  streak: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum" | "Diamond" | "Elite" | "Legend";
  isMe?: boolean;
}

const MOCK_GLOBAL_USERS: Omit<LeaderboardUser, "tier">[] = [
  { id: "1", name: "Alex Calisthenics", points: 15420, workouts: 142, habits: 350, streak: 45 },
  { id: "2", name: "Sarah Shreds", points: 14200, workouts: 120, habits: 310, streak: 30 },
  { id: "3", name: "David Irons", points: 12100, workouts: 110, habits: 280, streak: 21 },
  { id: "4", name: "Iron Mike", points: 9500, workouts: 85, habits: 200, streak: 14 },
  { id: "5", name: "Nina Fit", points: 8100, workouts: 65, habits: 180, streak: 12 },
  { id: "6", name: "Jack Aesthetics", points: 7500, workouts: 60, habits: 160, streak: 8 },
  { id: "7", name: "Coach Max", points: 5200, workouts: 45, habits: 100, streak: 5 },
  { id: "8", name: "Gym Bro Luke", points: 4100, workouts: 35, habits: 85, streak: 3 },
  { id: "9", name: "Emma Moves", points: 2800, workouts: 22, habits: 60, streak: 2 },
];

const MOCK_FRIENDS_USERS: Omit<LeaderboardUser, "tier">[] = [
  { id: "1", name: "Alex Calisthenics", points: 15420, workouts: 142, habits: 350, streak: 45 },
  { id: "8", name: "Gym Bro Luke", points: 4100, workouts: 35, habits: 85, streak: 3 },
];

const calculateTier = (points: number): LeaderboardUser["tier"] => {
  if (points > 10000) return "Legend";
  if (points > 7500) return "Elite";
  if (points > 5000) return "Diamond";
  if (points > 2500) return "Platinum";
  if (points > 1000) return "Gold";
  if (points > 500) return "Silver";
  return "Bronze";
};

const getTierColor = (tier: string) => {
  switch (tier) {
    case "Legend": return "text-red-500 border-red-500 bg-red-500/10";
    case "Elite": return "text-purple-400 border-purple-400 bg-purple-500/10";
    case "Diamond": return "text-cyan-400 border-cyan-400 bg-cyan-400/10";
    case "Platinum": return "text-teal-300 border-teal-300 bg-teal-300/10";
    case "Gold": return "text-gold border-gold bg-gold/10";
    case "Silver": return "text-gray-300 border-gray-300 bg-gray-300/10";
    case "Bronze": return "text-amber-600 border-amber-600 bg-amber-600/10";
    default: return "text-white border-white bg-white/10";
  }
};

export function LeaderboardSystem() {
  const [activeTab, setActiveTab] = useState<"global" | "friends">("global");
  const [filterPeriod, setFilterPeriod] = useState<"all" | "monthly" | "weekly">("all");
  const [showTrophies, setShowTrophies] = useState(false);
  const [myUser, setMyUser] = useState<Omit<LeaderboardUser, "tier">>({
    id: "me", name: "You", points: 0, workouts: 0, habits: 0, streak: 0, isMe: true
  });
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);

  useEffect(() => {
    loadMyStats();
  }, []);

  useEffect(() => {
    buildLeaderboard();
  }, [activeTab, filterPeriod, myUser]);

  const loadMyStats = async () => {
    try {
      const historyLogs = await Storage.getData("calisthenics_warrior_history_v1") || [];
      const habitsData = await Storage.getData("calisthenics_habits") || { items: [] };
      const streakStr = await Storage.getData("calisthenics_streak_v1");
      const streak = streakStr ? parseInt(streakStr, 10) : 0;

      const workoutsCompleted = historyLogs.length;
      let habitsCompleted = 0;
      
      if (habitsData.items) {
        habitsData.items.forEach((habit: any) => {
          habitsCompleted += habit.completedDates?.length || 0;
        });
      }

      // Calculate Points
      // 50 pts per workout, 10 pts per habit, bonus for current streak (5 pts per day)
      const calculatedPoints = (workoutsCompleted * 50) + (habitsCompleted * 10) + (streak * 5);

      setMyUser({
        id: "me",
        name: "You",
        points: calculatedPoints,
        workouts: workoutsCompleted,
        habits: habitsCompleted,
        streak: streak,
        isMe: true
      });
    } catch (error) {
      console.error("Error loading stats", error);
    }
  };

  const buildLeaderboard = () => {
    const baseUsers = activeTab === "global" ? MOCK_GLOBAL_USERS : MOCK_FRIENDS_USERS;
    
    // In a real app, filtering by weekly/monthly would filter actual logs by date.
    // For local mock, we slightly discount their points to simulate timeframes.
    let multiplier = 1;
    if (filterPeriod === "monthly") multiplier = 0.4;
    if (filterPeriod === "weekly") multiplier = 0.1;

    let combined = [...baseUsers].map(u => ({
      ...u,
      points: Math.round(u.points * multiplier),
      workouts: Math.round(u.workouts * multiplier),
      habits: Math.round(u.habits * multiplier),
      tier: calculateTier(Math.round(u.points * multiplier))
    }));

    combined.push({
      ...myUser,
      // My stats reflect true total context but in real app handled by db query
      tier: calculateTier(myUser.points)
    });

    // Sort descending by points
    combined.sort((a, b) => b.points - a.points);
    
    setLeaderboard(combined);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-neutral-950/60 border border-dark-border rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gold/20 p-2 rounded-lg border border-gold/30">
              <Trophy className="h-6 w-6 text-gold" />
            </div>
            <div>
              <h3 className="font-bebas text-2xl tracking-wide text-white">LEADERBOARD RANKINGS</h3>
              <p className="text-xs text-neutral-400 font-condensed tracking-widest uppercase">Dominate the global arena</p>
            </div>
          </div>

          {/* Type Toggle */}
          <div className="flex bg-neutral-900 border border-dark-border rounded-lg p-1">
            <button
              onClick={() => setActiveTab("global")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-condensed font-bold uppercase text-xs tracking-wider transition-colors ${
                activeTab === "global" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              Global
            </button>
            <button
              onClick={() => setActiveTab("friends")}
              className={`flex items-center gap-2 px-4 py-2 rounded-md font-condensed font-bold uppercase text-xs tracking-wider transition-colors ${
                activeTab === "friends" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-500 hover:text-white"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Friends
            </button>
          </div>
        </div>

        {/* My Current Rank summary */}
        <div className="bg-gradient-to-r from-neutral-900 to-neutral-950 border border-gold/30 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between shadow-[0_0_15px_rgba(252,211,77,0.05)] relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-gold" />
          
          <div className="flex items-center gap-4 mb-4 sm:mb-0 pl-2">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bebas text-2xl border-2 ${getTierColor(calculateTier(myUser.points))} bg-neutral-950`}>
              {leaderboard.findIndex(u => u.isMe) + 1}
            </div>
            <div>
              <h4 className="font-condensed font-bold text-white text-lg tracking-wider uppercase flex items-center gap-2">
                YOUR RANKING
                <span className={`text-[9px] px-2 py-0.5 rounded border ${getTierColor(calculateTier(myUser.points))}`}>
                  {calculateTier(myUser.points)}
                </span>
              </h4>
              <div className="flex items-center gap-3 text-xs text-neutral-400 font-condensed tracking-wider mt-1">
                <span><b className="text-white">{myUser.points.toLocaleString()}</b> PTS</span>
                <span>•</span>
                <span><b className="text-white">{myUser.workouts}</b> WRKOUTS</span>
                <span>•</span>
                <span><b className="text-white">{myUser.habits}</b> HABITS</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2 flex-col sm:flex-row mt-4 sm:mt-0 items-end sm:items-center">
            <button
              onClick={() => setShowTrophies(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded font-condensed font-bold text-[10px] uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
            >
              <Award className="w-3.5 h-3.5" />
              Trophy Case
            </button>
            <div className="flex gap-2">
              {["all", "monthly", "weekly"].map((period) => (
                <button
                  key={period}
                  onClick={() => setFilterPeriod(period as any)}
                  className={`px-3 py-1.5 rounded font-condensed font-bold text-[10px] uppercase tracking-widest border transition-colors ${
                     filterPeriod === period ? "bg-gold/20 border-gold/40 text-gold" : "bg-neutral-900 border-dark-border text-neutral-500 hover:text-white"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="bg-neutral-950/60 border border-dark-border rounded-xl p-2 sm:p-5">
        <div className="flex text-[10px] sm:text-xs text-neutral-500 font-condensed font-bold tracking-widest uppercase px-4 mb-3">
          <div className="w-12 sm:w-16">RANK</div>
          <div className="flex-1">USER</div>
          <div className="w-16 sm:w-24 text-right">SCORE</div>
        </div>

        <div className="space-y-2">
          {leaderboard.map((user, index) => {
            const rank = index + 1;
            let RankIcon = null;
            if (rank === 1) RankIcon = Crown;
            else if (rank === 2) RankIcon = Medal;
            else if (rank === 3) RankIcon = Medal;

            return (
              <div 
                key={user.id} 
                className={`flex items-center p-3 sm:p-4 rounded-xl border transition-all duration-300 ${
                  user.isMe 
                    ? "bg-gold/5 border-gold/30 shadow-[inset_0_0_15px_rgba(252,211,77,0.05)]" 
                    : "bg-neutral-900 border-dark-border hover:border-neutral-700"
                }`}
              >
                {/* Rank Number */}
                <div className="w-12 sm:w-16 font-bebas text-2xl flex items-center gap-2">
                  <span className={rank === 1 ? "text-gold" : rank === 2 ? "text-gray-300" : rank === 3 ? "text-amber-600" : "text-neutral-500"}>
                    {rank}
                  </span>
                  {RankIcon && (
                    <RankIcon className={`w-4 h-4 ${rank === 1 ? "text-gold" : rank === 2 ? "text-gray-300" : "text-amber-600"}`} />
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`font-condensed font-bold text-base sm:text-lg tracking-wider uppercase ${user.isMe ? "text-gold" : "text-white"}`}>
                      {user.name}
                    </h4>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border hidden sm:inline-block ${getTierColor(user.tier)}`}>
                      {user.tier}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-neutral-500 font-condensed tracking-wider mt-0.5">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-fire" /> {user.streak}
                    </span>
                    <span className="hidden sm:inline-block">•</span>
                    <span className="hidden sm:inline-block flex items-center gap-1">
                      <Activity className="w-3 h-3 text-emerald-500" /> {user.workouts}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="w-16 sm:w-24 text-right">
                  <span className="font-bebas text-xl sm:text-2xl tracking-wider text-white">
                    {user.points.toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-neutral-500 font-condensed uppercase tracking-widest mt-[-2px]">
                    PTS
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <AnimatePresence>
        {showTrophies && (
          <TrophyCase 
            onClose={() => setShowTrophies(false)} 
            myStats={myUser} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

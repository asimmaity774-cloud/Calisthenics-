import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Storage } from '../lib/storage';
import { TrendingUp, Plus, Trash2 } from 'lucide-react';

interface WeightEntry {
  id: string;
  date: string;
  weight: number;
}

export function WeightTracker() {
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [newWeight, setNewWeight] = useState<string>('');

  useEffect(() => {
    Storage.getData("calisthenics_weight_log").then((data) => {
      if (data && Array.isArray(data)) {
        setEntries(data);
      }
    });
  }, []);

  const handleAddWeight = () => {
    if (!newWeight || isNaN(parseFloat(newWeight))) return;

    const entry: WeightEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: parseFloat(newWeight)
    };

    const updatedEntries = [...entries, entry];
    setEntries(updatedEntries);
    Storage.saveData("calisthenics_weight_log", updatedEntries);
    setNewWeight('');
  };

  const handleRemoveEntry = (id: string) => {
    const updatedEntries = entries.filter(e => e.id !== id);
    setEntries(updatedEntries);
    Storage.saveData("calisthenics_weight_log", updatedEntries);
  };

  return (
    <div className="bg-neutral-950/60 border border-dark-border rounded-xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-4 border-b border-dark-border pb-3">
        <TrendingUp className="h-5 w-5 text-emerald-500" />
        <h3 className="font-bebas text-xl tracking-wide text-white uppercase">WEIGHT & PROGRESS TRACKING</h3>
      </div>
      
      <p className="text-sm text-neutral-400 mb-6">
        Log your bodyweight to measure gains relative to your strength performance. In calisthenics, relative strength is the ultimate indicator, so keep your stats updated.
      </p>

      <div className="flex gap-2 mb-6">
        <input 
          type="number"
          step="0.1"
          placeholder="Enter weight (e.g., 75.5)"
          value={newWeight}
          onChange={(e) => setNewWeight(e.target.value)}
          className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500/50 transition-colors"
        />
        <button
          onClick={handleAddWeight}
          className="px-6 py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg font-condensed font-bold tracking-widest uppercase transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Data</span>
        </button>
      </div>

      {entries.length > 0 ? (
        <>
          <div className="h-64 w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={entries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#525252" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  dy={10}
                />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']} 
                  stroke="#525252" 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  dx={-10}
                  tickFormatter={(val) => val.toFixed(1)}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#f5f5f4' }}
                  itemStyle={{ color: '#10b981' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#064e3b', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-xs font-condensed tracking-widest text-neutral-500 uppercase mb-3">Recent Logs</h4>
            <div className="max-h-40 overflow-y-auto custom-scrollbar pr-2 space-y-2">
              {[...entries].reverse().map(entry => (
                <div key={entry.id} className="flex justify-between items-center p-3 bg-neutral-900/50 rounded-lg border border-neutral-800/50">
                  <span className="text-sm text-neutral-300 font-mono">{entry.date}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-emerald-400 font-condensed font-bold tracking-wider">{entry.weight.toFixed(1)}</span>
                    <button 
                      onClick={() => handleRemoveEntry(entry.id)}
                      className="text-neutral-500 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="h-48 flex items-center justify-center border border-dashed border-neutral-800 rounded-xl bg-neutral-900/30">
          <p className="text-sm font-condensed tracking-wider text-neutral-500 uppercase">No data logged. Add your first weight entry.</p>
        </div>
      )}
    </div>
  );
}

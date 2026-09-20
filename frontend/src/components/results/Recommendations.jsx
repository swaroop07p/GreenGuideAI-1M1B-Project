import React, { useState } from 'react';
import {
  Sparkles, Bike, Salad, Zap, Recycle, Thermometer, Sun, Trash2,
  Utensils, Car, Leaf, Home, Flame, ArrowUpRight, Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCo2Value } from '../../utils/calculations';

export default function Recommendations({ recommendations, isAiGenerated = true }) {
  const { unit } = useApp();
  const [filter, setFilter] = useState('all');

  if (!recommendations || recommendations.length === 0) return null;

  const iconMap = {
    Bike: Bike,
    Salad: Salad,
    Zap: Zap,
    Recycle: Recycle,
    Thermometer: Thermometer,
    Sun: Sun,
    Trash2: Trash2,
    Utensils: Utensils,
    Car: Car,
    Leaf: Leaf,
    Home: Home,
    Flame: Flame,
    Sparkles: Sparkles
  };

  const filteredItems = filter === 'all'
    ? recommendations
    : recommendations.filter((r) => r.category.toLowerCase() === filter.toLowerCase());

  const categoryTags = ['all', 'transport', 'food', 'energy', 'waste'];

  return (
    <div className="rounded-3xl p-4 sm:p-8 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Personalized High-Impact Recommendations
            </h3>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Gemini AI Tailored
            </span>
          </div>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Actionable lifestyle shifts synthesized specifically for your reported habits & highest carbon drivers
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap gap-1.5 self-start sm:self-auto">
          {categoryTags.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                filter === cat
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {filteredItems.map((rec) => {
          const IconComp = iconMap[rec.icon] || Sparkles;
          const difficultyColors = {
            Easy: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
            Medium: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800',
            'High Impact': 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800'
          };

          return (
            <div
              key={rec.id || rec.title}
              className="p-4 sm:p-5 rounded-2xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/40 dark:bg-zinc-800/30 hover:border-emerald-500/50 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 group-hover:scale-105 transition-transform">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {rec.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${difficultyColors[rec.difficulty] || difficultyColors.Easy}`}>
                      {rec.difficulty}
                    </span>
                  </div>
                </div>

                <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mb-1.5 leading-snug">
                  {rec.title}
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {rec.description}
                </p>
              </div>

              {/* CO2 Savings Callout */}
              <div className="mt-4 pt-3 border-t border-zinc-200/60 dark:border-zinc-700/60 flex items-center justify-between">
                <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Potential Savings:
                </span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  ~{formatCo2Value(rec.estimated_co2_saved_kg_monthly, unit)} / mo
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

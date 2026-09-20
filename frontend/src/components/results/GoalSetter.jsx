import React, { useState } from 'react';
import { Target, TrendingDown, Flag, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCo2Value } from '../../utils/calculations';
import CustomSlider from '../form/CustomSlider';

export default function GoalSetter({ totalMonthlyKg }) {
  const { unit } = useApp();
  const [targetPct, setTargetPct] = useState(25);

  const targetMonthlyKg = totalMonthlyKg * (1 - targetPct / 100);
  const monthlySavingsKg = totalMonthlyKg - targetMonthlyKg;
  const annualSavingsKg = monthlySavingsKg * 12;

  // Assuming progressive action plan pace (~7% reduction per 4-week cycle)
  const estimatedWeeks = Math.max(4, Math.round((targetPct / 6) * 4));

  return (
    <div className="rounded-3xl p-4 sm:p-8 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
          <Target className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-sm sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Set Your Climate Reduction Goal
          </h3>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
            Pick a target reduction percentage and project your progress timeline
          </p>
        </div>
      </div>

      <CustomSlider
        id="target-goal-pct"
        label="Target Carbon Reduction"
        icon={TrendingDown}
        min={5}
        max={60}
        step={5}
        unit="%"
        value={targetPct}
        onChange={setTargetPct}
        helperText="Recommended target: 20–35% in first 90 days"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/70 dark:border-zinc-700/60 mt-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
            Target Footprint
          </span>
          <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 font-mono">
            {formatCo2Value(targetMonthlyKg, unit)} / mo
          </p>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 block">
            Annual Carbon Kept From Atmosphere
          </span>
          <p className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono">
            {formatCo2Value(annualSavingsKg, unit)} / yr
          </p>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
            Projected Timeline
          </span>
          <p className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
            ~{estimatedWeeks} Weeks
          </p>
        </div>
      </div>
    </div>
  );
}

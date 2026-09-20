import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Globe, Target, UserCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { convertCo2, formatCo2Value } from '../../utils/calculations';

export default function BenchmarksChart({ benchmarks, userMonthlyKg }) {
  const { unit } = useApp();

  if (!benchmarks) return null;

  const data = [
    {
      name: 'Your Footprint',
      value: convertCo2(userMonthlyKg, unit),
      rawKg: userMonthlyKg,
      color: '#10B981', // Emerald
      label: 'You'
    },
    {
      name: 'National Average',
      value: convertCo2(benchmarks.national_average_monthly || 360, unit),
      rawKg: benchmarks.national_average_monthly || 360,
      color: '#3B82F6', // Blue
      label: 'National'
    },
    {
      name: 'Global Average',
      value: convertCo2(benchmarks.global_average_monthly || 390, unit),
      rawKg: benchmarks.global_average_monthly || 390,
      color: '#6366F1', // Indigo
      label: 'Global'
    },
    {
      name: '1.5°C Paris Target',
      value: convertCo2(benchmarks.sustainable_target_monthly || 167, unit),
      rawKg: benchmarks.sustainable_target_monthly || 167,
      color: '#059669', // Deep Emerald
      label: '1.5°C Goal'
    }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-900/95 text-white border border-zinc-800 shadow-xl text-xs">
          <p className="font-bold text-xs sm:text-sm mb-0.5">{item.name}</p>
          <p className="text-zinc-300 text-[11px]">
            Monthly: <span className="font-semibold text-white">{item.value.toLocaleString()} {unit === 'lb' ? 'lb CO2e' : 'kg CO2e'}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl p-4 sm:p-8 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              You vs. Average Benchmarks
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
              Comparative perspective against standard reference populations
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs text-zinc-600 dark:text-zinc-300 mb-4 sm:mb-6 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800 leading-relaxed">
        {benchmarks.comparison_text}
      </p>

      {/* Horizontal Bar Chart */}
      <div className="h-52 sm:h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 15, left: -10, bottom: 5 }}
          >
            <XAxis type="number" tick={{ fontSize: 10, fill: '#888' }} />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 10, fill: '#888' }}
              width={68}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {data.map((entry, index) => (
                <Cell key={`benchmark-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] text-zinc-500 dark:text-zinc-400 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" /> You
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" /> National
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-indigo-500" /> Global
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-700" /> 1.5°C Paris Goal
        </span>
      </div>
    </div>
  );
}

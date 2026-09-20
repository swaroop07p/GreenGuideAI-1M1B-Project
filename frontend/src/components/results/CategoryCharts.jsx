import React, { useState } from 'react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { PieChart as PieIcon, BarChart2, Zap, Car, Utensils, Recycle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { convertCo2, formatCo2Value } from '../../utils/calculations';

export default function CategoryCharts({ categoryBreakdown }) {
  const { unit } = useApp();
  const [chartType, setChartType] = useState('pie'); // 'pie' | 'bar'

  if (!categoryBreakdown) return null;

  const categories = [
    { key: 'energy', label: 'Energy', data: categoryBreakdown.energy, color: '#10B981', icon: Zap },
    { key: 'transport', label: 'Mobility', data: categoryBreakdown.transport, color: '#3B82F6', icon: Car },
    { key: 'food', label: 'Food', data: categoryBreakdown.food, color: '#F59E0B', icon: Utensils },
    { key: 'waste', label: 'Waste', data: categoryBreakdown.waste, color: '#8B5CF6', icon: Recycle }
  ];

  const chartData = categories.map((cat) => ({
    name: cat.label,
    rawKg: cat.data?.kg_co2e_monthly || 0,
    value: convertCo2(cat.data?.kg_co2e_monthly || 0, unit),
    percentage: cat.data?.percentage || 0,
    color: cat.color
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="p-2.5 sm:p-3 rounded-xl bg-zinc-900/95 text-white border border-zinc-800 shadow-xl text-xs">
          <p className="font-bold text-xs sm:text-sm mb-0.5">{item.name}</p>
          <p className="text-zinc-300 text-[11px]">
            Emissions: <span className="font-semibold text-white">{item.value.toLocaleString()} {unit === 'lb' ? 'lb CO2e' : 'kg CO2e'}</span>
          </p>
          <p className="text-emerald-400 font-medium text-[11px]">
            Share: {item.percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl p-4 sm:p-8 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <h3 className="text-sm sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
            Category Breakdown
          </h3>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
            Monthly emissions distributed across lifestyle domains
          </p>
        </div>

        {/* Chart View Switcher (Pie / Bar) */}
        <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/80 self-start sm:self-auto">
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              chartType === 'pie'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Donut</span>
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              chartType === 'bar'
                ? 'bg-white dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400 shadow-2xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Bars</span>
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-60 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'pie' ? (
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={88}
                paddingAngle={4}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#888' }}
                interval={0}
              />
              <YAxis tick={{ fontSize: 11, fill: '#888' }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`bar-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Category Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        {categories.map((cat) => {
          const monthlyKg = cat.data?.kg_co2e_monthly || 0;
          const pct = cat.data?.percentage || 0;

          return (
            <div
              key={cat.key}
              className="p-2.5 sm:p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-[10px] sm:text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 truncate">
                  {cat.label}
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 font-mono">
                {formatCo2Value(monthlyKg, unit)}
              </p>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                {pct}% of total
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

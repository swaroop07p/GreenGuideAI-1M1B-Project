import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, TrendingDown, Award } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { convertCo2, formatCo2Value, getTierColor } from '../../utils/calculations';

export default function FootprintHero({
  totalMonthlyKg,
  ecoScore,
  ecoTier,
  ecoBlurb
}) {
  const { unit, t } = useApp();
  const [isAnnual, setIsAnnual] = useState(false);
  const [displayValue, setDisplayValue] = useState(0);

  const targetKg = isAnnual ? totalMonthlyKg * 12 : totalMonthlyKg;
  const targetConverted = convertCo2(targetKg, unit);

  // Animated count-up effect
  useEffect(() => {
    let start = 0;
    const duration = 800; // ms
    const steps = 30;
    const increment = targetConverted / steps;
    let stepCount = 0;

    const interval = setInterval(() => {
      stepCount++;
      start += increment;
      if (stepCount >= steps) {
        setDisplayValue(targetConverted);
        clearInterval(interval);
      } else {
        setDisplayValue(Math.round(start * 10) / 10);
      }
    }, duration / steps);

    return () => clearInterval(interval);
  }, [targetConverted]);

  const tierColors = getTierColor(ecoScore);

  return (
    <div className="rounded-3xl p-4 sm:p-8 bg-gradient-to-br from-emerald-900 via-teal-900 to-zinc-950 text-white shadow-2xl relative overflow-hidden">
      {/* Decorative background glow & circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 sm:gap-6">
        
        {/* Footprint Headline */}
        <div className="w-full lg:w-auto">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Total Carbon Footprint
            </span>
            {/* Monthly / Annual Toggle */}
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className="px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium bg-white/10 hover:bg-white/20 text-zinc-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Calendar className="w-3 h-3" />
              <span>{isAnnual ? "Showing Annual" : "Showing Monthly"}</span>
            </button>
          </div>

          <div className="flex flex-wrap items-baseline gap-2 sm:gap-3 my-2">
            <span className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-mono break-all">
              {displayValue.toLocaleString()}
            </span>
            <span className="text-sm sm:text-xl font-medium text-emerald-300">
              {unit === 'lb' ? 'lb CO2e' : 'kg CO2e'} / {isAnnual ? 'year' : 'month'}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl leading-relaxed mt-1 sm:mt-2">
            {ecoBlurb}
          </p>
        </div>

        {/* Eco Score Badge */}
        <div className="w-full lg:w-auto p-3.5 sm:p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-between sm:justify-start gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${tierColors.bg} text-white flex flex-col items-center justify-center font-bold shadow-lg shrink-0`}>
              <span className="text-lg sm:text-xl leading-none">{ecoScore}</span>
              <span className="text-[9px] uppercase tracking-wider opacity-85 mt-0.5">/ 100</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                Eco Rating Tier
              </span>
              <h4 className="text-sm sm:text-base font-bold text-white">
                {ecoTier}
              </h4>
              <span className="text-[11px] text-emerald-300 flex items-center gap-1 mt-0.5">
                <Award className="w-3 h-3" /> Science-Grounded
              </span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

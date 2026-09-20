import React, { useEffect } from 'react';
import { Award, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { getTierColor } from '../../utils/calculations';

export default function EcoScoreGauge({ score, tier, blurb }) {
  const tierColor = getTierColor(score);

  // Trigger subtle celebratory confetti if score is in Eco Champion or Climate Hero tier
  useEffect(() => {
    if (score >= 75) {
      try {
        confetti({
          particleCount: 35,
          spread: 55,
          origin: { y: 0.6 },
          colors: ['#10b981', '#14b8a6', '#06b6d4']
        });
      } catch (e) {
        // silent fallback if canvas-confetti fails
      }
    }
  }, [score]);

  // Circumference for SVG gauge circle
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const tiers = [
    { label: "Just Starting Out", range: "0–39", min: 0 },
    { label: "Making Progress", range: "40–59", min: 40 },
    { label: "On Track", range: "60–74", min: 60 },
    { label: "Eco Champion", range: "75–89", min: 75 },
    { label: "Climate Hero", range: "90–100", min: 90 }
  ];

  return (
    <div className="rounded-3xl p-4 sm:p-8 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm flex flex-col justify-between">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                Eco Performance Score
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Relative to global sustainability benchmarks
              </p>
            </div>
          </div>
          <span className={`text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-full ${tierColor.lightBg} ${tierColor.text} border ${tierColor.border}`}>
            {tier}
          </span>
        </div>

        {/* Circular Gauge */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 py-2 sm:py-4">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background Track */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className="text-zinc-100 dark:text-zinc-800 stroke-current"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Progress Arc */}
              <circle
                cx="64"
                cy="64"
                r={radius}
                className={`${tierColor.text} stroke-current transition-all duration-1000 ease-out`}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                {score}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                out of 100
              </span>
            </div>
          </div>

          <div className="text-center sm:text-left space-y-2 max-w-xs">
            <p className="text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed">
              {blurb}
            </p>
            <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-zinc-500 dark:text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Framed positively for constructive climate action</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tier Progress Bar / Ladder - Responsive Grid */}
      <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 mt-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-1.5 text-center">
          {tiers.map((item) => {
            const isCurrent = tier === item.label;
            return (
              <div
                key={item.label}
                className={`p-1.5 sm:p-2 rounded-xl border text-[10px] transition-colors ${
                  isCurrent
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold col-span-2 sm:col-span-1'
                    : 'bg-zinc-50 dark:bg-zinc-800/40 border-transparent text-zinc-400 dark:text-zinc-500'
                }`}
              >
                <div className="truncate font-semibold">{item.label}</div>
                <div className="opacity-75">{item.range}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

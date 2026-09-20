import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Globe, Compass, TreePine, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCo2Value } from '../utils/calculations';

export default function Hero({ onStartCalculation }) {
  const { t, unit } = useApp();

  // Dynamic rotating eco facts for the live animated ticker
  const facts = [
    { label: "Global Average Footprint", kg: 390, icon: Globe, highlight: "390 kg CO2e / month" },
    { label: "Paris Agreement 1.5°C Target", kg: 167, icon: TreePine, highlight: "167 kg CO2e / month" },
    { label: "Public Transit Shift Savings", kg: 42, icon: Zap, highlight: "42 kg CO2e / month saved" },
    { label: "Plant-Rich Diet Shift Savings", kg: 35, icon: Sparkles, highlight: "35 kg CO2e / month saved" }
  ];

  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFactIndex((prev) => (prev + 1) % facts.length);
    }, 3800);
    return () => clearInterval(timer);
  }, []);

  const activeFact = facts[currentFactIndex];
  const IconComponent = activeFact.icon;

  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
      {/* Background Decorative Radial Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-100/50 via-teal-50/20 to-transparent dark:from-emerald-950/25 dark:via-teal-950/10 dark:to-transparent pointer-events-none -z-10 blur-3xl" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* SDG Badges Header */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/80 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            UN SDG 13: Climate Action
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            SDG 12: Responsible Consumption
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            SDG 11: Sustainable Cities
          </span>
        </div>

        {/* Hero Headline & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 leading-[1.15]">
            Understand Your Carbon Footprint.{' '}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
              Take Action That Matters.
            </span>
          </h1>
          <p className="mt-5 text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            {t.heroSubtitle}
          </p>

          {/* Primary CTA & Guarantee */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartCalculation}
              className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{t.calculateCta}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="mt-5 flex items-center justify-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              100% Anonymous & Private
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              No Login or Account Needed
            </span>
          </div>
        </div>

        {/* 🆕 Dynamic Rotating Eco Metric Ticker */}
        <div className="max-w-xl mx-auto mb-14 p-4 rounded-2xl bg-white/70 dark:bg-zinc-900/70 border border-emerald-200/70 dark:border-emerald-900/60 shadow-sm backdrop-blur-sm transition-all duration-300">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                <IconComponent className="w-5 h-5" />
              </div>
              <div className="text-left">
                <span className="text-xs uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-500">
                  {activeFact.label}
                </span>
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-100">
                  {formatCo2Value(activeFact.kg, unit)}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              {facts.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentFactIndex(i)}
                  aria-label={`Show fact ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentFactIndex ? 'w-5 bg-emerald-500' : 'bg-zinc-300 dark:bg-zinc-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 3-Step "How it Works" Visual Explainer */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-zinc-200/80 dark:border-zinc-800/80">
          <div className="p-5 rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 font-bold flex items-center justify-center mb-3">
              1
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              {t.step1Title}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t.step1Desc}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 font-bold flex items-center justify-center mb-3">
              2
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              {t.step2Title}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t.step2Desc}
            </p>
          </div>

          <div className="p-5 rounded-xl bg-white/50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/80 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 font-bold flex items-center justify-center mb-3">
              3
            </div>
            <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
              {t.step3Title}
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t.step3Desc}
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}

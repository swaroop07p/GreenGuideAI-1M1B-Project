import React from 'react';
import { Leaf, ShieldCheck, Sparkles, Globe, ExternalLink, Heart, Compass, BookOpen, Lock } from 'lucide-react';

export default function Footer({ onOpenTransparency }) {
  const scrollToCalculator = () => {
    const el = document.getElementById('calculator-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="w-full border-t border-emerald-100/80 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/80 backdrop-blur-xl mt-16 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        
        {/* Top 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          
          {/* Column 1: Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Leaf className="w-4 h-4" />
              </div>
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                GreenGuide AI
              </span>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Empowering personal climate action through open science, accessible carbon accounting, and tailored lifestyle decarbonization pathways.
            </p>

            {/* SDG Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="w-2.5 h-2.5" /> SDG 13
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                SDG 12
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                SDG 11
              </span>
            </div>
          </div>

          {/* Column 2: Navigation & Tools */}
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3">
              Application Tools
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li>
                <button
                  onClick={scrollToCalculator}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Lifestyle Carbon Calculator
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenTransparency}
                  className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer text-left"
                >
                  Methodology & Reference Factors
                </button>
              </li>
              <li>
                <span className="text-zinc-500 dark:text-zinc-500">What-If Habit Simulator</span>
              </li>
              <li>
                <span className="text-zinc-500 dark:text-zinc-500">PDF Carbon Assessment Export</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Science & Methodology */}
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3">
              Scientific Standards
            </h4>
            <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
              <li className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>IPCC Sixth Assessment (AR6)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Paris 1.5°C Boundary (~167 kg/mo)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>EPA GHG Conversion Factors</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                <span>Regional Grid Baseline Equivalents</span>
              </li>
            </ul>
          </div>

          {/* Column 4: Privacy & Integrity Guarantee */}
          <div>
            <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider mb-3">
              Privacy & Trust
            </h4>
            <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 space-y-2 text-xs text-zinc-700 dark:text-zinc-300">
              <div className="flex items-center gap-1.5 font-semibold text-emerald-800 dark:text-emerald-300 text-[11px]">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Zero Server-Side Storage</span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed">
                All assessment responses and simulation choices remain private on your device. No personal data or tracking cookies are collected.
              </p>
            </div>
          </div>

        </div>

        {/* Climate Inspiration Quote Banner */}
        <div className="mb-8 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 text-center">
          <p className="text-xs sm:text-sm font-medium text-emerald-900 dark:text-emerald-200 italic">
            "The greatest threat to our planet is the belief that someone else will save it."
          </p>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block mt-0.5">
            — Robert Swan, Polar Explorer & Environmentalist
          </span>
        </div>

        {/* Bottom Bar: Copyright & Educational Scope Disclaimer */}
        <div className="pt-6 border-t border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-zinc-400 dark:text-zinc-500">
          <div>
            © {new Date().getFullYear()} GreenGuide AI. An Open Climate Action & Sustainability Initiative.
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-zinc-600 dark:text-zinc-400">
              Validated on IPCC AR6 & EPA Conversion Guidelines
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}

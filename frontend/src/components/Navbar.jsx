import React, { useState, useEffect } from 'react';
import { Leaf, Moon, Sun, Sparkles, Key, Menu, X, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar({ onOpenTransparency, onOpenApiKeyModal }) {
  const { theme, toggleTheme, unit, toggleUnit, apiKey, aiStatus } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCustomActive = Boolean(apiKey && apiKey.trim());
  const isBackendActive = Boolean(aiStatus?.has_backend_key);
  const isAiActive = isCustomActive || isBackendActive || Boolean(aiStatus?.configured);

  return (
    <header className="sticky top-0 z-40 w-full max-w-full backdrop-blur-md bg-white/90 dark:bg-zinc-950/90 border-b border-emerald-100/80 dark:border-emerald-950/60 transition-colors duration-200 shadow-xs">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 flex-shrink-0">
            <Leaf className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-black tracking-tight bg-gradient-to-r from-emerald-800 via-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent truncate">
                GreenGuide AI
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Sparkles className="w-2.5 h-2.5" /> SDG 13
              </span>
            </div>
            <p className="hidden lg:block text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
              Personal Sustainability & Carbon Footprint Advisor
            </p>
          </div>
        </div>

        {/* Right: Desktop Controls (hidden on mobile) */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 flex-shrink-0">
          
          {/* Gemini AI Status / Key Config Button */}
          <button
            onClick={onOpenApiKeyModal}
            title={
              isCustomActive
                ? "Website API Key Active (Dominates backend default key) - Click to Manage"
                : isBackendActive
                ? "Backend Default Key Active (.env) - Click to override with your own key"
                : "Configure Gemini API Key"
            }
            className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${
              isCustomActive
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:border-emerald-400 shadow-xs ring-1 ring-emerald-400/30'
                : isBackendActive
                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-800 hover:border-teal-400 shadow-xs'
                : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-emerald-500'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isCustomActive ? 'bg-emerald-500 animate-pulse' : isBackendActive ? 'bg-teal-500 animate-pulse' : 'bg-zinc-400'}`} />
            <Key className="w-3.5 h-3.5" />
            <span>
              {isCustomActive ? 'Gemini (Custom)' : isBackendActive ? 'Gemini (Default)' : 'Set API Key'}
            </span>
          </button>

          {/* Methodology / Transparency Link */}
          <button
            onClick={onOpenTransparency}
            className="flex items-center gap-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 px-2.5 py-1.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/50 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>How it works</span>
          </button>

          {/* Unit Toggle (kg <-> lb) */}
          <button
            onClick={toggleUnit}
            title="Toggle unit between metric (kg) and imperial (lb)"
            className="flex items-center text-xs font-semibold px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-emerald-500 transition-colors"
          >
            <span className={unit === 'kg' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-400'}>kg</span>
            <span className="mx-1 text-zinc-300 dark:text-zinc-700">/</span>
            <span className={unit === 'lb' ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-zinc-400'}>lb</span>
          </button>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Right: Mobile Controls (< md) - Compact & Space-Efficient */}
        <div className="flex md:hidden items-center gap-1.5 flex-shrink-0">
          
          {/* Quick Unit Switcher */}
          <button
            onClick={toggleUnit}
            title="Toggle unit"
            className="px-2 py-1 text-[11px] font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400"
          >
            {unit.toUpperCase()}
          </button>

          {/* Quick Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 rounded-lg text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open mobile navigation menu"
            className={`p-1.5 rounded-lg border transition-colors relative ${
              mobileMenuOpen
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                : 'border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900'
            }`}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            {isAiActive && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-zinc-950" />
            )}
          </button>
        </div>

      </div>

      {/* Mobile Slide-Down Drawer (< md) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-200/80 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl px-4 py-3 space-y-2.5 animate-in slide-in-from-top-2 duration-150 shadow-lg">
          
          {/* Gemini AI Status & Settings Button */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenApiKeyModal();
            }}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-xs font-semibold ${
              isCustomActive
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-400/20'
                : isBackendActive
                ? 'bg-teal-50 dark:bg-teal-950/40 border-teal-300 dark:border-teal-800 text-teal-800 dark:text-teal-300'
                : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${isCustomActive ? 'bg-emerald-500 animate-pulse' : isBackendActive ? 'bg-teal-500 animate-pulse' : 'bg-zinc-400'}`} />
              <Key className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>
                {isCustomActive
                  ? 'Gemini AI (Custom Key)'
                  : isBackendActive
                  ? 'Gemini AI (Default .env)'
                  : 'Configure Gemini API Key'}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              {isCustomActive ? 'Custom Priority' : isBackendActive ? 'Default Active' : 'Set Key'}
            </span>
          </button>

          {/* How It Works Action */}
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenTransparency();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-700 dark:text-zinc-300"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Methodology & Emission Factors</span>
            </div>
            <span className="text-[11px] text-zinc-400">View</span>
          </button>

          {/* SDG Alignment Tag */}
          <div className="pt-1 flex items-center justify-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400">
            <span>Aligned with</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">UN SDG 13, 12, 11</span>
          </div>

        </div>
      )}
    </header>
  );
}

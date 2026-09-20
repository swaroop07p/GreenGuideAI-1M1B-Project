import React, { useState } from 'react';
import { Zap, Car, Utensils, Recycle, Check, ArrowRight, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import EnergyStep from './EnergyStep';
import TransportStep from './TransportStep';
import FoodStep from './FoodStep';
import WasteStep from './WasteStep';
import { useApp } from '../../context/AppContext';

export default function FormWizard({
  formData,
  setFormData,
  onSubmit,
  isLoading
}) {
  const { t } = useApp();
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    { id: 'energy', label: t.energy, icon: Zap, color: 'emerald' },
    { id: 'transport', label: t.transport, icon: Car, color: 'blue' },
    { id: 'food', label: t.food, icon: Utensils, color: 'amber' },
    { id: 'waste', label: t.waste, icon: Recycle, color: 'purple' }
  ];

  const updateSection = (section, data) => {
    setFormData((prev) => ({
      ...prev,
      [section]: data
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onSubmit();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  // Count sections filled / touched
  const completedCount = currentStep + 1;

  return (
    <div id="calculator-form" className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Outer Card with Soft Tint & Gentle Shadows */}
      <div className="rounded-3xl bg-white/90 dark:bg-zinc-900/90 border border-emerald-100 dark:border-emerald-950/70 shadow-xl shadow-emerald-900/5 dark:shadow-black/30 backdrop-blur-md overflow-hidden transition-all">
        
        {/* Wizard Header & Segmented Progress Bar */}
        <div className="p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-b from-emerald-50/40 to-transparent dark:from-emerald-950/20">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Personal Lifestyle Calculator</span>
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Every field is optional. We will assume standard regional baselines for any unselected items.
              </p>
            </div>

            {/* Sections Completed Indicator */}
            <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full bg-emerald-100/70 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step {currentStep + 1} of {steps.length}</span>
            </div>
          </div>

          {/* Segmented Stepper Tabs */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === currentStep;
              const isPast = idx < currentStep;

              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(idx)}
                  className={`group relative p-2.5 sm:p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 ${
                    isActive
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                      : isPast
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300/70 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                      : 'bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200/80 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-emerald-300'
                  }`}
                >
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : isPast
                        ? 'bg-emerald-200/60 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200'
                        : 'bg-zinc-200/60 dark:bg-zinc-700 text-zinc-500'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : <Icon className="w-4 h-4" />}
                  </div>
                  <div className="hidden sm:block truncate">
                    <span className="text-[10px] uppercase font-bold tracking-wider opacity-75 block leading-none mb-1">
                      Step {idx + 1}
                    </span>
                    <span className="text-xs font-bold truncate block">
                      {step.label}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Body: Active Step View */}
        <div className="p-6 sm:p-8 min-h-[380px]">
          {currentStep === 0 && (
            <EnergyStep
              data={formData.energy || {}}
              onChange={(val) => updateSection('energy', val)}
            />
          )}
          {currentStep === 1 && (
            <TransportStep
              data={formData.transport || {}}
              onChange={(val) => updateSection('transport', val)}
            />
          )}
          {currentStep === 2 && (
            <FoodStep
              data={formData.food || {}}
              onChange={(val) => updateSection('food', val)}
            />
          )}
          {currentStep === 3 && (
            <WasteStep
              data={formData.waste || {}}
              onChange={(val) => updateSection('waste', val)}
            />
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="p-6 sm:p-8 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            {/* Back button */}
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                disabled={isLoading}
                className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-semibold text-xs sm:text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{t.prevStep}</span>
              </button>
            )}

            {/* Skip this section link */}
            <button
              type="button"
              onClick={handleSkip}
              disabled={isLoading}
              className="text-xs text-zinc-500 hover:text-emerald-600 dark:text-zinc-400 dark:hover:text-emerald-400 font-medium underline underline-offset-4 cursor-pointer px-2"
            >
              {t.skipSection}
            </button>
          </div>

          {/* Action button: Next Step or Calculate Impact */}
          <div className="w-full sm:w-auto">
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{t.nextStep}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={onSubmit}
                disabled={isLoading}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t.calculating}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{t.calculateBtn}</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

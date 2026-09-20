import React, { useState, useMemo } from 'react';
import { Sliders, RefreshCw, ArrowDownRight, Sparkles, Bike, Salad, Zap, SunMedium, Recycle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { recalculateWhatIf, formatCo2Value, getTierColor } from '../../utils/calculations';
import CustomSlider from '../form/CustomSlider';
import CustomSelect from '../form/CustomSelect';
import WhatIfAIChat from './WhatIfAIChat';

export default function WhatIfSimulator({ baseBreakdown, baseTotalMonthlyKg, fullData, onOpenApiKeyModal }) {
  const { unit, t } = useApp();

  // Interactive slider states
  const [transitDays, setTransitDays] = useState(2);
  const [meatFreeDays, setMeatFreeDays] = useState(3);
  const [elecReduction, setElecReduction] = useState(15);
  const [solarAdoption, setSolarAdoption] = useState('none');
  const [compost, setCompost] = useState(false);
  const [recycle, setRecycle] = useState(true);

  // Client-side instant recalculation
  const simulation = useMemo(() => {
    return recalculateWhatIf(baseBreakdown, {
      transitDaysPerWeek: transitDays,
      meatFreeDaysPerWeek: meatFreeDays,
      electricityReductionPct: elecReduction,
      solarAdoption: solarAdoption,
      compostingActive: compost,
      recycleActive: recycle
    });
  }, [baseBreakdown, transitDays, meatFreeDays, elecReduction, solarAdoption, compost, recycle]);

  const savedKg = Math.max(0, Math.round((baseTotalMonthlyKg - simulation.totalMonthly) * 10) / 10);
  const reductionPct = Math.round((savedKg / Math.max(1, baseTotalMonthlyKg)) * 100);
  const tierColor = getTierColor(simulation.score);

  const resetSliders = () => {
    setTransitDays(0);
    setMeatFreeDays(0);
    setElecReduction(0);
    setSolarAdoption('none');
    setCompost(false);
    setRecycle(false);
  };

  return (
    <div className="rounded-3xl p-4 sm:p-8 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Interactive What-If Simulator
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
              Slide to test real-world habit changes and see instant carbon reductions
            </p>
          </div>
        </div>

        <button
          onClick={resetSliders}
          className="self-start sm:self-auto px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Sliders</span>
        </button>
      </div>

      {/* Live Impact Difference Callout Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-500/20 mb-6 sm:mb-8">
        <div className="text-center sm:text-left">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 block">
            New Projected Footprint
          </span>
          <span className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
            {formatCo2Value(simulation.totalMonthly, unit)} / mo
          </span>
        </div>

        <div className="text-center sm:text-left">
          <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 block flex items-center justify-center sm:justify-start gap-1">
            <ArrowDownRight className="w-3.5 h-3.5" /> Total Carbon Saved
          </span>
          <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
            -{formatCo2Value(savedKg, unit)} ({reductionPct}%)
          </span>
        </div>

        <div className="text-center sm:text-left flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 dark:text-zinc-400 block">
            Projected Eco Rating
          </span>
          <div className="flex items-center justify-center sm:justify-start gap-2 mt-0.5">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${tierColor.lightBg} ${tierColor.text}`}>
              {simulation.score}/100 • {simulation.tier}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        {/* Transit shift slider */}
        <CustomSlider
          id="whatif-transit"
          label="Replace Solo Driving with Bike/Transit (Days/Wk)"
          icon={Bike}
          min={0}
          max={7}
          step={1}
          unit="days"
          value={transitDays}
          onChange={setTransitDays}
          helperText="Saves ~8–12 kg CO2e per replaced day"
        />

        {/* Meat free days slider */}
        <CustomSlider
          id="whatif-meatfree"
          label="Meat-Free / Plant-Based Days per Week"
          icon={Salad}
          min={0}
          max={7}
          step={1}
          unit="days"
          value={meatFreeDays}
          onChange={setMeatFreeDays}
          helperText="Saves ~6–10 kg CO2e per plant-rich day"
        />

        {/* Electricity reduction slider */}
        <CustomSlider
          id="whatif-elec"
          label="Household Electricity Conservation"
          icon={Zap}
          min={0}
          max={50}
          step={5}
          unit="%"
          value={elecReduction}
          onChange={setElecReduction}
          helperText="Via thermostat 1–2°C, LED lights, smart plugs"
        />

        {/* Solar Adoption Select */}
        <CustomSelect
          id="whatif-solar"
          label="Rooftop Solar / Clean Power Tariff"
          icon={SunMedium}
          value={solarAdoption}
          onChange={setSolarAdoption}
          options={[
            { value: 'none', label: 'None (Standard Grid)' },
            { value: 'partial', label: 'Partial Solar (~30% Clean)' },
            { value: 'majority', label: 'Majority Solar (~65% Clean)' },
            { value: 'full', label: '100% Clean / Off-Grid (~90% Clean)' }
          ]}
        />
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 pt-4 border-t border-zinc-100 dark:border-zinc-800">
        <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer">
          <input
            type="checkbox"
            checked={compost}
            onChange={(e) => setCompost(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded border-zinc-300 focus:ring-emerald-500"
          />
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Start Organic Food Composting (-25% Waste CO2)
          </span>
        </label>

        <label className="flex items-center gap-3 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 cursor-pointer">
          <input
            type="checkbox"
            checked={recycle}
            onChange={(e) => setRecycle(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded border-zinc-300 focus:ring-emerald-500"
          />
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            Strict Recycling & Minimal Single-Use Plastic (-15% Waste CO2)
          </span>
        </label>
      </div>

      {/* Embedded AI Sustainability & Notation Assistant */}
      <WhatIfAIChat 
        contextData={fullData || { total_monthly_kg: baseTotalMonthlyKg, category_breakdown: baseBreakdown }} 
        onOpenApiKeyModal={onOpenApiKeyModal} 
      />
    </div>
  );
}

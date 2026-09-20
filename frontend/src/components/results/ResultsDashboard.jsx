import React, { useState } from 'react';
import {
  RotateCcw, Printer, Share2, Sparkles, Sliders, ChevronDown
} from 'lucide-react';
import FootprintHero from './FootprintHero';
import EcoScoreGauge from './EcoScoreGauge';
import CategoryCharts from './CategoryCharts';
import BenchmarksChart from './BenchmarksChart';
import ExplanationCard from './ExplanationCard';
import Recommendations from './Recommendations';
import ActionPlan from './ActionPlan';
import WhatIfSimulator from './WhatIfSimulator';
import GoalSetter from './GoalSetter';
import ShareCardModal from './ShareCardModal';
import SessionCompare from './SessionCompare';
import PrintReport from './PrintReport';
import { useApp } from '../../context/AppContext';

export default function ResultsDashboard({
  data,
  onReset,
  onOpenApiKeyModal
}) {
  const { t } = useApp();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (!data) return null;

  const handlePrint = () => {
    window.print();
  };

  const topTip = data.recommendations && data.recommendations.length > 0
    ? data.recommendations[0].title
    : "Shift commutes to public transit and adopt plant-rich meals.";

  return (
    <>
      {/* 🖨️ Dedicated High-Fidelity Printable PDF Report (Rendered only on print) */}
      <PrintReport data={data} />

      {/* 💻 Screen Interactive Dashboard (Hidden automatically on print) */}
      <div className="screen-dashboard max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-300">
        
        {/* Top Action Bar */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl bg-white/85 dark:bg-zinc-900/85 border border-zinc-200/70 dark:border-zinc-800 shadow-2xs backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
              Session Calculation Complete
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Share Button */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:border-emerald-500 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{t.shareCard}</span>
            </button>

            {/* Print / PDF Button */}
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold hover:border-emerald-500 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{t.downloadPdf}</span>
            </button>

            {/* Reset / Start Over */}
            <button
              onClick={onReset}
              className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.reset}</span>
            </button>
          </div>
        </div>

        {/* 1. Footprint Hero Overview */}
        <FootprintHero
          totalMonthlyKg={data.total_monthly_kg}
          ecoScore={data.eco_score}
          ecoTier={data.eco_tier}
          ecoBlurb={data.eco_blurb}
        />

        {/* 2. Side-by-Side: Eco Score Gauge & Category Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          <div className="lg:col-span-5">
            <EcoScoreGauge
              score={data.eco_score}
              tier={data.eco_tier}
              blurb={data.eco_blurb}
            />
          </div>
          <div className="lg:col-span-7">
            <CategoryCharts
              categoryBreakdown={data.category_breakdown}
            />
          </div>
        </div>

        {/* 3. Benchmarks ("You vs. Average") */}
        <BenchmarksChart
          benchmarks={data.benchmarks}
          userMonthlyKg={data.total_monthly_kg}
        />

        {/* 4. Plain-Language Explanation & Assumptions */}
        <ExplanationCard
          explanation={data.explanation}
          assumptionsMade={data.assumptions_made}
          source={data.source}
          totalMonthlyKg={data.total_monthly_kg}
          totalAnnualKg={data.total_annual_kg}
        />

        {/* 5. What-If Simulator with Integrated Gemini AI Chat Assistant */}
        <div className="no-print">
          <WhatIfSimulator
            baseBreakdown={data.category_breakdown}
            baseTotalMonthlyKg={data.total_monthly_kg}
            fullData={data}
            onOpenApiKeyModal={onOpenApiKeyModal}
          />
        </div>

        {/* 6. Goal Setter Widget */}
        <div className="no-print">
          <GoalSetter
            totalMonthlyKg={data.total_monthly_kg}
          />
        </div>

        {/* 7. Actionable Recommendations */}
        <Recommendations
          recommendations={data.recommendations}
          isAiGenerated={data.source === 'gemini'}
        />

        {/* 8. 4-Week Action Plan */}
        <ActionPlan
          actionPlan={data.action_plan || data.actionPlan}
          isAiGenerated={data.source === 'gemini'}
        />

        {/* 9. Optional Local Session Comparison */}
        <div className="no-print">
          <SessionCompare
            currentData={data}
          />
        </div>

        {/* Share Card Modal */}
        <ShareCardModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          totalMonthlyKg={data.total_monthly_kg}
          ecoScore={data.eco_score}
          ecoTier={data.eco_tier}
          topTip={topTip}
        />

      </div>
    </>
  );
}

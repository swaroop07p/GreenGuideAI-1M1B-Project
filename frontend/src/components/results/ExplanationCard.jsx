import React, { useState, useMemo } from 'react';
import { BookOpen, Info, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function ExplanationCard({
  explanation,
  assumptionsMade,
  source,
  totalMonthlyKg,
  totalAnnualKg
}) {
  const { unit } = useApp();
  const [showAssumptions, setShowAssumptions] = useState(false);

  // Synchronize unit & score values so methodology text matches the Hero card 1:1
  const displayExplanation = useMemo(() => {
    if (!explanation) return '';
    if (unit !== 'lb') return explanation;

    let text = explanation;

    // Replace opening sentence if present with exact matching lb values
    if (totalMonthlyKg) {
      const monthlyLb = (Math.round(totalMonthlyKg * 2.20462 * 10) / 10).toLocaleString();
      const annualLb = (Math.round((totalAnnualKg || totalMonthlyKg * 12) * 2.20462 * 10) / 10).toLocaleString();
      
      text = text.replace(
        /Your estimated footprint of [\d,.]+\s*kg CO2e per month\s*\([\d,.]+\s*tonnes per year\)/i,
        `Your estimated footprint of ${monthlyLb} lb CO2e per month (${annualLb} lb CO2e per year)`
      );
    }

    // Convert any remaining numeric "... kg CO2e" into "... lb CO2e"
    text = text.replace(/([\d,.]+)\s*kg CO2e/gi, (match, val) => {
      const num = parseFloat(val.replace(/,/g, ''));
      if (isNaN(num)) return match;
      const converted = Math.round(num * 2.20462 * 10) / 10;
      return `${converted.toLocaleString()} lb CO2e`;
    });

    // Convert "... kg" into "... lb"
    text = text.replace(/([\d,.]+)\s*kg\b/gi, (match, val) => {
      const num = parseFloat(val.replace(/,/g, ''));
      if (isNaN(num)) return match;
      const converted = Math.round(num * 2.20462 * 10) / 10;
      return `${converted.toLocaleString()} lb`;
    });

    // Convert benchmark references (390 kg/mo -> 860 lb/mo, 167 kg/mo -> 368 lb/mo)
    text = text.replace(/390\s*kg\/mo/gi, '860 lb/mo');
    text = text.replace(/167\s*kg\/mo/gi, '368 lb/mo');

    return text;
  }, [explanation, unit, totalMonthlyKg, totalAnnualKg]);

  return (
    <div className="rounded-3xl p-4 sm:p-8 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Plain-Language Methodology Explanation
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
              How your carbon footprint estimate was derived
            </p>
          </div>
        </div>

        <span className="text-[10px] sm:text-[11px] font-semibold px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
          {source === 'gemini' ? 'AI Structured Reasoning' : 'Scientific Rule Engine'}
        </span>
      </div>

      <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        {displayExplanation}
      </p>

      {/* Assumptions Accordion */}
      {assumptionsMade && assumptionsMade.length > 0 && (
        <div className="mt-5 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <button
            onClick={() => setShowAssumptions(!showAssumptions)}
            className="w-full flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-500" />
              Standard Assumptions Made ({assumptionsMade.length})
            </span>
            {showAssumptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAssumptions && (
            <ul className="mt-3 space-y-2 text-xs text-zinc-600 dark:text-zinc-400 pl-2">
              {assumptionsMade.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

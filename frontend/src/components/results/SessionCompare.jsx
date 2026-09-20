import React, { useState } from 'react';
import { History, ArrowDownRight, ArrowUpRight, Trash2, CheckCircle2, BookmarkPlus } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCo2Value } from '../../utils/calculations';

export default function SessionCompare({ currentData }) {
  const { previousSession, saveCurrentSession, clearPreviousSession, unit } = useApp();
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    saveCurrentSession(currentData);
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const currentKg = currentData.total_monthly_kg;
  const prevKg = previousSession ? previousSession.total_monthly_kg : null;
  const diffKg = prevKg !== null ? Math.round((currentKg - prevKg) * 10) / 10 : 0;
  const isReduction = diffKg < 0;

  return (
    <div className="rounded-3xl p-4 sm:p-8 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
              Session Progress Comparison
            </h3>
            <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400">
              Optional browser-only storage to track "before vs. after" lifestyle changes
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleSave}
            className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <BookmarkPlus className="w-3.5 h-3.5" />
            <span>{savedNotice ? "Saved to Browser!" : "Save Baseline"}</span>
          </button>

          {previousSession && (
            <button
              onClick={clearPreviousSession}
              title="Clear saved browser comparison data"
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-rose-500 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {previousSession ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 p-3.5 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
              Saved Baseline
            </span>
            <p className="text-base font-bold text-zinc-800 dark:text-zinc-200 font-mono">
              {formatCo2Value(prevKg, unit)} / mo
            </p>
            <span className="text-[10px] text-zinc-400">
              Saved {new Date(previousSession.timestamp).toLocaleDateString()}
            </span>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
              Current Calculation
            </span>
            <p className="text-base font-bold text-zinc-900 dark:text-zinc-100 font-mono">
              {formatCo2Value(currentKg, unit)} / mo
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
              Net Change
            </span>
            <div className="flex items-center gap-1.5 mt-0.5">
              {isReduction ? (
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 font-mono">
                  <ArrowDownRight className="w-4 h-4" />
                  {formatCo2Value(Math.abs(diffKg), unit)} reduction!
                </span>
              ) : diffKg === 0 ? (
                <span className="text-base font-bold text-zinc-500 font-mono">No change</span>
              ) : (
                <span className="text-base font-bold text-amber-600 dark:text-amber-400 flex items-center gap-0.5 font-mono">
                  <ArrowUpRight className="w-4 h-4" />
                  +{formatCo2Value(diffKg, unit)} increase
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-xs text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/30 p-3 rounded-xl border border-zinc-100 dark:border-zinc-800">
          Click "Save Baseline" to store your current results in your browser. When you recalculate with new habits, your net carbon reduction will appear here. No data ever leaves your device.
        </p>
      )}
    </div>
  );
}

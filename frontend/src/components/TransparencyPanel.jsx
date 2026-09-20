import React, { useState, useEffect } from 'react';
import { Shield, BookOpen, Scale, Eye, Lock, CheckCircle2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiUrl } from '../utils/api';

export default function TransparencyPanel({ isOpen, onClose }) {
  const { t } = useApp();
  const [factorsData, setFactorsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('factors'); // 'factors' | 'principles'

  useEffect(() => {
    if (isOpen && !factorsData) {
      setLoading(true);
      fetch(apiUrl('/api/emission-factors'))
        .then((res) => res.json())
        .then((data) => {
          setFactorsData(data);
          setLoading(false);
        })
        .catch((err) => {
          console.warn('Failed to fetch factors:', err);
          setLoading(false);
        });
    }
  }, [isOpen, factorsData]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col">
        
        {/* Modal Header */}
        <div className="p-6 sm:p-8 border-b border-zinc-100 dark:border-zinc-800 bg-gradient-to-b from-emerald-50/40 to-transparent dark:from-emerald-950/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                Responsible AI & Methodology Transparency
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Live synchronization with backend scientific emission constants
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800 px-6 bg-zinc-50 dark:bg-zinc-950">
          <button
            onClick={() => setActiveTab('factors')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'factors'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Live Emission Constants
          </button>
          <button
            onClick={() => setActiveTab('principles')}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'principles'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Core Ethical Principles
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {activeTab === 'principles' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-2">
                  <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Fairness & Universal Standards</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  No predictions are based on user demographics, race, gender, or nationality. Emission factors are strictly standardized physical measurements per unit of energy, transport, diet, and waste.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-2">
                  <Eye className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Total Transparency</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Every number presented is explained in plain language alongside its percentage contribution. Calculations reason directly over fixed, auditable factor tables rather than black-box models.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-2">
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Ethics & Positive Agency</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Estimates are explicitly presented as educational approximations, avoiding sensationalist or shame-based framing. The Eco Score celebrates agency at every level.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/60">
                <div className="flex items-center gap-2 font-bold text-sm text-zinc-900 dark:text-zinc-100 mb-2">
                  <Lock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span>Session-Only Privacy</span>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Zero server database, no user accounts, no tracking cookies. All request data exists solely for the HTTP lifecycle. Local storage usage is optional, user-controlled, and private to your browser.
                </p>
              </div>
            </div>
          ) : (
            <div>
              {loading ? (
                <div className="flex items-center justify-center py-12 text-zinc-400">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  <span>Fetching live scientific constants...</span>
                </div>
              ) : factorsData ? (
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300">
                    <p className="font-semibold">Citations: {factorsData.metadata.citation}</p>
                    <p className="text-[11px] opacity-80">Version: {factorsData.metadata.version} • {factorsData.metadata.note}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                    {/* Energy Table */}
                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 font-sans mb-2">⚡ Energy Constants</h4>
                      <p>Grid: {factorsData.factors.energy.grid_electricity_kg_co2e_per_kwh} kg CO2e / kWh</p>
                      <p>Baseline: {factorsData.factors.energy.default_monthly_kwh} kWh/mo</p>
                      <p className="mt-2 font-semibold">Cooking Fuel (Monthly kg):</p>
                      {Object.entries(factorsData.factors.energy.cooking_fuel_monthly_kg_co2e).slice(0, 4).map(([k, v]) => (
                        <p key={k} className="text-zinc-600 dark:text-zinc-400">{k}: {v} kg</p>
                      ))}
                    </div>

                    {/* Transport Table */}
                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 font-sans mb-2">🚗 Transport Factors (kg CO2e/km)</h4>
                      {Object.entries(factorsData.factors.transport.mode_kg_co2e_per_km).slice(0, 5).map(([k, v]) => (
                        <p key={k} className="text-zinc-600 dark:text-zinc-400">{k}: {v}</p>
                      ))}
                    </div>

                    {/* Food Table */}
                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 font-sans mb-2">🍽️ Food Diets (Monthly Base)</h4>
                      {Object.entries(factorsData.factors.food.diet_base_monthly_kg_co2e).map(([k, v]) => (
                        <p key={k} className="text-zinc-600 dark:text-zinc-400">{k}: {v} kg</p>
                      ))}
                    </div>

                    {/* Benchmarks */}
                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30">
                      <h4 className="font-bold text-zinc-900 dark:text-zinc-100 font-sans mb-2">🌍 Benchmarks (Monthly Target)</h4>
                      <p>Paris 1.5°C Goal: {factorsData.factors.benchmarks.sustainable_target_monthly_kg} kg</p>
                      <p>Global Average: {factorsData.factors.benchmarks.global_average_monthly_kg} kg</p>
                      <p>National Reference: {factorsData.factors.benchmarks.national_average_monthly_kg} kg</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-zinc-400">Emission factors live reference available upon connection.</p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold cursor-pointer"
          >
            Close Panel
          </button>
        </div>

      </div>
    </div>
  );
}

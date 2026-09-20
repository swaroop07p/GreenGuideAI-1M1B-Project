import React from 'react';

export default function PrintReport({ data }) {
  if (!data) return null;

  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const categories = [
    { label: 'Energy & Utilities', key: 'energy', item: data.category_breakdown?.energy, color: '#10b981', icon: '⚡' },
    { label: 'Mobility & Transport', key: 'transport', item: data.category_breakdown?.transport, color: '#3b82f6', icon: '🚗' },
    { label: 'Food & Nutrition', key: 'food', item: data.category_breakdown?.food, color: '#f59e0b', icon: '🥗' },
    { label: 'Waste & Material', key: 'waste', item: data.category_breakdown?.waste, color: '#8b5cf6', icon: '♻️' }
  ];

  const recommendations = (data.recommendations || []).slice(0, 4);
  const actionPlan = (data.action_plan || []).slice(0, 4);
  const assumptions = (data.assumptions_made || []).slice(0, 4);

  return (
    <div className="print-only-report font-sans text-zinc-900 bg-white">
      {/* =========================================================================
          PAGE 1: Executive Assessment, Breakdown & Priority Recommendations
          ========================================================================= */}
      <div className="print-page print-page-1">
        <div>
          {/* Header Banner */}
          <div className="border-b-2 border-emerald-600 pb-3 mb-3.5 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-emerald-800 tracking-tight">
                  🌿 GreenGuide AI
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  SDG 13 Climate Action
                </span>
                <span className="text-[10px] font-semibold text-zinc-500">
                  • Official Assessment
                </span>
              </div>
              <p className="text-xs sm:text-[13px] font-bold text-zinc-800 mt-1">
                Personal Carbon Footprint Assessment & Decarbonization Roadmap
              </p>
              <p className="text-[10.5px] text-zinc-500 mt-0.5">
                Scientifically aligned with IPCC Sixth Assessment (AR6) & EPA Standard GHG Conversion Factors
              </p>
            </div>
            <div className="text-right text-xs text-zinc-600 shrink-0">
              <p className="font-bold text-zinc-900">Date: {today}</p>
              <p className="text-[10.5px] text-zinc-500">Standard: IPCC AR6 Models</p>
              <p className="text-[10.5px] text-emerald-700 font-bold">Paris 1.5°C Goal: ~167 kg/mo</p>
            </div>
          </div>

          {/* 1. Executive Summary KPI Grid */}
          <div className="print-card mb-3.5 bg-zinc-50/80">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-zinc-200">
              <h2 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                1. Executive Carbon Impact Overview
              </h2>
              <span className="text-[10.5px] font-semibold text-zinc-500">
                Unit: kg CO2e (Carbon Dioxide Equivalent)
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3 text-center py-1">
              <div className="border-r border-zinc-200 pr-2">
                <span className="text-[10.5px] text-zinc-500 uppercase font-bold block">Monthly Footprint</span>
                <span className="text-xl font-black text-zinc-900 font-mono block my-0.5">
                  {data.total_monthly_kg?.toLocaleString()} kg
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  (~{Math.round((data.total_monthly_kg || 0) * 2.20462).toLocaleString()} lb CO2e)
                </span>
              </div>

              <div className="border-r border-zinc-200 pr-2">
                <span className="text-[10.5px] text-zinc-500 uppercase font-bold block">Annualized Footprint</span>
                <span className="text-xl font-black text-zinc-900 font-mono block my-0.5">
                  {(Math.round((data.total_annual_kg || 0) / 100) / 10).toLocaleString()} tonnes
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  ({data.total_annual_kg?.toLocaleString()} kg/yr)
                </span>
              </div>

              <div className="border-r border-zinc-200 pr-2">
                <span className="text-[10.5px] text-zinc-500 uppercase font-bold block">Eco Score & Tier</span>
                <span className="text-xl font-black text-emerald-700 font-mono block my-0.5">
                  {data.eco_score} / 100
                </span>
                <span className="text-[10.5px] font-bold text-emerald-800 block">
                  {data.eco_tier}
                </span>
              </div>

              <div>
                <span className="text-[10.5px] text-zinc-500 uppercase font-bold block">Paris 1.5°C Boundary</span>
                <span className={`text-xs font-bold block my-0.5 ${data.total_monthly_kg <= 167 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {data.total_monthly_kg <= 167 ? "✅ Within 1.5°C Target" : "Transitioning to 1.5°C"}
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  Target: 167 kg/mo (2.0 t/yr)
                </span>
              </div>
            </div>

            {data.eco_blurb && (
              <p className="mt-2.5 pt-2 border-t border-zinc-200/80 text-xs text-zinc-700 leading-snug italic text-center">
                "{data.eco_blurb}"
              </p>
            )}
          </div>

          {/* 2 & 3. Side-by-Side: Domain Breakdown (Left) & Assessment Interpretation (Right) */}
          <div className="grid grid-cols-12 gap-3.5 mb-3.5">
            {/* Left: Emissions Breakdown Table */}
            <div className="col-span-7 print-card">
              <h2 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 pb-1 border-b border-zinc-200">
                2. Emissions by Lifestyle Domain
              </h2>
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-300 text-zinc-600">
                    <th className="py-1.5 font-bold">Domain</th>
                    <th className="py-1.5 font-bold text-right">Monthly</th>
                    <th className="py-1.5 font-bold text-right">Share</th>
                    <th className="py-1.5 font-bold pl-3 pr-1">Distribution</th>
                    <th className="py-1.5 font-bold text-right">Annual</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat, idx) => {
                    const kg = cat.item?.kg_co2e_monthly || 0;
                    const pct = cat.item?.percentage || 0;
                    return (
                      <tr key={idx} className="border-b border-zinc-100">
                        <td className="py-1.5 font-semibold text-zinc-800">
                          <span className="mr-1">{cat.icon}</span> {cat.label}
                        </td>
                        <td className="py-1.5 text-right font-mono font-medium">{kg.toLocaleString()} kg</td>
                        <td className="py-1.5 text-right font-bold text-zinc-700">{pct}%</td>
                        <td className="py-1.5 pl-3 pr-1">
                          <div className="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                            <div 
                              className="h-full rounded-full" 
                              style={{ width: `${Math.min(100, Math.max(4, pct))}%`, backgroundColor: cat.color }}
                            />
                          </div>
                        </td>
                        <td className="py-1.5 text-right font-mono text-zinc-500">
                          {Math.round(kg * 12).toLocaleString()} kg
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Right: Plain Language Interpretation & Benchmarks */}
            <div className="col-span-5 print-card flex flex-col justify-between">
              <div>
                <h2 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 pb-1 border-b border-zinc-200">
                  3. Assessment Interpretation
                </h2>
                <p className="text-xs text-zinc-700 leading-relaxed">
                  {data.explanation}
                </p>
              </div>

              {data.benchmarks && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/90 text-xs text-emerald-950">
                  <div className="font-bold flex items-center justify-between mb-1">
                    <span>Benchmark Context:</span>
                    <span className="font-mono text-emerald-800">Global Avg: 390 kg/mo</span>
                  </div>
                  <p className="leading-snug text-[11px]">
                    {data.benchmarks.comparison_text || `Target is 167 kg/mo to limit global warming to 1.5°C.`}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 4. Priority Recommendations (Ranked by Leverage) */}
          <div className="print-card mb-2">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-zinc-200">
              <h2 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                4. Priority Decarbonization Interventions (Ranked by Leverage)
              </h2>
              <span className="text-[10.5px] font-semibold text-emerald-700">
                Tailored for this profile
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="p-2.5 sm:p-3 rounded-lg border border-zinc-200 bg-zinc-50/50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-xs sm:text-[12.5px] text-zinc-900 line-clamp-1">
                        {idx + 1}. {rec.title}
                      </span>
                      <span className="text-[9.5px] font-bold px-2 py-0.5 rounded bg-zinc-200/90 text-zinc-700 shrink-0 uppercase">
                        {rec.difficulty}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-snug">
                      {rec.description}
                    </p>
                  </div>
                  <div className="mt-2 pt-1.5 border-t border-zinc-200/80 flex items-center justify-between text-[10.5px]">
                    <span className="text-zinc-500 font-medium capitalize">{rec.category}</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      ~{rec.estimated_co2_saved_kg_monthly} kg/mo saved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Page 1 Bottom Footer */}
        <div className="border-t border-zinc-200 pt-1.5 text-[10px] text-zinc-500 flex items-center justify-between mt-auto">
          <span className="font-semibold text-zinc-700">GreenGuide AI • Personal Carbon Assessment</span>
          <span>Aligned with IPCC AR6 Reference Factors & UN SDG 13</span>
          <span className="font-bold text-zinc-800">Page 1 of 2</span>
        </div>
      </div>

      {/* =========================================================================
          PAGE 2: 4-Week Action Implementation Plan & Scientific Transparency
          ========================================================================= */}
      <div className="print-page print-page-2">
        <div>
          {/* Header Banner Page 2 */}
          <div className="border-b-2 border-emerald-600 pb-3 mb-3.5 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-emerald-800 tracking-tight">
                  🌿 GreenGuide AI
                </span>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Decarbonization Roadmap
                </span>
              </div>
              <p className="text-xs sm:text-[13px] font-bold text-zinc-800 mt-1">
                4-Week Action Implementation Plan & Scientific Methodology
              </p>
            </div>
            <div className="text-right text-xs text-zinc-600 shrink-0">
              <p className="font-bold text-zinc-900">Date: {today}</p>
              <p className="text-[10.5px] text-zinc-500">Framework: UN SDG 13, 12, 11</p>
            </div>
          </div>

          {/* 5. 4-Week Action Implementation Plan */}
          <div className="print-card mb-3.5">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-zinc-200">
              <h2 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                5. 4-Week Climate Action Implementation Plan
              </h2>
              <span className="text-[10.5px] font-semibold text-emerald-700">
                Cumulative Monthly Potential: ~{actionPlan.reduce((acc, w) => acc + (w.expected_impact_kg_monthly || 0), 0).toFixed(0)} kg CO2e
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {actionPlan.map((w) => (
                <div key={w.week} className="p-3 rounded-lg border border-zinc-200 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs sm:text-[13px] font-bold text-zinc-900">
                        Week {w.week}: {w.title}
                      </span>
                      <span className="text-xs font-bold text-emerald-700 font-mono">
                        ~{w.expected_impact_kg_monthly} kg/mo
                      </span>
                    </div>
                    <p className="text-[11px] font-bold text-emerald-800 mb-1.5">Goal: {w.focus_goal}</p>
                    <ul className="list-disc list-inside text-[10.5px] text-zinc-600 space-y-1">
                      {(w.action_steps || []).map((st, i) => (
                        <li key={i} className="leading-snug">{st}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 6. Scientific Methodology, Standards & Assumptions */}
          <div className="grid grid-cols-2 gap-3.5 mb-3.5">
            <div className="print-card">
              <h2 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 pb-1 border-b border-zinc-200">
                6. Scientific Attribution & Factors
              </h2>
              <div className="text-[10.5px] text-zinc-600 space-y-2 leading-relaxed">
                <p>
                  <strong>Physical Conversion Models:</strong> All emissions figures are calculated based on representative lifecycle physical conversion factors from the <strong>IPCC Sixth Assessment Report (AR6)</strong>, <strong>US EPA GHG Equivalencies</strong>, and regional grid averages.
                </p>
                <p>
                  <strong>Global Paris 1.5°C Boundary:</strong> Personal target of ~167 kg CO2e/month (~2.0 tonnes/year) aligns with global greenhouse gas stabilization pathways required to prevent catastrophic climate tipping points.
                </p>
                {assumptions.length > 0 && (
                  <div className="pt-1.5 border-t border-zinc-100">
                    <strong className="text-zinc-800 block mb-0.5">Session Assumptions:</strong>
                    <ul className="list-disc list-inside text-[10px] text-zinc-500 space-y-0.5">
                      {assumptions.map((asm, i) => (
                        <li key={i} className="leading-snug">{asm}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="print-card">
              <h2 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 pb-1 border-b border-zinc-200">
                7. Long-Term Decarbonization Guidance
              </h2>
              <div className="text-[10.5px] text-zinc-600 space-y-2 leading-relaxed">
                <p>
                  <strong>Energy Decarbonization:</strong> Transitioning household power to certified rooftop solar or green grid tariffs permanently removes up to 70% of domestic utility emissions without changing living standards.
                </p>
                <p>
                  <strong>Mobility Modal Shift:</strong> Combining active transit (walking/cycling) for trips under 3km with electrified mass transit provides the highest single-person carbon return on investment.
                </p>
                <p>
                  <strong>Kitchen Circularity:</strong> Minimizing food spoilage and diverting wet waste to municipal composting eliminates methane emissions generated in anaerobic landfill environments.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Page 2 Bottom Footer & Official Verification */}
        <div className="border-t border-zinc-200 pt-2 text-[10px] text-zinc-500 text-center leading-normal mt-auto">
          <p className="font-semibold text-zinc-700">
            GreenGuide AI • Aligned with United Nations Sustainable Development Goals: SDG 13 (Climate Action), SDG 12 & SDG 11
          </p>
          <p className="text-[9px] mt-0.5">
            Values reflect educational GHG conversion models. No private demographic data is retained on servers. • Page 2 of 2
          </p>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Recycle, Trash2, Sprout, ShoppingBag, CheckCircle2 } from 'lucide-react';
import CustomSelect from './CustomSelect';

export default function WasteStep({ data, onChange }) {
  const updateField = (field, val) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Step Header Intro */}
      <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/50 dark:border-purple-900/40 text-purple-800 dark:text-purple-300 text-xs">
        <Recycle className="w-4 h-4 shrink-0 text-purple-600 dark:text-purple-400" />
        <span>Landfilled organic waste decomposes anaerobically into methane, a greenhouse gas with 28x the warming potential of CO2.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        {/* Weekly Waste Volume */}
        <CustomSelect
          id="waste_level"
          label="Weekly Garbage Bag Generation"
          icon={Trash2}
          value={data.waste_level || "Medium"}
          onChange={(val) => updateField('waste_level', val)}
          options={[
            { value: "Low", label: "Low (1 small bin bag / week)" },
            { value: "Medium", label: "Medium (2–3 standard bags / week)" },
            { value: "High", label: "High (4+ large trash bags / week)" }
          ]}
        />

        {/* Recycling Habits */}
        <CustomSelect
          id="recycling_habits"
          label="Recycling Habits"
          icon={Recycle}
          value={data.recycling_habits || "Sometimes recycle"}
          onChange={(val) => updateField('recycling_habits', val)}
          options={[
            { value: "Always recycle", label: "Always Recycle (Paper, plastics, glass & metals)" },
            { value: "Sometimes recycle", label: "Sometimes Recycle" },
            { value: "Rarely/never recycle", label: "Rarely / Never Recycle" }
          ]}
        />

        {/* Composting */}
        <CustomSelect
          id="composting"
          label="Organic Composting"
          icon={Sprout}
          value={data.composting || "No"}
          onChange={(val) => updateField('composting', val)}
          options={[
            { value: "Yes, regularly", label: "Yes, Regularly (Home or Community Bin)" },
            { value: "Occasionally", label: "Occasionally / Irregular" },
            { value: "No", label: "No (Food scraps go into general trash)" }
          ]}
        />

        {/* Single-Use Plastics */}
        <CustomSelect
          id="single_use_plastic"
          label="Single-Use Plastic Usage"
          icon={ShoppingBag}
          value={data.single_use_plastic || "Moderate"}
          onChange={(val) => updateField('single_use_plastic', val)}
          options={[
            { value: "Minimal", label: "Minimal (Cloth bags, refill bottles, minimal packaged food)" },
            { value: "Moderate", label: "Moderate (Some takeout packaging & retail bags)" },
            { value: "High", label: "High (Frequent plastic bottles, disposable cutlery, packaging)" }
          ]}
        />

        {/* Waste Segregation Toggle */}
        <div className="col-span-full pt-2">
          <div
            onClick={() => updateField('waste_segregated', !data.waste_segregated)}
            className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
              data.waste_segregated
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/80 text-emerald-900 dark:text-emerald-200'
                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                  data.waste_segregated
                    ? 'bg-emerald-600 text-white'
                    : 'border-2 border-zinc-300 dark:border-zinc-700'
                }`}
              >
                {data.waste_segregated && <CheckCircle2 className="w-4 h-4" />}
              </div>
              <div>
                <p className="text-sm font-semibold">Separate Dry & Wet / Organic Waste</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Separating wet kitchen waste from dry recyclables enables high-efficiency municipal recovery.
                </p>
              </div>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
              {data.waste_segregated ? "Active (-15% Waste CO2)" : "Off"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

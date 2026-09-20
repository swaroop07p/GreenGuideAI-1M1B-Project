import React from 'react';
import { Zap, Flame, Home, Users, Wind, SunMedium } from 'lucide-react';
import CustomSelect from './CustomSelect';
import CustomSlider from './CustomSlider';

export default function EnergyStep({ data, onChange }) {
  const updateField = (field, val) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Step Header Intro */}
      <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs">
        <Zap className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        <span>Residential electricity, cooking energy, and temperature conditioning accounts for ~25% of household emissions.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        {/* Electricity Slider */}
        <div className="col-span-full">
          <CustomSlider
            id="electricity_kwh"
            label="Monthly Electricity Consumption (kWh)"
            icon={Zap}
            min={30}
            max={800}
            step={10}
            unit="kWh"
            value={data.electricity_kwh || 220}
            onChange={(val) => updateField('electricity_kwh', val)}
            helperText="Typical household: 150–350 kWh/mo"
          />
        </div>

        {/* Cooking Fuel Type */}
        <CustomSelect
          id="cooking_fuel"
          label="Cooking Fuel Type"
          icon={Flame}
          value={data.cooking_fuel || "LPG"}
          onChange={(val) => updateField('cooking_fuel', val)}
          options={[
            { value: "LPG", label: "LPG (Cylinder Gas)" },
            { value: "Piped Natural Gas (PNG)", label: "Piped Natural Gas (PNG)" },
            { value: "Electric induction", label: "Electric Induction Cooktop" },
            { value: "Electric coil/hotplate", label: "Electric Coil / Hotplate" },
            { value: "Wood/biomass", label: "Wood / Traditional Biomass" },
            { value: "Kerosene", label: "Kerosene" },
            { value: "Solar cooker", label: "Solar Cooker" },
            { value: "Other", label: "Other" }
          ]}
        />

        {/* Home Type */}
        <CustomSelect
          id="home_type"
          label="Residence Type"
          icon={Home}
          value={data.home_type || "Apartment/Flat"}
          onChange={(val) => updateField('home_type', val)}
          options={[
            { value: "Apartment/Flat", label: "Apartment / Flat" },
            { value: "Independent house", label: "Independent House / Villa" },
            { value: "Shared accommodation", label: "Shared Accommodation" },
            { value: "Studio", label: "Studio Apartment" }
          ]}
        />

        {/* Household Size */}
        <CustomSelect
          id="household_size"
          label="Household Size (People Sharing)"
          icon={Users}
          value={data.household_size || "3-4"}
          onChange={(val) => updateField('household_size', val)}
          options={[
            { value: "1", label: "1 Person (Solo)" },
            { value: "2", label: "2 People" },
            { value: "3-4", label: "3–4 People (Average Family)" },
            { value: "5+", label: "5+ People" }
          ]}
        />

        {/* Air Conditioning Usage */}
        <CustomSelect
          id="ac_usage"
          label="Air Conditioning (AC) Usage"
          icon={Wind}
          value={data.ac_usage || "Moderate (few hrs/day)"}
          onChange={(val) => updateField('ac_usage', val)}
          options={[
            { value: "None", label: "None / Fans Only" },
            { value: "Occasional (seasonal)", label: "Occasional (Peak Summer Only)" },
            { value: "Moderate (few hrs/day)", label: "Moderate (3–5 hours/day)" },
            { value: "Heavy (most of the day)", label: "Heavy (All Day / Night)" }
          ]}
        />

        {/* Renewable / Solar Adoption */}
        <div className="col-span-full">
          <CustomSelect
            id="renewable_usage"
            label="Renewable / Solar Energy Usage"
            icon={SunMedium}
            value={data.renewable_usage || "None"}
            onChange={(val) => updateField('renewable_usage', val)}
            options={[
              { value: "None", label: "None (100% Standard Grid)" },
              { value: "Partial (some solar/renewable)", label: "Partial (Rooftop Solar or Green Tariff)" },
              { value: "Majority renewable", label: "Majority Renewable (>50%)" },
              { value: "Fully off-grid renewable", label: "100% Off-Grid / Certified Clean Power" }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

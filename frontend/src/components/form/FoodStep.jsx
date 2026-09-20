import React from 'react';
import { Utensils, Apple, Trash2, Milk, Leaf } from 'lucide-react';
import CustomSelect from './CustomSelect';
import CustomSlider from './CustomSlider';

export default function FoodStep({ data, onChange }) {
  const updateField = (field, val) => {
    onChange({ ...data, [field]: val });
  };

  const isMeatEater = data.diet_type && (
    data.diet_type.includes("Non-vegetarian") ||
    data.diet_type === "Mixed/Flexitarian" ||
    data.diet_type === "Pescatarian"
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Step Header Intro */}
      <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/50 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-xs">
        <Utensils className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>Food systems generate ~26% of anthropogenic greenhouse gases, largely driven by livestock, deforestation, and food waste.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        {/* Diet Type */}
        <div className="col-span-full">
          <CustomSelect
            id="diet_type"
            label="Primary Dietary Pattern"
            icon={Leaf}
            value={data.diet_type || "Mixed/Flexitarian"}
            onChange={(val) => updateField('diet_type', val)}
            options={[
              { value: "Vegan", label: "🌱 Vegan (100% Plant-Based)" },
              { value: "Vegetarian", label: "🥦 Vegetarian (Plants + Dairy)" },
              { value: "Eggetarian", label: "🍳 Eggetarian (Vegetarian + Eggs)" },
              { value: "Pescatarian", label: "🐟 Pescatarian (Fish & Seafood)" },
              { value: "Non-vegetarian (moderate)", label: "🍗 Non-Vegetarian (Moderate: 2–4 meat meals/week)" },
              { value: "Non-vegetarian (heavy/daily meat)", label: "🥩 Non-Vegetarian (Heavy: Daily meat/red meat)" },
              { value: "Mixed/Flexitarian", label: "🥗 Mixed / Flexitarian (Occasional meat)" }
            ]}
          />
        </div>

        {/* Non-Veg Meals Per Week (shown or dynamic) */}
        {isMeatEater && (
          <div className="col-span-full">
            <CustomSlider
              id="non_veg_meals_per_week"
              label="Meat or Fish Meals per Week"
              icon={Utensils}
              min={0}
              max={21}
              step={1}
              unit="meals"
              value={data.non_veg_meals_per_week !== undefined ? data.non_veg_meals_per_week : 3}
              onChange={(val) => updateField('non_veg_meals_per_week', val)}
              helperText="Average across lunch and dinner"
            />
          </div>
        )}

        {/* Local / Seasonal Habits */}
        <CustomSelect
          id="local_seasonal_habits"
          label="Produce Source (Local vs Imported)"
          icon={Apple}
          value={data.local_seasonal_habits || "Mixed"}
          onChange={(val) => updateField('local_seasonal_habits', val)}
          options={[
            { value: "Mostly local & seasonal", label: "Mostly Local & In-Season" },
            { value: "Mixed", label: "Mixed (Supermarket Average)" },
            { value: "Mostly imported/out-of-season", label: "Mostly Imported / Air-Freighted Produce" },
            { value: "Not sure", label: "Not Sure" }
          ]}
        />

        {/* Food Waste Level */}
        <CustomSelect
          id="food_waste_level"
          label="Food Waste Habits"
          icon={Trash2}
          value={data.food_waste_level || "Moderate"}
          onChange={(val) => updateField('food_waste_level', val)}
          options={[
            { value: "Minimal (rarely throw away food)", label: "Minimal (Eat leftovers, rarely discard)" },
            { value: "Moderate", label: "Moderate (Occasional spoiled food)" },
            { value: "High (frequently discard leftovers)", label: "High (Frequently throw out leftovers/scraps)" }
          ]}
        />

        {/* Dairy Consumption */}
        <div className="col-span-full">
          <CustomSelect
            id="dairy_consumption"
            label="Dairy Consumption Level (Milk, Cheese, Butter)"
            icon={Milk}
            value={data.dairy_consumption || "Moderate"}
            onChange={(val) => updateField('dairy_consumption', val)}
            options={[
              { value: "None", label: "None (Plant-milk only)" },
              { value: "Low", label: "Low (Occasional splash of milk)" },
              { value: "Moderate", label: "Moderate (Daily tea/coffee, some cheese)" },
              { value: "High", label: "High (Heavy milk, cheese, paneer, yogurt daily)" }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

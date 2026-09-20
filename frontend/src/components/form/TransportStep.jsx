import React from 'react';
import { Car, Navigation, Gauge, Plane, Calendar, Bike } from 'lucide-react';
import CustomSelect from './CustomSelect';
import CustomSlider from './CustomSlider';

export default function TransportStep({ data, onChange }) {
  const updateField = (field, val) => {
    onChange({ ...data, [field]: val });
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Step Header Intro */}
      <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/50 dark:border-blue-900/40 text-blue-800 dark:text-blue-300 text-xs">
        <Car className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <span>Transportation is often the largest single source of personal emissions, especially solo car journeys and aviation.</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        {/* Daily Commute Distance Slider */}
        <CustomSlider
          id="commute_distance_km"
          label="Round-Trip Daily Commute (km)"
          icon={Navigation}
          min={0}
          max={100}
          step={2}
          unit="km"
          value={data.commute_distance_km !== undefined ? data.commute_distance_km : 16}
          onChange={(val) => updateField('commute_distance_km', val)}
          helperText="Average daily round-trip commute"
        />

        {/* Days Commuting Per Week Slider */}
        <CustomSlider
          id="commute_days_per_week"
          label="Commute Days per Week"
          icon={Calendar}
          min={0}
          max={7}
          step={1}
          unit="days"
          value={data.commute_days_per_week !== undefined ? data.commute_days_per_week : 5}
          onChange={(val) => updateField('commute_days_per_week', val)}
          helperText="0 = Work from home / Remote"
        />

        {/* Primary Commute Mode */}
        <div className="col-span-full">
          <CustomSelect
            id="primary_mode"
            label="Primary Daily Commute Mode"
            icon={Car}
            value={data.primary_mode || "Petrol/Diesel car"}
            onChange={(val) => updateField('primary_mode', val)}
            options={[
              { value: "Petrol/Diesel car", label: "🚗 Petrol / Diesel Car (Solo)" },
              { value: "EV (electric car)", label: "⚡ EV (Electric Car)" },
              { value: "Hybrid car", label: "🔋 Hybrid Car" },
              { value: "Motorbike/Scooter (petrol)", label: "🛵 Motorbike / Petrol Scooter" },
              { value: "Electric two-wheeler", label: "🛵⚡ Electric Scooter / E-Bike" },
              { value: "Bus/Public transit", label: "🚌 City Bus / Public Transit" },
              { value: "Metro/Train", label: "🚇 Metro / Suburban Train" },
              { value: "Carpool/Rideshare", label: "👥 Carpool / Shared Ride" },
              { value: "Bicycle", label: "🚲 Bicycle / Walking" },
              { value: "Walk", label: "🚶 Pure Walking" },
              { value: "Work from home / No commute", label: "🏠 Remote / Work from Home" }
            ]}
          />
        </div>

        {/* Long-Distance Travel Frequency */}
        <CustomSelect
          id="long_distance_freq"
          label="Long-Distance Travel Frequency"
          icon={Plane}
          value={data.long_distance_freq || "Rarely (0-1 flights/trips per year)"}
          onChange={(val) => updateField('long_distance_freq', val)}
          options={[
            { value: "Rarely (0-1 flights/trips per year)", label: "Rarely (0–1 trips / year)" },
            { value: "Occasionally (2-4 per year)", label: "Occasionally (2–4 trips / year)" },
            { value: "Frequently (5+ per year)", label: "Frequently (5+ trips / year)" }
          ]}
        />

        {/* Long-Distance Travel Mode */}
        <CustomSelect
          id="long_distance_mode"
          label="Primary Long-Distance Mode"
          icon={Navigation}
          value={data.long_distance_mode || "Domestic flights"}
          onChange={(val) => updateField('long_distance_mode', val)}
          options={[
            { value: "Domestic flights", label: "✈️ Domestic Flights" },
            { value: "International flights", label: "🛫 Long-Haul International Flights" },
            { value: "Train", label: "🚆 Long-Distance Rail / High-Speed Train" },
            { value: "Car road trips", label: "🚙 Highway Car Trips" },
            { value: "None", label: "None / No Travel" }
          ]}
        />

        {/* Fuel Efficiency */}
        <div className="col-span-full">
          <CustomSelect
            id="fuel_efficiency"
            label="Vehicle Fuel Efficiency (if driving)"
            icon={Gauge}
            value={data.fuel_efficiency || "Average"}
            onChange={(val) => updateField('fuel_efficiency', val)}
            options={[
              { value: "Very efficient", label: "Very Efficient (>20 km/l or >45 MPG / EV)" },
              { value: "Average", label: "Average Efficiency (13–18 km/l or 30–40 MPG)" },
              { value: "Below average", label: "Below Average / Large SUV (<12 km/l or <25 MPG)" },
              { value: "Not sure", label: "Not Sure / Standard" }
            ]}
          />
        </div>
      </div>
    </div>
  );
}

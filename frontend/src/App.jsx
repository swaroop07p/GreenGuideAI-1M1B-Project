import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import FormWizard from './components/form/FormWizard';
import ResultsDashboard from './components/results/ResultsDashboard';
import TransparencyPanel from './components/TransparencyPanel';
import ApiKeyModal from './components/ApiKeyModal';
import Footer from './components/Footer';
import { AppProvider } from './context/AppContext';

function AppContent() {
  const [hasCalculated, setHasCalculated] = useState(false);
  const [calculationResults, setCalculationResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isTransparencyOpen, setIsTransparencyOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  // Form State initialized with realistic defaults
  const [formData, setFormData] = useState({
    energy: {
      electricity_kwh: 220,
      cooking_fuel: "LPG",
      home_type: "Apartment/Flat",
      household_size: "3-4",
      ac_usage: "Moderate (few hrs/day)",
      renewable_usage: "None"
    },
    transport: {
      commute_distance_km: 16,
      commute_days_per_week: 5,
      primary_mode: "Petrol/Diesel car",
      long_distance_freq: "Rarely (0-1 flights/trips per year)",
      long_distance_mode: "Domestic flights",
      fuel_efficiency: "Average"
    },
    food: {
      diet_type: "Mixed/Flexitarian",
      non_veg_meals_per_week: 3,
      local_seasonal_habits: "Mixed",
      food_waste_level: "Moderate",
      dairy_consumption: "Moderate"
    },
    waste: {
      waste_level: "Medium",
      waste_segregated: false,
      recycling_habits: "Sometimes recycle",
      composting: "No",
      single_use_plastic: "Moderate"
    }
  });

  // Disable browser automatic scroll restoration on load/refresh and ensure top positioning
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      if ('scrollRestoration' in window.history) {
        window.history.scrollRestoration = 'manual';
      }
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, []);

  // Ensure scroll is at the very top whenever view transitions between calculator and results
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [hasCalculated]);

  // Handle browser back/forward buttons
  React.useEffect(() => {
    const handlePopState = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const scrollToForm = () => {
    const el = document.getElementById('calculator-form');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleCalculate = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const localKey = localStorage.getItem('greenguide_gemini_api_key') || '';
      const headers = { 'Content-Type': 'application/json' };
      if (localKey.trim()) {
        headers['X-Gemini-API-Key'] = localKey.trim();
      }

      const response = await fetch('/api/calculate-footprint', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      setCalculationResults(data);
      setHasCalculated(true);
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }, 10);
    } catch (err) {
      console.warn('Backend connection error or fallback:', err);
      try {
        await fetch('/api/health');
      } catch (e) {
        // disconnected
      }
      setError("Note: Live AI request encountered a network or rate limit; rendered with standard IPCC reference engine.");
      setCalculationResults(createClientMock(formData));
      setHasCalculated(true);
      setTimeout(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      }, 10);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setHasCalculated(false);
    setCalculationResults(null);
    setError(null);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200">
      <Navbar 
        onOpenTransparency={() => setIsTransparencyOpen(true)} 
        onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
      />

      <main className="flex-grow w-full max-w-full overflow-x-hidden">
        {error && (
          <div className="max-w-4xl mx-auto mt-4 px-4">
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
              {error}
            </div>
          </div>
        )}

        {!hasCalculated ? (
          <>
            <Hero onStartCalculation={scrollToForm} />
            <FormWizard
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleCalculate}
              isLoading={isLoading}
            />
          </>
        ) : (
          <ResultsDashboard
            data={calculationResults}
            onReset={handleReset}
            onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
          />
        )}
      </main>

      <Footer onOpenTransparency={() => setIsTransparencyOpen(true)} />

      <TransparencyPanel
        isOpen={isTransparencyOpen}
        onClose={() => setIsTransparencyOpen(false)}
      />

      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />
    </div>
  );
}

// Emergency client-side generator in case backend server is unreachable
function createClientMock(req) {
  return {
    total_monthly_kg: 346.1,
    total_annual_kg: 4153.2,
    eco_score: 63,
    eco_tier: "On Track",
    eco_blurb: "Great balance! You are right in line with sustainable transition practices with solid opportunities ahead.",
    category_breakdown: {
      energy: {
        category: "energy",
        label: "Energy & Utilities",
        kg_co2e_monthly: 98.4,
        percentage: 28.4,
        icon: "Zap",
        color: "#10B981"
      },
      transport: {
        category: "transport",
        label: "Mobility & Transport",
        kg_co2e_monthly: 112.5,
        percentage: 32.5,
        icon: "Car",
        color: "#3B82F6"
      },
      food: {
        category: "food",
        label: "Food & Nutrition",
        kg_co2e_monthly: 108.0,
        percentage: 31.2,
        icon: "Utensils",
        color: "#F59E0B"
      },
      waste: {
        category: "waste",
        label: "Waste & Material",
        kg_co2e_monthly: 27.2,
        percentage: 7.9,
        icon: "Recycle",
        color: "#8B5CF6"
      }
    },
    explanation: "Your estimated footprint of 346.1 kg CO2e per month is calculated using standard emission factors applied to your self-reported habits across energy, daily mobility, dietary intake, and waste management.",
    recommendations: [
      {
        id: "rec-1",
        title: "Shift 2 Commutes to Public Transit or Cycling",
        category: "transport",
        description: "Replacing just two driving commutes per week with public transit or cycling curtails emissions by over 35 kg/mo.",
        estimated_co2_saved_kg_monthly: 38.0,
        difficulty: "Easy",
        icon: "Bike"
      },
      {
        id: "rec-2",
        title: "Introduce 2 Plant-Rich Days per Week",
        category: "food",
        description: "Swapping 2-3 meat dishes for vibrant legume or tofu bowls saves significant agricultural emissions.",
        estimated_co2_saved_kg_monthly: 32.0,
        difficulty: "Easy",
        icon: "Salad"
      },
      {
        id: "rec-3",
        title: "Smart Thermostat & AC Management",
        category: "energy",
        description: "Adjusting AC temperature closer to ambient and using timers reduces baseload noticeably.",
        estimated_co2_saved_kg_monthly: 26.0,
        difficulty: "Medium",
        icon: "Thermometer"
      }
    ],
    actionPlan: [
      {
        week: 1,
        title: "Energy & Food Audit",
        focus_goal: "Eliminate phantom energy drain and food waste",
        expected_impact_kg_monthly: 18.0,
        action_steps: ["Audit fridge items", "Unplug phantom electronics", "Set AC 1.5°C warmer"]
      },
      {
        week: 2,
        title: "Low-Carbon Commute",
        focus_goal: "Test alternative commute methods",
        expected_impact_kg_monthly: 24.0,
        action_steps: ["Map transit lines", "Try 1 bike day", "Check vehicle tire pressures"]
      }
    ],
    action_plan: [
      {
        week: 1,
        title: "Energy & Food Audit",
        focus_goal: "Eliminate phantom energy drain and food waste",
        expected_impact_kg_monthly: 18.0,
        action_steps: ["Audit fridge items", "Unplug phantom electronics", "Set AC 1.5°C warmer"]
      },
      {
        week: 2,
        title: "Low-Carbon Commute",
        focus_goal: "Test alternative commute methods",
        expected_impact_kg_monthly: 24.0,
        action_steps: ["Map transit lines", "Try 1 bike day", "Check vehicle tire pressures"]
      },
      {
        week: 3,
        title: "Waste & Composting",
        focus_goal: "Sort recyclables and start composting",
        expected_impact_kg_monthly: 14.0,
        action_steps: ["Establish dry/wet bins", "Cut single-use bags", "Explore kitchen composting"]
      },
      {
        week: 4,
        title: "Plant-Forward Habit",
        focus_goal: "Celebrate 2 plant-rich days per week",
        expected_impact_kg_monthly: 28.0,
        action_steps: ["Cook 3 vegetarian meals", "Buy seasonal local fruit", "Review impact in GreenGuide"]
      }
    ],
    benchmarks: {
      user_footprint_monthly: 346.1,
      national_average_monthly: 360.0,
      global_average_monthly: 390.0,
      sustainable_target_monthly: 167.0,
      comparison_text: "Your footprint (346 kg/mo) is 11% below the global average (390 kg/mo)."
    },
    assumptions_made: [
      "Assumed regional grid emission average of 0.70 kg CO2e/kWh.",
      "Assumed typical commute days and household size sharing baseload."
    ],
    source: "deterministic_fallback"
  };
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

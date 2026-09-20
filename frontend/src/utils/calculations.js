/**
 * Carbon calculations and unit conversion utilities
 */

export const KG_TO_LB_MULTIPLIER = 2.20462;

export function convertCo2(kgValue, unit = 'kg') {
  if (kgValue === undefined || kgValue === null) return 0;
  if (unit === 'lb') {
    return Math.round(kgValue * KG_TO_LB_MULTIPLIER * 10) / 10;
  }
  return Math.round(kgValue * 10) / 10;
}

export function formatCo2Value(kgValue, unit = 'kg', suffix = true) {
  const converted = convertCo2(kgValue, unit);
  const formattedNumber = converted.toLocaleString();
  if (!suffix) return formattedNumber;
  return `${formattedNumber} ${unit === 'lb' ? 'lb CO2e' : 'kg CO2e'}`;
}

export function getTierColor(score) {
  if (score >= 90) return { bg: "bg-emerald-500", text: "text-emerald-500", lightBg: "bg-emerald-50 dark:bg-emerald-950/40", border: "border-emerald-500" };
  if (score >= 75) return { bg: "bg-teal-500", text: "text-teal-500", lightBg: "bg-teal-50 dark:bg-teal-950/40", border: "border-teal-500" };
  if (score >= 60) return { bg: "bg-green-500", text: "text-green-500", lightBg: "bg-green-50 dark:bg-green-950/40", border: "border-green-500" };
  if (score >= 40) return { bg: "bg-amber-500", text: "text-amber-500", lightBg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-500" };
  return { bg: "bg-orange-500", text: "text-orange-500", lightBg: "bg-orange-50 dark:bg-orange-950/40", border: "border-orange-500" };
}

// Client-side quick recalculation for What-If sliders
export function recalculateWhatIf(baseBreakdown, whatIfDeltas) {
  const {
    transitDaysPerWeek = 0, // days replacing car commute with transit/bike
    meatFreeDaysPerWeek = 0, // days replacing non-veg with plant-based
    electricityReductionPct = 0, // % reduction in electricity
    solarAdoption = 'none', // 'none', 'partial', 'majority', 'full'
    compostingActive = false, // boolean
    recycleActive = false
  } = whatIfDeltas;

  // Clone base numbers
  let energy = baseBreakdown?.energy?.kg_co2e_monthly || 120;
  let transport = baseBreakdown?.transport?.kg_co2e_monthly || 100;
  let food = baseBreakdown?.food?.kg_co2e_monthly || 110;
  let waste = baseBreakdown?.waste?.kg_co2e_monthly || 25;

  // Energy adjustments
  const solarSavingsMap = { none: 0, partial: 0.30, majority: 0.65, full: 0.90 };
  const solarPct = solarSavingsMap[solarAdoption] || 0;
  energy = energy * (1 - (electricityReductionPct / 100)) * (1 - solarPct);

  // Transport adjustments: 5 work days base; each day replaced saves ~70% of that day's commute
  const transitSavings = Math.min(transport * 0.7, (transitDaysPerWeek / 5) * (transport * 0.65));
  transport = Math.max(0, transport - transitSavings);

  // Food adjustments: replacing meat days saves ~3.5 kg/day * 4.33
  const foodSavings = (meatFreeDaysPerWeek / 7) * (food * 0.45);
  food = Math.max(20, food - foodSavings);

  // Waste adjustments
  if (compostingActive) waste = waste * 0.75;
  if (recycleActive) waste = waste * 0.85;

  energy = Math.round(Math.max(5, energy) * 10) / 10;
  transport = Math.round(Math.max(0, transport) * 10) / 10;
  food = Math.round(Math.max(15, food) * 10) / 10;
  waste = Math.round(Math.max(3, waste) * 10) / 10;

  const totalMonthly = Math.round((energy + transport + food + waste) * 10) / 10;
  const totalAnnual = Math.round(totalMonthly * 12 * 10) / 10;

  // Recompute score
  let score = 50;
  let tier = "On Track";
  if (totalMonthly <= 140) {
    score = Math.min(100, Math.round(90 + (140 - totalMonthly) / 4));
    tier = "Climate Hero";
  } else if (totalMonthly <= 240) {
    score = Math.round(76 + ((240 - totalMonthly) / 100) * 13);
    tier = "Eco Champion";
  } else if (totalMonthly <= 380) {
    score = Math.round(60 + ((380 - totalMonthly) / 140) * 15);
    tier = "On Track";
  } else if (totalMonthly <= 580) {
    score = Math.round(40 + ((580 - totalMonthly) / 200) * 19);
    tier = "Making Progress";
  } else {
    score = Math.max(15, Math.round(40 - ((totalMonthly - 580) / 400) * 20));
    tier = "Just Starting Out";
  }

  return {
    totalMonthly,
    totalAnnual,
    score,
    tier,
    breakdown: {
      energy,
      transport,
      food,
      waste
    }
  };
}

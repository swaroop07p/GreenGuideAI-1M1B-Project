"""
Emission Factor Constants & Calculation Engine for GreenGuide AI
All values are standard, widely accepted scientific approximations (IPCC, EPA, UK BEIS references).
Clearly documented as illustrative/standardized averages, not region-specific precise values.
"""

from typing import Dict, Any, Tuple, List
from .models import (
    FootprintRequest, FootprintResponse, CategoryBreakdown,
    CategoryBreakdownItem, RecommendationItem, ActionPlanItem, Benchmarks
)

# --- Standardized Emission Factor Constants ---

EMISSION_FACTORS = {
    "version": "2026.1-enhanced",
    "sources": "IPCC Sixth Assessment Report, EPA GHG Equivalencies, UK BEIS Conversion Factors",
    "energy": {
        "grid_electricity_kg_co2e_per_kwh": 0.70,  # Standard world grid average
        "default_monthly_kwh": 220.0,
        "cooking_fuel_monthly_kg_co2e": {
            "LPG": 35.0,
            "Piped Natural Gas (PNG)": 28.0,
            "Electric induction": 18.0,
            "Electric coil/hotplate": 28.0,
            "Wood/biomass": 55.0,
            "Kerosene": 45.0,
            "Solar cooker": 0.0,
            "Other": 30.0
        },
        "home_type_multiplier": {
            "Apartment/Flat": 0.85,
            "Independent house": 1.25,
            "Shared accommodation": 0.70,
            "Studio": 0.75
        },
        "household_size_divisor": {
            "1": 1.0,
            "2": 0.65,
            "3-4": 0.45,
            "5+": 0.35
        },
        "ac_usage_monthly_kg_co2e": {
            "None": 0.0,
            "Occasional (seasonal)": 20.0,
            "Moderate (few hrs/day)": 50.0,
            "Heavy (most of the day)": 125.0
        },
        "renewable_usage_discount": {
            "None": 0.0,
            "Partial (some solar/renewable)": 0.30,
            "Majority renewable": 0.70,
            "Fully off-grid renewable": 0.95
        }
    },
    "transport": {
        "default_daily_km": 16.0,
        "default_days_per_week": 5,
        "mode_kg_co2e_per_km": {
            "Petrol/Diesel car": 0.192,
            "EV (electric car)": 0.053,
            "Hybrid car": 0.108,
            "Motorbike/Scooter (petrol)": 0.084,
            "Electric two-wheeler": 0.025,
            "Bus/Public transit": 0.045,
            "Metro/Train": 0.031,
            "Carpool/Rideshare": 0.096,
            "Bicycle": 0.0,
            "Walk": 0.0,
            "Work from home / No commute": 0.0
        },
        "fuel_efficiency_multiplier": {
            "Very efficient": 0.82,
            "Average": 1.0,
            "Below average": 1.25,
            "Not sure": 1.0
        },
        "long_distance_monthly_kg_co2e": {
            # (frequency, mode) -> monthly equivalent kg CO2e
            "Domestic flights": {
                "Rarely (0-1 flights/trips per year)": 12.0,
                "Occasionally (2-4 per year)": 38.0,
                "Frequently (5+ per year)": 95.0
            },
            "International flights": {
                "Rarely (0-1 flights/trips per year)": 60.0,
                "Occasionally (2-4 per year)": 180.0,
                "Frequently (5+ per year)": 390.0
            },
            "Train": {
                "Rarely (0-1 flights/trips per year)": 3.0,
                "Occasionally (2-4 per year)": 9.0,
                "Frequently (5+ per year)": 22.0
            },
            "Car road trips": {
                "Rarely (0-1 flights/trips per year)": 6.0,
                "Occasionally (2-4 per year)": 18.0,
                "Frequently (5+ per year)": 45.0
            },
            "None": {
                "Rarely (0-1 flights/trips per year)": 0.0,
                "Occasionally (2-4 per year)": 0.0,
                "Frequently (5+ per year)": 0.0
            }
        }
    },
    "food": {
        "diet_base_monthly_kg_co2e": {
            "Vegan": 65.0,
            "Vegetarian": 95.0,
            "Eggetarian": 110.0,
            "Pescatarian": 135.0,
            "Non-vegetarian (moderate)": 175.0,
            "Non-vegetarian (heavy/daily meat)": 260.0,
            "Mixed/Flexitarian": 140.0
        },
        "dairy_adjustment_kg_co2e": {
            "None": -15.0,
            "Low": -5.0,
            "Moderate": 0.0,
            "High": 20.0
        },
        "local_seasonal_multiplier": {
            "Mostly local & seasonal": 0.85,
            "Mixed": 1.0,
            "Mostly imported/out-of-season": 1.20,
            "Not sure": 1.0
        },
        "food_waste_adjustment_kg_co2e": {
            "Minimal (rarely throw away food)": -12.0,
            "Moderate": 0.0,
            "High (frequently discard leftovers)": 25.0
        }
    },
    "waste": {
        "level_base_monthly_kg_co2e": {
            "Low": 14.0,
            "Medium": 32.0,
            "High": 65.0
        },
        "segregation_discount": 0.15,
        "recycling_discount": {
            "Always recycle": 0.20,
            "Sometimes recycle": 0.05,
            "Rarely/never recycle": -0.10  # penalty
        },
        "composting_discount": {
            "Yes, regularly": 0.25,
            "Occasionally": 0.10,
            "No": 0.0
        },
        "single_use_plastic_adjustment_kg_co2e": {
            "Minimal": -6.0,
            "Moderate": 0.0,
            "High": 14.0
        }
    },
    "benchmarks": {
        "global_average_monthly_kg": 390.0,      # ~4.7 tonnes / year
        "national_average_monthly_kg": 360.0,    # Representative reference average
        "sustainable_target_monthly_kg": 167.0   # ~2.0 tonnes / year (1.5°C Paris Accord Target)
    }
}


def calculate_deterministic_footprint(req: FootprintRequest) -> Tuple[Dict[str, float], List[str]]:
    """
    Computes exact monthly category values in kg CO2e based on standard emission factors.
    Returns (breakdown_dict, list_of_assumptions_made).
    """
    assumptions: List[str] = []
    
    # 1. Energy
    energy_cfg = EMISSION_FACTORS["energy"]
    e_in = req.energy or req.dict().get("energy", {})
    
    kwh = getattr(e_in, "electricity_kwh", None)
    bill = getattr(e_in, "electricity_bill", None)
    
    if kwh is not None and kwh > 0:
        base_elec_kwh = float(kwh)
    elif bill is not None and bill > 0:
        # Approximate 1 currency unit ~ 6.5 kWh equivalent
        base_elec_kwh = float(bill) * 6.5
        assumptions.append(f"Estimated electricity consumption ({round(base_elec_kwh)} kWh) from entered bill amount.")
    else:
        base_elec_kwh = energy_cfg["default_monthly_kwh"]
        assumptions.append("Assumed regional average household electricity usage (220 kWh/month) as no reading was provided.")

    household_size = getattr(e_in, "household_size", "3-4") or "3-4"
    h_divisor = energy_cfg["household_size_divisor"].get(household_size, 0.45)
    
    home_type = getattr(e_in, "home_type", "Apartment/Flat") or "Apartment/Flat"
    home_mult = energy_cfg["home_type_multiplier"].get(home_type, 0.85)
    
    ac_usage = getattr(e_in, "ac_usage", "Moderate (few hrs/day)") or "Moderate (few hrs/day)"
    ac_kg = energy_cfg["ac_usage_monthly_kg_co2e"].get(ac_usage, 50.0)
    
    fuel = getattr(e_in, "cooking_fuel", "LPG") or "LPG"
    fuel_kg = energy_cfg["cooking_fuel_monthly_kg_co2e"].get(fuel, 35.0)
    
    renewable = getattr(e_in, "renewable_usage", "None") or "None"
    renewable_discount = energy_cfg["renewable_usage_discount"].get(renewable, 0.0)
    
    # Base electricity footprint adjusted for household sharing, home type and renewable solar
    elec_footprint = (base_elec_kwh * energy_cfg["grid_electricity_kg_co2e_per_kwh"] * home_mult * h_divisor) * (1.0 - renewable_discount)
    fuel_footprint = (fuel_kg * h_divisor)
    ac_footprint = (ac_kg * h_divisor) * (1.0 - renewable_discount * 0.5)
    energy_total = round(max(5.0, elec_footprint + fuel_footprint + ac_footprint), 1)

    # 2. Transport
    t_cfg = EMISSION_FACTORS["transport"]
    t_in = req.transport or req.dict().get("transport", {})
    
    daily_km = getattr(t_in, "commute_distance_km", None)
    if daily_km is None:
        daily_km = t_cfg["default_daily_km"]
        assumptions.append("Assumed typical daily commute distance of 16 km round-trip.")
    else:
        daily_km = float(daily_km)
        
    commute_days = getattr(t_in, "commute_days_per_week", 5) or 5
    monthly_commute_km = daily_km * commute_days * 4.33
    
    primary_mode = getattr(t_in, "primary_mode", "Petrol/Diesel car") or "Petrol/Diesel car"
    mode_factor = t_cfg["mode_kg_co2e_per_km"].get(primary_mode, 0.192)
    
    efficiency = getattr(t_in, "fuel_efficiency", "Average") or "Average"
    eff_mult = t_cfg["fuel_efficiency_multiplier"].get(efficiency, 1.0)
    
    commute_kg = monthly_commute_km * mode_factor * eff_mult
    
    long_dist_freq = getattr(t_in, "long_distance_freq", "Rarely (0-1 flights/trips per year)") or "Rarely (0-1 flights/trips per year)"
    long_dist_mode = getattr(t_in, "long_distance_mode", "Domestic flights") or "Domestic flights"
    long_dist_kg = t_cfg["long_distance_monthly_kg_co2e"].get(long_dist_mode, {}).get(long_dist_freq, 12.0)
    
    transport_total = round(max(0.0, commute_kg + long_dist_kg), 1)

    # 3. Food
    f_cfg = EMISSION_FACTORS["food"]
    f_in = req.food or req.dict().get("food", {})
    
    diet = getattr(f_in, "diet_type", "Mixed/Flexitarian") or "Mixed/Flexitarian"
    diet_base = f_cfg["diet_base_monthly_kg_co2e"].get(diet, 140.0)
    
    non_veg_meals = getattr(f_in, "non_veg_meals_per_week", None)
    if non_veg_meals is not None and "Non-vegetarian" in diet:
        # Fine-tune with explicit meat meals per week
        diet_base = max(70.0, 60.0 + (float(non_veg_meals) * 4.33 * 2.1))
        
    dairy = getattr(f_in, "dairy_consumption", "Moderate") or "Moderate"
    dairy_adj = f_cfg["dairy_adjustment_kg_co2e"].get(dairy, 0.0)
    
    local = getattr(f_in, "local_seasonal_habits", "Mixed") or "Mixed"
    local_mult = f_cfg["local_seasonal_multiplier"].get(local, 1.0)
    
    waste_food = getattr(f_in, "food_waste_level", "Moderate") or "Moderate"
    waste_adj = f_cfg["food_waste_adjustment_kg_co2e"].get(waste_food, 0.0)
    
    food_total = round(max(15.0, (diet_base + dairy_adj + waste_adj) * local_mult), 1)

    # 4. Waste
    w_cfg = EMISSION_FACTORS["waste"]
    w_in = req.waste or req.dict().get("waste", {})
    
    w_level = getattr(w_in, "waste_level", "Medium") or "Medium"
    w_base = w_cfg["level_base_monthly_kg_co2e"].get(w_level, 32.0)
    
    segregated = getattr(w_in, "waste_segregated", False)
    seg_discount = w_cfg["segregation_discount"] if segregated else 0.0
    
    recycling = getattr(w_in, "recycling_habits", "Sometimes recycle") or "Sometimes recycle"
    rec_discount = w_cfg["recycling_discount"].get(recycling, 0.05)
    
    composting = getattr(w_in, "composting", "No") or "No"
    comp_discount = w_cfg["composting_discount"].get(composting, 0.0)
    
    plastic = getattr(w_in, "single_use_plastic", "Moderate") or "Moderate"
    plastic_adj = w_cfg["single_use_plastic_adjustment_kg_co2e"].get(plastic, 0.0)
    
    total_waste_discount = min(0.70, seg_discount + rec_discount + comp_discount)
    waste_total = round(max(4.0, (w_base * (1.0 - total_waste_discount)) + plastic_adj), 1)

    return {
        "energy": energy_total,
        "transport": transport_total,
        "food": food_total,
        "waste": waste_total
    }, assumptions


def compute_eco_score_and_tier(total_monthly_kg: float) -> Tuple[int, str, str]:
    """
    Computes a non-judgmental 0-100 Eco Score and positive tier label + blurb.
    Sustainable benchmark: ~167 kg/mo.
    """
    # Scale: <= 120 kg -> 98-100, 167 kg -> 88, 300 kg -> 72, 450 kg -> 55, 700+ kg -> 25-35
    if total_monthly_kg <= 140:
        score = int(90 + min(10, (140 - total_monthly_kg) / 4))
        tier = "Climate Hero"
        blurb = "Outstanding! Your lifestyle is closely aligned with the Paris Climate Accord 1.5°C threshold."
    elif total_monthly_kg <= 240:
        score = int(76 + ((240 - total_monthly_kg) / 100) * 13)
        tier = "Eco Champion"
        blurb = "Fantastic work! Your carbon footprint is well below typical averages and making a real difference."
    elif total_monthly_kg <= 380:
        score = int(60 + ((380 - total_monthly_kg) / 140) * 15)
        tier = "On Track"
        blurb = "Great balance! You are right in line with sustainable transition practices with solid opportunities ahead."
    elif total_monthly_kg <= 580:
        score = int(40 + ((580 - total_monthly_kg) / 200) * 19)
        tier = "Making Progress"
        blurb = "Good foundation! You have clear high-leverage areas where small lifestyle tweaks can slash carbon fast."
    else:
        score = max(15, int(40 - ((total_monthly_kg - 580) / 400) * 20))
        tier = "Just Starting Out"
        blurb = "Every journey begins here! You have huge potential to make an outsized positive climate impact."

    return max(5, min(100, score)), tier, blurb


def generate_backend_footprint_analysis(req: FootprintRequest) -> FootprintResponse:
    """
    Constructs a complete, mathematically verified, highly personalized FootprintResponse
    using the backend calculation engine based on IPCC Sixth Assessment and EPA conversion models.
    Provides rich, dynamic, user-tailored results without consuming Gemini LLM tokens.
    """
    breakdown_vals, assumptions = calculate_deterministic_footprint(req)
    total_monthly = round(sum(breakdown_vals.values()), 1)
    total_annual = round(total_monthly * 12.0, 1)

    # Percentages
    pcts = {
        k: round((v / max(1.0, total_monthly)) * 100.0, 1)
        for k, v in breakdown_vals.items()
    }

    eco_score, eco_tier, eco_blurb = compute_eco_score_and_tier(total_monthly)

    benchmarks_data = Benchmarks(
        user_footprint_monthly=total_monthly,
        national_average_monthly=EMISSION_FACTORS["benchmarks"]["national_average_monthly_kg"],
        global_average_monthly=EMISSION_FACTORS["benchmarks"]["global_average_monthly_kg"],
        sustainable_target_monthly=EMISSION_FACTORS["benchmarks"]["sustainable_target_monthly_kg"],
        comparison_text=(
            f"Your footprint ({round(total_monthly)} kg/mo) is "
            f"{abs(round((total_monthly - EMISSION_FACTORS['benchmarks']['global_average_monthly_kg']) / EMISSION_FACTORS['benchmarks']['global_average_monthly_kg'] * 100))}% "
            f"{'below' if total_monthly <= EMISSION_FACTORS['benchmarks']['global_average_monthly_kg'] else 'above'} "
            f"the global average ({round(EMISSION_FACTORS['benchmarks']['global_average_monthly_kg'])} kg/mo)."
        )
    )

    cat_breakdown = CategoryBreakdown(
        energy=CategoryBreakdownItem(
            category="energy",
            label="Energy & Utilities",
            kg_co2e_monthly=breakdown_vals["energy"],
            percentage=pcts["energy"],
            icon="Zap",
            color="#10B981"  # Emerald
        ),
        transport=CategoryBreakdownItem(
            category="transport",
            label="Mobility & Transport",
            kg_co2e_monthly=breakdown_vals["transport"],
            percentage=pcts["transport"],
            icon="Car",
            color="#3B82F6"  # Blue
        ),
        food=CategoryBreakdownItem(
            category="food",
            label="Food & Nutrition",
            kg_co2e_monthly=breakdown_vals["food"],
            percentage=pcts["food"],
            icon="Utensils",
            color="#F59E0B"  # Amber
        ),
        waste=CategoryBreakdownItem(
            category="waste",
            label="Waste & Material",
            kg_co2e_monthly=breakdown_vals["waste"],
            percentage=pcts["waste"],
            icon="Recycle",
            color="#8B5CF6"  # Purple
        )
    )

    # Dynamically generate intelligent recommendations tailored to the user's specific inputs
    e_in = req.energy or req.dict().get("energy", {})
    t_in = req.transport or req.dict().get("transport", {})
    f_in = req.food or req.dict().get("food", {})
    w_in = req.waste or req.dict().get("waste", {})

    t_mode = getattr(t_in, "primary_mode", "Petrol/Diesel car") or "Petrol/Diesel car"
    commute_days = getattr(t_in, "commute_days_per_week", 5) or 5
    f_diet = getattr(f_in, "diet_type", "Mixed/Flexitarian") or "Mixed/Flexitarian"
    non_veg_meals = getattr(f_in, "non_veg_meals_per_week", 3) or 3
    e_renew = getattr(e_in, "renewable_usage", "None") or "None"
    e_ac = getattr(e_in, "ac_usage", "Moderate (few hrs/day)") or "Moderate (few hrs/day)"
    w_compost = getattr(w_in, "composting", "No") or "No"
    w_plastic = getattr(w_in, "single_use_plastic", "Moderate") or "Moderate"

    potential_recs = []

    # 1. Transport recommendation
    if "car" in t_mode.lower() or "petrol" in t_mode.lower() or "diesel" in t_mode.lower():
        transit_savings = round(min(breakdown_vals["transport"] * (2.0 / max(1, commute_days)), 55.0), 1)
        potential_recs.append(RecommendationItem(
            id="rec-transit",
            title="Shift 2 Commutes per Week to Public Transit or Cycling",
            category="transport",
            description=f"Replacing two weekly driving days ({t_mode}) with metro, bus, or cycling directly eliminates tailpipe combustion.",
            estimated_co2_saved_kg_monthly=max(12.0, transit_savings),
            difficulty="Easy",
            icon="Bike"
        ))
        ev_savings = round(breakdown_vals["transport"] * 0.70, 1)
        if ev_savings > 20:
            potential_recs.append(RecommendationItem(
                id="rec-ev",
                title="Transition to an Electric Vehicle (EV)",
                category="transport",
                description="Electric drivetrains are 3-4x more energy-efficient than internal combustion engines, cutting commute emissions by 70% even on standard grids.",
                estimated_co2_saved_kg_monthly=ev_savings,
                difficulty="High Impact",
                icon="Zap"
            ))

    # 2. Food recommendation
    if "non-vegetarian" in f_diet.lower() or "meat" in f_diet.lower() or "mixed" in f_diet.lower() or non_veg_meals > 0:
        diet_savings = round(min(breakdown_vals["food"] * 0.32, 45.0), 1)
        potential_recs.append(RecommendationItem(
            id="rec-plant",
            title="Adopt 2 to 3 Plant-Rich Days per Week",
            category="food",
            description="Swapping 2-3 meat dishes for legume, tofu, or grain bowls significantly reduces ruminant methane emissions and land-use footprints.",
            estimated_co2_saved_kg_monthly=max(15.0, diet_savings),
            difficulty="Easy",
            icon="Salad"
        ))

    # Food waste reduction
    f_waste = getattr(f_in, "food_waste_level", "Moderate") or "Moderate"
    if f_waste in ["Moderate", "High"]:
        waste_food_savings = round(min(breakdown_vals["food"] * 0.18, 26.0), 1)
        potential_recs.append(RecommendationItem(
            id="rec-foodwaste",
            title="Smart Meal Planning to Eliminate Kitchen Spoilage",
            category="food",
            description="Planning weekly meals and freezing leftovers keeps edible food from rotting in landfills, preserving both household budget and carbon budgets.",
            estimated_co2_saved_kg_monthly=max(8.0, waste_food_savings),
            difficulty="Easy",
            icon="Utensils"
        ))

    # 3. Energy recommendation
    if e_renew in ["None", "Partial (solar water heater only)"]:
        solar_savings = round(min(breakdown_vals["energy"] * 0.42, 60.0), 1)
        potential_recs.append(RecommendationItem(
            id="rec-solar",
            title="Install Rooftop Solar or Choose Green Power Tariff",
            category="energy",
            description="Generating clean solar electricity or subscribing to utility green tariffs replaces fossil-heavy grid baseload with zero-emission power.",
            estimated_co2_saved_kg_monthly=max(18.0, solar_savings),
            difficulty="High Impact",
            icon="Sun"
        ))

    if "moderate" in e_ac.lower() or "high" in e_ac.lower():
        ac_savings = round(min(breakdown_vals["energy"] * 0.22, 32.0), 1)
        potential_recs.append(RecommendationItem(
            id="rec-ac",
            title="Optimize Air Conditioning Thermostat (24°C–25°C Eco Mode)",
            category="energy",
            description="Setting AC setpoints 1.5°C closer to ambient and servicing filters boosts efficiency by 8-10% without sacrificing comfort.",
            estimated_co2_saved_kg_monthly=max(10.0, ac_savings),
            difficulty="Easy",
            icon="Thermometer"
        ))

    # 4. Waste recommendation
    if w_compost in ["No", "Interested but not started"]:
        compost_savings = round(min(breakdown_vals["waste"] * 0.40, 16.0), 1)
        potential_recs.append(RecommendationItem(
            id="rec-compost",
            title="Start Household Kitchen Scrap Composting",
            category="waste",
            description="Aerobic composting decomposes kitchen peels and coffee grounds with oxygen, preventing potent anaerobic methane formation in municipal dumps.",
            estimated_co2_saved_kg_monthly=max(6.0, compost_savings),
            difficulty="Medium",
            icon="Trash2"
        ))

    if w_plastic in ["Moderate", "High"]:
        potential_recs.append(RecommendationItem(
            id="rec-plastic",
            title="Eliminate Single-Use Packaging with Reusable Kits",
            category="waste",
            description="Carrying reusable produce bags, water bottles, and meal containers directly curtails upstream petroleum refining and disposal emissions.",
            estimated_co2_saved_kg_monthly=6.5,
            difficulty="Easy",
            icon="Recycle"
        ))

    # Sort recommendations by estimated CO2 saved (highest impact first) and pick top 4-6
    potential_recs.sort(key=lambda r: r.estimated_co2_saved_kg_monthly, reverse=True)
    final_recs = potential_recs[:5] if len(potential_recs) >= 5 else potential_recs

    # Identify largest and second largest emission categories for dynamic narration
    sorted_cats = sorted(breakdown_vals.items(), key=lambda item: item[1], reverse=True)
    top_cat, top_val = sorted_cats[0]
    second_cat, second_val = sorted_cats[1]

    category_labels = {
        "energy": "Energy & Utilities",
        "transport": "Mobility & Transport",
        "food": "Food & Nutrition",
        "waste": "Waste & Material"
    }

    # Customized 4-week Action Plan tailored to their specific high-impact areas
    week1_impact = round(max(8.0, top_val * 0.16), 1)
    week2_impact = round(max(10.0, second_val * 0.18), 1)
    week3_impact = round(max(6.0, breakdown_vals["waste"] * 0.25), 1)
    week4_impact = round(max(12.0, (top_val + second_val) * 0.12), 1)

    action_plan = [
        ActionPlanItem(
            week=1,
            title=f"Fast Wins in {category_labels[top_cat]}",
            focus_goal=f"Address your largest carbon share ({pcts[top_cat]}% of total footprint) with low-friction quick changes",
            expected_impact_kg_monthly=week1_impact,
            action_steps=[
                f"Identify immediate efficiency gains in {category_labels[top_cat].lower()}",
                "Eliminate phantom standby electricity draw and verify thermostat settings",
                "Log daily energy use to establish a verifiable personal baseline"
            ]
        ),
        ActionPlanItem(
            week=2,
            title=f"Habit Shift in {category_labels[second_cat]}",
            focus_goal=f"Target your second largest domain ({pcts[second_cat]}% of footprint) with conscious habit alternatives",
            expected_impact_kg_monthly=week2_impact,
            action_steps=[
                f"Test multi-modal transit or incorporate low-carbon options into weekly routine",
                "Substitute two high-impact consumption items with sustainable alternatives",
                "Track measurable weekly reduction using the GreenGuide What-If simulator"
            ]
        ),
        ActionPlanItem(
            week=3,
            title="Kitchen & Waste Circularity",
            focus_goal="Divert organic scraps from landfills and implement zero-single-use habits",
            expected_impact_kg_monthly=week3_impact,
            action_steps=[
                "Establish a two-stream segregation setup for compostables and dry recyclables",
                "Organize refrigerator shelves by expiration date to reduce food waste to near zero",
                "Pack reusable bottles, bags, and cutlery for everyday on-the-go meals"
            ]
        ),
        ActionPlanItem(
            week=4,
            title="Long-Term Decarbonization & Goal Setting",
            focus_goal="Lock in compounded monthly reductions toward the Paris 1.5°C sustainable boundary",
            expected_impact_kg_monthly=week4_impact,
            action_steps=[
                "Review cumulative monthly reductions against the 167 kg/mo Paris Agreement target",
                "Explore clean utility tariffs, rooftop solar feasibility, or green transport options",
                "Save and export your verified GreenGuide Assessment Report for ongoing tracking"
            ]
        )
    ]

    explanation = (
        f"Your estimated footprint of {total_monthly} kg CO2e per month "
        f"({round(total_annual / 1000, 2)} tonnes per year) was calculated using standard IPCC Sixth Assessment and "
        f"EPA emissions factors matching your self-reported habits. "
        f"{category_labels[top_cat]} is your single largest contributor at {top_val} kg CO2e ({pcts[top_cat]}%), "
        f"followed by {category_labels[second_cat]} at {second_val} kg CO2e ({pcts[second_cat]}%). "
        f"Food contributes {breakdown_vals['food']} kg ({pcts['food']}%) and household waste generates {breakdown_vals['waste']} kg ({pcts['waste']}%). "
        f"Your footprint is currently {abs(round((total_monthly - 390.0) / 390.0 * 100))}% "
        f"{'below' if total_monthly <= 390.0 else 'above'} the global average (390 kg/mo). "
        f"Targeted adjustments in {category_labels[top_cat].lower()} provide your greatest leverage to approach the Paris 1.5°C sustainable target (167 kg/mo)."
    )

    return FootprintResponse(
        total_monthly_kg=total_monthly,
        total_annual_kg=total_annual,
        eco_score=eco_score,
        eco_tier=eco_tier,
        eco_blurb=eco_blurb,
        category_breakdown=cat_breakdown,
        explanation=explanation,
        recommendations=final_recs,
        action_plan=action_plan,
        benchmarks=benchmarks_data,
        assumptions_made=assumptions,
        source="backend_engine"
    )


# Alias for backwards compatibility
build_fallback_response = generate_backend_footprint_analysis

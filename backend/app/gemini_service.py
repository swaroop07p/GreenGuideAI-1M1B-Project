"""
Gemini LLM Service for GreenGuide AI
Uses the official google-genai SDK to generate structured, personalized carbon footprint analysis,
action plans, and eco scoring. Provides seamless deterministic fallback if API key is not configured.
"""

import os
import json
import logging
from typing import Optional, List, Tuple, Dict, Any
from pathlib import Path
from dotenv import load_dotenv

from .models import (
    FootprintRequest, FootprintResponse, RecommendationItem, ActionPlanItem
)
from .emission_factors import (
    EMISSION_FACTORS,
    calculate_deterministic_footprint,
    compute_eco_score_and_tier,
    build_fallback_response
)

_backend_env = Path(__file__).resolve().parent.parent / ".env"
if _backend_env.exists():
    load_dotenv(dotenv_path=_backend_env, override=True)
else:
    load_dotenv(override=True)

logger = logging.getLogger("greenguide.gemini")


def get_candidate_models() -> List[str]:
    """
    Returns an ordered list of viable Gemini models to provide resilience against
    temporary 503 capacity spikes or regional model deprecations.
    """
    preferred = os.getenv("GEMINI_MODEL", "gemini-3.6-flash").strip()
    candidates = [
        preferred,
        "gemini-3.6-flash",
        "gemini-3.5-flash-lite",
        "gemini-3.1-flash-lite",
        "gemini-3-flash-preview",
    ]
    seen = set()
    result = []
    for m in candidates:
        if m and m not in seen:
            seen.add(m)
            result.append(m)
    return result


def resolve_api_key(custom_api_key: Optional[str] = None) -> Tuple[Optional[str], str]:
    """
    Resolves the active API key with strict precedence:
    1. Custom API key from website settings (dominates/overrides backend key)
    2. Default backend API key from environment (.env)
    Returns (api_key, source) where source is 'website_settings', 'backend_env', or 'none'.
    """
    key = (custom_api_key or "").strip()
    if key:
        return key, "website_settings"

    if _backend_env.exists():
        load_dotenv(dotenv_path=_backend_env, override=True)
    else:
        load_dotenv(override=True)
    env_key = os.getenv("GEMINI_API_KEY", "").strip()
    if env_key:
        return env_key, "backend_env"

    return None, "none"


def get_genai_client(custom_api_key: Optional[str] = None):
    """
    Returns a live google-genai Client.
    Precedence:
    1. custom_api_key (from website settings via X-Gemini-API-Key header) - STRICT DOMINANCE
    2. GEMINI_API_KEY from backend environment (.env)
    """
    api_key, source = resolve_api_key(custom_api_key)
    if not api_key:
        return None

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        logger.info(f"Initialized Gemini Client using {source} key (Website settings dominance = {source == 'website_settings'}).")
        return client
    except Exception as e:
        logger.warning(f"Failed to initialize Google GenAI client with {source} key: {e}")
        # Secondary resilience: if website key fails initialization and backend key exists, try backend as safety net
        if source == "website_settings":
            backend_key, b_source = resolve_api_key(None)
            if backend_key:
                try:
                    from google import genai
                    client = genai.Client(api_key=backend_key)
                    logger.info("Fell back to default backend key after custom key initialization failure.")
                    return client
                except Exception as ex:
                    logger.warning(f"Default backend key initialization also failed: {ex}")
        return None


def test_gemini_api_key(custom_api_key: Optional[str] = None) -> Tuple[bool, str, str]:
    """
    Performs a lightweight verification call to test if the specified custom key
    (or default backend key) is active and has valid quota.
    Returns (is_valid, message, source).
    """
    api_key, source = resolve_api_key(custom_api_key)
    if not api_key:
        return False, "No API key found in website settings or backend environment.", "none"

    try:
        from google import genai
        client = genai.Client(api_key=api_key)
        test_model = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
        response = client.models.generate_content(
            model=test_model,
            contents="Say 'OK'",
        )
        if response and response.text:
            return True, f"API key is valid and connected to Gemini ({test_model}).", source
        return True, "API key responded successfully.", source
    except Exception as e:
        err_msg = str(e)
        logger.warning(f"API key test failed ({source}): {err_msg}")
        if "403" in err_msg or "PERMISSION_DENIED" in err_msg:
            clean_msg = "Permission denied. Check that the API key is active and has Gemini API enabled."
        elif "400" in err_msg or "INVALID_ARGUMENT" in err_msg:
            clean_msg = "Invalid API key format. Please ensure you copied the complete key."
        elif "429" in err_msg or "RESOURCE_EXHAUSTED" in err_msg:
            clean_msg = "Rate limit or quota exhausted for this API key."
        else:
            clean_msg = f"Validation failed: {err_msg[:120]}"
        return False, clean_msg, source


def is_gemini_configured() -> bool:
    """Checks if a Gemini API key is present in environment."""
    if _backend_env.exists():
        load_dotenv(dotenv_path=_backend_env, override=True)
    else:
        load_dotenv(override=True)
    return bool(os.getenv("GEMINI_API_KEY", "").strip())


def generate_gemini_footprint_analysis(
    req: FootprintRequest,
    custom_api_key: Optional[str] = None
) -> FootprintResponse:
    """
    Calls Gemini API with strict structured schema to produce personalized analysis,
    or safely falls back to deterministic calculation engine.
    """
    deterministic_vals, initial_assumptions = calculate_deterministic_footprint(req)
    total_det_monthly = sum(deterministic_vals.values())

    client = get_genai_client(custom_api_key)
    if not client:
        logger.info("No Gemini API key detected. Using standard deterministic calculation engine.")
        fallback = build_fallback_response(req)
        fallback.source = "deterministic_engine"
        return fallback

    model_name = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

    # Construct structured prompt
    prompt = f"""
You are the lead sustainability analyst for GreenGuide AI (aligned with UN SDG 13 Climate Action).
Your tone must be encouraging, non-judgmental, inclusive, and scientifically grounded.
Avoid fear-based messaging; emphasize positive agency and actionable steps.

Reference standard emission factor constants and guidelines:
{json.dumps(EMISSION_FACTORS, indent=2)}

User's Self-Reported Lifestyle Inputs:
- Energy: {req.energy.dict() if req.energy else "None provided"}
- Transport: {req.transport.dict() if req.transport else "None provided"}
- Food: {req.food.dict() if req.food else "None provided"}
- Waste: {req.waste.dict() if req.waste else "None provided"}

Standard baseline calculation for this user gives approximately:
- Energy: {deterministic_vals['energy']} kg CO2e/month
- Transport: {deterministic_vals['transport']} kg CO2e/month
- Food: {deterministic_vals['food']} kg CO2e/month
- Waste: {deterministic_vals['waste']} kg CO2e/month
- Total Baseline: {total_det_monthly} kg CO2e/month

Task:
Reason over the provided inputs and standard emission factors to return a strictly compliant JSON response matching this exact structure:
{{
  "total_monthly_kg": <float>,
  "total_annual_kg": <float>,
  "eco_score": <integer between 0 and 100>,
  "eco_tier": "<one of: 'Just Starting Out', 'Making Progress', 'On Track', 'Eco Champion', 'Climate Hero'>",
  "eco_blurb": "<1 encouraging sentence describing their score>",
  "category_breakdown": {{
    "energy": {{
      "category": "energy",
      "label": "Energy & Utilities",
      "kg_co2e_monthly": <float>,
      "percentage": <float>,
      "icon": "Zap",
      "color": "#10B981"
    }},
    "transport": {{
      "category": "transport",
      "label": "Mobility & Transport",
      "kg_co2e_monthly": <float>,
      "percentage": <float>,
      "icon": "Car",
      "color": "#3B82F6"
    }},
    "food": {{
      "category": "food",
      "label": "Food & Nutrition",
      "kg_co2e_monthly": <float>,
      "percentage": <float>,
      "icon": "Utensils",
      "color": "#F59E0B"
    }},
    "waste": {{
      "category": "waste",
      "label": "Waste & Material",
      "kg_co2e_monthly": <float>,
      "percentage": <float>,
      "icon": "Recycle",
      "color": "#8B5CF6"
    }}
  }},
  "explanation": "<2-4 sentences in clear, plain language explaining how this footprint was calculated and where the greatest shares come from>",
  "recommendations": [
    {{
      "id": "rec-1",
      "title": "<Concise action title>",
      "category": "<energy|transport|food|waste>",
      "description": "<Practical, encouraging 1-2 sentence description>",
      "estimated_co2_saved_kg_monthly": <realistic float saved per month>,
      "difficulty": "<Easy|Medium|High Impact>",
      "icon": "<Lucide icon name like Bike, Salad, Zap, Recycle, Thermometer, Sun, Trash2>"
    }}
    // Provide 4 to 6 specific recommendations
  ],
  "action_plan": [
    {{
      "week": 1,
      "title": "<Week 1 theme>",
      "focus_goal": "<Clear 1-sentence focus goal>",
      "expected_impact_kg_monthly": <float>,
      "action_steps": ["<step 1>", "<step 2>", "<step 3>"]
    }},
    {{
      "week": 2,
      "title": "<Week 2 theme>",
      "focus_goal": "<Clear 1-sentence focus goal>",
      "expected_impact_kg_monthly": <float>,
      "action_steps": ["<step 1>", "<step 2>", "<step 3>"]
    }},
    {{
      "week": 3,
      "title": "<Week 3 theme>",
      "focus_goal": "<Clear 1-sentence focus goal>",
      "expected_impact_kg_monthly": <float>,
      "action_steps": ["<step 1>", "<step 2>", "<step 3>"]
    }},
    {{
      "week": 4,
      "title": "<Week 4 theme>",
      "focus_goal": "<Clear 1-sentence focus goal>",
      "expected_impact_kg_monthly": <float>,
      "action_steps": ["<step 1>", "<step 2>", "<step 3>"]
    }}
  ],
  "benchmarks": {{
    "user_footprint_monthly": <float matching total_monthly_kg>,
    "national_average_monthly": 360.0,
    "global_average_monthly": 390.0,
    "sustainable_target_monthly": 167.0,
    "comparison_text": "<1 sentence comparing user's footprint against global/national averages>"
  }},
  "assumptions_made": [
    "<Explicitly list any assumptions made for unselected or missing fields>"
  ],
  "source": "gemini"
}}

CRITICAL REQUIREMENTS:
1. Return ONLY the JSON object. Do not include markdown code block formatting like ```json or ```, and no introductory or concluding prose.
2. The numbers must be mathematically consistent: category percentages sum to 100%, total_annual_kg is 12 * total_monthly_kg.
3. Eco score must range from 0 to 100 based on standard target (~167 kg/month is ~85+).
"""

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
        )

        raw_text = response.text.strip()
        # Clean potential markdown wrapping if returned
        if raw_text.startswith("```json"):
            raw_text = raw_text[7:]
        elif raw_text.startswith("```"):
            raw_text = raw_text[3:]
        if raw_text.endswith("```"):
            raw_text = raw_text[:-3]
        raw_text = raw_text.strip()

        data = json.loads(raw_text)
        data["source"] = "gemini"
        
        # Validate through Pydantic
        validated_response = FootprintResponse(**data)
        return validated_response

    except Exception as e:
        logger.error(f"Gemini API invocation error ({e}); using deterministic calculation engine.")
        fallback = build_fallback_response(req)
        fallback.source = "deterministic_engine"
        return fallback


def generate_gemini_recommendations_and_action_plan(
    req: FootprintRequest,
    breakdown_vals: Dict[str, float],
    total_monthly_kg: float,
    eco_score: int,
    custom_api_key: Optional[str] = None
) -> Tuple[List[RecommendationItem], List[ActionPlanItem], str]:
    """
    Calls Google Gemini LLM with full prompt engineering to dynamically synthesize:
    1. Personalized High-Impact Recommendations
    2. 4-Week Progressive Action Plan
    strictly based on the user's specific self-reported inputs across Energy, Transport, Food, and Waste.
    Provides automated multi-model cascade (gemini-3.6-flash -> gemini-3.5-flash-lite -> etc.)
    and seamless fallback to dynamic input-aware deterministic rules if Gemini is unavailable.
    """
    client = get_genai_client(custom_api_key)
    if not client:
        logger.info("No Gemini API key available; using input-tailored deterministic recommendations.")
        fallback = build_fallback_response(req)
        return fallback.recommendations, fallback.action_plan, "deterministic_engine"

    energy_dict = req.energy.dict() if req.energy else {}
    transport_dict = req.transport.dict() if req.transport else {}
    food_dict = req.food.dict() if req.food else {}
    waste_dict = req.waste.dict() if req.waste else {}

    # Sort categories to highlight highest emission areas
    sorted_cats = sorted(breakdown_vals.items(), key=lambda item: item[1], reverse=True)
    top_cat, top_val = sorted_cats[0]
    second_cat, second_val = sorted_cats[1]

    category_labels = {
        "energy": "Energy & Utilities",
        "transport": "Mobility & Transport",
        "food": "Food & Nutrition",
        "waste": "Waste & Material"
    }

    prompt = f"""
You are the lead climate advisor and behavioral change scientist for GreenGuide AI (aligned with UN SDG 13 Climate Action, SDG 12 Responsible Consumption, and SDG 11 Sustainable Cities).
Your tone must be encouraging, constructive, positive, and scientifically grounded.
CRITICAL: Do NOT give generic advice. You MUST synthesize recommendations and an action plan that explicitly cite and directly address the user's specific inputs and habits below.

User's Self-Reported Lifestyle Choices:
- Energy & Housing:
  • Electricity Consumption: {energy_dict.get('electricity_kwh') or 'Not specified'} kWh/month (Bill: {energy_dict.get('electricity_bill') or 'N/A'})
  • Primary Cooking Fuel: {energy_dict.get('cooking_fuel', 'LPG')}
  • Residence Type: {energy_dict.get('home_type', 'Apartment/Flat')}
  • Household Size: {energy_dict.get('household_size', '3-4')} persons
  • Air Conditioning Usage: {energy_dict.get('ac_usage', 'Moderate (few hrs/day)')}
  • Clean / Renewable Energy: {energy_dict.get('renewable_usage', 'None')}

- Mobility & Commuting:
  • Round-Trip Daily Commute: {transport_dict.get('commute_distance_km') or '16'} km
  • Commuting Frequency: {transport_dict.get('commute_days_per_week', 5)} days per week
  • Primary Commute Mode: {transport_dict.get('primary_mode', 'Petrol/Diesel car')}
  • Vehicle Fuel Efficiency: {transport_dict.get('fuel_efficiency', 'Average')}
  • Long-Distance Travel Frequency: {transport_dict.get('long_distance_freq', 'Rarely (0-1 flights/trips per year)')}
  • Long-Distance Transport Mode: {transport_dict.get('long_distance_mode', 'Domestic flights')}

- Food & Nutrition:
  • Dietary Pattern: {food_dict.get('diet_type', 'Mixed/Flexitarian')}
  • Meat / Seafood Meals: {food_dict.get('non_veg_meals_per_week', 3)} meals per week
  • Sourcing (Local vs Imported): {food_dict.get('local_seasonal_habits', 'Mixed')}
  • Food Waste Tendency: {food_dict.get('food_waste_level', 'Moderate')}
  • Dairy Consumption: {food_dict.get('dairy_consumption', 'Moderate')}

- Waste Management:
  • Trash / Waste Generation: {waste_dict.get('waste_level', 'Medium')}
  • Wet/Dry Waste Segregated: {"Yes" if waste_dict.get('waste_segregated') else "No"}
  • Recycling Frequency: {waste_dict.get('recycling_habits', 'Sometimes recycle')}
  • Composting Organic Waste: {waste_dict.get('composting', 'No')}
  • Single-Use Disposable Plastic: {waste_dict.get('single_use_plastic', 'Moderate')}

User's Evaluated Carbon Footprint:
- Total Footprint: {total_monthly_kg} kg CO2e / month (Annualized: {round(total_monthly_kg * 12 / 1000, 2)} tonnes CO2e)
- Baseline Breakdown:
  • Energy: {breakdown_vals.get('energy', 0)} kg CO2e ({round(breakdown_vals.get('energy', 0) / max(1, total_monthly_kg) * 100, 1)}%)
  • Transport: {breakdown_vals.get('transport', 0)} kg CO2e ({round(breakdown_vals.get('transport', 0) / max(1, total_monthly_kg) * 100, 1)}%)
  • Food: {breakdown_vals.get('food', 0)} kg CO2e ({round(breakdown_vals.get('food', 0) / max(1, total_monthly_kg) * 100, 1)}%)
  • Waste: {breakdown_vals.get('waste', 0)} kg CO2e ({round(breakdown_vals.get('waste', 0) / max(1, total_monthly_kg) * 100, 1)}%)
- Largest Impact Domain: {category_labels.get(top_cat, top_cat)} ({top_val} kg CO2e), followed by {category_labels.get(second_cat, second_cat)} ({second_val} kg CO2e)
- Eco Score: {eco_score}/100

YOUR TASK:
Synthesize two dynamic, customized components directly based on the user's specific answers:

1. "recommendations": Exactly 4 to 6 "Personalized High-Impact Recommendations":
   - Every recommendation MUST be explicitly tailored to the user's stated choices above (e.g. mention their actual primary mode '{transport_dict.get('primary_mode')}', their {transport_dict.get('commute_distance_km', 16)} km distance, their diet '{food_dict.get('diet_type')}', their {food_dict.get('non_veg_meals_per_week', 3)} non-veg meals, their AC usage '{energy_dict.get('ac_usage')}', their composting habit '{waste_dict.get('composting')}', etc.).
   - Prioritize highest impact areas first.
   - For each recommendation, provide:
     - "id": string (e.g., "rec-1", "rec-2", "rec-3", ...)
     - "title": concise, action-oriented title
     - "category": one of "energy", "transport", "food", "waste"
     - "description": 2-3 engaging, encouraging sentences explaining the concrete action and explicitly citing why it matters for their specific profile.
     - "estimated_co2_saved_kg_monthly": realistic float (between 8.0 and 65.0 kg CO2e saved monthly based on IPCC standards).
     - "difficulty": one of "Easy", "Medium", "High Impact"
     - "icon": one of "Bike", "Salad", "Zap", "Recycle", "Thermometer", "Sun", "Trash2", "Utensils", "Car", "Sparkles", "Leaf"

2. "action_plan": Exactly 4 progressive weekly action roadmaps (weeks 1, 2, 3, 4):
   - A step-by-step roadmap tailored to the user's specific habits and carbon drivers.
   - Week 1: Quick wins & low-friction adjustments in their highest emission category ({category_labels.get(top_cat, top_cat)}).
   - Week 2: Moderate habit shifts targeting their second highest domain ({category_labels.get(second_cat, second_cat)}).
   - Week 3: Kitchen circularity, food waste reduction, and domestic waste diversion.
   - Week 4: Habit anchoring, long-term decarbonization choices (clean tariff/EV/solar feasibility), and Paris 1.5°C boundary alignment.
   - For each week, provide:
     - "week": integer 1, 2, 3, or 4
     - "title": motivating, relevant theme title
     - "focus_goal": clear 1-sentence goal specifically referencing their habits
     - "expected_impact_kg_monthly": realistic monthly reduction in kg CO2e (float)
     - "action_steps": array of exactly 3 or 4 practical, tangible checklist actions tailored to their profile

STRICT FORMAT REQUIREMENT:
Return ONLY valid JSON matching this schema with no markdown code fences:
{{
  "recommendations": [
    {{
      "id": "rec-1",
      "title": "...",
      "category": "transport",
      "description": "...",
      "estimated_co2_saved_kg_monthly": 28.5,
      "difficulty": "Easy",
      "icon": "Bike"
    }}
  ],
  "action_plan": [
    {{
      "week": 1,
      "title": "...",
      "focus_goal": "...",
      "expected_impact_kg_monthly": 18.0,
      "action_steps": ["...", "...", "..."]
    }}
  ]
}}
"""

    candidate_models = get_candidate_models()
    for model_name in candidate_models:
        try:
            logger.info(f"Generating personalized recommendations via Gemini ({model_name})...")
            response = client.models.generate_content(
                model=model_name,
                contents=prompt,
            )
            raw_text = (response.text or "").strip()
            if raw_text.startswith("```json"):
                raw_text = raw_text[7:]
            elif raw_text.startswith("```"):
                raw_text = raw_text[3:]
            if raw_text.endswith("```"):
                raw_text = raw_text[:-3]
            raw_text = raw_text.strip()

            data = json.loads(raw_text)
            raw_recs = data.get("recommendations", [])
            raw_plan = data.get("action_plan", [])

            validated_recs = [RecommendationItem(**r) for r in raw_recs]
            validated_plan = [ActionPlanItem(**p) for p in raw_plan]

            if len(validated_recs) >= 3 and len(validated_plan) >= 3:
                logger.info(f"Successfully generated {len(validated_recs)} recs and {len(validated_plan)} week plan with Gemini ({model_name})")
                return validated_recs, validated_plan, "gemini"
        except Exception as e:
            logger.warning(f"Model {model_name} failed ({e}); trying next candidate model...")
            continue

    logger.warning("All Gemini candidate models failed; falling back to dynamic rule-based engine.")
    fallback = build_fallback_response(req)
    return fallback.recommendations, fallback.action_plan, "deterministic_engine"


def ask_sustainability_assistant(chat_req, custom_api_key: Optional[str] = None) -> dict:
    """
    Interactive sustainability advisor and notation clarifier.
    Uses Gemini API to explain complex terms, notations, and what-if scenarios in formatted markdown.
    Eliminates hardcoded answers by routing all inquiries directly to Gemini LLM.
    """
    user_msg = chat_req.message.strip()
    ctx = chat_req.context or {}
    history = chat_req.history or []

    client = get_genai_client(custom_api_key)

    # If no Gemini API key is configured, prompt user clearly rather than serving fake pre-answers
    if not client:
        return {
            "reply": (
                "### 🔑 Gemini API Key Required\n\n"
                "To chat with the live **GreenGuide AI Assistant** and receive real-time, dynamic explanations, "
                "please configure your **Google Gemini API Key**.\n\n"
                "- **Set in UI:** Click the **'✨ Gemini AI'** button in the top navigation bar to save your key securely in your browser.\n"
                "- **Or in Backend:** Set `GEMINI_API_KEY=your_key` in your backend environment.\n"
                "- **Get a free key:** Visit [Google AI Studio](https://aistudio.google.com/app/apikey) to generate a free Gemini key.\n\n"
                "Once configured, all questions are analyzed and answered in real time by Gemini with zero pre-canned answers!"
            ),
            "suggestions": [
                "What is kg CO2e?",
                "How much do I save with an EV?",
                "What is the Paris 1.5°C target?"
            ],
            "source": "api_key_required"
        }

    active_unit = ctx.get('unit', 'kg')
    monthly_str = ctx.get('display_monthly')
    annual_str = ctx.get('display_annual')
    if not monthly_str:
        monthly_val = ctx.get('total_monthly_kg')
        if monthly_val is not None:
            monthly_str = f"{monthly_val} kg CO2e"
            annual_str = f"{round(monthly_val * 12 / 1000, 2)} tonnes CO2e"
        else:
            monthly_str = "Not yet calculated"
            annual_str = "N/A"

    system_instruction = f"""
You are the GreenGuide AI Sustainability Assistant (aligned with UN SDG 13 Climate Action, SDG 12 Responsible Consumption, and SDG 11 Sustainable Cities).
You specialize in explaining carbon accounting notations (e.g. kg CO2e, scopes, grid emissions factors, anaerobic decomposition), climate targets (Paris Agreement 1.5°C threshold), and quantitatively evaluating lifestyle what-if choices.

User's Self-Reported Footprint Context (if available):
- Total Monthly Footprint: {monthly_str} / month
- Total Annual Footprint: {annual_str} / year
- Active Display Unit: {active_unit}
- Eco Score: {ctx.get('eco_score', 'N/A')}/100 ({ctx.get('eco_tier', 'N/A')})
- Categories: {json.dumps(ctx.get('category_breakdown', {}))}

Instructions:
1. Explain scientific terms using clear, non-judgmental, intuitive language and relatable analogies.
2. When referencing the user's footprint, always cite their exact active figures ({monthly_str} / month, {annual_str} / year) so your response matches their dashboard display.
3. If the user asks about What-If scenarios (e.g., getting an EV, installing rooftop solar, diet swaps, composting), provide scientifically realistic quantitative estimates using IPCC/EPA standards.
4. Tone: Encouraging, constructive, empowering (positive agency), scientifically grounded.
4. Formatting:
   - Use clean Markdown with headers, bold key metrics, and bullet lists.
   - Chemical Notations: Do NOT use LaTeX math notations or backslashes. Always write standard clean text like CO2, CO2e, CH4, N2O (or Unicode subscripts CO₂, CH₄, N₂O). Never wrap chemical formulas in dollar signs.
   - Analogies: Format relatable analogies with a clear subheader like '#### The Currency Analogy 💡'.
   - Always conclude the main explanation with a bold '**Key Takeaway:**' section.
   - Keep the explanation focused and concise (under 250 words) so it reads effortlessly on mobile devices.
5. At the very end of your response, provide exactly 2 or 3 relevant follow-up questions in this format:
---
**Suggested Follow-ups:**
- <short question 1>
- <short question 2>
- <short question 3>
"""

    history_text = "\n".join([f"{h.role.upper()}: {h.content}" for h in history[-4:]])
    full_prompt = f"{system_instruction}\n\nConversation History:\n{history_text}\n\nUSER INQUIRY:\n{user_msg}"

    try:
        candidate_models = get_candidate_models()
        for model_name in candidate_models:
            try:
                res = client.models.generate_content(
                    model=model_name,
                    contents=full_prompt,
                )
                raw_text = (res.text or "").strip()

                # Extract suggested follow-ups if present
                suggestions = []
                reply_text = raw_text

                delim_candidates = [
                    "**Suggested Follow-ups:**",
                    "**Suggested Follow-up Questions:**",
                    "**Suggested Questions:**",
                    "Suggested Follow-ups:",
                    "Suggested Questions:"
                ]
                
                for delim in delim_candidates:
                    if delim in raw_text:
                        parts = raw_text.split(delim, 1)
                        reply_text = parts[0].strip()
                        if reply_text.endswith("---"):
                            reply_text = reply_text[:-3].strip()
                        
                        lines = parts[1].strip().split("\n")
                        for line in lines:
                            cleaned = line.strip().lstrip("-*•0123456789.) ").strip()
                            if cleaned and len(cleaned) > 4:
                                suggestions.append(cleaned)
                        break

                if not suggestions:
                    suggestions = [
                        "What is the Paris 1.5°C target?",
                        "How much do I save with an EV?",
                        "Why does food waste create methane?"
                    ]

                return {
                    "reply": reply_text,
                    "suggestions": suggestions[:3],
                    "source": "gemini"
                }
            except Exception as e:
                logger.warning(f"Chat with {model_name} failed ({e}); trying fallback model...")
                continue

        return {
            "reply": (
                "### ⚠️ Service Notice\n\n"
                "The live Gemini assistant is momentarily experiencing high demand. "
                "Please try again in a few moments or adjust your questions."
            ),
            "suggestions": [
                "What is kg CO2e?",
                "How do I reduce my highest emission category?"
            ],
            "source": "error"
        }

    except Exception as e:
        logger.error(f"Gemini API chat error: {e}")
        return {
            "reply": (
                f"### ⚠️ Gemini API Notice\n\n"
                f"Could not complete live AI generation: **{str(e)}**.\n\n"
                f"Please verify that your Gemini API Key is valid and has active quota in the top navigation settings."
            ),
            "suggestions": [
                "What is kg CO2e?",
                "How do I verify my Gemini API Key?"
            ],
            "source": "error"
        }


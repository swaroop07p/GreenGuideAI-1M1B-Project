"""
FastAPI Backend Application for GreenGuide AI
Personal Sustainability & Carbon Footprint Advisor
"""

import time
import os
from typing import Dict, Any
from fastapi import FastAPI, Request, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .models import (
    FootprintRequest, FootprintResponse, WhatIfRequest, Benchmarks,
    CategoryBreakdown, CategoryBreakdownItem,
    ChatRequest, ChatResponse
)
from .emission_factors import (
    EMISSION_FACTORS,
    calculate_deterministic_footprint,
    compute_eco_score_and_tier,
    build_fallback_response,
    generate_backend_footprint_analysis
)
from .gemini_service import (
    generate_gemini_footprint_analysis,
    generate_gemini_recommendations_and_action_plan,
    ask_sustainability_assistant,
    is_gemini_configured,
    test_gemini_api_key
)
from .rate_limiter import calculation_rate_limiter

app = FastAPI(
    title="GreenGuide AI API",
    description="Personal Sustainability & Carbon Footprint Advisor API (SDG 13, 12, 11)",
    version="2.0.0"
)

# Configure CORS dynamically for production (Render) and local dev
cors_origins_env = os.getenv("ALLOWED_ORIGINS", "*").strip()
if cors_origins_env and cors_origins_env != "*":
    allowed_origins = [origin.strip() for origin in cors_origins_env.split(",") if origin.strip()]
    allow_credentials = True
else:
    allowed_origins = ["*"]
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=allow_credentials,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["System"])
@app.get("/health", tags=["System"])
@app.get("/api/health", tags=["System"])
def health_check():
    """Basic health check and service readiness status."""
    return {
        "status": "healthy",
        "service": "GreenGuide AI Backend",
        "version": "2.0.0",
        "timestamp": time.time(),
        "sdg_alignment": ["SDG 13 - Climate Action", "SDG 12 - Responsible Consumption", "SDG 11 - Sustainable Cities"],
        "docs": "/docs"
    }


@app.get("/api/emission-factors", tags=["Transparency"])
def get_emission_factors():
    """
    Returns the live reference table of emission factors and benchmark constants
    powering the application methodology and transparency panel.
    """
    return {
        "metadata": {
            "title": "GreenGuide AI Standard Emission Reference Factors",
            "citation": EMISSION_FACTORS["sources"],
            "version": EMISSION_FACTORS["version"],
            "note": "Standardized representative factors for educational and awareness calculation."
        },
        "factors": EMISSION_FACTORS
    }


@app.get("/api/gemini-status", tags=["System"])
def gemini_status(request: Request):
    """
    Returns whether a Gemini API key is configured in website settings (header)
    or backend environment, clearly reporting active source with website precedence.
    """
    header_key = request.headers.get("x-gemini-api-key", "").strip()
    has_header = bool(header_key)
    has_backend = is_gemini_configured()

    # Precedence: Website settings header strictly dominates over backend .env
    if has_header:
        active_source = "website_settings"
    elif has_backend:
        active_source = "backend_env"
    else:
        active_source = "none"

    return {
        "configured": has_header or has_backend,
        "source": active_source,
        "has_custom_key": has_header,
        "has_backend_key": has_backend,
        "model": os.getenv("GEMINI_MODEL", "gemini-3.6-flash")
    }


@app.post("/api/validate-key", tags=["System"])
def validate_key(request: Request, payload: Dict[str, Any] = None):
    """
    Tests and validates a Gemini API key with a fast verification call to verify permissions and quota.
    Precedence: payload/header key tested first; if omitted, validates default backend key.
    """
    payload = payload or {}
    key_to_test = payload.get("api_key", "").strip() if isinstance(payload, dict) else ""
    if not key_to_test:
        key_to_test = request.headers.get("x-gemini-api-key", "").strip() or None

    is_valid, message, source = test_gemini_api_key(key_to_test)
    return {
        "valid": is_valid,
        "message": message,
        "source": source
    }


@app.post("/api/calculate-footprint", response_model=FootprintResponse, tags=["Footprint"])
def calculate_footprint(
    req: FootprintRequest,
    request: Request,
):
    """
    Calculate carbon footprint using the comprehensive backend calculation engine (IPCC & EPA standards),
    while generating personalized High-Impact Recommendations and a 4-Week Progressive Action Plan
    dynamically synthesized by Google Gemini LLM based on the user's specific inputs.
    """
    calculation_rate_limiter.check(request)
    custom_key = request.headers.get("x-gemini-api-key", "").strip() or None

    # 1. Deterministic baseline emissions calculation per IPCC & EPA standards
    breakdown_vals, initial_assumptions = calculate_deterministic_footprint(req)
    total_monthly = round(sum(breakdown_vals.values()), 1)
    total_annual = round(total_monthly * 12.0, 1)

    eco_score, eco_tier, eco_blurb = compute_eco_score_and_tier(total_monthly)

    # 2. Benchmarks comparison
    benchmarks_cfg = EMISSION_FACTORS["benchmarks"]
    user_kg = total_monthly
    global_avg = benchmarks_cfg["global_average_monthly_kg"]
    national_avg = benchmarks_cfg["national_average_monthly_kg"]
    target = benchmarks_cfg["sustainable_target_monthly_kg"]
    diff_pct = round(((user_kg - global_avg) / global_avg) * 100.0, 1)
    benchmarks_data = Benchmarks(
        user_footprint_monthly=user_kg,
        national_average_monthly=national_avg,
        global_average_monthly=global_avg,
        sustainable_target_monthly=target,
        comparison_text=(
            f"Your footprint ({user_kg} kg/mo) is {abs(diff_pct)}% "
            f"{'below' if diff_pct <= 0 else 'above'} the global average ({global_avg} kg/mo)."
        )
    )

    # 3. Category breakdown
    pcts = {}
    for cat, val in breakdown_vals.items():
        pcts[cat] = round((val / max(1.0, total_monthly)) * 100.0, 1)
    cat_breakdown = CategoryBreakdown(
        energy=CategoryBreakdownItem(
            category="energy", label="Energy & Utilities",
            kg_co2e_monthly=breakdown_vals["energy"], percentage=pcts["energy"],
            icon="Zap", color="#10B981"
        ),
        transport=CategoryBreakdownItem(
            category="transport", label="Mobility & Transport",
            kg_co2e_monthly=breakdown_vals["transport"], percentage=pcts["transport"],
            icon="Car", color="#3B82F6"
        ),
        food=CategoryBreakdownItem(
            category="food", label="Food & Nutrition",
            kg_co2e_monthly=breakdown_vals["food"], percentage=pcts["food"],
            icon="Utensils", color="#F59E0B"
        ),
        waste=CategoryBreakdownItem(
            category="waste", label="Waste & Material",
            kg_co2e_monthly=breakdown_vals["waste"], percentage=pcts["waste"],
            icon="Recycle", color="#8B5CF6"
        )
    )

    # 4. Generate Personalized Recommendations & 4-Week Action Plan via Gemini LLM
    recommendations, action_plan, source = generate_gemini_recommendations_and_action_plan(
        req=req,
        breakdown_vals=breakdown_vals,
        total_monthly_kg=total_monthly,
        eco_score=eco_score,
        custom_api_key=custom_key
    )

    # 5. Dynamic explanation narrative
    sorted_cats = sorted(breakdown_vals.items(), key=lambda item: item[1], reverse=True)
    top_cat, top_val = sorted_cats[0]
    second_cat, second_val = sorted_cats[1]
    category_labels = {
        "energy": "Energy & Utilities",
        "transport": "Mobility & Transport",
        "food": "Food & Nutrition",
        "waste": "Waste & Material"
    }

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
        recommendations=recommendations,
        action_plan=action_plan,
        benchmarks=benchmarks_data,
        assumptions_made=initial_assumptions,
        source=source
    )


@app.post("/api/whatif-recalculate", tags=["Simulator"])
def whatif_recalculate(whatif: WhatIfRequest):
    """
    Instant formula-based recalculation using the static emission factors when user
    adjusts What-If simulator sliders/toggles without needing a new LLM call.
    """
    # 1. Base footprint
    base_breakdown, _ = calculate_deterministic_footprint(whatif.base_request)
    base_total = round(sum(base_breakdown.values()), 1)

    # 2. Apply modifications to cloned request
    req_dict = whatif.base_request.dict()
    for field_path, new_value in whatif.modifications.items():
        parts = field_path.split(".")
        if len(parts) == 2 and parts[0] in req_dict and req_dict[parts[0]] is not None:
            req_dict[parts[0]][parts[1]] = new_value

    modified_req = FootprintRequest(**req_dict)
    simulated_breakdown, _ = calculate_deterministic_footprint(modified_req)
    simulated_total = round(sum(simulated_breakdown.values()), 1)
    
    saved_kg = round(max(0.0, base_total - simulated_total), 1)
    reduction_pct = round((saved_kg / max(1.0, base_total)) * 100.0, 1)

    sim_eco_score, sim_tier, sim_blurb = compute_eco_score_and_tier(simulated_total)

    return {
        "base_monthly_kg": base_total,
        "simulated_monthly_kg": simulated_total,
        "saved_monthly_kg": saved_kg,
        "reduction_percentage": reduction_pct,
        "simulated_eco_score": sim_eco_score,
        "simulated_tier": sim_tier,
        "simulated_breakdown": simulated_breakdown
    }


@app.post("/api/compare-benchmarks", tags=["Benchmarks"])
def compare_benchmarks(payload: Dict[str, float]):
    """
    Given a monthly footprint in kg CO2e, returns comparative benchmark statistics
    against global, national, and sustainable Paris targets.
    """
    user_kg = payload.get("monthly_kg", 250.0)
    benchmarks_cfg = EMISSION_FACTORS["benchmarks"]
    
    global_avg = benchmarks_cfg["global_average_monthly_kg"]
    national_avg = benchmarks_cfg["national_average_monthly_kg"]
    target = benchmarks_cfg["sustainable_target_monthly_kg"]

    global_diff_pct = round(((user_kg - global_avg) / global_avg) * 100.0, 1)
    national_diff_pct = round(((user_kg - national_avg) / national_avg) * 100.0, 1)

    return {
        "user_monthly_kg": user_kg,
        "global_average_monthly_kg": global_avg,
        "national_average_monthly_kg": national_avg,
        "sustainable_target_monthly_kg": target,
        "vs_global_percentage": global_diff_pct,
        "vs_national_percentage": national_diff_pct,
        "status": "below_average" if user_kg <= global_avg else "above_average"
    }


@app.post("/api/generate-share-card", tags=["Social"])
def generate_share_card_data(payload: Dict[str, Any]):
    """
    Formats public-safe results data for client-side HTML5 canvas rendering.
    Contains no private or demographic data.
    """
    total_kg = payload.get("total_monthly_kg", 250.0)
    score = payload.get("eco_score", 70)
    tier = payload.get("eco_tier", "On Track")
    top_tip = payload.get("top_tip", "Switching 2 commutes per week to transit saves 40+ kg CO2e/month.")
    
    return {
        "title": "My GreenGuide AI Impact Card",
        "monthly_footprint_kg": total_kg,
        "eco_score": score,
        "eco_tier": tier,
        "headline_tip": top_tip,
        "sdg_badge": "SDG 13 Climate Action",
        "app_url": "https://greenguide.ai",
        "watermark": "Calculated with GreenGuide AI • Private & Anonymous"
    }


@app.post("/api/chat", response_model=ChatResponse, tags=["Assistant"])
def chat_with_assistant(req: ChatRequest, request: Request):
    """
    Sustainability & Notation Clarification Assistant powered by Gemini LLM.
    Answers queries regarding complex metrics (kg CO2e, scopes, grid factors)
    and evaluates specific lifestyle what-if choices.
    """
    calculation_rate_limiter.check(request)
    custom_key = request.headers.get("x-gemini-api-key")
    result = ask_sustainability_assistant(req, custom_api_key=custom_key)
    return ChatResponse(**result)

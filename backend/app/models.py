from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict

# --- Input Models ---

class EnergyInput(BaseModel):
    electricity_kwh: Optional[float] = Field(None, description="Monthly electricity usage in kWh")
    electricity_bill: Optional[float] = Field(None, description="Monthly electricity bill amount if kWh unknown")
    cooking_fuel: Optional[str] = Field("LPG", description="Primary cooking fuel type")
    home_type: Optional[str] = Field("Apartment/Flat", description="Type of residence")
    household_size: Optional[str] = Field("3-4", description="Number of residents in household")
    ac_usage: Optional[str] = Field("Moderate (few hrs/day)", description="Air conditioning usage pattern")
    renewable_usage: Optional[str] = Field("None", description="Renewable/solar energy adoption level")

class TransportInput(BaseModel):
    commute_distance_km: Optional[float] = Field(None, description="Daily round-trip commute distance in km")
    commute_days_per_week: Optional[int] = Field(5, description="Days per week commuting")
    primary_mode: Optional[str] = Field("Petrol/Diesel car", description="Primary mode of transportation")
    long_distance_freq: Optional[str] = Field("Rarely (0-1 flights/trips per year)", description="Frequency of long distance trips")
    long_distance_mode: Optional[str] = Field("Domestic flights", description="Primary mode for long distance journeys")
    fuel_efficiency: Optional[str] = Field("Average", description="Vehicle fuel efficiency rating")

class FoodInput(BaseModel):
    diet_type: Optional[str] = Field("Mixed/Flexitarian", description="Primary dietary pattern")
    non_veg_meals_per_week: Optional[int] = Field(3, description="Number of meat/fish meals per week")
    local_seasonal_habits: Optional[str] = Field("Mixed", description="Preference for local & seasonal produce")
    food_waste_level: Optional[str] = Field("Moderate", description="Frequency of food thrown away")
    dairy_consumption: Optional[str] = Field("Moderate", description="Level of milk/cheese/dairy consumption")

class WasteInput(BaseModel):
    waste_level: Optional[str] = Field("Medium", description="Weekly trash generation level")
    waste_segregated: Optional[bool] = Field(False, description="Whether dry and wet waste are segregated")
    recycling_habits: Optional[str] = Field("Sometimes recycle", description="Frequency of recycling recyclables")
    composting: Optional[str] = Field("No", description="Organic/food composting habits")
    single_use_plastic: Optional[str] = Field("Moderate", description="Use of disposable plastics")

class FootprintRequest(BaseModel):
    energy: Optional[EnergyInput] = Field(default_factory=EnergyInput)
    transport: Optional[TransportInput] = Field(default_factory=TransportInput)
    food: Optional[FoodInput] = Field(default_factory=FoodInput)
    waste: Optional[WasteInput] = Field(default_factory=WasteInput)

class WhatIfRequest(BaseModel):
    base_request: FootprintRequest
    modifications: Dict[str, Any] = Field(
        default_factory=dict,
        description="Modified fields to simulate, e.g. {'transport.primary_mode': 'Bicycle', 'food.diet_type': 'Vegetarian'}"
    )

# --- Output Models ---

class CategoryBreakdownItem(BaseModel):
    category: str
    label: str
    kg_co2e_monthly: float
    percentage: float
    icon: str
    color: str

class CategoryBreakdown(BaseModel):
    energy: CategoryBreakdownItem
    transport: CategoryBreakdownItem
    food: CategoryBreakdownItem
    waste: CategoryBreakdownItem

class RecommendationItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    title: str
    category: str
    description: str
    estimated_co2_saved_kg_monthly: float
    difficulty: str  # "Easy", "Medium", "High Impact"
    icon: str

class ActionPlanItem(BaseModel):
    model_config = ConfigDict(extra="ignore")
    week: int
    title: str
    focus_goal: str
    expected_impact_kg_monthly: float
    action_steps: List[str]

class Benchmarks(BaseModel):
    user_footprint_monthly: float
    national_average_monthly: float
    global_average_monthly: float
    sustainable_target_monthly: float
    comparison_text: str

class FootprintResponse(BaseModel):
    total_monthly_kg: float
    total_annual_kg: float
    eco_score: int
    eco_tier: str  # e.g., "Just Starting Out", "Making Progress", "On Track", "Eco Champion", "Climate Hero"
    eco_blurb: str
    category_breakdown: CategoryBreakdown
    explanation: str
    recommendations: List[RecommendationItem]
    action_plan: List[ActionPlanItem]
    benchmarks: Benchmarks
    assumptions_made: List[str]
    source: str = "gemini"  # "gemini" or "deterministic_fallback"

# --- Chat Assistant Models ---

class ChatMessage(BaseModel):
    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Text content of the message")

class ChatRequest(BaseModel):
    message: str = Field(..., description="User question or clarification query")
    context: Optional[Dict[str, Any]] = Field(
        default=None,
        description="Current footprint results context (total, categories, eco score)"
    )
    history: Optional[List[ChatMessage]] = Field(
        default_factory=list,
        description="Previous turns in the conversation"
    )

class ChatResponse(BaseModel):
    reply: str = Field(..., description="Formatted markdown explanation/answer")
    suggestions: List[str] = Field(
        default_factory=list,
        description="Suggested follow-up questions"
    )
    source: str = "gemini"

from fastapi import APIRouter, HTTPException
from typing import Any
from app.services.normalizer import normalize_workout_input
from app.services.ai_coach import analyze_workout

router = APIRouter()


@router.post("/analyze")
def analyze(workout_input: Any):
    """
    Accepts workout details in any format — natural language, JSON, partial data, etc.
    Normalizes the input first, then runs AI coaching analysis.
    """
    try:
        normalized = normalize_workout_input(workout_input)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse workout input: {str(e)}")

    try:
        analysis = analyze_workout(normalized)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

    return {
        "normalized_input": normalized.model_dump(),
        "analysis": analysis
    }

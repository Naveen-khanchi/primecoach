from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Any, Optional
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserProfile
from app.services.normalizer import normalize_workout_input
from app.services.ai_coach import analyze_workout
from app.services.session_service import save_session

router = APIRouter()


@router.post("/analyze")
def analyze(
    workout_input: Any,
    user_id: Optional[int] = Query(None, description="User ID to personalize the analysis"),
    db: Session = Depends(get_db)
):
    profile = None
    user_name = None
    if user_id:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User with id {user_id} not found")
        user_name = user.name
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    try:
        normalized = normalize_workout_input(workout_input)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not parse workout input: {str(e)}")

    try:
        analysis = analyze_workout(normalized, profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

    session_id = None
    if user_id:
        try:
            saved = save_session(user_id, normalized, analysis, db)
            session_id = saved.id
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to save session: {str(e)}")

    return {
        "user": user_name,
        "session_id": session_id,
        "normalized_input": normalized.model_dump(),
        "analysis": analysis
    }

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserProfile
from app.services.normalizer import normalize_workout_input
from app.services.ai_coach import analyze_workout
from app.services.session_service import save_session
from app.auth import get_current_user_optional

router = APIRouter()


class WorkoutAnalyzeRequest(BaseModel):
    workout_input: str


@router.post("/analyze")
def analyze(
    body: WorkoutAnalyzeRequest,
    user_id: Optional[int] = Query(None, description="User ID to personalize the analysis"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional),
):
    profile = None
    user_name = None
    if user_id:
        if current_user is None or user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to access this user's data")
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail=f"User with id {user_id} not found")
        user_name = user.name
        profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    try:
        normalized = normalize_workout_input(body.workout_input)
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

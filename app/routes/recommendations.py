from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserProfile
from app.services.recommendation_service import get_next_session_context, get_weekly_plan_context
from app.services.recommendation_engine import recommend_next_session, recommend_weekly_plan

router = APIRouter()


def _get_profile_or_404(user_id: int, db: Session) -> UserProfile:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")
    return profile


@router.get("/{user_id}/next-session")
def next_session(user_id: int, db: Session = Depends(get_db)):
    """Recommend the next workout session based on recent training history."""
    profile = _get_profile_or_404(user_id, db)
    context = get_next_session_context(user_id, db)
    return recommend_next_session(profile, context)


@router.get("/{user_id}/weekly-plan")
def weekly_plan(user_id: int, db: Session = Depends(get_db)):
    """Generate a full week training plan based on user profile and recent history."""
    profile = _get_profile_or_404(user_id, db)
    context = get_weekly_plan_context(user_id, db)
    return recommend_weekly_plan(profile, context)

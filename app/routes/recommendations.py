from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.services.recommendation_service import get_next_session_context, get_weekly_plan_context
from app.services.recommendation_engine import recommend_next_session, recommend_weekly_plan

router = APIRouter()


def _get_user_or_404(user_id: int, db: Session) -> User:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/{user_id}/next-session")
def next_session(user_id: int, db: Session = Depends(get_db)):
    """Recommend the next workout session based on recent training history."""
    user = _get_user_or_404(user_id, db)
    context = get_next_session_context(user_id, db)
    return recommend_next_session(user, context)


@router.get("/{user_id}/weekly-plan")
def weekly_plan(user_id: int, db: Session = Depends(get_db)):
    """Generate a full week training plan based on user profile and recent history."""
    user = _get_user_or_404(user_id, db)
    context = get_weekly_plan_context(user_id, db)
    return recommend_weekly_plan(user, context)

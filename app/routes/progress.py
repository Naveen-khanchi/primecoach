from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User, UserProfile
from app.services.progress_service import get_strength_progression, get_volume_trends, get_consistency
from app.services.progress_analyzer import analyze_progress

router = APIRouter()


def _get_profile_or_404(user_id: int, db: Session) -> UserProfile:
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="User profile not found")
    return profile


@router.get("/{user_id}")
def get_progress(user_id: int, db: Session = Depends(get_db)):
    """Full progress report — raw metrics + AI insights."""
    profile = _get_profile_or_404(user_id, db)

    strength = get_strength_progression(user_id, db)
    volume = get_volume_trends(user_id, db)
    consistency = get_consistency(user_id, db)

    # Raw metrics above are pure DB queries — always return them even if the
    # AI call below fails, so an AI outage never takes down the whole report.
    # Broad except is intentional: AI insights are optional here, and Groq can
    # fail in ways progress_analyzer.py doesn't explicitly catch (e.g. a
    # decommissioned model raising a raw BadRequestError).
    try:
        ai_insights = analyze_progress(profile, strength, volume, consistency)
    except Exception:
        ai_insights = None

    return {
        "period": f"all time ({consistency['total_sessions']} sessions)",
        "consistency": {
            "total_sessions": consistency["total_sessions"],
            "sessions_per_week_avg": consistency["sessions_per_week_avg"],
            "weeks_tracked": consistency.get("weeks_tracked"),
            "target_days_per_week": profile.days_available,
            "gap_periods": consistency["gap_periods"],
            "score_trend": consistency["score_trend"],
        },
        "muscle_frequency": consistency["muscle_frequency"],
        "volume_trends": {
            "weekly_volume": volume["weekly_volume"],
            "overtrained": volume["overtrained"],
            "neglected": volume["neglected"],
        },
        "strength_progression": strength,
        "ai_insights": ai_insights,
    }


@router.get("/{user_id}/strength")
def get_strength(user_id: int, db: Session = Depends(get_db)):
    """Per-lift progression chart data with trend detection."""
    _get_profile_or_404(user_id, db)
    return get_strength_progression(user_id, db)


@router.get("/{user_id}/volume")
def get_volume(user_id: int, db: Session = Depends(get_db)):
    """Weekly volume trends per muscle group."""
    _get_profile_or_404(user_id, db)
    return get_volume_trends(user_id, db)


@router.get("/{user_id}/consistency")
def get_consistency_report(user_id: int, db: Session = Depends(get_db)):
    """Training frequency, gap periods, muscle frequency, and score trend."""
    _get_profile_or_404(user_id, db)
    return get_consistency(user_id, db)

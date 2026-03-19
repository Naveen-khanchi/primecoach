import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.models.session import WorkoutSession, SessionExercise

router = APIRouter()


@router.get("/{user_id}")
def get_sessions(user_id: int, db: Session = Depends(get_db)):
    """List all sessions for a user — summary only, no full AI analysis."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    sessions = (
        db.query(WorkoutSession)
        .filter(WorkoutSession.user_id == user_id)
        .order_by(WorkoutSession.created_at.desc())
        .all()
    )

    return [
        {
            "id": s.id,
            "created_at": s.created_at,
            "workout_type": s.workout_type,
            "duration_minutes": s.duration_minutes,
            "total_volume_kg": s.total_volume_kg,
            "total_sets": s.total_sets,
            "exercise_count": len(s.exercises),
            "scores": {
                "overall": s.overall_score,
                "intensity": s.intensity_score,
                "volume": s.volume_score,
                "exercise_selection": s.exercise_selection_score,
                "muscle_balance": s.muscle_balance_score,
            },
        }
        for s in sessions
    ]


@router.get("/{user_id}/{session_id}")
def get_session(user_id: int, session_id: int, db: Session = Depends(get_db)):
    """Get a single session with full exercise list and stored AI analysis."""
    session = (
        db.query(WorkoutSession)
        .filter(WorkoutSession.id == session_id, WorkoutSession.user_id == user_id)
        .first()
    )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    exercises = (
        db.query(SessionExercise)
        .filter(SessionExercise.session_id == session_id)
        .order_by(SessionExercise.order_in_session)
        .all()
    )

    return {
        "id": session.id,
        "created_at": session.created_at,
        "workout_type": session.workout_type,
        "duration_minutes": session.duration_minutes,
        "notes": session.notes,
        "total_volume_kg": session.total_volume_kg,
        "total_sets": session.total_sets,
        "scores": {
            "overall": session.overall_score,
            "intensity": session.intensity_score,
            "volume": session.volume_score,
            "exercise_selection": session.exercise_selection_score,
            "muscle_balance": session.muscle_balance_score,
        },
        "exercises": [
            {
                "order": ex.order_in_session,
                "name": ex.name,
                "primary_muscle": ex.primary_muscle,
                "movement_pattern": ex.movement_pattern,
                "superset_group": ex.superset_group,
                "sets": ex.sets,
                "reps": ex.reps_int,
                "weight_kg": ex.weight_kg,
                "volume_kg": ex.volume_kg,
                "notes": ex.notes,
            }
            for ex in exercises
        ],
        "ai_analysis": json.loads(session.ai_analysis) if session.ai_analysis else None,
    }

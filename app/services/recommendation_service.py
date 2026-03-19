from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.session import WorkoutSession, SessionExercise
from app.services.progress_service import get_strength_progression


def get_next_session_context(user_id: int, db: Session) -> dict:
    """
    Gather context needed to recommend the next session:
    - Last session details
    - Muscles trained in the last 7 days
    - Strength progression trends
    """
    # Last session
    last_session = (
        db.query(WorkoutSession)
        .filter(WorkoutSession.user_id == user_id)
        .order_by(WorkoutSession.created_at.desc())
        .first()
    )

    last_session_data = None
    if last_session:
        exercises = (
            db.query(SessionExercise)
            .filter(SessionExercise.session_id == last_session.id)
            .order_by(SessionExercise.order_in_session)
            .all()
        )
        last_session_data = {
            "date": last_session.created_at.date().isoformat(),
            "workout_type": last_session.workout_type,
            "overall_score": last_session.overall_score,
            "total_volume_kg": last_session.total_volume_kg,
            "exercises": [
                {
                    "name": ex.name,
                    "primary_muscle": ex.primary_muscle,
                    "sets": ex.sets,
                    "reps_int": ex.reps_int,
                    "weight_kg": ex.weight_kg,
                }
                for ex in exercises
            ],
        }

    # Muscles trained in the last 7 days
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    recent_rows = (
        db.query(
            SessionExercise.primary_muscle,
            func.count(func.distinct(SessionExercise.session_id)).label("count"),
        )
        .join(WorkoutSession, SessionExercise.session_id == WorkoutSession.id)
        .filter(WorkoutSession.user_id == user_id)
        .filter(WorkoutSession.created_at >= cutoff)
        .filter(SessionExercise.primary_muscle.isnot(None))
        .group_by(SessionExercise.primary_muscle)
        .all()
    )
    recent_muscles = {row.primary_muscle: row.count for row in recent_rows}

    # Strength progression for weight targets
    strength = get_strength_progression(user_id, db)

    return {
        "last_session": last_session_data,
        "recent_muscles": recent_muscles,
        "strength_progression": strength,
    }


def get_weekly_plan_context(user_id: int, db: Session) -> dict:
    """
    Gather context needed to generate a weekly plan:
    - Muscle frequency over the last 2 weeks
    - Last 3 sessions (to understand recent training split)
    - Strength baselines from progression data
    """
    # Muscle frequency last 2 weeks
    cutoff = datetime.now(timezone.utc) - timedelta(days=14)
    muscle_rows = (
        db.query(
            SessionExercise.primary_muscle,
            func.count(func.distinct(SessionExercise.session_id)).label("count"),
        )
        .join(WorkoutSession, SessionExercise.session_id == WorkoutSession.id)
        .filter(WorkoutSession.user_id == user_id)
        .filter(WorkoutSession.created_at >= cutoff)
        .filter(SessionExercise.primary_muscle.isnot(None))
        .group_by(SessionExercise.primary_muscle)
        .order_by(func.count(func.distinct(SessionExercise.session_id)).desc())
        .all()
    )
    recent_muscle_frequency = {row.primary_muscle: row.count for row in muscle_rows}

    # Last 3 sessions summary
    recent_sessions = (
        db.query(WorkoutSession)
        .filter(WorkoutSession.user_id == user_id)
        .order_by(WorkoutSession.created_at.desc())
        .limit(3)
        .all()
    )
    recent_sessions_data = [
        {
            "date": s.created_at.date().isoformat(),
            "workout_type": s.workout_type,
            "overall_score": s.overall_score,
        }
        for s in recent_sessions
    ]

    # Strength baselines from progression
    strength = get_strength_progression(user_id, db)
    strength_baselines = {
        lift: data["history"][-1]["weight_kg"]
        for lift, data in strength.items()
        if data["history"]
    }

    return {
        "recent_muscle_frequency": recent_muscle_frequency,
        "recent_sessions": recent_sessions_data,
        "strength_baselines": strength_baselines,
    }

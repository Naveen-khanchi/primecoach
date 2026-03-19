import re
import json
from sqlalchemy.orm import Session
from app.models.exercise import Exercise
from app.models.session import WorkoutSession, SessionExercise
from app.schemas.session_schema import NormalizedWorkout


def _parse_reps_int(reps: str | None) -> int | None:
    """Parse reps string to integer. For ranges like '8-12', returns lower bound (8)."""
    if reps is None:
        return None
    try:
        return int(reps)
    except ValueError:
        pass
    match = re.match(r"^(\d+)", reps.strip())
    if match:
        return int(match.group(1))
    return None  # "to failure", "AMRAP", etc.


def _upsert_exercise(
    name: str,
    primary_muscle: str | None,
    movement_pattern: str | None,
    db: Session
) -> Exercise | None:
    """Look up exercise by name (case-insensitive). Insert if not found."""
    if not name:
        return None

    canonical = name.strip().title()
    exercise = db.query(Exercise).filter(Exercise.name.ilike(canonical)).first()

    if not exercise:
        exercise = Exercise(
            name=canonical,
            primary_muscle=primary_muscle or "unknown",
            movement_pattern=movement_pattern,
        )
        db.add(exercise)
        db.flush()  # get ID without committing

    return exercise


def save_session(user_id: int, workout: NormalizedWorkout, analysis: dict, db: Session) -> WorkoutSession:
    """Save a completed workout session and its exercises to the database."""
    score = analysis.get("score_breakdown", {})

    # Compute session-level aggregates
    total_volume = 0.0
    total_sets = 0
    for ex in workout.exercises:
        reps_int = _parse_reps_int(ex.reps)
        if ex.sets and reps_int and ex.weight_kg:
            total_volume += ex.sets * reps_int * ex.weight_kg
        if ex.sets:
            total_sets += ex.sets

    # Fall back to AI-reported volume if we couldn't compute it (missing weight data)
    computed_volume = round(total_volume, 2) if total_volume > 0 else None
    ai_volume = analysis.get("strength_volume_insights", {}).get("total_volume_kg")

    session = WorkoutSession(
        user_id=user_id,
        workout_type=workout.workout_type,
        duration_minutes=workout.duration_minutes,
        notes=workout.notes,
        total_volume_kg=computed_volume or ai_volume,
        total_sets=total_sets or None,
        overall_score=score.get("overall"),
        intensity_score=score.get("intensity"),
        volume_score=score.get("volume"),
        exercise_selection_score=score.get("exercise_selection"),
        muscle_balance_score=score.get("muscle_balance"),
        ai_analysis=json.dumps(analysis),
    )
    db.add(session)
    db.flush()  # get session.id before inserting exercises

    for i, ex in enumerate(workout.exercises, 1):
        exercise_record = _upsert_exercise(ex.name, ex.primary_muscle, ex.movement_pattern, db)
        reps_int = _parse_reps_int(ex.reps)

        volume_kg = None
        if ex.sets and reps_int and ex.weight_kg:
            volume_kg = round(ex.sets * reps_int * ex.weight_kg, 2)

        session_ex = SessionExercise(
            session_id=session.id,
            exercise_id=exercise_record.id if exercise_record else None,
            name=ex.name,
            primary_muscle=ex.primary_muscle,
            movement_pattern=ex.movement_pattern,
            order_in_session=i,
            superset_group=ex.superset_group,
            sets=ex.sets,
            reps_int=reps_int,
            weight_kg=ex.weight_kg,
            volume_kg=volume_kg,
            notes=ex.notes,
        )
        db.add(session_ex)

    db.commit()
    db.refresh(session)
    return session

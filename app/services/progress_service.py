from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.session import WorkoutSession, SessionExercise


def get_strength_progression(user_id: int, db: Session) -> dict:
    """
    Per lift, return chronological list of {date, weight_kg, sets, reps_int}.
    Detects overload, plateau (same weight 3+ sessions), and regression per lift.
    """
    rows = (
        db.query(
            SessionExercise.name,
            SessionExercise.exercise_id,
            SessionExercise.weight_kg,
            SessionExercise.sets,
            SessionExercise.reps_int,
            WorkoutSession.created_at,
        )
        .join(WorkoutSession, SessionExercise.session_id == WorkoutSession.id)
        .filter(WorkoutSession.user_id == user_id)
        .filter(SessionExercise.weight_kg.isnot(None))
        .order_by(SessionExercise.name, WorkoutSession.created_at)
        .all()
    )

    # Group by exercise name
    lifts: dict[str, list] = {}
    for row in rows:
        key = row.name
        lifts.setdefault(key, []).append({
            "date": row.created_at.date().isoformat(),
            "weight_kg": row.weight_kg,
            "sets": row.sets,
            "reps_int": row.reps_int,
        })

    result = {}
    for name, entries in lifts.items():
        trend = _detect_strength_trend(entries)
        result[name] = {
            "history": entries,
            "trend": trend,
        }

    return result


def _detect_strength_trend(entries: list) -> str:
    """Detect overload / plateau / regression from a chronological weight list."""
    weights = [e["weight_kg"] for e in entries if e["weight_kg"] is not None]
    if len(weights) < 2:
        return "insufficient_data"

    # Plateau: last 3+ entries all same weight
    if len(weights) >= 3 and len(set(weights[-3:])) == 1:
        return "plateau"

    # Compare first half avg vs second half avg
    mid = len(weights) // 2
    first_half_avg = sum(weights[:mid]) / mid
    second_half_avg = sum(weights[mid:]) / len(weights[mid:])

    if second_half_avg > first_half_avg:
        return "overload"
    elif second_half_avg < first_half_avg:
        return "regression"
    return "stable"


def get_volume_trends(user_id: int, db: Session) -> dict:
    """
    Per muscle group, return weekly volume (kg) sorted chronologically.
    Flags overtrained (appears every session) and neglected (absent 2+ weeks) muscles.
    """
    rows = (
        db.query(
            SessionExercise.primary_muscle,
            SessionExercise.volume_kg,
            WorkoutSession.created_at,
        )
        .join(WorkoutSession, SessionExercise.session_id == WorkoutSession.id)
        .filter(WorkoutSession.user_id == user_id)
        .filter(SessionExercise.primary_muscle.isnot(None))
        .filter(SessionExercise.volume_kg.isnot(None))
        .all()
    )

    # Group by muscle + week in Python, not SQL — func.strftime() is SQLite-only
    # and raises UndefinedFunction on Postgres. get_consistency() below already
    # does date bucketing this way; mirror it here for the same portability.
    weekly_totals: dict[tuple[str, str], float] = {}
    for row in rows:
        week = row.created_at.strftime("%Y-W%W")
        key = (row.primary_muscle, week)
        weekly_totals[key] = weekly_totals.get(key, 0) + row.volume_kg

    by_muscle: dict[str, list] = {}
    for muscle, week in sorted(weekly_totals.keys()):
        by_muscle.setdefault(muscle, []).append({
            "week": week,
            "volume_kg": round(weekly_totals[(muscle, week)], 2),
        })

    # Get total session count to detect overtrained muscles
    total_sessions = (
        db.query(func.count(WorkoutSession.id))
        .filter(WorkoutSession.user_id == user_id)
        .scalar()
    ) or 0

    # Get latest session date to detect neglected muscles (absent 2+ weeks)
    latest_session = (
        db.query(func.max(WorkoutSession.created_at))
        .filter(WorkoutSession.user_id == user_id)
        .scalar()
    )

    # Get session count per muscle (how many sessions included this muscle)
    session_counts = (
        db.query(
            SessionExercise.primary_muscle,
            func.count(func.distinct(SessionExercise.session_id)).label("session_count"),
            func.max(WorkoutSession.created_at).label("last_trained"),
        )
        .join(WorkoutSession, SessionExercise.session_id == WorkoutSession.id)
        .filter(WorkoutSession.user_id == user_id)
        .filter(SessionExercise.primary_muscle.isnot(None))
        .group_by(SessionExercise.primary_muscle)
        .all()
    )

    overtrained = []
    neglected = []

    for row in session_counts:
        # Overtrained: appeared in every session
        if total_sessions >= 3 and row.session_count == total_sessions:
            overtrained.append(row.primary_muscle)

        # Neglected: not trained in last 2 weeks
        if latest_session and row.last_trained:
            days_since = (latest_session - row.last_trained).days
            if days_since >= 14:
                neglected.append(row.primary_muscle)

    return {
        "weekly_volume": by_muscle,
        "overtrained": overtrained,
        "neglected": neglected,
    }


def get_consistency(user_id: int, db: Session) -> dict:
    """
    Returns sessions per week, gap periods, and muscle frequency patterns.
    """
    sessions = (
        db.query(WorkoutSession)
        .filter(WorkoutSession.user_id == user_id)
        .order_by(WorkoutSession.created_at)
        .all()
    )

    if not sessions:
        return {
            "total_sessions": 0,
            "sessions_per_week_avg": 0,
            "gap_periods": [],
            "muscle_frequency": {},
            "score_trend": [],
        }

    # Sessions grouped by ISO week
    by_week: dict[str, int] = {}
    for s in sessions:
        week = s.created_at.strftime("%Y-W%W")
        by_week[week] = by_week.get(week, 0) + 1

    sessions_per_week_avg = round(sum(by_week.values()) / len(by_week), 1)

    # Gap periods: consecutive sessions more than 7 days apart
    gap_periods = []
    for i in range(1, len(sessions)):
        delta = (sessions[i].created_at - sessions[i - 1].created_at).days
        if delta > 7:
            gap_periods.append({
                "from": sessions[i - 1].created_at.date().isoformat(),
                "to": sessions[i].created_at.date().isoformat(),
                "days": delta,
            })

    # Muscle frequency: how many sessions each muscle appeared in
    muscle_rows = (
        db.query(
            SessionExercise.primary_muscle,
            func.count(func.distinct(SessionExercise.session_id)).label("count"),
        )
        .join(WorkoutSession, SessionExercise.session_id == WorkoutSession.id)
        .filter(WorkoutSession.user_id == user_id)
        .filter(SessionExercise.primary_muscle.isnot(None))
        .group_by(SessionExercise.primary_muscle)
        .order_by(func.count(func.distinct(SessionExercise.session_id)).desc())
        .all()
    )
    muscle_frequency = {row.primary_muscle: row.count for row in muscle_rows}

    # Score trend: overall score per session over time
    score_trend = [
        {
            "date": s.created_at.date().isoformat(),
            "overall": s.overall_score,
            "intensity": s.intensity_score,
            "volume": s.volume_score,
        }
        for s in sessions
        if s.overall_score is not None
    ]

    return {
        "total_sessions": len(sessions),
        "sessions_per_week_avg": sessions_per_week_avg,
        "weeks_tracked": len(by_week),
        "gap_periods": gap_periods,
        "muscle_frequency": muscle_frequency,
        "score_trend": score_trend,
    }

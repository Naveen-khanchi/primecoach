from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.database import Base


class WorkoutSession(Base):
    __tablename__ = "workout_sessions"

    id               = Column(Integer, primary_key=True)
    user_id          = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    created_at       = Column(DateTime, default=lambda: datetime.now(timezone.utc), index=True)
    workout_type     = Column(String, nullable=True)            # Push / Pull / Legs / Full Body
    duration_minutes = Column(Integer, nullable=True)
    notes            = Column(Text, nullable=True)

    # ── Pre-computed aggregates ──
    total_volume_kg          = Column(Float, nullable=True)     # SUM(sets × reps_int × weight_kg)
    total_sets               = Column(Integer, nullable=True)   # SUM(sets) across all exercises

    # ── AI scores (stored flat for Phase 5 trend queries) ──
    overall_score            = Column(Integer, nullable=True)
    intensity_score          = Column(Integer, nullable=True)
    volume_score             = Column(Integer, nullable=True)
    exercise_selection_score = Column(Integer, nullable=True)
    muscle_balance_score     = Column(Integer, nullable=True)

    # ── Full AI output ──
    ai_analysis = Column(Text, nullable=True)                   # full AI JSON as string

    # ── Relationship ──
    exercises = relationship("SessionExercise", back_populates="session", cascade="all, delete-orphan")


class SessionExercise(Base):
    __tablename__ = "session_exercises"

    id               = Column(Integer, primary_key=True)
    session_id       = Column(Integer, ForeignKey("workout_sessions.id"), index=True, nullable=False)
    exercise_id      = Column(Integer, ForeignKey("exercises.id"), index=True, nullable=True)   # nullable — upsert safety net
    name             = Column(String, nullable=False)           # always store as logged (display fallback)

    # ── Denormalized for fast Phase 5 queries (no join needed) ──
    primary_muscle   = Column(String, index=True, nullable=True)
    movement_pattern = Column(String, index=True, nullable=True)

    # ── Session structure ──
    order_in_session = Column(Integer, nullable=True)           # position in session: 1, 2, 3...
    superset_group   = Column(Integer, nullable=True)           # exercises sharing same group = superset; null = standalone

    # ── Workout data ──
    sets      = Column(Integer, nullable=True)
    reps_int  = Column(Integer, nullable=True)                  # parsed integer; lower bound for ranges (e.g. "8-12" → 8)
    weight_kg = Column(Float, nullable=True)
    volume_kg = Column(Float, nullable=True)                    # pre-computed: sets × reps_int × weight_kg
    notes     = Column(Text, nullable=True)

    # ── Relationship ──
    session = relationship("WorkoutSession", back_populates="exercises")

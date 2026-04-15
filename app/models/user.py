from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database import Base


class User(Base):
    """Authentication table — login credentials."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False, index=True)
    phone = Column(String, nullable=True)
    password_hash = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    profile = relationship("UserProfile", back_populates="user", uselist=False)


class UserProfile(Base):
    """Fitness profile — all training-related data."""
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False, index=True)

    # Body metrics
    age = Column(Integer, nullable=True)
    weight_kg = Column(Float, nullable=True)
    height_cm = Column(Float, nullable=True)
    gender = Column(String, nullable=True)

    # Goal & Training
    fitness_level = Column(String, nullable=True)       # beginner / intermediate / advanced
    goal = Column(String, nullable=True)                # muscle_gain / fat_loss / strength / endurance / general_fitness
    days_available = Column(Integer, nullable=True)     # days per week available to train
    target_deadline = Column(String, nullable=True)     # e.g. "12 weeks"
    injuries = Column(String, nullable=True)            # free text

    # Strength Baseline
    bench_press_kg = Column(Float, nullable=True)
    squat_kg = Column(Float, nullable=True)
    deadlift_kg = Column(Float, nullable=True)
    overhead_press_kg = Column(Float, nullable=True)
    pull_ups_max_reps = Column(Integer, nullable=True)

    user = relationship("User", back_populates="profile")

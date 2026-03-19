from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from app.database import Base


class User(Base):
    __tablename__ = "users"

    # Identity
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    weight_kg = Column(Float, nullable=False)
    height_cm = Column(Float, nullable=False)
    gender = Column(String, nullable=False)

    # Goal & Training
    fitness_level = Column(String, nullable=False)   # beginner / intermediate / advanced
    goal = Column(String, nullable=False)             # muscle_gain / fat_loss / strength / endurance / general_fitness
    days_available = Column(Integer, nullable=False)  # days per week available to train
    target_deadline = Column(String, nullable=True)   # e.g. "12 weeks"
    injuries = Column(String, nullable=True)          # free text, e.g. "bad left knee"

    # Strength Baseline (key compound lifts in kg)
    bench_press_kg = Column(Float, nullable=True)
    squat_kg = Column(Float, nullable=True)
    deadlift_kg = Column(Float, nullable=True)
    overhead_press_kg = Column(Float, nullable=True)
    pull_ups_max_reps = Column(Integer, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

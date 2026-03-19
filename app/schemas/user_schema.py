from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    age: int
    weight_kg: float
    height_cm: float
    gender: str                  # male / female / other
    fitness_level: str           # beginner / intermediate / advanced
    goal: str                    # muscle_gain / fat_loss / strength / endurance / general_fitness
    days_available: int          # days per week
    target_deadline: Optional[str] = None
    injuries: Optional[str] = None

    # Strength baseline
    bench_press_kg: Optional[float] = None
    squat_kg: Optional[float] = None
    deadlift_kg: Optional[float] = None
    overhead_press_kg: Optional[float] = None
    pull_ups_max_reps: Optional[int] = None


class UserResponse(BaseModel):
    id: int
    name: str
    age: int
    weight_kg: float
    height_cm: float
    gender: str
    fitness_level: str
    goal: str
    days_available: int
    target_deadline: Optional[str] = None
    injuries: Optional[str] = None
    bench_press_kg: Optional[float] = None
    squat_kg: Optional[float] = None
    deadlift_kg: Optional[float] = None
    overhead_press_kg: Optional[float] = None
    pull_ups_max_reps: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

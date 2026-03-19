from pydantic import BaseModel
from typing import List, Optional

class Exercise(BaseModel):
    name: str
    primary_muscle: str
    difficulty: str
    type: str

class NormalizedExercise(BaseModel):
    name: str
    sets: Optional[int] = None
    reps: Optional[str] = None          # e.g. "8-10", "12", "to failure" — parsed to reps_int on save
    weight_kg: Optional[float] = None
    primary_muscle: Optional[str] = None    # e.g. "chest", "hamstrings"
    movement_pattern: Optional[str] = None  # push/pull/squat/hinge/lunge/carry/rotation
    superset_group: Optional[int] = None    # exercises sharing same group = superset; null = standalone
    notes: Optional[str] = None

class NormalizedWorkout(BaseModel):
    exercises: List[NormalizedExercise]
    workout_type: Optional[str] = None   # e.g. "Push", "Pull", "Legs", "Full Body"
    duration_minutes: Optional[int] = None
    notes: Optional[str] = None

class WorkoutSessionCreate(BaseModel):
    user_id: int
    exercises: List[str]


class WorkoutSession(WorkoutSessionCreate):
    session_id: int

class WorkoutAnalysis(BaseModel):
    muscle_distribution: dict[str, int]
    total_exercises: int

class ExerciseRecommendation(BaseModel):
    name: str
    reason: str

class SessionRecommendation(BaseModel):
    exercises:List[ExerciseRecommendation]

class SessionResponse(BaseModel):
    session: WorkoutSession
    analysis: WorkoutAnalysis
    recommendations:SessionRecommendation
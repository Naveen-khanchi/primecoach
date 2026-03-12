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
    reps: Optional[str] = None       # e.g. "8-10", "12", "to failure"
    weight_kg: Optional[float] = None
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
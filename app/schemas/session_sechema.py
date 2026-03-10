from pydantic import BaseModel
from typing import List

class Exercise(BaseModel):
    name: str
    primary_muscle: str
    difficulty: str
    type: str

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
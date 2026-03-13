from fastapi import APIRouter
from typing import List
from app.schemas.session_schema import WorkoutSession, SessionResponse, WorkoutSessionCreate, SessionRecommendation
from app.services.analyzer import analyze_session
from app.services.recommendation_engine import recommend_exercises

router = APIRouter()

sessions_db = []
session_counter = 1


@router.post("/", response_model=SessionResponse)
def create_session(session: WorkoutSessionCreate):
    global session_counter

    new_session = {
        "session_id": session_counter,
        "user_id": session.user_id,
        "exercises": session.exercises
    }

    sessions_db.append(new_session)
    session_counter += 1

    analysis = analyze_session(session.exercises)
    recommendations = recommend_exercises(analysis['muscle_distribution'])

    return {
        "session": new_session,
        "analysis": analysis,
        "recommendations": SessionRecommendation(
            exercises=recommendations
        )
    }


@router.get("/", response_model=List[WorkoutSession])
def get_sessions():
    return sessions_db

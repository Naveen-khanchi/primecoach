from fastapi import FastAPI, Query
from typing import Optional, List
from app.exercise_library import EXERCISES
from app.schemas.session_sechema import Exercise, WorkoutSession, SessionResponse, WorkoutSessionCreate, SessionRecommendation
from app.services.analyzer import analyze_session
from app.services.recommendation_engine import recommend_exercises
from app.services.ai_coach import analyze_workout

app = FastAPI()

sessions_db = []
session_counter = 1

@app.get("/exercises", response_model= List[Exercise])
def get_exercises(
    muscle: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None)
):
    results = []
    for muscle_group in EXERCISES.values():
        for exercises in muscle_group:
            if muscle and exercises["primary_muscle"] != muscle:
                continue
            if difficulty and difficulty["difficulty"] != difficulty:
                continue
            results.append(exercises)

    return results


@app.post("/sessions", response_model=SessionResponse)
def create_session(session:WorkoutSessionCreate):
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


@app.get("/sessions", response_model=List[WorkoutSession])
def get_sessions():
    return sessions_db

@app.post("/ai-test")
def test_ai(workout: dict):

    response = analyze_workout(workout)

    return {
        "ai_response": response
    }
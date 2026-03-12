from fastapi import FastAPI
from app.routes import workout, exercises, sessions

app = FastAPI(
    title="PrimeCoach API",
    version="1.0.0"
)

app.include_router(workout.router, prefix="/workout", tags=["Workout"])
app.include_router(exercises.router, prefix="/exercises", tags=["Exercises"])
app.include_router(sessions.router, prefix="/sessions", tags=["Sessions"])

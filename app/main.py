from fastapi import FastAPI
from app.database import engine
from app.models import user
from app.routes import workout, exercises, sessions, users

user.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PrimeCoach API",
    version="1.0.0"
)

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(workout.router, prefix="/workout", tags=["Workout"])
app.include_router(exercises.router, prefix="/exercises", tags=["Exercises"])
app.include_router(sessions.router, prefix="/sessions", tags=["Sessions"])

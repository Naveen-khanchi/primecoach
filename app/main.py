from fastapi import FastAPI
from app.database import engine, Base
from app.models import user, exercise, session  # noqa: F401 — imports register models with Base
from app.routes import workout, exercises, sessions, users, progress, recommendations

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PrimeCoach API",
    version="1.0.0"
)

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(workout.router, prefix="/workout", tags=["Workout"])
app.include_router(exercises.router, prefix="/exercises", tags=["Exercises"])
app.include_router(sessions.router, prefix="/sessions", tags=["Sessions"])
app.include_router(progress.router, prefix="/progress", tags=["Progress"])
app.include_router(recommendations.router, prefix="/recommendations", tags=["Recommendations"])

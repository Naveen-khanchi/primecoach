from fastapi import APIRouter, Query
from typing import Optional, List
from app.exercise_library import EXERCISES
from app.schemas.session_schema import Exercise

router = APIRouter()


@router.get("/", response_model=List[Exercise])
def get_exercises(
    muscle: Optional[str] = Query(None),
    difficulty: Optional[str] = Query(None)
):
    results = []
    for muscle_group in EXERCISES.values():
        for exercises in muscle_group:
            if muscle and exercises["primary_muscle"] != muscle:
                continue
            if difficulty and exercises["difficulty"] != difficulty:
                continue
            results.append(exercises)

    return results

from fastapi import APIRouter, Depends, Query
from typing import Optional, List
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.exercise import Exercise

router = APIRouter()


@router.get("/")
def get_exercises(
    muscle: Optional[str] = Query(None, description="Filter by primary muscle (e.g. chest, hamstrings)"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty (beginner / intermediate / advanced)"),
    movement_pattern: Optional[str] = Query(None, description="Filter by movement pattern (push / pull / squat / hinge / lunge)"),
    db: Session = Depends(get_db)
):
    query = db.query(Exercise)

    if muscle:
        query = query.filter(Exercise.primary_muscle.ilike(muscle))
    if difficulty:
        query = query.filter(Exercise.difficulty.ilike(difficulty))
    if movement_pattern:
        query = query.filter(Exercise.movement_pattern.ilike(movement_pattern))

    exercises = query.order_by(Exercise.name).all()

    return [
        {
            "id": ex.id,
            "name": ex.name,
            "primary_muscle": ex.primary_muscle,
            "secondary_muscles": ex.secondary_muscles,
            "movement_pattern": ex.movement_pattern,
            "type": ex.type,
            "difficulty": ex.difficulty,
        }
        for ex in exercises
    ]

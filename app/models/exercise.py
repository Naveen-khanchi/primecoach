from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime, timezone
from app.database import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id                = Column(Integer, primary_key=True)
    name              = Column(String, unique=True, index=True, nullable=False)
    primary_muscle    = Column(String, index=True, nullable=False)
    secondary_muscles = Column(String, nullable=True)           # comma-separated e.g. "triceps,shoulders"
    movement_pattern  = Column(String, nullable=True)           # push/pull/squat/hinge/lunge/carry/rotation
    type              = Column(String, nullable=True)           # compound / isolation
    equipment         = Column(String, nullable=True)           # barbell / dumbbell / machine / bodyweight
    difficulty        = Column(String, nullable=True)           # beginner / intermediate / advanced
    created_at        = Column(DateTime, default=lambda: datetime.now(timezone.utc))

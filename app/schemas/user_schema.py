from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# --- Auth schemas ---

class UserSignup(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    password: str


class UserLogin(BaseModel):
    email: str
    password: str


class UserAuthResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# --- Profile schemas ---

class ProfileCreate(BaseModel):
    age: Optional[int] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    gender: Optional[str] = None
    fitness_level: Optional[str] = None
    goal: Optional[str] = None
    days_available: Optional[int] = None
    target_deadline: Optional[str] = None
    injuries: Optional[str] = None
    bench_press_kg: Optional[float] = None
    squat_kg: Optional[float] = None
    deadlift_kg: Optional[float] = None
    overhead_press_kg: Optional[float] = None
    pull_ups_max_reps: Optional[int] = None


class ProfileResponse(BaseModel):
    id: int
    user_id: int
    age: Optional[int] = None
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    gender: Optional[str] = None
    fitness_level: Optional[str] = None
    goal: Optional[str] = None
    days_available: Optional[int] = None
    target_deadline: Optional[str] = None
    injuries: Optional[str] = None
    bench_press_kg: Optional[float] = None
    squat_kg: Optional[float] = None
    deadlift_kg: Optional[float] = None
    overhead_press_kg: Optional[float] = None
    pull_ups_max_reps: Optional[int] = None

    class Config:
        from_attributes = True


# --- Combined response (for frontend convenience) ---

class UserFullResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str] = None
    created_at: datetime
    profile: Optional[ProfileResponse] = None

    class Config:
        from_attributes = True

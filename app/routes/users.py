from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from hashlib import sha256
from app.database import get_db
from app.models.user import User, UserProfile
from app.auth import create_access_token, get_current_user
from app.schemas.user_schema import (
    UserSignup, UserLogin, UserAuthResponse,
    ProfileCreate, ProfileResponse, UserFullResponse,
)

router = APIRouter()


def _hash_password(password: str) -> str:
    return sha256(password.encode()).hexdigest()


# --- Auth endpoints ---

@router.post("/signup", response_model=UserAuthResponse)
def signup(data: UserSignup, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        name=data.name,
        email=data.email,
        phone=data.phone,
        password_hash=_hash_password(data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    response = UserAuthResponse.model_validate(user)
    response.access_token = token
    return response


@router.post("/login", response_model=UserFullResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or user.password_hash != _hash_password(data.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id)
    response = UserFullResponse.model_validate(user)
    response.access_token = token
    return response


# --- Profile endpoints ---

@router.get("/{user_id}", response_model=UserFullResponse)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this user's data")
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/{user_id}/profile", response_model=ProfileResponse)
def create_or_update_profile(user_id: int, data: ProfileCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this user's data")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()

    if profile:
        for key, value in data.model_dump(exclude_unset=True).items():
            setattr(profile, key, value)
    else:
        profile = UserProfile(user_id=user_id, **data.model_dump())
        db.add(profile)

    db.commit()
    db.refresh(profile)
    return profile


@router.get("/{user_id}/profile", response_model=ProfileResponse)
def get_profile(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):

    if user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to access this user's data")

    profile = db.query(UserProfile).filter(UserProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

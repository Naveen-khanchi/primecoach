# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start the development server
uvicorn app.main:app --reload

# Install dependencies
pip install -r requirements.txt

# Run with a specific port
uvicorn app.main:app --reload --port 8000
```

No test runner is configured. The `.env` file (gitignored) must contain `GROQ_API_KEY` for AI features to work.

## Architecture

PrimeCoach is a FastAPI backend for AI-powered personal fitness coaching. It takes a user's profile and workout sessions, analyzes them using Groq AI, and tracks progress over time to provide personalized insights.

**Full project roadmap and phase status:** See `PLANNING.md`.

---

## Request Flows

### `POST /workout/analyze`
1. Receives any workout input (natural language, JSON, shorthand) + optional `user_id` query param
2. `services/normalizer.py` calls Groq to parse input into a `NormalizedWorkout` object
3. If `user_id` provided, fetches `User` from DB
4. `services/ai_coach.py` calls Groq with the normalized workout + user profile context
5. `services/session_service.py` saves session + exercises to DB (skipped if no `user_id`)
6. Returns `user`, `session_id`, `normalized_input`, and full `analysis` JSON

### `POST /users`
1. Receives `UserCreate` (profile + strength baselines)
2. Saves to `users` table via SQLAlchemy
3. Returns `UserResponse` with assigned `id`

### `GET /users/{user_id}`
Fetches user profile from `users` table. 404 if not found.

---

## Key Files

### Entry Point
- `app/main.py` — app setup and router registration only. No endpoint logic here.

### Routes (one file per feature)
- `app/routes/workout.py` — `POST /workout/analyze`
- `app/routes/users.py` — `POST /users`, `GET /users/{user_id}`
- `app/routes/exercises.py` — `GET /exercises` (queries DB exercises table, supports muscle/difficulty/movement_pattern filters)
- `app/routes/sessions.py` — `GET /sessions/{user_id}`, `GET /sessions/{user_id}/{session_id}`
- `app/routes/progress.py` — `GET /progress/{user_id}`, `/strength`, `/volume`, `/consistency`
- `app/routes/recommendations.py` — `GET /recommendations/{user_id}/next-session`, `/weekly-plan`

### Services (all business logic)
- `app/services/normalizer.py` — Groq call to parse any workout input → `NormalizedWorkout`
- `app/services/ai_coach.py` — Groq call to analyze workout with user context → structured JSON. `_format_user_context()` is reused by other AI services.
- `app/services/session_service.py` — `_upsert_exercise()` + `save_session()` — saves session to DB after analysis
- `app/services/progress_service.py` — raw DB queries for strength progression, volume trends, consistency metrics
- `app/services/progress_analyzer.py` — Groq call for AI progress insights using raw metrics
- `app/services/recommendation_service.py` — gathers DB context (last session, recent muscles, strength baselines) for recommendation calls
- `app/services/recommendation_engine.py` — Groq calls for next session recommendation and weekly plan

### Models (SQLAlchemy ORM)
- `app/models/user.py` — `users` table
- `app/models/exercise.py` — `exercises` table (canonical exercise registry, grows via upsert)
- `app/models/session.py` — `workout_sessions` + `session_exercises` tables
- `app/models/__init__.py` — imports all models so `Base.metadata.create_all()` registers all tables

### Schemas (Pydantic)
- `app/schemas/session_schema.py` — `NormalizedExercise`, `NormalizedWorkout`, session models
- `app/schemas/user_schema.py` — `UserCreate`, `UserResponse`

### Database
- `app/database.py` — SQLite engine, `SessionLocal`, `Base`, `get_db()` dependency
- `primecoach.db` — SQLite file (gitignored)

---

## Database Schema (current)

### `users`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| name | TEXT | |
| age | INTEGER | |
| weight_kg | FLOAT | |
| height_cm | FLOAT | |
| gender | TEXT | |
| fitness_level | TEXT | beginner / intermediate / advanced |
| goal | TEXT | muscle_gain / fat_loss / strength / endurance / general_fitness |
| days_available | INTEGER | days per week |
| target_deadline | TEXT | e.g. "12 weeks" |
| injuries | TEXT | free text |
| bench_press_kg | FLOAT | nullable |
| squat_kg | FLOAT | nullable |
| deadlift_kg | FLOAT | nullable |
| overhead_press_kg | FLOAT | nullable |
| pull_ups_max_reps | INTEGER | nullable |
| created_at | DATETIME | |

---

## Database Schema (Phase 4 — implemented)

### `exercises`
Canonical exercise registry. Grows automatically via upsert as users log new exercises.

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| name | TEXT UNIQUE | canonical name e.g. "Romanian Deadlift" |
| primary_muscle | TEXT | e.g. "hamstrings" |
| secondary_muscles | TEXT | comma-separated |
| type | TEXT | compound / isolation |
| difficulty | TEXT | beginner / intermediate / advanced |

**Upsert rule:** After normalization, look up by name (case-insensitive). Use existing ID or insert new row.

### `workout_sessions`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| user_id | INTEGER FK → users.id | |
| created_at | DATETIME | |
| workout_type | TEXT | Push / Pull / Legs / Full Body / etc. |
| duration_minutes | INTEGER | nullable |
| notes | TEXT | nullable |
| total_volume_kg | FLOAT | SUM(sets × reps_int × weight_kg) |
| total_sets | INTEGER | SUM(sets) across all exercises |
| overall_score | INTEGER | from ai_coach score_breakdown.overall |
| intensity_score | INTEGER | from ai_coach score_breakdown.intensity |
| volume_score | INTEGER | from ai_coach score_breakdown.volume |
| exercise_selection_score | INTEGER | from ai_coach score_breakdown.exercise_selection |
| muscle_balance_score | INTEGER | from ai_coach score_breakdown.muscle_balance |
| ai_analysis | TEXT | full AI analysis JSON stored as string |

### `session_exercises`
| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| session_id | INTEGER FK → workout_sessions.id | |
| exercise_id | INTEGER FK → exercises.id | nullable — upsert safety net |
| name | TEXT | always store as logged (display fallback) |
| primary_muscle | TEXT | denormalized for fast volume-by-muscle queries |
| movement_pattern | TEXT | denormalized for fast pattern-based queries |
| order_in_session | INTEGER | position in session: 1, 2, 3... |
| superset_group | INTEGER | exercises sharing same group = superset; null = standalone |
| sets | INTEGER | nullable |
| reps_int | INTEGER | parsed integer; lower bound for ranges ("8-12" → 8); null for "to failure" |
| weight_kg | FLOAT | nullable |
| volume_kg | FLOAT | pre-computed: sets × reps_int × weight_kg |
| notes | TEXT | nullable |

---

## AI Integration

All AI calls use `Groq(llama-3.3-70b-versatile)` at `temperature=0.4`.

All services handle Groq errors consistently: `AuthenticationError` → 500, `RateLimitError` → 503, `APIConnectionError` → 503, `InternalServerError` → 503, `JSONDecodeError` → 502.

**Normalizer prompt** (`services/normalizer.py`):
- Input: raw workout in any format
- Output: `NormalizedWorkout` JSON with exercises list (name, sets, reps, weight_kg, primary_muscle, movement_pattern, superset_group, notes)

**AI Coach prompt** (`services/ai_coach.py`):
- Input: formatted workout text + formatted user profile context
- Output: structured JSON with score_breakdown, analysis, strength_volume_insights,
  muscle_balance, recovery, improvements (exactly 3), warnings, next_workout_plan, coach_message
- `_format_user_context()` formats the User ORM object into readable text — reused by progress_analyzer and recommendation_engine

**Progress Analyzer prompt** (`services/progress_analyzer.py`):
- Input: user profile + formatted strength/volume/consistency metrics
- Output: structured JSON with progress_status, overall_summary, top_strength, main_weakness, blocking_factors, recommendation

**Recommendation Engine prompts** (`services/recommendation_engine.py`):
- Next session: user profile + last session + recent muscles + current weights → recommended workout type, exercises with sets/reps/weight targets
- Weekly plan: user profile + recent muscle frequency + strength baselines → day-by-day plan for the full week

---

## Architectural Rules
- `main.py` registers routers only — no endpoint logic
- Each feature has its own route file
- All AI calls go through services — never directly from routes
- Normalization always runs before analysis — routes never pass raw input to AI
- User profile must be attached to every analysis call (`user_id` query param on `/workout/analyze`)
- Session saving always happens as part of analysis — no separate "log session" endpoint
- Session saving is skipped silently if no `user_id` is provided to `/workout/analyze`
- Exercise lookup is always an upsert — never fail if exercise name is unknown
- `session_exercises.reps_int` stores lower bound for ranges ("8-12" → 8); free-text reps ("to failure") → null, captured in notes

---

## Known Issues
- `PUT /users/{user_id}` (update profile) not yet implemented

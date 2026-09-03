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

### `POST /users/signup`
1. Receives `UserSignup` (name, email, phone, password)
2. Hashes password with SHA-256, saves to `users` table (auth only — no fitness data)
3. Returns `UserAuthResponse` with assigned `id`

### `POST /users/login`
Looks up `users` by email, compares SHA-256 hash. 401 if no match.

### `GET /users/{user_id}`
Fetches user + profile (`UserFullResponse`, includes nested `profile`). 404 if not found.

### `POST /users/{user_id}/profile`
Upserts the `user_profiles` row for this user (age, weight, goals, strength baselines, etc). Creates it if missing, updates fields present in the request otherwise.

### `GET /users/{user_id}/profile`
Fetches the `user_profiles` row for this user. 404 if not found.

### `GET /health/ping`
Runs a trivial `SELECT 1` against the DB. Exists purely as an external keepalive target (UptimeRobot pings it every 5 min) so the Supabase free-tier project doesn't pause after 7 days of inactivity, and so the Render free-tier backend doesn't spin down from idling.

### `GET /exercises`
Queries the `exercises` DB table (auto-populated via upsert when users log workouts). Supports optional filters: `muscle`, `difficulty`, `movement_pattern`. Returns matching exercises.

### `GET /sessions/{user_id}`
Lists all past workout sessions for a user (summaries — date, type, scores, volume). No full AI analysis included.

### `GET /sessions/{user_id}/{session_id}`
Returns full detail of one session — all exercises with sets/reps/weight + the stored AI analysis JSON.

### `GET /progress/{user_id}`
Full progress report combining raw metrics (strength, volume, consistency) with AI-generated insights. Tells the user if they're on track, what's improving, and what to focus on.

### `GET /progress/{user_id}/strength`
Per-lift progression data (weight over time per exercise). Detects progressive overload, plateaus, and regression.

### `GET /progress/{user_id}/volume`
Volume trends per muscle group per week. Detects overtrained and neglected muscles.

### `GET /progress/{user_id}/consistency`
Training frequency vs target, gap periods, and muscle skip patterns.

### `GET /recommendations/{user_id}/next-session`
AI-powered suggestion for what to train next — which muscles, exercises, sets/reps/weight targets, and rationale. Based on last session, recent history, and user goals.

### `GET /recommendations/{user_id}/weekly-plan`
Full week plan — day-by-day breakdown with exercises, sets, reps, weight guidance, and rest days. Built from actual user data, not generic templates.

---

## Key Files

### Entry Point
- `app/main.py` — app setup and router registration only. No endpoint logic here.

### Routes (one file per feature)
- `app/routes/workout.py` — `POST /workout/analyze`
- `app/routes/users.py` — `POST /users/signup`, `POST /users/login`, `GET /users/{user_id}`, `POST /users/{user_id}/profile`, `GET /users/{user_id}/profile`
- `app/routes/exercises.py` — `GET /exercises` (queries DB exercises table, supports muscle/difficulty/movement_pattern filters)
- `app/routes/sessions.py` — `GET /sessions/{user_id}`, `GET /sessions/{user_id}/{session_id}`
- `app/routes/progress.py` — `GET /progress/{user_id}`, `/strength`, `/volume`, `/consistency`
- `app/routes/recommendations.py` — `GET /recommendations/{user_id}/next-session`, `/weekly-plan`
- `app/routes/health.py` — `GET /health/ping` (external keepalive target, not app functionality)

### Services (all business logic)
- `app/services/normalizer.py` — Groq call to parse any workout input → `NormalizedWorkout`
- `app/services/ai_coach.py` — Groq call to analyze workout with user context → structured JSON. `_format_user_context()` is reused by other AI services.
- `app/services/session_service.py` — `_upsert_exercise()` + `save_session()` — saves session to DB after analysis
- `app/services/progress_service.py` — raw DB queries for strength progression, volume trends, consistency metrics
- `app/services/progress_analyzer.py` — Groq call for AI progress insights using raw metrics
- `app/services/recommendation_service.py` — gathers DB context (last session, recent muscles, strength baselines) for recommendation calls
- `app/services/recommendation_engine.py` — Groq calls for next session recommendation and weekly plan

### Models (SQLAlchemy ORM)
- `app/models/user.py` — `User` (`users` table, auth only) + `UserProfile` (`user_profiles` table, fitness data), one-to-one via `user_id` FK
- `app/models/exercise.py` — `exercises` table (canonical exercise registry, grows via upsert)
- `app/models/session.py` — `workout_sessions` + `session_exercises` tables
- `app/models/__init__.py` — imports all models so `Base.metadata.create_all()` registers all tables

### Schemas (Pydantic)
- `app/schemas/session_schema.py` — `NormalizedExercise`, `NormalizedWorkout`, session models
- `app/schemas/user_schema.py` — `UserSignup`, `UserLogin`, `UserAuthResponse`, `ProfileCreate`, `ProfileResponse`, `UserFullResponse` (nests `profile`)

### Database
- `app/database.py` — SQLAlchemy engine built from `DATABASE_URL` env var (Postgres in production — Supabase; falls back to a local Postgres URL if unset). Also supports SQLite (`connect_args` branch) for quick local runs. Exposes `SessionLocal`, `Base`, `get_db()` dependency.
- Production DB is hosted on Supabase (free tier). `GET /health/ping` + an UptimeRobot monitor exist solely to keep it from pausing due to inactivity — see Known Issues below.

---

## Database Schema (current)

### `users`
Auth only — no fitness data lives here anymore (see `user_profiles` below).

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| name | TEXT | |
| email | TEXT | unique |
| phone | TEXT | nullable |
| password_hash | TEXT | SHA-256 |
| created_at | DATETIME | |

### `user_profiles`
One-to-one with `users` via `user_id` FK. Created/updated via upsert on `POST /users/{user_id}/profile`.

| Column | Type | Notes |
|---|---|---|
| id | INTEGER PK | |
| user_id | INTEGER FK → users.id | unique |
| age | INTEGER | nullable |
| weight_kg | FLOAT | nullable |
| height_cm | FLOAT | nullable |
| gender | TEXT | nullable |
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
| movement_pattern | TEXT | push / pull / squat / hinge / lunge / carry / rotation |
| type | TEXT | compound / isolation |
| equipment | TEXT | barbell / dumbbell / machine / bodyweight |
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

## Known Issues / Upcoming (Phase 7)
- `PUT /users/{user_id}` (update name/email/phone) not yet implemented — only the fitness profile has an upsert route (`POST /users/{user_id}/profile`)
- `GET /users/{user_id}/onboarding-status` (profile completeness check) not yet implemented
- Guided user onboarding flow not yet implemented

## Operational Notes
- Supabase (free tier) pauses the DB project after ~7 days of inactivity — not a usage-quota issue, purely an inactivity timeout that recurs every time it goes idle again. Mitigated with `GET /health/ping` (trivial `SELECT 1`) + an UptimeRobot HTTP monitor pinging it every 5 min, which also keeps the Render free-tier backend from spinning down.

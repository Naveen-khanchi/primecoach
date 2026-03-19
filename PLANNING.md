# PrimeCoach — Project Planning Document

## Vision
An AI-powered personal fitness coach that takes a user's current fitness and strength
status and provides a detailed analysis of their strengths, weaknesses, and key mistakes
with a specific improvement plan to achieve their goal. No generic plans — only
user-specific plans built on real data and AI.

**Scope (current focus):** Workout analysis, AI-powered recommendations, and progress
tracking. Diet planning is out of scope for now.

---

## Project Status Legend
- ✅ Done
- ⚠️ Partially done / needs improvement
- ❌ Not started

---

## Phase 1 — Foundation (Core Infrastructure)

### 1.1 Project Structure ✅
Clean separation of routes, services, schemas, and models.
```
app/
├── main.py               ← app setup + router registration only
├── database.py           ← SQLAlchemy engine, SessionLocal, Base, get_db()
├── exercise_library.py   ← static exercise list (to be replaced by DB table)
├── routes/               ← one file per feature
├── schemas/              ← pydantic models
├── services/             ← business logic
└── models/               ← SQLAlchemy ORM models
```

### 1.2 Routing ✅
Routers registered in main.py:
- POST /workout/analyze   ← AI normalize + analyze endpoint
- GET  /exercises         ← fetch exercise library
- POST /sessions          ← old flow (in-memory, to be replaced)
- GET  /sessions          ← old flow (in-memory, to be replaced)
- POST /users             ← create user profile
- GET  /users/{user_id}   ← fetch user profile

### 1.3 Exercise Library ⚠️
Static list of 6 hardcoded exercises lives in `exercise_library.py` (legacy, kept for
reference). Replaced in Phase 4 by a proper `exercises` DB table that grows
automatically via upsert as users log workouts.

### 1.4 Database ✅
SQLite via SQLAlchemy ORM. `database.py` defines engine, `SessionLocal`, `Base`,
and `get_db()` dependency.

---

## Phase 2 — User Profile ✅

### 2.1 User Profile Schema ✅
Pydantic models in `schemas/user_schema.py`:
- `UserCreate` — input (name, age, weight, height, gender, fitness_level, goal,
  days_available, target_deadline, injuries, strength baselines)
- `UserResponse` — DB user with id and created_at

### 2.2 User DB Model ✅
SQLAlchemy model in `models/user.py` — `users` table.

Fields:
- Identity: name, age, weight_kg, height_cm, gender
- Training: fitness_level, goal, days_available, target_deadline, injuries
- Strength baseline: bench_press_kg, squat_kg, deadlift_kg, overhead_press_kg,
  pull_ups_max_reps

### 2.3 User Profile Endpoints ✅
- `POST /users`           ← create user + save to DB
- `GET  /users/{user_id}` ← fetch user profile
- `PUT  /users/{user_id}` ← update profile ❌ not yet implemented

---

## Phase 3 — Workout Analysis (AI) ✅

### 3.1 Input Normalization ✅
`services/normalizer.py` — accepts any format (natural language, shorthand, structured
JSON, bullet points). Uses Groq llama-3.3-70b-versatile to extract and standardize into
a `NormalizedWorkout` object.

Handles:
- Exercise name standardization (rdl → Romanian Deadlift)
- Unit conversion (lbs → kg)
- Shorthand decoding (3x10 → sets: 3, reps: "10")
- Workout type inference from exercise names
- RPE and effort notes capture

**Pending:** Normalizer needs to also extract `primary_muscle` per exercise (needed for
Phase 4 exercise upsert and muscle-level volume tracking).

### 3.2 AI Coaching Analysis ✅
`services/ai_coach.py` — analyzes `NormalizedWorkout` with user context using Groq.

Returns structured JSON with:
- `score_breakdown` — intensity, volume, exercise_selection, muscle_balance, overall (0-10)
- `analysis` — training stimulus, muscle focus, exercise order quality
- `strength_volume_insights` — training zones per exercise, total_volume_kg, highlights
- `muscle_balance` — well_trained vs undertrained (specific muscles with risk explanation)
- `recovery` — 48h/72h rest per muscle, nutrition tip, sleep note
- `improvements` — exactly 3, each referencing a specific exercise
- `warnings` — injury risks, dangerous imbalances
- `next_workout_plan` — 4-6 exercises with sets, reps, weight, rationale
- `coach_message` — one personalized sentence

### 3.3 User-Aware Analysis ✅
`routes/workout.py` fetches the user from DB using `user_id` query param and passes the
`User` object to `ai_coach.analyze_workout()`. Analysis is personalized to the user's
fitness level, goal, injury history, and strength baseline.

---

## Phase 4 — Exercise Registry & Session Persistence ✅

### 4.0 Exercise Registry Table ✅
**Why:** Storing exercise names as plain strings makes per-lift trend analysis fragile
(e.g. "Bench Press" vs "barbell bench press" = same lift, no way to group reliably).
A canonical `exercises` table with integer IDs allows clean joins across all sessions.

**Design: `exercises` table**
```
id               INTEGER PK
name             TEXT UNIQUE   ← canonical name (e.g. "Romanian Deadlift")
primary_muscle   TEXT          ← e.g. "hamstrings"
secondary_muscles TEXT         ← e.g. "glutes, lower_back" (comma-separated)
type             TEXT          ← "compound" / "isolation"
difficulty       TEXT          ← "beginner" / "intermediate" / "advanced"
```

**Upsert strategy:** After normalization, look up exercise by name (case-insensitive).
If found → use its ID. If not → insert a new row. This means the exercise library
grows automatically as users log new exercises, with no manual seeding required.
Implemented in `services/session_service.py` → `_upsert_exercise()`.

**Normalizer updated:** Returns `primary_muscle`, `movement_pattern`, and `superset_group`
per exercise. `NormalizedExercise` schema updated to include these fields.

### 4.1 Session Storage ✅
**Design: `workout_sessions` table**
```
id               INTEGER PK
user_id          INTEGER FK → users.id
created_at       DATETIME
workout_type     TEXT          ← "Push" / "Pull" / "Legs" / "Full Body" / etc.
duration_minutes INTEGER
notes            TEXT
total_volume_kg  FLOAT         ← sum of sets × reps × weight across all exercises
overall_score    INTEGER       ← from ai_coach score_breakdown.overall
ai_analysis      TEXT          ← full AI analysis JSON stored as string
```

**Design: `session_exercises` table**
```
id               INTEGER PK
session_id       INTEGER FK → workout_sessions.id
exercise_id      INTEGER FK → exercises.id (nullable — if upsert failed)
name             TEXT          ← always store name as logged (display fallback)
primary_muscle   TEXT          ← denormalized for fast queries without join
sets             INTEGER
reps             TEXT          ← "10", "8-12", "to failure"
weight_kg        FLOAT
notes            TEXT
```

**Why denormalize `primary_muscle` and `movement_pattern` on session_exercises?**
Volume-by-muscle and pattern-based queries run across thousands of rows. Having these
fields directly on the row avoids a join to `exercises` every time.

**Superset support:** `superset_group` integer on `session_exercises` — exercises sharing
the same group number within a session were performed back-to-back. Null = standalone.
Drop sets not handled (not needed at this stage).

**Flow:** `POST /workout/analyze` saves the session after analysis. No separate
"log session" endpoint — analysis and saving always happen together.
Saving is skipped silently if no `user_id` is provided.

### 4.2 Session History Endpoints ✅
- `GET /sessions/{user_id}`                ← list of all sessions (summary, no full analysis)
- `GET /sessions/{user_id}/{session_id}`   ← full session with exercises + stored AI analysis JSON

---

## Phase 5 — Progress Analysis

### 5.1 Strength Progression Tracking ❌
Query `session_exercises` grouped by `exercise_id` (or name for unmatched), ordered by
`workout_sessions.created_at`. For key compound lifts, track max weight per session.

Detect:
- **Progressive overload** — weight consistently increasing (positive signal)
- **Plateau** — same weight for 3+ sessions on a lift (needs intervention)
- **Regression** — weight going down over time (flag for investigation)

Output per lift: `[{date, weight_kg, sets, reps}]` array — ready for a chart.

### 5.2 Volume Trend Analysis ❌
Group `session_exercises` by `primary_muscle` and week. Sum `sets × reps × weight_kg`
per muscle per week.

Detect:
- Muscles being consistently overtrained (appear in every session)
- Muscles being consistently neglected (haven't appeared in 2+ weeks)
- Whether overall volume is increasing, stable, or declining

### 5.3 Consistency & Pattern Detection ❌
Query sessions by date, group by week.

Detect:
- Actual sessions per week vs `user.days_available` (are they hitting their target?)
- Which muscle groups are skipped across multiple sessions
- Whether the user repeatedly trains the same muscles (e.g. chest 4x/week, legs 0x)
- Long gaps between sessions (>7 days without logging)

### 5.4 AI Progress Summary ❌
After computing raw metrics (5.1–5.3), pass aggregated data to Groq with user profile
for a written human-readable report answering:
- Is progress on track relative to their goal and `target_deadline`?
- What has improved since they started?
- Where is the user lacking (consistently undertrained muscles, stalling lifts)?
- What patterns might be blocking progress (inconsistency, muscle imbalance, no overload)?
- Adjusted focus for the next 2–4 weeks based on actual data

New service: `services/progress_analyzer.py`

### 5.5 Progress Endpoints ❌
- `GET /progress/{user_id}`              ← full progress report (raw data + AI insights)
- `GET /progress/{user_id}/strength`     ← per-lift progression chart data
- `GET /progress/{user_id}/volume`       ← volume trends per muscle group per week
- `GET /progress/{user_id}/consistency`  ← training frequency and pattern report

**Progress report response shape:**
```json
{
  "period": "last 30 days",
  "session_count": 12,
  "strength_progression": {
    "bench_press": [{"date": "...", "weight_kg": 80, "sets": 4, "reps": "5"}]
  },
  "volume_trends": {
    "chest": [{"week": "2026-W10", "volume_kg": 2400}]
  },
  "score_trend": [{"date": "...", "overall": 7, "intensity": 6}],
  "consistency": {
    "sessions_per_week_avg": 3.2,
    "target_days_per_week": 4,
    "gap_periods": [{"from": "...", "to": "...", "days": 9}]
  },
  "muscle_frequency": {
    "overtrained": ["chest", "anterior deltoid"],
    "neglected": ["hamstrings", "rear deltoid"]
  },
  "ai_insights": {
    "progress_status": "on_track | slightly_behind | off_track",
    "overall_summary": "...",
    "top_strength": "...",
    "main_weakness": "...",
    "blocking_factors": ["...", "..."],
    "recommendation": "..."
  }
}
```

---

## Phase 6 — AI Recommendation Engine (Goal + History Aware)

### 6.1 Replace Hardcoded Recommendations ❌
Current recommendation engine in `services/recommendation_engine.py` is hardcoded:
- if back == 0 → recommend Pull Ups
- if legs == 0 → recommend Squats

Replace with AI-powered service using user goal, session history, and detected weaknesses.

### 6.2 Next Session Recommendation ❌
Based on last session and weekly training history, recommend exactly what the next
session should look like:
- Which muscle group to train and why (based on what hasn't been trained recently)
- Which exercises to do (with sets, reps, weight targets based on progression data)
- Rationale for each recommendation

### 6.3 Weekly Plan Generation ❌
Based on user profile (goal, days_available, fitness_level) and current progress,
generate a full week training plan:
- Day-by-day breakdown
- Each session: exercises, sets, reps, weight guidance
- Rest days specified
- Plan adjusts weekly based on actual logged sessions

### 6.4 Recommendation Endpoints ❌
- `GET /recommendations/{user_id}/next-session`  ← what to do next
- `GET /recommendations/{user_id}/weekly-plan`   ← full week plan

---

## Build Order Summary

```
Phase 1 — Foundation              ✅ Complete
  1.1 Project structure           ✅
  1.2 Routing                     ✅
  1.3 Exercise library            ⚠️ Static — replaced by DB table in Phase 4
  1.4 Database                    ✅

Phase 2 — User Profile            ✅ Complete
  2.1 Profile schema              ✅
  2.2 User DB model               ✅
  2.3 POST/GET /users             ✅
  2.3 PUT /users/{id}             ❌ Not yet implemented

Phase 3 — Workout Analysis        ✅ Complete
  3.1 Input normalization         ✅
  3.2 AI coaching analysis        ✅
  3.3 User-aware analysis         ✅
  Pending: primary_muscle in normalizer output

Phase 4 — Exercise Registry & Sessions  ✅ Complete
  4.0 exercises table + upsert    ✅
  4.1 workout_sessions table      ✅
  4.1 session_exercises table     ✅
  4.1 Save session on /analyze    ✅
  4.2 GET /sessions/{user_id}     ✅
  4.2 GET /sessions/{user_id}/{id}✅

Phase 5 — Progress Analysis       ✅ Complete
  5.1 Strength progression        ✅
  5.2 Volume trends               ✅
  5.3 Consistency & patterns      ✅
  5.4 AI progress summary         ✅
  5.5 Progress endpoints          ✅

Phase 6 — Recommendation Engine   ✅ Complete
  6.1 Replace hardcoded logic     ✅
  6.2 Next session recommendation ✅
  6.3 Weekly plan generation      ✅
  6.4 Recommendation endpoints    ✅
```

---

## Current API Endpoints

| Method | Endpoint                          | Status | Description                              |
|--------|-----------------------------------|--------|------------------------------------------|
| POST   | /workout/analyze                  | ✅     | Normalize + AI analyze + save session    |
| GET    | /exercises                        | ⚠️     | List exercises (static library, buggy)   |
| POST   | /users                            | ✅     | Create user profile                      |
| GET    | /users/{user_id}                  | ✅     | Get user profile                         |
| PUT    | /users/{user_id}                  | ❌     | Update user profile                      |
| GET    | /sessions/{user_id}               | ✅     | Session history summary for user         |
| GET    | /sessions/{user_id}/{session_id}  | ✅     | Full session with exercises + AI analysis|
| GET    | /progress/{user_id}               | ✅     | Full progress report                     |
| GET    | /progress/{user_id}/strength      | ✅     | Per-lift progression chart data          |
| GET    | /progress/{user_id}/volume        | ✅     | Volume trends per muscle group           |
| GET    | /progress/{user_id}/consistency   | ✅     | Training frequency and pattern report    |
| GET    | /recommendations/{user_id}/next-session  | ✅     | Next session recommendation       |
| GET    | /recommendations/{user_id}/weekly-plan   | ✅     | Full week plan                    |

---

## File Structure (current + planned)

```
app/
├── main.py                        ← router registration only
├── database.py                    ← SQLAlchemy setup, get_db()
├── exercise_library.py            ← legacy static list (keep for reference)
│
├── models/
│   ├── __init__.py                ✅ imports all models so Base.metadata.create_all works
│   ├── user.py                    ✅ User table
│   ├── session.py                 ✅ WorkoutSession + SessionExercise tables
│   └── exercise.py                ✅ Exercise registry table
│
├── schemas/
│   ├── session_schema.py          ✅ NormalizedWorkout, NormalizedExercise, etc.
│   └── user_schema.py             ✅ UserCreate, UserResponse
│
├── routes/
│   ├── workout.py                 ✅ POST /workout/analyze (saves session after analysis)
│   ├── users.py                   ✅ POST+GET /users
│   ├── exercises.py               ⚠️ GET /exercises (static, buggy filter)
│   ├── sessions.py                ✅ GET /sessions/{user_id}, GET /sessions/{user_id}/{id}
│   ├── progress.py                ✅ GET /progress/*
│   └── recommendations.py         ✅ GET /recommendations/*
│
└── services/
    ├── normalizer.py              ✅ Extracts name, sets, reps, weight, primary_muscle, movement_pattern, superset_group
    ├── ai_coach.py                ✅ AI workout analysis
    ├── session_service.py         ✅ _upsert_exercise(), save_session()
    ├── progress_service.py        ✅ Compute strength/volume/consistency metrics
    ├── progress_analyzer.py       ✅ AI progress summary (Groq call)
    ├── recommendation_service.py  ✅ Gather DB context for recommendations
    └── recommendation_engine.py   ✅ Groq calls for next session + weekly plan
```

---

## Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Framework | FastAPI | Fast, async-ready, auto Swagger docs |
| AI Model | Groq llama-3.3-70b-versatile | Fast inference, strong reasoning |
| AI Temperature | 0.4 | Focused and consistent responses |
| Data validation | Pydantic | Native FastAPI integration |
| Database | SQLite (dev) → PostgreSQL (prod) | SQLite for simplicity now |
| ORM | SQLAlchemy | Works with both SQLite and PostgreSQL |
| Exercise ID strategy | Upsert by name (case-insensitive) | Auto-growing registry, no manual seeding |
| AI analysis storage | Full JSON as TEXT column | Avoid complex schema for nested data; no re-analysis needed |
| primary_muscle denormalized | Stored on session_exercises row | Fast volume-by-muscle queries without joins |

---

## Key Architectural Rules
- `main.py` only registers routers — no endpoint logic
- Each feature has its own route file
- All AI calls go through services — never directly from routes
- Normalization always runs before analysis — routes never pass raw input to AI
- User profile is always attached to analysis calls (user_id required on /workout/analyze)
- Session saving always happens as part of analysis — no separate log endpoint
- Exercise lookup is always an upsert — never fail if exercise is unknown

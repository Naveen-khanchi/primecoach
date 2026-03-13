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
Clean separation of routes, services, and schemas.
```
app/
├── main.py               ← app setup + router registration only
├── routes/               ← one file per feature
├── schemas/              ← pydantic models
└── services/             ← business logic
```

### 1.2 Routing ✅
Three routers registered in main.py:
- POST /workout/analyze   ← AI analysis endpoint
- GET  /exercises         ← fetch exercise library
- POST /sessions          ← create a session (old flow)
- GET  /sessions          ← list sessions (old flow)

### 1.3 Exercise Library ⚠️
Static list of 6 hardcoded exercises (Chest, Back, Legs only).
Needs to be expanded significantly to cover all muscle groups and exercise types
before recommendations can be meaningful.

### 1.4 Database ✅
Currently using in-memory lists. Data is lost on every server restart.
Need to introduce a real database (SQLite for development, PostgreSQL for production)
to persist users, sessions, and progress data.
- Tables needed: users, workout_sessions, session_exercises
- ORM: SQLAlchemy recommended

---

## Phase 2 — User Profile

### 2.1 User Profile Schema ✅
Before any analysis or recommendation can be personalized, the system needs to know
who the user is. A profile must be collected on first use.

Fields required:
- Name, age, weight (kg), height (cm)
- Gender
- Fitness level: beginner / intermediate / advanced
- Primary goal: muscle gain / fat loss / strength / endurance / general fitness
- Target deadline (optional): e.g. "12 weeks"
- Injuries or limitations (optional): e.g. "bad left knee"
- Days available to train per week

### 2.2 Strength Baseline ✅
To make strength analysis meaningful, the system needs to know the user's starting
point for key compound lifts. This is collected once during onboarding and updated
over time.

Key lifts to capture:
- Bench Press (kg)
- Squat (kg)
- Deadlift (kg)
- Overhead Press (kg)
- Pull Ups (max reps)

### 2.3 User Profile Endpoints ✅
- POST /users              ← create user + collect profile + strength baseline
- GET  /users/{user_id}    ← fetch user profile
- PUT  /users/{user_id}    ← update profile (weight change, goal change, etc.)

---

## Phase 3 — Workout Analysis (AI)

### 3.1 Input Normalization ✅
Accepts any format of workout input — natural language, shorthand, structured JSON,
bullet points. Uses Groq (llama-3.3-70b) to extract and standardize into a
NormalizedWorkout object before analysis.

Handles:
- Exercise name standardization (rdl → Romanian Deadlift)
- Unit conversion (lbs → kg)
- Shorthand decoding (3x10 → sets: 3, reps: "10")
- Workout type inference from exercise names
- RPE and effort notes capture

### 3.2 AI Coaching Analysis ✅
Uses Groq (llama-3.3-70b) to analyze the normalized workout and return:
- Score breakdown (intensity, volume, exercise selection, muscle balance)
- Analysis (training stimulus, muscle focus, exercise order quality)
- Strength & volume insights (training zones, total volume in kg, highlights)
- Muscle balance (well trained vs undertrained, with injury risk explanation)
- Recovery (48h/72h rest per muscle, nutrition tip, sleep note)
- Improvements (exactly 3, each referencing a specific exercise)
- Warnings (injury risks, dangerous imbalances)
- Next workout plan (4-6 exercises with rationale)
- Coach message (one personalized sentence)

### 3.3 User-Aware Analysis ❌
Currently the AI analyzes sessions with no knowledge of who the user is.
Once user profiles exist, analysis must be personalized:
- Adjust scoring based on fitness level (beginner vs advanced standards)
- Reference the user's goal in every recommendation
- Flag when workout doesn't align with stated goal
  (e.g. user goal is strength but training in hypertrophy rep ranges)
- Compare weights used against the user's baseline strength numbers

---

## Phase 4 — Session History & Persistence

### 4.1 Session Storage ❌
Workout sessions must be saved to the database with:
- user_id (linked to user profile)
- date and time
- list of exercises with sets, reps, weight
- workout type
- AI analysis result (stored so it doesn't need to be regenerated)

### 4.2 Session History Endpoint ❌
- GET /sessions/{user_id}              ← all sessions for a user
- GET /sessions/{user_id}/{session_id} ← single session with full analysis

---

## Phase 5 — Progress Analysis

### 5.1 Strength Progression Tracking ❌
Compare weight used on key lifts across sessions over time.
Detect:
- Progressive overload (weight going up — positive signal)
- Plateaus (same weight for 3+ sessions on a lift — needs intervention)
- Regression (weight going down — flag for investigation)

Output: per-lift progression chart data and a written summary.

### 5.2 Volume Trend Analysis ❌
Track total session volume (sets × reps × weight) over time per muscle group.
Detect:
- Which muscles are being overtrained
- Which muscles are being consistently neglected
- Whether overall volume is increasing, stable, or declining

### 5.3 Consistency & Pattern Detection ❌
Analyze session frequency and muscle group coverage over time.
Detect:
- How many days per week the user is actually training
- Which muscle groups are being skipped repeatedly
- Whether the user is following a balanced program or overloading one area
- Rest day patterns

### 5.4 Progress Analysis Endpoint ❌
- GET /progress/{user_id}              ← full progress report
- GET /progress/{user_id}/strength     ← strength progression per lift
- GET /progress/{user_id}/volume       ← volume trends per muscle group
- GET /progress/{user_id}/consistency  ← training consistency report

### 5.5 AI Progress Summary ❌
After generating the raw progress data, pass it to the AI to write a
human-readable progress report:
- What has improved since they started
- What is stalling and why
- What the biggest pattern or mistake is across all sessions
- Adjusted plan for the next 2-4 weeks based on actual progress

---

## Phase 6 — AI Recommendation Engine (Goal + History Aware)

### 6.1 Replace Hardcoded Recommendations ❌
Current recommendation engine is hardcoded:
- if back == 0 → recommend Pull Ups
- if legs == 0 → recommend Squats

This needs to be replaced with an AI-powered recommendation service that uses:
- User's goal
- Session history (what has been trained recently)
- Detected weaknesses from progress analysis
- Current training split

### 6.2 Next Session Recommendation ❌
Based on the user's last session and their weekly training history, recommend
exactly what the next session should look like:
- Which muscle group to train
- Which exercises to do (with sets, reps, weight targets)
- Why this session is being recommended

### 6.3 Weekly Plan Generation ❌
Based on user profile (goal, days available, fitness level) and current progress,
generate a full week training plan:
- Day-by-day breakdown
- Each session includes exercises, sets, reps, weight guidance
- Rest days specified
- Plan adjusts every week based on actual logged sessions

### 6.4 Recommendation Endpoint ❌
- GET /recommendations/{user_id}/next-session  ← what to do next
- GET /recommendations/{user_id}/weekly-plan   ← full week plan

---

## Build Order Summary

```
Phase 1 — Foundation          ✅ Complete
  1.1 Project structure       ✅
  1.2 Routing                 ✅
  1.3 Exercise library        ⚠️ Needs expansion
  1.4 Database                ❌ Not started

Phase 2 — User Profile        ❌ Not started
  2.1 Profile schema
  2.2 Strength baseline
  2.3 Profile endpoints

Phase 3 — Workout Analysis    ⚠️ Partially complete
  3.1 Input normalization     ✅
  3.2 AI coaching analysis    ✅
  3.3 User-aware analysis     ❌ Not started

Phase 4 — Session History     ❌ Not started
  4.1 Session storage
  4.2 Session history endpoints

Phase 5 — Progress Analysis   ❌ Not started
  5.1 Strength progression
  5.2 Volume trend analysis
  5.3 Consistency & patterns
  5.4 Progress endpoints
  5.5 AI progress summary

Phase 6 — Recommendation      ❌ Not started
  6.1 Replace hardcoded logic
  6.2 Next session recommendation
  6.3 Weekly plan generation
  6.4 Recommendation endpoints
```

---

## Current API Endpoints

| Method | Endpoint               | Status | Description                        |
|--------|------------------------|--------|------------------------------------|
| POST   | /workout/analyze       | ✅     | Normalize + AI analyze a session   |
| GET    | /exercises             | ✅     | List exercises with filters        |
| POST   | /sessions              | ⚠️     | Create session (old flow, basic)   |
| GET    | /sessions              | ⚠️     | List sessions (in-memory only)     |
| POST   | /users                 | ❌     | Create user profile                |
| GET    | /users/{id}            | ❌     | Get user profile                   |
| PUT    | /users/{id}            | ❌     | Update user profile                |
| GET    | /sessions/{user_id}    | ❌     | Get session history for user       |
| GET    | /progress/{user_id}    | ❌     | Full progress report               |
| GET    | /recommendations/{id}  | ❌     | Next session / weekly plan         |

---

## Technical Decisions

| Decision | Choice | Reason |
|---|---|---|
| Framework | FastAPI | Fast, async-ready, auto Swagger docs |
| AI Model | Groq llama-3.3-70b-versatile | Fast inference, strong reasoning |
| AI Temperature | 0.4 | Focused and consistent responses |
| Data validation | Pydantic | Native FastAPI integration |
| Database (planned) | SQLite → PostgreSQL | SQLite for dev simplicity, Postgres for production |
| ORM (planned) | SQLAlchemy | Industry standard, works with both DBs |

---

## Key Architectural Rules
- main.py only registers routers — no endpoint logic
- Each feature has its own route file
- All AI calls go through services — never directly from routes
- Normalization always runs before analysis — routes never pass raw input to AI
- User profile must be attached to every analysis call once Phase 2 is complete

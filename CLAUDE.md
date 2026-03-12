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

PrimeCoach is a FastAPI backend for AI-powered workout coaching. It analyzes workout sessions for muscle group balance and uses the Groq API (llama-3.3-70b-versatile) to generate coaching feedback.

**Entry point:** `app/main.py` — defines the FastAPI app and core endpoints (`GET /exercises`, `POST /sessions`, `GET /sessions`, `POST /ai-test`), plus includes the workout router.

**Request flow for `POST /sessions`:**
1. Receives `WorkoutSessionCreate` (user_id + list of exercise name strings)
2. `services/analyzer.py` maps exercise names to muscle groups via the exercise library and returns a muscle distribution dict
3. `services/recommendation_engine.py` checks which muscle groups are missing and returns hardcoded recommendations
4. Returns `SessionResponse` combining session, analysis, and recommendations

**Request flow for AI endpoints (`POST /ai-test`, `POST /workout/analyze`):**
1. Receives a workout dict
2. `services/ai_coach.py` sends it to Groq with a structured prompt
3. Returns parsed JSON with score, analysis, muscle balance, and next workout plan

**Key files:**
- `app/exercise_library.py` — static list of 6 `Exercise` objects (Chest/Back/Legs only)
- `app/schemas/session_schema.py` — all Pydantic models
- `app/routes/workout.py` — mounted at `/workout`, adds `POST /workout/analyze`

**Storage:** Sessions are stored in an in-memory list `sessions_db` in `main.py` — no persistence between restarts.

**Known issues:**
- The `/workout` router prefix creates a double-prefixed path: `/workout/workout/analyze`
- Filter in `GET /exercises` has a bug: `difficulty["difficulty"]` references the wrong variable
- No error handling around Groq API calls or JSON parsing

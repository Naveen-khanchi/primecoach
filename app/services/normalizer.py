import os
import json
from groq import Groq, RateLimitError, AuthenticationError, APIConnectionError, InternalServerError
from dotenv import load_dotenv
from fastapi import HTTPException
from app.schemas.session_schema import NormalizedWorkout

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def normalize_workout_input(raw_input) -> NormalizedWorkout:
    """
    Accepts any workout input format — natural language, partial JSON, structured dict, plain text —
    and converts it into a clean NormalizedWorkout object.
    """

    prompt = f"""
    You are a fitness data extraction assistant. Your only job is to extract and structure workout data — not analyze it.

    The input may be in any format:
    - Natural language: "did 3 sets of bench at 80kg, then some squats"
    - Shorthand: "Bench 3x10 @ 80kg, OHP 3x8 @ 50kg"
    - Structured JSON
    - A mix of the above
    - Incomplete or partial information

    Extract all available information and return ONLY valid JSON in this exact format:

    {{
        "exercises": [
            {{
                "name": "<full standardized name, e.g. 'Bench Press' not 'bench' or 'BP'>",
                "sets": <integer or null>,
                "reps": "<string: '8-10', '12', 'to failure', 'AMRAP' — or null>",
                "weight_kg": <float or null>,
                "primary_muscle": "<single primary muscle targeted: chest / back / shoulders / biceps / triceps / hamstrings / quads / glutes / abs / calves / forearms / traps / null>",
                "movement_pattern": "<push / pull / squat / hinge / lunge / carry / rotation / null>",
                "superset_group": <integer if this exercise is performed back-to-back with another — group them with the same number; null for standalone>,
                "notes": "<RPE, tempo, form notes, or any extra detail — or null>"
            }}
        ],
        "workout_type": "<a short label describing the session — these are illustrative, NOT a fixed list to pick from: 'Chest', 'Shoulders', 'Chest & Triceps', 'Back & Biceps', 'Push', 'Pull', 'Legs', 'Upper Body', 'Full Body', 'Cardio', 'Endurance', 'Strength Training', 'Mobility', or null>",
        "duration_minutes": <integer or null>,
        "notes": "<overall session notes: how the user felt, energy level, injuries, PRs, etc. — or null>"
    }}

    Extraction rules:
    - Standardize exercise names: full name, title case (e.g. "rdl" → "Romanian Deadlift", "ohp" → "Overhead Press", "lat pd" → "Lat Pulldown")
    - Shorthand like "3x10" means sets=3, reps="10"
    - If reps is a single number, store as string: 10 → "10"
    - Convert lbs to kg: multiply by 0.453592, round to 1 decimal place
    - workout_type: prefer how a lifter would actually describe the session over a rigid category. There is no fixed enum — pick whatever label a real lifter would use, don't force-fit one of the examples below.
        - If the user states the type themselves (even casually, e.g. "chest and triceps day", "just did shoulders", "endurance work"), use their own wording, title-cased.
        - Otherwise, infer it from the primary_muscle values across the exercises:
            1 dominant muscle group → name that muscle alone, e.g. "Chest", "Back", "Shoulders" — do NOT pad it into a pair
            2 dominant muscle groups → name both, e.g. "Chest & Triceps", "Back & Biceps"
            3+ muscle groups with no clear focus, following a push/pull/squat movement-pattern split → "Push" / "Pull" / "Legs"
            Mix of push + pull movements → "Upper Body"
            Mix of upper + lower body → "Full Body"
            High-rep/low-rest work aimed at muscular or cardiovascular endurance rather than max strength → "Endurance"
            Primarily running/cycling/rowing-style conditioning, no resistance work → "Cardio"
            Stretching/activation only → "Mobility"
    - primary_muscle: the single most targeted muscle for that exercise (e.g. Bench Press → "chest", Squat → "quads", RDL → "hamstrings")
    - movement_pattern: the fundamental movement the exercise belongs to:
        Bench Press, Overhead Press, Dips, Push Ups → "push"
        Rows, Pulldowns, Pull Ups, Face Pulls → "pull"
        Squats, Leg Press, Hack Squat → "squat"
        Deadlifts, RDL, Good Mornings, Hip Thrusts → "hinge"
        Lunges, Step Ups, Split Squats → "lunge"
        Carries, Farmer's Walk → "carry"
        Cable Twists, Woodchops → "rotation"
    - superset_group: if exercises are mentioned as a superset or back-to-back, assign them the same integer (1, 2, 3...). Standalone exercises get null.
    - Capture RPE mentions (e.g. "felt like RPE 8", "hard set") in the exercise notes field
    - If a field is genuinely unknown, use null — never invent data
    - Return ONLY the JSON object, no markdown, no explanation, no extra text

    Input:
    {raw_input}
    """

    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {"role": "system", "content": "You are a precise fitness data extraction assistant. You extract and structure workout data exactly as instructed. You output only valid JSON with no markdown, no commentary, and no invented data."},
                {"role": "user", "content": prompt}
            ]
        )
    except AuthenticationError:
        raise HTTPException(status_code=500, detail="Groq API key is invalid or missing")
    except RateLimitError:
        raise HTTPException(status_code=503, detail="Groq rate limit reached — try again shortly")
    except APIConnectionError:
        raise HTTPException(status_code=503, detail="Could not connect to Groq API")
    except InternalServerError:
        raise HTTPException(status_code=503, detail="Groq service error — try again later")

    content = response.choices[0].message.content
    content = content.replace("```json", "").replace("```", "").strip()

    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail="Groq returned malformed JSON during normalization")

    return NormalizedWorkout(**data)

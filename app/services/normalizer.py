import os
import json
from groq import Groq
from dotenv import load_dotenv
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
                "notes": "<RPE, tempo, form notes, superset info, or any extra detail — or null>"
            }}
        ],
        "workout_type": "<Push / Pull / Legs / Upper Body / Lower Body / Full Body / Cardio / Mobility / null>",
        "duration_minutes": <integer or null>,
        "notes": "<overall session notes: how the user felt, energy level, injuries, PRs, etc. — or null>"
    }}

    Extraction rules:
    - Standardize exercise names: full name, title case (e.g. "rdl" → "Romanian Deadlift", "ohp" → "Overhead Press", "lat pd" → "Lat Pulldown")
    - Shorthand like "3x10" means sets=3, reps="10"
    - If reps is a single number, store as string: 10 → "10"
    - Convert lbs to kg: multiply by 0.453592, round to 1 decimal place
    - If workout_type is not stated, infer it from the exercises:
        Push exercises (bench, press, dips, triceps) → "Push"
        Pull exercises (rows, pulldowns, curls, deadlifts) → "Pull"
        Leg exercises (squats, lunges, leg press, RDL) → "Legs"
        Mix of push + pull → "Upper Body"
        Mix of upper + lower → "Full Body"
    - Capture RPE mentions (e.g. "felt like RPE 8", "hard set") in the exercise notes field
    - Capture rest times, tempo, or superset info in notes if mentioned
    - If a field is genuinely unknown, use null — never invent data
    - Return ONLY the JSON object, no markdown, no explanation, no extra text

    Input:
    {raw_input}
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a precise fitness data extraction assistant. You extract and structure workout data exactly as instructed. You output only valid JSON with no markdown, no commentary, and no invented data."},
            {"role": "user", "content": prompt}
        ]
    )

    content = response.choices[0].message.content
    content = content.replace("```json", "").replace("```", "").strip()

    data = json.loads(content)
    return NormalizedWorkout(**data)

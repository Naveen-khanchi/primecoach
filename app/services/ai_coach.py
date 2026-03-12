import os
from groq import Groq
from dotenv import load_dotenv
from app.schemas.session_schema import NormalizedWorkout

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def _format_workout(workout: NormalizedWorkout) -> str:
    lines = []

    if workout.workout_type:
        lines.append(f"Workout Type: {workout.workout_type}")
    if workout.duration_minutes:
        lines.append(f"Duration: {workout.duration_minutes} minutes")
    if workout.notes:
        lines.append(f"Session Notes: {workout.notes}")

    lines.append("\nExercises:")
    for i, ex in enumerate(workout.exercises, 1):
        parts = [f"  {i}. {ex.name}"]
        if ex.sets is not None:
            parts.append(f"{ex.sets} sets")
        if ex.reps is not None:
            parts.append(f"{ex.reps} reps")
        if ex.weight_kg is not None:
            parts.append(f"@ {ex.weight_kg} kg")
        if ex.notes:
            parts.append(f"({ex.notes})")
        lines.append(" | ".join(parts) if len(parts) > 1 else parts[0])

    return "\n".join(lines)


def analyze_workout(workout: NormalizedWorkout):
    workout_summary = _format_workout(workout)

    prompt = f"""
    Analyze the following workout session logged by a client:

    ---- WORKOUT LOG ----
    {workout_summary}
    ---------------------

    Instructions for each section:

    1. SCORE BREAKDOWN
    Score each dimension 0-10 (integers only). Be strict — 10 is perfect, 7 is good, 5 is average.
    - intensity: based on weight used relative to typical strength standards and rep ranges
    - volume: total sets and exercises — is it too little, appropriate, or excessive?
    - exercise_selection: are the chosen exercises effective and complementary?
    - muscle_balance: are opposing muscle groups (push/pull, anterior/posterior) addressed?
    - overall: weighted average of the above (intensity 30%, volume 25%, selection 25%, balance 20%)
    If sets/reps/weight data is missing for some exercises, note this and score conservatively.

    2. ANALYSIS
    2-3 sentences. State: what training stimulus this workout creates (hypertrophy/strength/endurance based on rep ranges),
    which muscle groups were the primary focus, and how well the exercise order served the session goal.
    Be specific — reference the actual exercises logged.

    3. STRENGTH & VOLUME INSIGHTS
    - Identify the training zone for each exercise (1-5 reps = strength, 6-12 = hypertrophy, 13+ = endurance/conditioning)
    - Flag any exercises where the weight seems too light or too heavy for the rep range given
    - Estimate total session volume (sets × reps × weight) if weight data is available; otherwise note it's unavailable
    - Call out any exercise that stands out as particularly strong or weak relative to typical standards

    4. MUSCLE BALANCE
    - well_trained: list specific muscles (not just "chest" — say "pectoralis major, anterior deltoid")
    - undertrained: list muscles that were skipped or insufficiently loaded, explain the imbalance risk
      (e.g. "No posterior chain work — risk of anterior dominance and lower back issues")

    5. RECOVERY
    - Which specific muscles need 48h vs 72h rest before training again
    - One nutrition tip relevant to this workout type (e.g. protein timing, carb replenishment)
    - Sleep quality note if the session was high volume or high intensity

    6. IMPROVEMENTS
    Give exactly 3 improvements. Each must:
    - Reference a specific exercise from this session
    - Be actionable (a number, a swap, a technique cue — not "increase intensity")
    - State the benefit (e.g. "Add 1 set of Romanian Deadlifts — this session had zero hamstring work")

    7. WARNINGS
    List any red flags: dangerous imbalances, overtraining signals, injury-risk patterns, or missing muscle groups
    that could cause problems over time. Empty array if none.

    8. NEXT WORKOUT PLAN
    Recommend the next session that best complements this one.
    - Target the muscles that were undertrained today
    - Include 4-6 exercises with sets, reps, and suggested weight (or % of typical working weight)
    - Add a one-line rationale for why each exercise was chosen

    9. COACH MESSAGE
    One sentence. Direct and specific to THIS workout. Motivating but honest.
    Example: "Solid push session — add a rowing movement next time to keep your shoulders healthy."

    Return ONLY valid JSON in this exact format. All integers must be integers (not strings):

    {{
        "score_breakdown": {{
            "intensity": <integer 0-10>,
            "volume": <integer 0-10>,
            "exercise_selection": <integer 0-10>,
            "muscle_balance": <integer 0-10>,
            "overall": <integer 0-10>
        }},
        "analysis": "<2-3 sentences>",
        "strength_volume_insights": {{
            "training_zones": {{"<exercise name>": "<Strength / Hypertrophy / Endurance>"}},
            "total_volume_kg": <number or null if data unavailable>,
            "highlights": "<1-2 sentences on standout lifts or volume observations>"
        }},
        "muscle_balance": {{
            "well_trained": ["<muscle>"],
            "undertrained": ["<muscle — reason>"]
        }},
        "recovery": {{
            "rest_48h": ["<muscle>"],
            "rest_72h": ["<muscle>"],
            "nutrition_tip": "<tip>",
            "sleep_note": "<note or null>"
        }},
        "improvements": [
            {{"action": "<specific change>", "benefit": "<why>"}}
        ],
        "warnings": ["<warning or empty array>"],
        "next_workout_plan": [
            {{
                "exercise": "<name>",
                "sets": <integer>,
                "reps": "<range>",
                "suggested_weight": "<weight or % guidance>",
                "rationale": "<one line why>"
            }}
        ],
        "coach_message": "<one sentence>"
    }}

    Do not include markdown, backticks, or any text outside the JSON object.
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are PrimeCoach — an elite strength and conditioning coach with 15+ years of experience "
                    "training athletes from beginners to competitive lifters. You are direct, specific, and data-driven. "
                    "You never give vague advice. When data is missing from the workout log, you acknowledge it and "
                    "work with what is available. You always reference the client's actual exercises — never give "
                    "generic responses that could apply to any workout."
                )
            },
            {"role": "user", "content": prompt}
        ],
        temperature=0.4
    )

    import json

    content = response.choices[0].message.content

    content = content.replace("```json", "").replace("```", "").strip()

    return json.loads(content)
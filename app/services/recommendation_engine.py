import os
import json
from groq import Groq, RateLimitError, AuthenticationError, APIConnectionError, InternalServerError
from dotenv import load_dotenv
from fastapi import HTTPException
from app.services.ai_coach import _format_user_context

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def recommend_next_session(user, context: dict) -> dict:
    """
    Given user profile and recent training context, recommend the next session.
    """
    user_context = _format_user_context(user)
    summary = _format_next_session_context(context)

    prompt = f"""
    You are PrimeCoach — an elite strength and conditioning coach. Based on this client's
    profile and recent training history, recommend exactly what their next workout session should be.

    {user_context}

    ---- RECENT TRAINING CONTEXT ----
    {summary}
    ----------------------------------

    Guidelines:
    - Target muscles that haven't been trained recently or are undertrained relative to the client's goal
    - If the last session was Push, recommend Pull or Legs next (avoid consecutive same-muscle training)
    - Set weight targets based on their actual logged weights — be specific (e.g. "use 82.5kg" not "increase weight")
    - Tailor rep ranges to their goal (strength: 3-6 reps, hypertrophy: 8-12, endurance: 15+)
    - Account for any injuries in the client profile
    - Include 4-6 exercises only — quality over quantity

    Return ONLY valid JSON in this exact format:

    {{
        "recommended_workout_type": "<Push / Pull / Legs / Upper Body / Lower Body / Full Body>",
        "focus_muscles": ["<muscle 1>", "<muscle 2>"],
        "rationale": "<1-2 sentences explaining why this session was chosen>",
        "exercises": [
            {{
                "name": "<exercise name>",
                "sets": <integer>,
                "reps": "<rep range or number>",
                "weight_kg": <float or null if bodyweight>,
                "rationale": "<one line why this exercise was chosen>"
            }}
        ],
        "coach_tip": "<one specific tip for this session>"
    }}

    Do not include markdown, backticks, or any text outside the JSON object.
    """

    return _call_groq(prompt, "next session recommendation")


def recommend_weekly_plan(user, context: dict) -> dict:
    """
    Given user profile and recent training history, generate a full week training plan.
    """
    user_context = _format_user_context(user)
    summary = _format_weekly_plan_context(user, context)

    prompt = f"""
    You are PrimeCoach — an elite strength and conditioning coach. Generate a complete,
    personalized weekly training plan for this client based on their profile and recent history.

    {user_context}

    ---- RECENT TRAINING CONTEXT ----
    {summary}
    ----------------------------------

    Guidelines:
    - The plan must have exactly {user.days_available} training days and the rest as rest days
    - Distribute muscle groups to avoid training the same muscle on consecutive days
    - Prioritize muscles that have been neglected recently
    - Set weight targets based on their actual logged weights where available
    - Tailor all rep ranges to their stated goal
    - Each training day should have 4-6 exercises
    - Account for any injuries in the client profile

    Return ONLY valid JSON in this exact format:

    {{
        "weekly_plan": [
            {{
                "day": "<Monday / Tuesday / etc.>",
                "type": "<workout type or 'Rest'>",
                "focus_muscles": ["<muscle>"],
                "exercises": [
                    {{
                        "name": "<exercise name>",
                        "sets": <integer>,
                        "reps": "<rep range>",
                        "weight_kg": <float or null>,
                        "rationale": "<one line why>"
                    }}
                ]
            }}
        ],
        "weekly_notes": "<2-3 sentences on the overall plan structure and key focus for this week>"
    }}

    For rest days, set type to "Rest", focus_muscles to [], and exercises to [].
    Do not include markdown, backticks, or any text outside the JSON object.
    """

    return _call_groq(prompt, "weekly plan")


def _call_groq(prompt: str, context_label: str) -> dict:
    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are PrimeCoach — an elite strength and conditioning coach. "
                        "You create specific, data-driven training recommendations. "
                        "You always reference actual weights and training history. "
                        "You never give generic advice."
                    )
                },
                {"role": "user", "content": prompt}
            ],
            temperature=0.4
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
        return json.loads(content)
    except json.JSONDecodeError:
        raise HTTPException(status_code=502, detail=f"Groq returned malformed JSON during {context_label}")


def _format_next_session_context(context: dict) -> str:
    lines = []

    last = context.get("last_session")
    if last:
        lines.append(f"Last Session: {last['date']} — {last['workout_type']} (score: {last['overall_score']}/10)")
        lines.append("Exercises performed:")
        for ex in last["exercises"]:
            weight = f"@ {ex['weight_kg']}kg" if ex["weight_kg"] else "bodyweight"
            lines.append(f"  - {ex['name']}: {ex['sets']}x{ex['reps_int']} {weight} ({ex['primary_muscle']})")
    else:
        lines.append("Last Session: No sessions logged yet")

    if context["recent_muscles"]:
        freq = ", ".join(f"{m} ({c}x)" for m, c in context["recent_muscles"].items())
        lines.append(f"Muscles trained in last 7 days: {freq}")
    else:
        lines.append("Muscles trained in last 7 days: None")

    if context["strength_progression"]:
        lines.append("Current working weights:")
        for lift, data in context["strength_progression"].items():
            if data["history"]:
                last_weight = data["history"][-1]["weight_kg"]
                lines.append(f"  - {lift}: {last_weight}kg (trend: {data['trend']})")

    return "\n".join(lines)


def _format_weekly_plan_context(user, context: dict) -> str:
    lines = []

    lines.append(f"Training days available: {user.days_available} days/week")

    if context["recent_sessions"]:
        lines.append("Recent sessions:")
        for s in context["recent_sessions"]:
            lines.append(f"  - {s['date']}: {s['workout_type']} (score: {s['overall_score']}/10)")

    if context["recent_muscle_frequency"]:
        freq = ", ".join(f"{m}: {c}x" for m, c in context["recent_muscle_frequency"].items())
        lines.append(f"Muscle frequency (last 2 weeks): {freq}")
    else:
        lines.append("Muscle frequency (last 2 weeks): No data")

    if context["strength_baselines"]:
        lines.append("Current working weights:")
        for lift, weight in context["strength_baselines"].items():
            lines.append(f"  - {lift}: {weight}kg")

    return "\n".join(lines)

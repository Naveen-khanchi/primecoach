import os
import json
from groq import Groq, RateLimitError, AuthenticationError, APIConnectionError, InternalServerError
from dotenv import load_dotenv
from fastapi import HTTPException
from app.services.ai_coach import _format_user_context

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def analyze_progress(user, strength: dict, volume: dict, consistency: dict) -> dict:
    """
    Takes raw progress metrics and user profile, calls Groq for a written AI insights report.
    """
    user_context = _format_user_context(user)
    metrics_summary = _format_metrics(strength, volume, consistency)

    prompt = f"""
    You are PrimeCoach — an elite strength and conditioning coach. A client has shared their
    full training history with you. Analyze their progress data and provide a detailed, honest,
    personalized report.

    {user_context}

    ---- PROGRESS DATA ----
    {metrics_summary}
    -----------------------

    Use the client profile and progress data to answer the following. Be specific — reference
    actual lifts, muscles, and numbers from the data. Never give generic advice.

    1. PROGRESS STATUS
    Is the client on track, slightly behind, or off track relative to their goal and deadline?
    Base this on their strength trends, volume consistency, and training frequency.

    2. OVERALL SUMMARY
    2-3 sentences summarizing their overall progress. What is working? What isn't?

    3. TOP STRENGTH
    What is the client's biggest strength or most notable improvement? Reference specific lifts or muscles.

    4. MAIN WEAKNESS
    What is the single most important area holding them back? Be direct.

    5. BLOCKING FACTORS
    List 2-3 specific patterns from the data that are blocking progress
    (e.g. inconsistent training weeks, plateau on a key lift, neglected muscle groups).

    6. RECOMMENDATION
    One clear, actionable focus for the next 2-4 weeks based on everything you see.

    Return ONLY valid JSON in this exact format:

    {{
        "progress_status": "<on_track | slightly_behind | off_track>",
        "overall_summary": "<2-3 sentences>",
        "top_strength": "<specific observation>",
        "main_weakness": "<specific observation>",
        "blocking_factors": ["<factor 1>", "<factor 2>", "<factor 3>"],
        "recommendation": "<actionable focus for next 2-4 weeks>"
    }}

    Do not include markdown, backticks, or any text outside the JSON object.
    """

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are PrimeCoach — an elite strength and conditioning coach. "
                        "You analyze training history data and provide honest, specific, data-driven feedback. "
                        "You never give vague advice. You always reference actual numbers and lifts from the data provided."
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
        raise HTTPException(status_code=502, detail="Groq returned malformed JSON during progress analysis")


def _format_metrics(strength: dict, volume: dict, consistency: dict) -> str:
    lines = []

    # Consistency
    lines.append(f"Total Sessions Logged: {consistency['total_sessions']}")
    lines.append(f"Avg Sessions/Week: {consistency['sessions_per_week_avg']} (target: based on user profile)")
    lines.append(f"Weeks Tracked: {consistency.get('weeks_tracked', 'N/A')}")

    if consistency["gap_periods"]:
        gaps = ", ".join(f"{g['days']} days ({g['from']} → {g['to']})" for g in consistency["gap_periods"])
        lines.append(f"Training Gaps: {gaps}")
    else:
        lines.append("Training Gaps: None")

    # Muscle frequency
    if consistency["muscle_frequency"]:
        freq = ", ".join(f"{m}: {c} sessions" for m, c in consistency["muscle_frequency"].items())
        lines.append(f"Muscle Frequency: {freq}")

    # Volume trends
    if volume["overtrained"]:
        lines.append(f"Overtrained Muscles: {', '.join(volume['overtrained'])}")
    if volume["neglected"]:
        lines.append(f"Neglected Muscles: {', '.join(volume['neglected'])}")

    # Strength progression
    lines.append("\nStrength Progression:")
    if strength:
        for lift, data in strength.items():
            trend = data["trend"]
            history = data["history"]
            if history:
                first = history[0]["weight_kg"]
                last = history[-1]["weight_kg"]
                lines.append(f"  {lift}: {first}kg → {last}kg | trend: {trend} | {len(history)} sessions logged")
    else:
        lines.append("  No strength data available")

    # Score trend
    if consistency["score_trend"]:
        scores = consistency["score_trend"]
        avg_score = round(sum(s["overall"] for s in scores if s["overall"]) / len(scores), 1)
        first_score = scores[0]["overall"]
        last_score = scores[-1]["overall"]
        lines.append(f"\nWorkout Quality Score: {first_score} → {last_score} (avg: {avg_score}/10)")

    return "\n".join(lines)

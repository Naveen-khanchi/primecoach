import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def analyze_workout(workout_data):

    prompt = f"""
    You are an elite strength coach and workout analyst.

    Analyze the following workout session data:

    {workout_data}

    Your job is to behave like a professional gym coach analyzing a client's workout log.

    Provide the following:

    1. Workout Score (0-10)
    Evaluate intensity, volume, and exercise selection.

    2. Workout Analysis
    Explain what the workout focused on and how effective it was.

    3. Strength & Volume Insights
    Comment on weight progression, rep ranges, and training stimulus.

    4. Muscle Balance Analysis
    Identify muscles that are well trained and muscles that are undertrained.

    5. Improvements
    Suggest specific improvements for the next session.

    6. Next Workout Plan
    Recommend the next workout session including exercises, sets, and reps.

    Return ONLY valid JSON in this format:

    {{
    "workout_score": "number",
    "analysis": "text",
    "strength_volume_insights": "text",
    "muscle_balance": {{
        "well_trained": [],
        "undertrained": []
    }},
    "improvements": [],
    "next_workout_plan": [
        {{
            "exercise": "name",
            "sets": "number",
            "reps": "range"
        }}
    ]
    }}

    Do not include markdown, explanations, or backticks.
    Return only JSON.
    """

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are an expert fitness coach."},
            {"role": "user", "content": prompt}
        ]
    )

    import json

    content = response.choices[0].message.content

    content = content.replace("```json", "").replace("```", "").strip()

    return json.loads(content)
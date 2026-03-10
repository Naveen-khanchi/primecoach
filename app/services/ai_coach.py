import os
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


def analyze_workout(workout_data):

    prompt = f"""
    You are a professional strength coach.

    Analyze this workout session:

    {workout_data}

    Return ONLY valid JSON.

    Format:
    {{
    "analysis": "text",
    "weak_muscles": ["muscle1","muscle2"],
    "recommended_exercises": ["exercise1","exercise2"]
    }}

    Do not include markdown or backticks.
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
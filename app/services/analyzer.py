from app.exercise_library import EXERCISES


def analyze_session(exercise_names: list[str]):
    muscle_count = {}

    for muscle_group, exercises in EXERCISES.items():
        for exercise in exercises:
            if exercise["name"] in exercise_names:
                muscle = exercise["primary_muscle"]
                muscle_count[muscle] = muscle_count.get(muscle, 0) + 1

    return {
        "muscle_distribution": muscle_count,
        "total_exercises": len(exercise_names)
    }
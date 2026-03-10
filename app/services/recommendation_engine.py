def recommend_exercises(muscle_distribution):
    recommendations = []

    if muscle_distribution.get("back", 0) == 0:
        recommendations.append({
            "name": "Pull Ups",
            "reason": "Back muscles were not trained in this session"
        })
        recommendations.append({
            "name": "Barbell Rows",
            "reason": "Back muscles were not trained in this session"
        })

    if muscle_distribution.get("legs", 0) == 0:
        recommendations.append({
            "name": "Squats",
            "reason": "Leg muscles were not trained in this session"
        })

    return recommendations
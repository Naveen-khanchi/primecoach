import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://primecoach.onrender.com",
});

// Auth
export function signup(data: { name: string; email: string; phone?: string; password: string }) {
  return api.post("/users/signup", data);
}

export function login(data: { email: string; password: string }) {
  return api.post("/users/login", data);
}

// User
export function getUser(userId: number) {
  return api.get(`/users/${userId}`);
}

// Profile
export function createOrUpdateProfile(userId: number, data: {
  age?: number;
  weight_kg?: number;
  height_cm?: number;
  gender?: string;
  fitness_level?: string;
  goal?: string;
  days_available?: number;
  target_deadline?: string;
  injuries?: string;
  bench_press_kg?: number;
  squat_kg?: number;
  deadlift_kg?: number;
  overhead_press_kg?: number;
  pull_ups_max_reps?: number;
}) {
  return api.post(`/users/${userId}/profile`, data);
}

export function getProfile(userId: number) {
  return api.get(`/users/${userId}/profile`);
}

// Workout Analysis
export function analyzeWorkout(userId: number, input: string) {
  return api.post(`/workout/analyze?user_id=${userId}`, { workout_input: input });
}

// Sessions
export function getSessions(userId: number) {
  return api.get(`/sessions/${userId}`);
}

export function getSessionDetail(userId: number, sessionId: number) {
  return api.get(`/sessions/${userId}/${sessionId}`);
}

// Exercises
export function getExercises(filters?: { muscle?: string; difficulty?: string; movement_pattern?: string }) {
  return api.get("/exercises", { params: filters });
}

// Progress
export function getProgress(userId: number) {
  return api.get(`/progress/${userId}`);
}

export function getStrengthProgress(userId: number) {
  return api.get(`/progress/${userId}/strength`);
}

export function getVolumeProgress(userId: number) {
  return api.get(`/progress/${userId}/volume`);
}

export function getConsistency(userId: number) {
  return api.get(`/progress/${userId}/consistency`);
}

// Recommendations
export function getNextSession(userId: number) {
  return api.get(`/recommendations/${userId}/next-session`);
}

export function getWeeklyPlan(userId: number) {
  return api.get(`/recommendations/${userId}/weekly-plan`);
}

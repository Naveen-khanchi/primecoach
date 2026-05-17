"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { useState } from "react";
import {
  Dumbbell,
  Loader2,
  Trophy,
  Zap,
  BarChart3,
  Scale,
  AlertTriangle,
  MessageSquare,
  ShieldCheck,
  BedDouble,
} from "lucide-react";
import {analyzeWorkout} from "@/lib/api";
import axios from "axios";

const examples = [
  "Bench press 4x8 80kg, incline dumbbell press 3x10 30kg, cable flyes 3x12 15kg",
  "Did leg day: squats 4x5 100kg, leg press 3x12 180kg, RDL 3x10 80kg, calf raises 4x15",
  "Back workout - deadlift 3x5 140kg, barbell rows 3x10 60kg, pullups 3x8, face pulls 3x15",
];

const dummyResult = {
  workout_type: "Push",
  date: "Apr 12",
  score_breakdown: {
    overall: 7,
    intensity: 8,
    volume: 6,
    exercise_selection: 7,
    muscle_balance: 6,
  },
  exercises: [
    { name: "Bench Press", sets: 4, reps: "8", weight_kg: 80, primary_muscle: "Chest" },
    { name: "Incline DB Press", sets: 3, reps: "10", weight_kg: 30, primary_muscle: "Chest" },
    { name: "Cable Flyes", sets: 3, reps: "12", weight_kg: 15, primary_muscle: "Chest" },
    { name: "Tricep Pushdown", sets: 3, reps: "15", weight_kg: 20, primary_muscle: "Triceps" },
  ],
  analysis: {
    training_stimulus: "Good hypertrophy-focused push session with solid compound-first ordering.",
    muscle_focus: "Primary: Chest. Secondary: Triceps, Front Delts.",
  },
  improvements: [
    "Add an overhead press variation to target front delts and improve shoulder strength.",
    "Increase tricep volume — only one isolation exercise for a push day is insufficient.",
    "Consider adding lateral raises for balanced shoulder development.",
  ],
  warnings: [
    "Anterior deltoid overload risk — all pressing movements hit front delts without rear delt work.",
  ],
  recovery: {
    chest: "Rest 48 hours before next chest session",
    triceps: "Rest 48 hours before next tricep session",
    nutrition: "Aim for 30-40g protein within 2 hours post-workout",
  },
  coach_message:
    "Solid push session, Naveen. Your bench press volume is on point. Next time add lateral raises and an extra tricep movement to round things out.",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ScoreCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <Card className="p-4 flex flex-col items-center gap-2 text-center">
      <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="size-4 text-primary" />
      </div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}/10</p>
    </Card>
  );
}

export default function WorkoutLogPage() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any>(null);

  async function handleSubmit() {
    if (!input.trim()) return;
    setLoading(true);
    setError("");

    try{
      const userID = Number(localStorage.getItem("userId"));
      const res = await analyzeWorkout(userID, input);
      setResult(res.data);
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.data?.detail) {
        const detail = err.response.data.detail;
        setError(typeof detail === "string" ? detail : "Something Went Wrong. Please Try Again.");
      } else {
        setError("Something Went Wrong. Please Try Again.");
      }
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setInput("");
    setResult(null);
    setError("");
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="size-8 text-primary animate-spin" />
        <div className="text-center">
          <p className="text-lg font-semibold">Analyzing your workout...</p>
          <p className="text-sm text-muted-foreground mt-1">
            Our AI coach is reviewing your session
          </p>
        </div>
      </div>
    );
  }

  if (result) {
    const normalized = result.normalized_input;
    const analysis = result.analysis;

    return (
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workout Analysis</h1>
          <p className="text-muted-foreground mt-1">
            {normalized.workout_type ?? "Workout"} Day
          </p>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <ScoreCard icon={Trophy} label="Overall" value={analysis.score_breakdown.overall} />
          <ScoreCard icon={Zap} label="Intensity" value={analysis.score_breakdown.intensity} />
          <ScoreCard icon={BarChart3} label="Volume" value={analysis.score_breakdown.volume} />
          <ScoreCard icon={Dumbbell} label="Selection" value={analysis.score_breakdown.exercise_selection} />
          <ScoreCard icon={Scale} label="Balance" value={analysis.score_breakdown.muscle_balance} />
        </div>

        {/* Exercises Logged */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Exercises Logged</h2>
          <div className="divide-y">
            {normalized.exercises.map((ex: { name: string; sets: number; reps: string; weight_kg: number; primary_muscle: string }, i: number) => (
              <div key={i} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium">{ex.name}</p>
                  <p className="text-xs text-muted-foreground">{ex.primary_muscle}</p>
                </div>
                <p className="text-sm text-muted-foreground">
                  {ex.sets} x {ex.reps}{ex.weight_kg ? ` • ${ex.weight_kg} kg` : ""}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* Analysis + Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="size-5 text-green-600" />
              <h2 className="text-lg font-semibold">Analysis</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{analysis.analysis}</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="size-5 text-amber-500" />
              <h2 className="text-lg font-semibold">Improvements</h2>
            </div>
            <ul className="space-y-3">
              {analysis.improvements.map((imp: { action: string; benefit: string }, i: number) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-amber-500 font-semibold shrink-0">{i + 1}.</span>
                  <span><span className="text-foreground font-medium">{imp.action}</span> — {imp.benefit}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Coach Message */}
        <Card className="p-6 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Coach Message</h2>
          </div>
          <p className="text-sm leading-relaxed">{analysis.coach_message}</p>
        </Card>

        {/* Warnings + Recovery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="size-5 text-red-500" />
              <h2 className="text-lg font-semibold">Warnings</h2>
            </div>
            {analysis.warnings.length > 0 ? (
              <ul className="space-y-2">
                {analysis.warnings.map((w: string, i: number) => (
                  <li key={i} className="text-sm text-muted-foreground">&bull; {w}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No warnings — great session!</p>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-3">
              <BedDouble className="size-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Recovery</h2>
            </div>
            <ul className="space-y-2">
              {analysis.recovery.rest_48h.length > 0 && (
                <li className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">48h rest:</span> {analysis.recovery.rest_48h.join(", ")}
                </li>
              )}
              {analysis.recovery.rest_72h.length > 0 && (
                <li className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">72h rest:</span> {analysis.recovery.rest_72h.join(", ")}
                </li>
              )}
              {analysis.recovery.nutrition_tip && (
                <li className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Nutrition:</span> {analysis.recovery.nutrition_tip}
                </li>
              )}
              {analysis.recovery.sleep_note && (
                <li className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Sleep:</span> {analysis.recovery.sleep_note}
                </li>
              )}
            </ul>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button size="lg" onClick={handleReset} className="flex-1">
            Log Another Workout
          </Button>
          <Link href="/workout/history" className="flex-1">
            <Button variant="outline" size="lg" className="w-full">
              View Sessions
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Log Workout</h1>
        <p className="text-muted-foreground mt-1">
          Describe your workout in any format and get AI-powered analysis
        </p>
      </div>

      {/* Input Card */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Dumbbell className="size-5 text-primary" />
          <h2 className="text-lg font-semibold">Your Workout</h2>
        </div>

        <textarea
          className="w-full min-h-[180px] p-4 rounded-lg border bg-background text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground"
          placeholder="Describe your workout here...&#10;&#10;e.g. Bench press 4x8 80kg, incline dumbbell press 3x10 30kg, cable flyes 3x12 15kg"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />

        {error && (
          <p className="text-sm text-destructive mt-2">{error}</p>
        )}

        <div className="flex justify-start mt-4">
          <Button
            onClick={handleSubmit}
            className="px-20"
            disabled={!input.trim()}
          >
            Analyze Workout
          </Button>
        </div>
      </Card>

      {/* Examples */}
      <Card className="p-6">
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">
          Examples — click to use
        </h3>
        <div className="space-y-2">
          {examples.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setInput(ex)}
              className="w-full text-left text-sm p-3 rounded-lg border hover:bg-muted transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}

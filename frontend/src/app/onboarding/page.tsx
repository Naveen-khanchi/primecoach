"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dumbbell, ArrowRight, ArrowLeft } from "lucide-react";

const GOALS = [
  { value: "muscle_gain", label: "Muscle Gain" },
  { value: "fat_loss", label: "Fat Loss" },
  { value: "strength", label: "Strength" },
  { value: "endurance", label: "Endurance" },
  { value: "general_fitness", label: "General Fitness" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    age: "",
    weight_kg: "",
    height_cm: "",
    gender: "",
    goals: [] as string[],
    bench_press_kg: "",
    squat_kg: "",
    deadlift_kg: "",
    overhead_press_kg: "",
    pull_ups_max_reps: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function next() {
    setError("");

    if (step === 1) {
      if (!form.age || !form.weight_kg || !form.height_cm || !form.gender) {
        setError("Please fill in all fields.");
        return;
      }
    }

    if (step === 2) {
      if (form.goals.length === 0) {
        setError("Please select at least one goal.");
        return;
      }
    }

    setStep(step + 1);
  }

  function back() {
    setError("");
    setStep(step - 1);
  }

  async function handleSubmit() {
    setLoading(true);

    // TODO: Replace with actual API call
    // await axios.post("/users", { ...form });

    setTimeout(() => {
      setLoading(false);
      router.push("/dashboard");
    }, 500);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center px-6 py-4 md:px-12">
        <Link href="/" className="flex items-center gap-2">
          <Dumbbell className="size-6" />
          <span className="text-xl font-bold">PrimeCoach</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 pt-0 pb-12">
        <Card className="w-full max-w-lg">
          {/* Progress indicator */}
          <div className="px-6 pt-6">
            <div className="flex gap-2">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    s <= step ? "bg-primary" : "bg-muted"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Step {step} of 3
            </p>
          </div>

          {/* Step 1 — Basic Info */}
          {step === 1 && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl">Tell us about yourself</CardTitle>
                <CardDescription>
                  We&apos;ll use this to personalize your coaching
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="Your age"
                    value={form.age}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="weight_kg">Weight (kg)</Label>
                    <Input
                      id="weight_kg"
                      name="weight_kg"
                      type="number"
                      placeholder="In kg"
                      value={form.weight_kg}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="height_cm">Height (cm)</Label>
                    <Input
                      id="height_cm"
                      name="height_cm"
                      type="number"
                      placeholder="In cm"
                      value={form.height_cm}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label>Gender</Label>
                  <div className="flex gap-3">
                    {["Male", "Female", "Other"].map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setForm({ ...form, gender: g.toLowerCase() })}
                        className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                          form.gender === g.toLowerCase()
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-border hover:bg-muted"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2 — Goal */}
          {step === 2 && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl">What&apos;s your goal?</CardTitle>
                <CardDescription>
                  This shapes your workout analysis and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {GOALS.map((g) => {
                  const selected = form.goals.includes(g.value);
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          goals: selected
                            ? form.goals.filter((v) => v !== g.value)
                            : [...form.goals, g.value],
                        })
                      }
                      className={`w-full py-3 px-4 rounded-lg border text-left text-sm font-medium transition-colors ${
                        selected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background border-border hover:bg-muted"
                      }`}
                    >
                      {g.label}
                    </button>
                  );
                })}
                <p className="text-xs text-muted-foreground">Select one or more goals</p>
              </CardContent>
            </>
          )}

          {/* Step 3 — Strength Baseline */}
          {step === 3 && (
            <>
              <CardHeader>
                <CardTitle className="text-2xl">Strength baseline</CardTitle>
                <CardDescription>
                  Optional — helps us track your progress from day one. Skip any you don&apos;t know.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="bench_press_kg">Bench Press (kg)</Label>
                    <Input
                      id="bench_press_kg"
                      name="bench_press_kg"
                      type="number"
                      placeholder="In kg"
                      value={form.bench_press_kg}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="squat_kg">Squat (kg)</Label>
                    <Input
                      id="squat_kg"
                      name="squat_kg"
                      type="number"
                      placeholder="In kg"
                      value={form.squat_kg}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="deadlift_kg">Deadlift (kg)</Label>
                    <Input
                      id="deadlift_kg"
                      name="deadlift_kg"
                      type="number"
                      placeholder="In kg"
                      value={form.deadlift_kg}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="overhead_press_kg">OHP (kg)</Label>
                    <Input
                      id="overhead_press_kg"
                      name="overhead_press_kg"
                      type="number"
                      placeholder="In kg"
                      value={form.overhead_press_kg}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="pull_ups_max_reps">Pull-ups (max reps)</Label>
                  <Input
                    id="pull_ups_max_reps"
                    name="pull_ups_max_reps"
                    type="number"
                    placeholder="Max reps"
                    value={form.pull_ups_max_reps}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </>
          )}

          {/* Error + Navigation */}
          <div className="px-6 pb-6 flex flex-col gap-4">
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <div className="flex gap-3">
              {step > 1 && (
                <Button variant="outline" size="lg" onClick={back} className="gap-2">
                  <ArrowLeft className="size-4" /> Back
                </Button>
              )}

              {step < 3 ? (
                <Button size="lg" onClick={next} className="flex-1 gap-2">
                  Next <ArrowRight className="size-4" />
                </Button>
              ) : (
                <Button size="lg" onClick={handleSubmit} className="flex-1" disabled={loading}>
                  {loading ? "Setting up..." : "Complete Setup"}
                </Button>
              )}
            </div>

            {step === 3 && (
              <button
                type="button"
                onClick={handleSubmit}
                className="text-sm text-muted-foreground underline underline-offset-4 text-center"
                disabled={loading}
              >
                Skip for now
              </button>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
}

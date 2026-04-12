"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Dumbbell,
  Target,
  Pencil,
} from "lucide-react";

const dummyUser = {
  name: "Naveen",
  age: 25,
  gender: "Male",
  weight_kg: 75,
  height_cm: 175,
  fitness_level: "Intermediate",
  goal: "Muscle Gain",
  days_available: 5,
  target_deadline: "12 weeks",
  injuries: "Lower back tightness",
  bench_press_kg: 80,
  squat_kg: 100,
  deadlift_kg: 140,
  overhead_press_kg: 45,
  pull_ups_max_reps: 12,
};

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-1">
            Your personal information and fitness settings
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Pencil className="size-4" /> Edit Profile
        </Button>
      </div>

      {/* Personal Info */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left — Avatar + Name */}
          <div className="flex flex-col items-center gap-3 md:min-w-[200px]">
            <div className="size-24 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">
                {dummyUser.name.charAt(0)}
              </span>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{dummyUser.name}</p>
              <p className="text-sm text-muted-foreground">
                {dummyUser.goal} &bull; {dummyUser.fitness_level}
              </p>
            </div>
          </div>

          {/* Right — Details Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Age</span>
              <span className="text-lg font-semibold">{dummyUser.age}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Gender</span>
              <span className="text-lg font-semibold">{dummyUser.gender}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Weight</span>
              <span className="text-lg font-semibold">{dummyUser.weight_kg} kg</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Height</span>
              <span className="text-lg font-semibold">{dummyUser.height_cm} cm</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Fitness Settings + Strength Baselines */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Fitness Settings</h2>
          </div>

          <div className="divide-y">
            <InfoRow label="Goal" value={dummyUser.goal} />
            <InfoRow label="Fitness Level" value={dummyUser.fitness_level} />
            <InfoRow label="Days / Week" value={dummyUser.days_available} />
            <InfoRow label="Target Deadline" value={dummyUser.target_deadline} />
            <InfoRow label="Injuries" value={dummyUser.injuries} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Strength Baselines</h2>
          </div>

          <div className="divide-y">
            <InfoRow label="Bench Press" value={`${dummyUser.bench_press_kg} kg`} />
            <InfoRow label="Squat" value={`${dummyUser.squat_kg} kg`} />
            <InfoRow label="Deadlift" value={`${dummyUser.deadlift_kg} kg`} />
            <InfoRow label="Overhead Press" value={`${dummyUser.overhead_press_kg} kg`} />
            <InfoRow label="Pull-ups" value={`${dummyUser.pull_ups_max_reps} reps`} />
          </div>
        </Card>
      </div>
    </div>
  );
}

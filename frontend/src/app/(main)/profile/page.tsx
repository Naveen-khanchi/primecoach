"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dumbbell,
  Target,
  Pencil,
  Loader2,
} from "lucide-react";
import { getUser, getProfile } from "@/lib/api";

function fmt(value: string | null | undefined) {
  if (!value) return "—";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex justify-between py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? "—"}</span>
    </div>
  );
}

export default function ProfilePage() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const userId = Number(localStorage.getItem("userId"));
      if (!userId) return;

      try {
        const [userRes, profileRes] = await Promise.all([
          getUser(userId),
          getProfile(userId),
        ]);
        setUser(userRes.data);
        setProfile(profileRes.data);
      } catch {
        // profile may not exist yet — user is still shown
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
                {user?.name?.charAt(0) ?? "?"}
              </span>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold">{user?.name ?? "—"}</p>
              <p className="text-sm text-muted-foreground">
                {fmt(profile?.goal)} &bull; {fmt(profile?.fitness_level)}
              </p>
            </div>
          </div>

          {/* Right — Details Grid */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Age</span>
              <span className="text-lg font-semibold">{profile?.age ?? "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Gender</span>
              <span className="text-lg font-semibold">{fmt(profile?.gender)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Weight</span>
              <span className="text-lg font-semibold">{profile?.weight_kg ? `${profile.weight_kg} kg` : "—"}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Height</span>
              <span className="text-lg font-semibold">{profile?.height_cm ? `${profile.height_cm} cm` : "—"}</span>
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
            <InfoRow label="Goal" value={fmt(profile?.goal)} />
            <InfoRow label="Fitness Level" value={fmt(profile?.fitness_level)} />
            <InfoRow label="Days / Week" value={profile?.days_available} />
            <InfoRow label="Target Deadline" value={profile?.target_deadline} />
            <InfoRow label="Injuries" value={profile?.injuries} />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Strength Baselines</h2>
          </div>
          <div className="divide-y">
            <InfoRow label="Bench Press" value={profile?.bench_press_kg ? `${profile.bench_press_kg} kg` : null} />
            <InfoRow label="Squat" value={profile?.squat_kg ? `${profile.squat_kg} kg` : null} />
            <InfoRow label="Deadlift" value={profile?.deadlift_kg ? `${profile.deadlift_kg} kg` : null} />
            <InfoRow label="Overhead Press" value={profile?.overhead_press_kg ? `${profile.overhead_press_kg} kg` : null} />
            <InfoRow label="Pull-ups" value={profile?.pull_ups_max_reps ? `${profile.pull_ups_max_reps} reps` : null} />
          </div>
        </Card>
      </div>
    </div>
  );
}

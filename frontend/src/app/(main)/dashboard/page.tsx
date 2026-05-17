"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LabelList } from "recharts";
import {
  type LucideIcon,
  CalendarCheck,
  Target,
  Flame,
  Trophy,
  Dumbbell,
  ChevronRight,
  AlertTriangle,
  EyeOff,
  ClipboardPen,
  TrendingUp,
  CalendarDays,
  User,
  Loader2,
} from "lucide-react";
import { getUser, getSessions, getConsistency, getVolumeProgress, getNextSession } from "@/lib/api";

function StatCard({ icon: Icon, label, value }: {
  icon: LucideIcon;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="size-4 text-primary" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold tracking-tight">{value}</p>
    </Card>
  );
}

function greeting(name: string) {
  const hour = new Date().getHours();
  const time = hour < 12 ? "Morning" : hour < 17 ? "Afternoon" : "Evening";
  return `Good ${time}, ${name}.`;
}

export default function DashboardPage() {
  const [userName, setUserName] = useState("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [consistency, setConsistency] = useState<any>(null);
  const [volume, setVolume] = useState<any>(null);
  const [nextSession, setNextSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const userId = Number(localStorage.getItem("userId"));
      if (!userId) return;

      // Sessions and user don't need a profile — always fetch
      const [userRes, sessionsRes] = await Promise.all([
        getUser(userId),
        getSessions(userId),
      ]);
      setUserName(userRes.data.name);
      setSessions(sessionsRes.data.slice(0, 3));

      // These need a profile — fetch independently so failures don't block the page
      await Promise.allSettled([
        getConsistency(userId).then((r) => setConsistency(r.data)),
        getVolumeProgress(userId).then((r) => setVolume(r.data)),
        getNextSession(userId).then((r) => setNextSession(r.data)),
      ]);

      setLoading(false);
    }
    fetchData();
  }, []);

  // Compute avg score from sessions list
  const avgScore = sessions.length
    ? (sessions.reduce((sum, s) => sum + (s.scores.overall ?? 0), 0) / sessions.length).toFixed(1)
    : "—";

  // Build volume chart data — sum all muscles per week
  const chartData = volume?.weekly_volume
    ? Object.entries(volume.weekly_volume).map(([week, muscles]: [string, any]) => ({
        week,
        volume: Object.values(muscles as Record<string, number>).reduce((a: number, b: number) => a + b, 0),
      }))
    : [];

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          {userName ? greeting(userName) : "Here is your workout overview."}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CalendarCheck} label="Total Sessions" value={consistency?.total_sessions ?? sessions.length} />
        <StatCard icon={Target} label="Sessions / Week" value={consistency?.sessions_per_week_avg?.toFixed(1) ?? "—"} />
        <StatCard icon={Flame} label="Weeks Tracked" value={consistency?.weeks_tracked ?? "—"} />
        <StatCard icon={Trophy} label="Average Score" value={avgScore} />
      </div>

      {/* Next Workout + Recent Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col">
          <div className="flex items-center gap-2">
            <Dumbbell className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Next Workout</h2>
          </div>

          {nextSession ? (
            <>
              <p className="text-sm text-muted-foreground mt-1">{nextSession.recommended_workout_type}</p>
              <ul className="mt-4 space-y-0 divide-y">
                {nextSession.exercises.slice(0, 4).map((ex: any, i: number) => (
                  <li key={i} className="flex justify-between text-sm py-3">
                    <span className="font-medium">{ex.name}</span>
                    <span className="text-muted-foreground">{ex.sets} x {ex.reps}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="text-sm text-muted-foreground mt-4">Log a workout to get a recommendation.</p>
          )}

          <Link href="/workout/log" className="w-full mt-auto pt-4">
            <Button className="w-full">Log Workout</Button>
          </Link>
        </Card>

        <Card className="p-6 flex flex-col">
          <h2 className="text-lg font-semibold">Recent Sessions</h2>

          {sessions.length > 0 ? (
            <ul className="mt-4 space-y-0 divide-y">
              {sessions.map((s: any) => (
                <li key={s.id} className="flex justify-between items-center py-3">
                  <div>
                    <p className="text-sm font-medium">{s.workout_type ?? "Workout"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className="text-sm font-medium">Score: {s.scores.overall ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">
                        {s.total_volume_kg ? `${s.total_volume_kg.toLocaleString()} kg` : "—"}
                      </p>
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground mt-4">No sessions logged yet.</p>
          )}

          <Link href="/workout/history" className="w-full mt-auto pt-4">
            <Button variant="outline" className="w-full">View All</Button>
          </Link>
        </Card>
      </div>

      {/* Weekly Volume Chart */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Weekly Volume</h2>
        <p className="text-sm text-muted-foreground mt-1">Total volume (kg) per week</p>
        <div className="mt-6 h-64">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart margin={{ top: 20, right: 20, bottom: 0, left: 0 }} data={chartData} barSize={48}>
                <XAxis dataKey="week" tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} activeBar={false}>
                  <LabelList dataKey="volume" position="top" fontSize={13} fontWeight={500} offset={8} formatter={(v) => `${(Number(v) / 1000).toFixed(1)}k`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              No volume data yet — log some workouts first.
            </div>
          )}
        </div>
      </Card>

      {/* Muscle Balance + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Muscle Balance</h2>
          <p className="text-sm text-muted-foreground mt-1">Based on recent training data</p>

          {volume ? (
            <div className="mt-5 space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="size-4 text-amber-500" />
                  <p className="text-sm font-medium text-amber-500">Overtrained</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {volume.overtrained.length > 0 ? volume.overtrained.map((m: string) => (
                    <span key={m} className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 font-medium capitalize">
                      {m}
                    </span>
                  )) : <p className="text-sm text-muted-foreground">None</p>}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <EyeOff className="size-4 text-red-500" />
                  <p className="text-sm font-medium text-red-500">Neglected</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {volume.neglected.length > 0 ? volume.neglected.map((m: string) => (
                    <span key={m} className="text-xs px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 font-medium capitalize">
                      {m}
                    </span>
                  )) : <p className="text-sm text-muted-foreground">None</p>}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-4">Log workouts to see muscle balance data.</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <p className="text-sm text-muted-foreground mt-1">Jump to a section</p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              { href: "/workout/log", label: "Log Workout", icon: ClipboardPen },
              { href: "/progress", label: "View Progress", icon: TrendingUp },
              { href: "/recommendations/next-session", label: "Weekly Plan", icon: CalendarDays },
              { href: "/profile", label: "Update Profile", icon: User },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex flex-col items-center gap-2 p-4 rounded-lg border hover:bg-muted transition-colors text-center"
              >
                <action.icon className="size-5 text-muted-foreground" />
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}


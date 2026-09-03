"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Loader2, Clock, ChevronRight, Inbox, ClipboardPen, AlertTriangle } from "lucide-react";
import { getSessions } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";

export default function SessionHistoryPage() {
  const userId = useRequireAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const uid = userId;

    async function fetchData() {
      try {
        const res = await getSessions(uid);
        setSessions(res.data);
      } catch {
        setError("Couldn't load sessions — check that the backend is running and reachable.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <AlertTriangle className="size-5 text-red-500" />
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sessions</h1>
          <p className="text-muted-foreground mt-1">
            {sessions.length} workout{sessions.length === 1 ? "" : "s"} logged
          </p>
        </div>
        <Link href="/workout/log">
          <Button>Log Workout</Button>
        </Link>
      </div>

      {sessions.length === 0 ? (
        <Card className="p-12 flex flex-col items-center text-center gap-3">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center">
            <Inbox className="size-5 text-muted-foreground" />
          </div>
          <h3 className="font-semibold">No sessions yet</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Log your first workout and it&apos;ll show up here with your score breakdown and full history.
          </p>
          <Link href="/workout/log">
            <Button className="mt-1">
              <ClipboardPen className="size-4" />
              Log a workout
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <ul className="divide-y">
            {sessions.map((s: any) => {
              const date = new Date(s.created_at);
              const low = (s.scores.overall ?? 0) <= 5;
              return (
                <li key={s.id}>
                  <Link
                    href={`/workout/history/${s.id}`}
                    className="flex items-center gap-4 px-5 py-4 hover:bg-muted transition-colors"
                  >
                    <div className="flex flex-col items-center w-12 shrink-0 leading-tight">
                      <span className="text-lg font-semibold tabular-nums">{date.getDate()}</span>
                      <span className="text-[11px] uppercase text-muted-foreground tracking-wide">
                        {date.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{s.workout_type ?? "Workout"}</p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="size-3" />
                          {s.duration_minutes ? `${s.duration_minutes} min` : "—"}
                        </span>
                        <span>{s.exercise_count} exercises</span>
                      </div>
                    </div>

                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium tabular-nums">
                        {s.total_volume_kg ? `${s.total_volume_kg.toLocaleString()} kg` : "—"}
                      </p>
                      <p className="text-xs text-muted-foreground">volume</p>
                    </div>

                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium tabular-nums">{s.total_sets ?? "—"}</p>
                      <p className="text-xs text-muted-foreground">sets</p>
                    </div>

                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full tabular-nums ${
                        low ? "bg-red-500/10 text-red-600" : "bg-muted text-foreground"
                      }`}
                    >
                      {s.scores.overall ?? "—"}/10
                    </span>

                    <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}

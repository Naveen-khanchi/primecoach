"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Loader2, ChevronLeft, Clock, Weight, Link2, CheckCircle2, AlertTriangle, Inbox } from "lucide-react";
import { getSessionDetail } from "@/lib/api";
import { useRequireAuth } from "@/lib/auth";

const SCORE_LABELS: Record<string, string> = {
  overall: "Overall",
  intensity: "Intensity",
  volume: "Volume",
  exercise_selection: "Selection",
  muscle_balance: "Balance",
};

export default function SessionDetailPage() {
  const userId = useRequireAuth();
  const params = useParams();
  const sessionId = Number(params.id);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !sessionId) return;
    const uid = userId;

    async function fetchData() {
      try {
        const res = await getSessionDetail(uid, sessionId);
        setSession(res.data);
      } catch {
        setError("Couldn't load this session — check that the backend is running and reachable.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [userId, sessionId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <p className="font-medium">{error ? "Something went wrong" : "Session not found"}</p>
        {error && <p className="text-sm text-muted-foreground max-w-xs">{error}</p>}
        <Link href="/workout/history" className="text-sm text-muted-foreground hover:text-foreground">
          Back to sessions
        </Link>
      </div>
    );
  }

  const date = new Date(session.created_at);
  const analysis = session.ai_analysis;

  // Group exercises so superset partners render together
  const groups: any[][] = [];
  const seen = new Set<number>();
  session.exercises.forEach((ex: any, i: number) => {
    if (seen.has(i)) return;
    if (ex.superset_group != null) {
      const group = session.exercises.filter((e: any) => e.superset_group === ex.superset_group);
      group.forEach((g: any) => seen.add(session.exercises.indexOf(g)));
      groups.push(group);
    } else {
      seen.add(i);
      groups.push([ex]);
    }
  });

  return (
    <div className="space-y-8">
      <Link
        href="/workout/history"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" />
        Sessions
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{session.workout_type ?? "Workout"}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mt-2">
          <span>{date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
          {session.duration_minutes && (
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {session.duration_minutes} min
            </span>
          )}
          {session.total_volume_kg != null && (
            <span className="flex items-center gap-1">
              <Weight className="size-3.5" />
              {session.total_volume_kg.toLocaleString()} kg total
            </span>
          )}
        </div>
        {session.notes && (
          <p className="text-sm text-muted-foreground italic border-l-2 pl-3 mt-4 max-w-2xl">
            {session.notes}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {Object.entries(session.scores).map(([key, value]: [string, any]) => (
          <Card key={key} className="p-4 text-center">
            <p className={`text-2xl font-bold tabular-nums ${value <= 5 ? "text-red-600" : ""}`}>{value ?? "—"}</p>
            <p className="text-xs text-muted-foreground mt-1">{SCORE_LABELS[key] ?? key}</p>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">Exercises</h2>
        <Card className="p-0 overflow-hidden">
          <ul className="divide-y">
            {groups.map((group, gi) => (
              <li key={gi}>
                {group.length > 1 && (
                  <div className="flex items-center gap-1.5 px-5 pt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    <Link2 className="size-3" />
                    Superset
                  </div>
                )}
                <ul className={group.length > 1 ? "ml-4 border-l" : ""}>
                  {group.map((ex: any) => (
                    <li
                      key={ex.order}
                      className="flex items-center gap-4 px-5 py-3 text-sm"
                    >
                      <span className="w-5 text-muted-foreground tabular-nums">{ex.order}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{ex.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{ex.primary_muscle}</p>
                      </div>
                      <span className="tabular-nums text-right whitespace-nowrap">
                        {ex.sets ?? "—"} × {ex.reps ?? "—"}{ex.weight_kg ? ` @ ${ex.weight_kg}kg` : ""}
                      </span>
                      <span className="tabular-nums text-right text-muted-foreground w-20 shrink-0">
                        {ex.volume_kg ? `${ex.volume_kg.toLocaleString()} kg` : "—"}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-3">AI Analysis</h2>
        {!analysis ? (
          <Card className="p-6 flex items-center gap-3 text-sm text-muted-foreground">
            <Inbox className="size-4" />
            No AI analysis stored for this session.
          </Card>
        ) : (
          <Card className="p-6">
            <p className="text-lg font-medium leading-relaxed">&ldquo;{analysis.coach_message}&rdquo;</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Improvements
                </h3>
                <ul className="space-y-3">
                  {analysis.improvements?.map((tip: { action: string; benefit: string }, i: number) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <CheckCircle2 className="size-3.5 shrink-0 mt-0.5" />
                      <span>
                        {tip.action}
                        {tip.benefit && (
                          <span className="text-muted-foreground"> — {tip.benefit}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Warnings
                </h3>
                {analysis.warnings?.length ? (
                  <ul className="space-y-2">
                    {analysis.warnings.map((w: string, i: number) => (
                      <li key={i} className="flex gap-2 text-sm">
                        <AlertTriangle className="size-3.5 shrink-0 mt-0.5 text-red-500" />
                        {w}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">None flagged this session.</p>
                )}
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { useRequireAuth } from "@/lib/auth";
import { getProgress } from "@/lib/api";
import {
  Loader2,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Minus,
  CheckCircle2,
  XCircle,
  Zap,
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

const TREND_META: Record<string, { label: string; className: string; icon: any }> = {
  overload: { label: "Overload", className: "bg-green-500/10 text-green-600", icon: ArrowUp },
  plateau: { label: "Plateau", className: "bg-amber-500/10 text-amber-600", icon: Minus },
  regression: { label: "Regression", className: "bg-red-500/10 text-red-600", icon: ArrowDown },
  stable: { label: "Stable", className: "bg-amber-500/10 text-amber-600", icon: Minus },
  insufficient_data: { label: "Needs more data", className: "bg-muted text-muted-foreground", icon: null },
};

const STATUS_META: Record<string, { label: string; className: string; icon: any }> = {
  on_track: { label: "On track", className: "bg-green-500/10 text-green-600", icon: CheckCircle2 },
  slightly_behind: { label: "Slightly behind", className: "bg-amber-500/10 text-amber-600", icon: AlertTriangle },
  off_track: { label: "Off track", className: "bg-red-500/10 text-red-600", icon: XCircle },
};

const SCORE_SERIES = [
  { key: "overall", label: "Overall", color: "var(--chart-3)" },
  { key: "intensity", label: "Intensity", color: "var(--chart-2)" },
  { key: "volume", label: "Volume", color: "var(--chart-1)" },
];

export default function ProgressPage() {
  const userId = useRequireAuth();
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const uid = userId;

    async function fetchData() {
      try {
        const res = await getProgress(uid);
        setProgress(res.data);
      } catch {
        setError("Couldn't load progress data — check that the backend is running and reachable, and that a profile exists for this user.");
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

  if (error || !progress) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <AlertTriangle className="size-5 text-red-500" />
        <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
      </div>
    );
  }

  const lifts = Object.entries(progress.strength_progression) as [string, any][];

  const volumeByMuscle = Object.entries(progress.volume_trends.weekly_volume as Record<string, any[]>)
    .map(([muscle, weeks]) => ({
      muscle,
      kg: weeks.reduce((sum, w) => sum + w.volume_kg, 0),
      overtrained: progress.volume_trends.overtrained.includes(muscle),
      neglected: progress.volume_trends.neglected.includes(muscle),
    }))
    .sort((a, b) => b.kg - a.kg);
  const maxKg = Math.max(...volumeByMuscle.map((v) => v.kg), 1);

  const insights = progress.ai_insights;
  const status = insights ? (STATUS_META[insights.progress_status] ?? STATUS_META.on_track) : null;
  const StatusIcon = status?.icon;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
        <p className="text-muted-foreground mt-1">{progress.period}</p>
      </div>

      {/* Score trend */}
      <Card className="p-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-semibold">Score Trend</h2>
          <div className="flex items-center gap-4">
            {SCORE_SERIES.map((s) => (
              <div key={s.key} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="w-2.5 h-0.5 rounded-full" style={{ background: s.color }} />
                {s.label}
              </div>
            ))}
          </div>
        </div>
        <div className="h-64 mt-4">
          {progress.consistency.score_trend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progress.consistency.score_trend} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  fontSize={12}
                  tickFormatter={(v) => new Date(v + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <YAxis domain={[0, 10]} tickLine={false} axisLine={false} fontSize={12} />
                {SCORE_SERIES.map((s) => (
                  <Line
                    key={s.key}
                    dataKey={s.key}
                    stroke={s.color}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
              No scored sessions yet — log a workout to start tracking trend.
            </div>
          )}
        </div>
      </Card>

      {/* Strength progression */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Strength Progression</h2>
        {lifts.length === 0 ? (
          <Card className="p-6 text-sm text-muted-foreground">
            No weighted lifts logged yet.
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lifts.map(([name, data]) => {
              const meta = TREND_META[data.trend] ?? TREND_META.insufficient_data;
              const Icon = meta.icon;
              const latest = data.history[data.history.length - 1];
              return (
                <Card key={name} className="p-5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{name}</p>
                      <p className="text-xl font-bold tracking-tight mt-1">
                        {latest.weight_kg}
                        <span className="text-sm font-medium text-muted-foreground">kg</span>
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${meta.className}`}>
                      {Icon && <Icon className="size-3" />}
                      {meta.label}
                    </span>
                  </div>
                  <div className="h-12 mt-3">
                    {data.history.length > 1 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.history}>
                          <Line dataKey="weight_kg" stroke="var(--foreground)" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center h-full text-xs text-muted-foreground">
                        Log one more session to see a trend.
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* AI insight hero */}
      {!insights ? (
        <Card className="p-6 flex items-center gap-3 text-sm text-muted-foreground">
          <AlertTriangle className="size-4 shrink-0" />
          AI insights are unavailable right now — showing your raw progress data instead. Try refreshing later.
        </Card>
      ) : (
        <Card className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI Progress Summary</p>
            <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${status!.className}`}>
              {StatusIcon && <StatusIcon className="size-3.5" />}
              {status!.label}
            </span>
          </div>
          <p className="text-lg font-medium leading-relaxed max-w-3xl">{insights.overall_summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Top strength</h4>
              <p className="text-sm">{insights.top_strength}</p>
            </div>
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Main weakness</h4>
              <p className="text-sm">{insights.main_weakness}</p>
            </div>
          </div>

          {insights.blocking_factors?.length > 0 && (
            <div className="mt-5">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Blocking factors</h4>
              <div className="flex flex-wrap gap-2">
                {insights.blocking_factors.map((f: string, i: number) => (
                  <span key={i} className="text-xs bg-muted px-2.5 py-1 rounded-full">{f}</span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 border-t pt-4 mt-6">
            <Zap className="size-4 mt-0.5 shrink-0" />
            <p className="text-sm">
              <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-0.5">
                Focus for the next 2–4 weeks
              </span>
              {insights.recommendation}
            </p>
          </div>
        </Card>
      )}

      {/* Consistency stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <p className="text-2xl font-bold tabular-nums">{progress.consistency.total_sessions}</p>
          <p className="text-sm text-muted-foreground mt-1">Total sessions</p>
        </Card>
        <Card className="p-5">
          <p className="text-2xl font-bold tabular-nums">
            {progress.consistency.sessions_per_week_avg}
            {progress.consistency.target_days_per_week && (
              <span className="text-sm font-medium text-muted-foreground"> / {progress.consistency.target_days_per_week}</span>
            )}
          </p>
          <p className="text-sm text-muted-foreground mt-1">Sessions per week</p>
        </Card>
        <Card className="p-5">
          <p className="text-2xl font-bold tabular-nums">{progress.consistency.weeks_tracked ?? "—"}</p>
          <p className="text-sm text-muted-foreground mt-1">Weeks tracked</p>
        </Card>
        <Card className="p-5">
          <p className="text-2xl font-bold tabular-nums">{progress.consistency.gap_periods.length}</p>
          <p className="text-sm text-muted-foreground mt-1">Gap period{progress.consistency.gap_periods.length === 1 ? "" : "s"}</p>
          {progress.consistency.gap_periods[0] && (
            <p className="text-xs text-muted-foreground mt-1">
              {progress.consistency.gap_periods[0].days} days, {progress.consistency.gap_periods[0].from}
            </p>
          )}
        </Card>
      </div>

      {/* Volume by muscle */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Volume by Muscle</h2>
        <Card className="p-6">
          {volumeByMuscle.length === 0 ? (
            <p className="text-sm text-muted-foreground">No volume data yet — log some workouts first.</p>
          ) : (
            <>
              <div className="space-y-3">
                {volumeByMuscle.map((v) => (
                  <div key={v.muscle} className="grid grid-cols-[7.5rem_1fr_5rem] items-center gap-3">
                    <div className="flex items-center gap-2 text-sm capitalize">
                      {v.overtrained && <span className="size-1.5 rounded-full bg-amber-500 shrink-0" />}
                      {v.neglected && <span className="size-1.5 rounded-full bg-red-500 shrink-0" />}
                      {v.muscle}
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-foreground"
                        style={{ width: `${(v.kg / maxKg) * 100}%` }}
                      />
                    </div>
                    <div className="text-sm text-muted-foreground text-right tabular-nums">
                      {v.kg.toLocaleString()} kg
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-5 mt-5 pt-4 border-t text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-amber-500" />
                  Overtrained — hit every session
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-red-500" />
                  Neglected — 14+ days since last trained
                </span>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

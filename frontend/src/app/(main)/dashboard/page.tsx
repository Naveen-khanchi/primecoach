"use client";

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
} from "lucide-react";

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

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Good Morning, Naveen. Here is your workouts overview.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CalendarCheck} label="Total Sessions" value={24} />
        <StatCard icon={Target} label="This Week" value="3/5" />
        <StatCard icon={Flame} label="Current Streak" value="9 Days" />
        <StatCard icon={Trophy} label="Average Score" value={7.4} />
      </div>

      {/* Next Workout + Recent Sessions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col">
          <div className="flex items-center gap-2">
            <Dumbbell className="size-5 text-primary" />
            <h2 className="text-lg font-semibold">Next Workout</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Pull Day</p>

          <ul className="mt-4 space-y-0 divide-y">
            <li className="flex justify-between text-sm py-3">
              <span className="font-medium">Deadlift</span>
              <span className="text-muted-foreground">4 x 5</span>
            </li>
            <li className="flex justify-between text-sm py-3">
              <span className="font-medium">Barbell Row</span>
              <span className="text-muted-foreground">3 x 10</span>
            </li>
            <li className="flex justify-between text-sm py-3">
              <span className="font-medium">Pull-ups</span>
              <span className="text-muted-foreground">3 x 8</span>
            </li>
            <li className="flex justify-between text-sm py-3">
              <span className="font-medium">Face Pulls</span>
              <span className="text-muted-foreground">3 x 15</span>
            </li>
          </ul>

          <Button className="w-full mt-auto">Start Workout</Button>
        </Card>

        <Card className="p-6 flex flex-col">
          <h2 className="text-lg font-semibold">Recent Sessions</h2>

          <ul className="mt-4 space-y-0 divide-y">
            <li className="flex justify-between items-center py-3">
              <div>
                <p className="text-sm font-medium">Push Day</p>
                <p className="text-xs text-muted-foreground">Apr 10</p>
              </div>
              <div className="text-right flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium">Score: 7</p>
                  <p className="text-xs text-muted-foreground">4200 kg</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </li>
            <li className="flex justify-between items-center py-3">
              <div>
                <p className="text-sm font-medium">Pull Day</p>
                <p className="text-xs text-muted-foreground">Apr 8</p>
              </div>
              <div className="text-right flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium">Score: 8</p>
                  <p className="text-xs text-muted-foreground">3800 kg</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </li>
            <li className="flex justify-between items-center py-3">
              <div>
                <p className="text-sm font-medium">Leg Day</p>
                <p className="text-xs text-muted-foreground">Apr 6</p>
              </div>
              <div className="text-right flex items-center gap-3">
                <div>
                  <p className="text-sm font-medium">Score: 6</p>
                  <p className="text-xs text-muted-foreground">5100 kg</p>
                </div>
                <ChevronRight className="size-4 text-muted-foreground" />
              </div>
            </li>
          </ul>

          <Link href="/workout/history" className="w-full mt-auto">
            <Button variant="outline" className="w-full">View All</Button>
          </Link>
        </Card>
      </div>

      {/* Weekly Volume Chart */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold">Weekly Volume</h2>
        <p className="text-sm text-muted-foreground mt-1">Total volume (kg) per week</p>
        <div className="mt-6 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart margin={{ top: 20, right: 20, bottom: 0, left: 0 }} data={[
              { week: "W1", volume: 12000 },
              { week: "W2", volume: 14500 },
              { week: "W3", volume: 11000 },
              { week: "W4", volume: 16200 },
              { week: "W5", volume: 15800 },
              { week: "W6", volume: 17500 },
            ]} barSize={48}>
              <XAxis dataKey="week" tickLine={false} fontSize={12} />
              <YAxis axisLine={false} tickLine={false} fontSize={12} tickFormatter={(v) => `${v / 1000}k`} />
              <Bar dataKey="volume" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} activeBar={false}>
                <LabelList dataKey="volume" position="top" fontSize={13} fontWeight={500} offset={8} formatter={(v) => `${(Number(v) / 1000).toFixed(1)}k`} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Muscle Balance + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold">Muscle Balance</h2>
          <p className="text-sm text-muted-foreground mt-1">Based on recent training data</p>

          <div className="mt-5 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="size-4 text-amber-500" />
                <p className="text-sm font-medium text-amber-500">Overtrained</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Chest", "Front Delts", "Triceps"].map((m) => (
                  <span key={m} className="text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 font-medium">
                    {m}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <EyeOff className="size-4 text-red-500" />
                <p className="text-sm font-medium text-red-500">Neglected</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {["Hamstrings", "Rear Delts", "Calves"].map((m) => (
                  <span key={m} className="text-xs px-2.5 py-1 rounded-full bg-red-500/10 text-red-600 font-medium">
                    {m}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold">Quick Actions</h2>
          <p className="text-sm text-muted-foreground mt-1">Jump to a section</p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            {[
              { href: "/workout", label: "Log Workout", icon: ClipboardPen },
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


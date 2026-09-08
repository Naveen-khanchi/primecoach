"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dumbbell,
  TrendingUp,
  Brain,
  CalendarDays,
  ArrowRight,
  ArrowUp,
  ChevronDown,
  Zap,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Workout Analysis",
    description:
      "Log your workout in any format - natural language, shorthand, anything. PrimeCoach scores your session and gives specific, actionable feedback.",
  },
  {
    icon: TrendingUp,
    title: "Progress Tracking",
    description:
      "Track strength progression, volume trends, and training consistency. See exactly where you're improving and where you're stalling.",
  },
  {
    icon: Dumbbell,
    title: "Smart Recommendations",
    description:
      "Get AI-powered suggestions for your next session based on what you've trained recently, your goals, and your progress.",
  },
  {
    icon: CalendarDays,
    title: "Weekly Plans",
    description:
      "PrimeCoach builds your next week's training around your actual performance, recovery, and progression - ",
    emphasis: "not a static template.",
  },
];

const steps = [
  {
    number: "1",
    title: "Create your profile",
    description:
      "Tell PrimeCoach your goals, fitness level, and current strength baselines - bench, squat, deadlift, whatever you've got. Everything after this step is built around your numbers, not a generic template.",
  },
  {
    number: "2",
    title: "Log your workouts, your way",
    description:
      "Type it however you actually think about it - shorthand, full sentences, whatever's fastest mid-workout. PrimeCoach parses exercises, sets, reps, and weight automatically, no rigid form to fill out.",
    example: "bench 80x8, 80x7, 75x10 · incline db 30x10, 30x9",
  },
  {
    number: "3",
    title: "Get AI coaching",
    description:
      "Every session gets scored and broken down - intensity, volume, muscle balance - with specific feedback on what to fix. Then PrimeCoach tells you exactly what to train next.",
    tags: ["Workout score", "Muscle balance", "Next-session plan"],
  },
];

function useCountUp(target: number, delay = 500, duration = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const effectiveDuration = reduceMotion ? 0 : duration;
    const effectiveDelay = reduceMotion ? 0 : delay;

    let raf = 0;
    let start: number | undefined;
    const timeout = setTimeout(() => {
      function tick(ts: number) {
        if (!start) start = ts;
        const t = effectiveDuration === 0 ? 1 : Math.min(1, (ts - start!) / effectiveDuration);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(eased * target);
        if (t < 1) raf = requestAnimationFrame(tick);
      }
      raf = requestAnimationFrame(tick);
    }, effectiveDelay);

    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(raf);
    };
  }, [target, delay, duration]);

  return value;
}

const STRENGTH_DATA = [70, 71, 72.5, 72.5, 74, 75, 75, 76.5, 78, 78, 80, 82.5];

function StrengthChart() {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const W = 720, H = 240, PAD_L = 36, PAD_R = 16, PAD_T = 16, PAD_B = 28;
  const plotW = W - PAD_L - PAD_R, plotH = H - PAD_T - PAD_B;
  const n = STRENGTH_DATA.length;
  const yMin = 68, yMax = 84;
  const x = (i: number) => PAD_L + (i / (n - 1)) * plotW;
  const y = (v: number) => PAD_T + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  const linePts = STRENGTH_DATA.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const areaPts = `${x(0)},${y(yMin)} ${linePts} ${x(n - 1)},${y(yMin)}`;

  return (
    <div className="relative mt-2">
      <svg width="100%" height="240" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="strengthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" className="text-green-600" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-green-600" />
          </linearGradient>
        </defs>
        {[68, 72, 76, 80, 84].map((v) => (
          <g key={v}>
            <line x1={PAD_L} y1={y(v)} x2={W - PAD_R} y2={y(v)} className="stroke-border" strokeWidth={1} />
            <text x={PAD_L - 8} y={y(v) + 3} textAnchor="end" fontSize={10} className="fill-muted-foreground">
              {v}
            </text>
          </g>
        ))}
        <polygon points={areaPts} fill="url(#strengthFill)" />
        <polyline
          points={linePts}
          fill="none"
          className="stroke-green-600"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={x(n - 1)} cy={y(STRENGTH_DATA[n - 1])} r={4} className="fill-green-600" />
        {STRENGTH_DATA.map((v, i) => (
          <circle
            key={i}
            cx={x(i)}
            cy={y(v)}
            r={12}
            fill="transparent"
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
          />
        ))}
      </svg>
      {hoverIdx !== null && (
        <div
          className="absolute pointer-events-none bg-foreground text-background text-xs px-2.5 py-1.5 rounded-md whitespace-nowrap -translate-x-1/2 -translate-y-[115%]"
          style={{ left: `${(x(hoverIdx) / W) * 100}%`, top: `${(y(yMax) / H) * 100}%` }}
        >
          Session {hoverIdx + 1} · <b>{STRENGTH_DATA[hoverIdx]}kg</b>
        </div>
      )}
    </div>
  );
}

export default function LandingPage() {
  const score = useCountUp(8.7);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <Dumbbell className="size-6" />
          <span className="text-xl font-bold">PrimeCoach</span>
        </div>
        <div className="flex items-center gap-8">
          <nav className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
          </nav>
          <Link href="/login">
            <Button size="lg" variant="outline" className="px-6 border-2 border-foreground">Login</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-14 md:px-12 md:py-20 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-14 items-center max-w-6xl mx-auto w-full">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-5">
            <span className="size-1.5 rounded-full bg-green-600" />
            Built from your actual training data
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-[1.04] max-w-xl text-balance">
            Stop following generic workout plans.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-md">
            PrimeCoach learns from every workout you log and builds your training around your actual progress - not a template.
          </p>
          <div className="mt-9 flex items-center gap-6 flex-wrap">
            <Link href="/signup">
              <Button size="lg" className="gap-2 h-11 px-6">
                Start Training Free <ArrowRight className="size-4" />
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button size="lg" variant="ghost" className="gap-1.5 text-muted-foreground">
                See how it works <ChevronDown className="size-4" />
              </Button>
            </a>
          </div>
          <div className="mt-10 flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <span className="font-semibold text-foreground">Log naturally</span>
            <ArrowRight className="size-3.5" />
            <span className="font-semibold text-foreground">PrimeCoach analyzes it</span>
            <ArrowRight className="size-3.5" />
            <span>Get personalized coaching</span>
          </div>
        </div>

        <Card className="p-6 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.18)]">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground">
              <Dumbbell className="size-3.5" />
              PrimeCoach
            </div>
            <div className="text-xs text-muted-foreground font-mono">Today, 6:42 PM</div>
          </div>

          <div className="flex items-baseline justify-between pb-4 border-b mb-4">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Workout Score</span>
            <span className="text-4xl font-bold font-mono tabular-nums">
              {score.toFixed(1)}
              <span className="text-lg text-muted-foreground font-medium">/10</span>
            </span>
          </div>

          <div>
            <div className="text-sm font-medium py-1">Bench Press</div>
            <div className="flex items-center justify-between text-sm text-muted-foreground py-1 font-mono">
              80kg × 8
              <span className="inline-flex items-center gap-1 text-green-600 font-sans font-semibold text-xs">
                <ArrowUp className="size-3" />PR pace
              </span>
            </div>
            <div className="text-sm text-muted-foreground py-1 font-mono">80kg × 7</div>
            <div className="text-sm text-muted-foreground py-1 font-mono">75kg × 10</div>
          </div>

          <div className="my-4 p-3.5 bg-muted rounded-lg text-sm leading-relaxed">
            <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              AI Coach
            </span>
            Solid pressing session - your top set matched last week&apos;s pace. Keep working sets around 8 reps before adding load.
          </div>

          <div className="flex items-center justify-between pt-3.5 border-t text-sm">
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <Zap className="size-3.5" />
              Next session
            </span>
            <span className="font-semibold font-mono">82.5kg × 6–8</span>
          </div>
        </Card>
      </section>

      {/* Features */}
      <section className="px-6 py-8 md:px-12" id="features">
        <div className="max-w-5xl mx-auto rounded-[2rem] bg-muted p-8 md:p-14">
          <div className="max-w-lg mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold">A coach that learns you</h2>
            <p className="mt-3 text-muted-foreground">
              Not a generic plan pulled from a template - every recommendation is built from what you actually trained.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex gap-4 p-7 rounded-2xl bg-card shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_2px_6px_rgba(0,0,0,0.2)]"
              >
                <div className="flex items-center justify-center size-10 rounded-lg bg-foreground text-background shrink-0">
                  <feature.icon className="size-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {feature.description}
                    {feature.emphasis && <strong className="text-foreground font-semibold">{feature.emphasis}</strong>}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Progress showcase */}
      <section className="px-6 py-20 md:px-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
              <span className="size-1.5 rounded-full bg-green-600" />
              Progress, proven
            </div>
            <h2 className="text-3xl font-bold tracking-tight max-w-[14ch] text-balance">
              Watch your strength climb, not guess at it.
            </h2>
            <p className="mt-4 text-muted-foreground max-w-sm">
              Every session you log becomes a data point. PrimeCoach tracks each lift over time and shows you the trend line, not just the last number.
            </p>
            <div className="flex gap-9 mt-8">
              <div>
                <span className="block text-2xl font-bold font-mono">+18%</span>
                <span className="block text-sm text-muted-foreground mt-0.5">Bench Press in 8 weeks</span>
              </div>
              <div>
                <span className="block text-2xl font-bold font-mono">12</span>
                <span className="block text-sm text-muted-foreground mt-0.5">sessions tracked</span>
              </div>
            </div>
          </div>

          <Card className="p-7">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="font-semibold text-sm">Bench Press</p>
                <p className="text-sm text-muted-foreground mt-0.5">Working weight, last 12 sessions</p>
              </div>
              <span className="inline-flex items-center gap-1 text-green-600 font-semibold text-sm">
                <ArrowUp className="size-3.5" />+12.5kg
              </span>
            </div>
            <StrengthChart />
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 md:px-12" id="how-it-works">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold">How it works</h2>
            <p className="mt-3 text-muted-foreground">Three steps between you and coaching built on your own data.</p>
          </div>
          <div className="flex flex-col gap-14">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-6 items-start">
                <div className="flex items-center justify-center size-10 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">{step.description}</p>

                  {step.example && (
                    <div className="mt-3.5 inline-block bg-muted rounded-lg px-3.5 py-2 font-mono text-sm">
                      {step.example}
                    </div>
                  )}

                  {step.tags && (
                    <div className="mt-3.5 flex flex-wrap gap-2">
                      {step.tags.map((tag) => (
                        <span key={tag} className="text-xs font-medium bg-muted px-2.5 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 py-20 md:px-12 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold">Start your fitness journey today</h2>
          <p className="mt-4 text-primary-foreground/80">
            Join PrimeCoach and get AI-powered coaching tailored to your goals, your body, and your progress.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="mt-8 gap-2">
              Start Training Free <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 md:px-12 border-t">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Dumbbell className="size-5" />
            <span className="font-semibold">PrimeCoach</span>
          </div>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} PrimeCoach. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

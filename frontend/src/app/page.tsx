"use client";

import { useEffect, useRef, useState } from "react";
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
  Menu,
  X,
  BarChart3,
  AlertTriangle,
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

const analysisRows = [
  {
    icon: BarChart3,
    tone: "good" as const,
    title: "Strong session",
    description: "Your pressing volume increased 7% compared to last week.",
  },
  {
    icon: TrendingUp,
    tone: "good" as const,
    title: "Bench performance",
    description: "Reps at 80kg are trending upward.",
  },
  {
    icon: Zap,
    tone: "good" as const,
    title: "Recommendation",
    description: "Next session: 82.5kg × 6–8",
  },
  {
    icon: AlertTriangle,
    tone: "warn" as const,
    title: "Watch out",
    description: "Keep an eye on shoulder fatigue due to increased pressing volume.",
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

  const W = 720, H = 240, PAD_L = 42, PAD_R = 24, PAD_T = 20, PAD_B = 28;
  const plotW = W - PAD_L - PAD_R, plotH = H - PAD_T - PAD_B;
  const n = STRENGTH_DATA.length;
  const yMin = 68, yMax = 84;
  const x = (i: number) => PAD_L + (i / (n - 1)) * plotW;
  const y = (v: number) => PAD_T + plotH - ((v - yMin) / (yMax - yMin)) * plotH;
  const linePts = STRENGTH_DATA.map((v, i) => `${x(i)},${y(v)}`).join(" ");
  const areaPts = `${x(0)},${y(yMin)} ${linePts} ${x(n - 1)},${y(yMin)}`;

  return (
    <div className="relative mt-2 h-56 md:h-64 lg:h-auto lg:flex-1">
      <svg width="100%" height="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="strengthFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.16" className="text-brand" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" className="text-brand" />
          </linearGradient>
        </defs>
        {[68, 72, 76, 80, 84].map((v) => (
          <line key={v} x1={PAD_L} y1={y(v)} x2={W - PAD_R} y2={y(v)} className="stroke-border" strokeWidth={1} vectorEffect="non-scaling-stroke" />
        ))}
        <polygon points={areaPts} fill="url(#strengthFill)" />
        <polyline
          points={linePts}
          fill="none"
          className="stroke-brand"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
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

      {/* Axis labels + endpoint dot rendered as HTML, positioned by percentage,
          so they stay perfectly round/legible regardless of how the SVG stretches. */}
      {[68, 72, 76, 80, 84].map((v) => (
        <span
          key={v}
          className="absolute left-0 -translate-y-1/2 text-xs text-muted-foreground tabular-nums"
          style={{ top: `${(y(v) / H) * 100}%` }}
        >
          {v}
        </span>
      ))}
      <div
        className="absolute size-2.5 rounded-full bg-brand -translate-x-1/2 -translate-y-1/2"
        style={{ left: `${(x(n - 1) / W) * 100}%`, top: `${(y(STRENGTH_DATA[n - 1]) / H) * 100}%` }}
      />

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [showStickyCta, setShowStickyCta] = useState(false);
  const heroCtaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = heroCtaRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setShowStickyCta(!entry.isIntersecting), {
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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
          <Link href="/login" className="hidden sm:block">
            <Button size="lg" variant="outline" className="px-6 border-2 border-foreground">Login</Button>
          </Link>
          <button
            className="sm:hidden p-2 -mr-2"
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
          >
            <Menu className="size-5" />
          </button>
        </div>
      </header>

      {/* Mobile nav drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[78%] max-w-xs bg-background p-6 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Dumbbell className="size-5" />
                <span className="font-bold">PrimeCoach</span>
              </div>
              <button aria-label="Close menu" onClick={() => setMenuOpen(false)}>
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-6 text-base font-medium">
              <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
              <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it Works</a>
              <Link href="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            </nav>
            <Link href="/signup" className="mt-8" onClick={() => setMenuOpen(false)}>
              <Button size="lg" className="w-full gap-2 bg-brand text-brand-foreground hover:bg-brand/90 text-base">
                Start Training <ArrowRight className="size-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="px-6 py-10 md:px-12 md:py-20 grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] lg:grid-rows-2 gap-8 lg:gap-x-14 lg:gap-y-4 items-center max-w-6xl mx-auto w-full">
        <div className="lg:col-start-1 lg:row-start-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-5">
            <span className="size-1.5 rounded-full bg-brand" />
            Built from your actual training data
          </div>
          <h1 className="text-[2.5rem] md:text-6xl font-extrabold tracking-tight leading-[1.05] max-w-xl text-balance">
            Better results start with better analysis.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-md">
            PrimeCoach analyzes every workout you log and turns it into recommendations built around your training and your goals.
          </p>
        </div>

        <Card className="p-6 shadow-[0_24px_48px_-16px_rgba(0,0,0,0.18)] lg:col-start-2 lg:row-start-1 lg:row-span-2">
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
              <span className="inline-flex items-center gap-1 text-brand font-sans font-semibold text-xs">
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

        <div ref={heroCtaRef} className="lg:col-start-1 lg:row-start-2 self-start">
          <div className="flex items-center gap-5 flex-wrap">
            <Link href="/signup">
              <Button size="lg" className="gap-2 h-11 px-6 bg-brand text-brand-foreground hover:bg-brand/90 text-base">
                Start Training <ArrowRight className="size-4" />
              </Button>
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              See how it works <ChevronDown className="size-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Tagline */}
      <section className="px-6 md:px-12 mt-4 md:mt-8">
        <p className="max-w-2xl mx-auto text-center text-lg md:text-xl font-medium italic text-balance">
          &ldquo;PrimeCoach is like having a knowledgeable training partner who remembers how you train and guides you toward your goals.&rdquo;
        </p>
      </section>

      {/* Progress showcase */}
      <section className="px-6 py-12 md:py-20 md:px-12">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-10 lg:gap-14 items-stretch">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">
              <span className="size-1.5 rounded-full bg-brand" />
              Progress, proven
            </div>
            <h2 className="text-4xl font-bold tracking-tight max-w-[14ch] text-balance">
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

          <Card className="p-7 lg:flex lg:flex-col">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="font-semibold text-sm">Bench Press</p>
                <p className="text-sm text-muted-foreground mt-0.5">Working weight, last 12 sessions</p>
              </div>
              <span className="inline-flex items-center gap-1 text-brand font-semibold text-sm">
                <ArrowUp className="size-3.5" />+12.5kg
              </span>
            </div>
            <StrengthChart />
          </Card>
        </div>
      </section>

      {/* Real Example */}
      <section className="px-6 py-12 md:py-16 md:px-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold tracking-tight text-balance">Just log your workout like you normally do.</h2>
            <p className="mt-3 text-muted-foreground">Type in any format. PrimeCoach understands it.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-stretch">
            <div className="relative bg-zinc-900 text-zinc-100 rounded-2xl p-6 font-mono text-sm leading-relaxed">
              <span className="block text-[11px] font-semibold uppercase tracking-wide text-zinc-500 mb-3">
                Your input
              </span>
              <pre className="whitespace-pre-wrap font-mono">{`chest today

bench 80x8 80x7 75x10
incline db 30x10 30x9
cable fly 15x12 15x10

felt strong today 💪`}</pre>
              <div className="absolute right-5 bottom-5 size-9 rounded-full bg-brand flex items-center justify-center">
                <ArrowRight className="size-4 text-zinc-900" />
              </div>
            </div>

            <Card className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-4">AI Analysis</p>
              <div className="divide-y">
                {analysisRows.map((row) => (
                  <div key={row.title} className="flex gap-3 py-3 first:pt-0 last:pb-0">
                    <div
                      className={`flex items-center justify-center size-8 rounded-lg shrink-0 ${
                        row.tone === "good" ? "bg-brand/10 text-brand" : "bg-amber-500/10 text-amber-600"
                      }`}
                    >
                      <row.icon className="size-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold">{row.title}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">{row.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-12 md:py-16 md:px-12" id="features">
        <div className="max-w-5xl mx-auto rounded-[2rem] bg-muted ring-1 ring-foreground/10 p-8 md:p-14">
          <div className="max-w-lg mx-auto text-center mb-12">
            <h2 className="text-4xl font-bold tracking-tight">A coach that understands how you train</h2>
            <p className="mt-3 text-muted-foreground">
              Not a generic plan pulled from a template - every recommendation is built from what you actually trained.
            </p>
          </div>
          <div className="flex overflow-x-auto snap-x snap-mandatory scroll-px-8 gap-4 -mx-8 px-8 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid md:grid-cols-2 md:gap-7 md:overflow-visible md:mx-0 md:px-0 md:pb-0">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="shrink-0 w-[82%] snap-start md:w-auto md:shrink flex flex-col gap-3 p-7 rounded-2xl bg-card shadow-[0_0_0_1px_rgba(0,0,0,0.1),0_2px_6px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_2px_6px_rgba(0,0,0,0.2)]"
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
          <p className="mt-3 text-center text-xs text-muted-foreground md:hidden">Swipe for more →</p>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-12 md:py-20 md:px-12" id="how-it-works">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold tracking-tight">How it works</h2>
            <p className="mt-3 text-muted-foreground">Three steps between you and coaching built on your own data.</p>
          </div>
          <div className="flex flex-col gap-14">
            {steps.map((step, idx) => (
              <div key={step.number} className="relative flex gap-6 items-start">
                <div className="relative z-10 flex items-center justify-center size-10 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                  {step.number}
                </div>
                {idx < steps.length - 1 && (
                  <div className="absolute left-5 top-10 w-px bg-border h-[calc(100%+1rem)]" />
                )}
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
      <section className="px-6 py-12 md:py-20 md:px-12 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold tracking-tight">Start your fitness journey today</h2>
          <p className="mt-4 text-primary-foreground/80">
            Join PrimeCoach and get AI-powered coaching tailored to your goals, your body, and your progress.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="mt-8 gap-2">
              Start Training <ArrowRight className="size-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 md:px-12 border-t pb-24 lg:pb-8">
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

      {/* Sticky mobile CTA */}
      <div
        className={`fixed inset-x-0 bottom-0 z-40 lg:hidden border-t bg-background/90 backdrop-blur px-4 py-3 transition-transform duration-200 ${
          showStickyCta ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <Link href="/signup">
          <Button size="lg" className="w-full gap-2 bg-brand text-brand-foreground hover:bg-brand/90 text-base">
            Start Training <ArrowRight className="size-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

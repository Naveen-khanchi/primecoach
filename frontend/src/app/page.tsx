"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dumbbell,
  TrendingUp,
  Brain,
  CalendarDays,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "AI Workout Analysis",
    description:
      "Log your workout in any format. Our AI analyzes your session, scores your performance, and gives actionable feedback.",
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
      "Receive a full week plan with exercises, sets, reps, and weight targets — built from your actual data, not generic templates.",
  },
];

const steps = [
  {
    number: "1",
    title: "Create Your Profile",
    description:
      "Tell us your goals, fitness level, and current strength.",
  },
  {
    number: "2",
    title: "Log Your Workouts",
    description:
      "Type your workout in any format — natural language, shorthand, anything.",
  },
  {
    number: "3",
    title: "Get AI Coaching",
    description:
      "Receive personalized analysis, progress insights, and smart recommendations.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 md:px-12">
        <div className="flex items-center gap-2">
          <Dumbbell className="size-6" />
          <span className="text-xl font-bold">PrimeCoach</span>
        </div>
        <Link href="/login">
          <Button size="lg" variant="outline" className="px-6 border-2 border-foreground">Login</Button>
        </Link>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 py-20 md:py-32">
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl max-w-3xl">
          Your AI-Powered Personal Fitness Coach
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl">
          No generic plans. PrimeCoach analyzes your real workouts, tracks your
          progress, and gives you personalized coaching — powered by AI.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/signup">
            <Button size="lg" className="gap-2">
              Get Started <ArrowRight className="size-4" />
            </Button>
          </Link>
          <Button size="lg" variant="outline">
            Learn More
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-20 md:px-12 bg-muted/50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything you need to train smarter
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="flex gap-4 p-6 rounded-xl bg-background border"
              >
                <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 shrink-0">
                  <feature.icon className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="mt-1 text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-6 py-20 md:px-12">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            How it works
          </h2>
          <div className="flex flex-col gap-10">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-6 items-start">
                <div className="flex items-center justify-center size-10 rounded-full bg-primary text-primary-foreground font-bold shrink-0">
                  {step.number}
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{step.title}</h3>
                  <p className="mt-1 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-6 py-20 md:px-12 bg-primary text-primary-foreground">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold">
            Start your fitness journey today
          </h2>
          <p className="mt-4 text-primary-foreground/80">
            Join PrimeCoach and get AI-powered coaching tailored to your goals,
            your body, and your progress.
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="mt-8 gap-2">
              Sign Up Free <ArrowRight className="size-4" />
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Dumbbell } from "lucide-react";
import SignupIllustration from "@/components/shared/signup-illustration";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);

    // TODO: Replace with actual API call when auth backend is ready
    // await axios.post("/auth/login", { email: form.email, password: form.password });

    setTimeout(() => {
      setLoading(false);
      router.push("/app/dashboard");
    }, 500);
  }

  return (
    <div className="flex min-h-screen">
      {/* Left — Form */}
      <div className="flex flex-col w-full md:w-1/2">
        <header className="flex items-center px-6 py-4 md:px-12">
          <Link href="/" className="flex items-center gap-2">
            <Dumbbell className="size-6" />
            <span className="text-xl font-bold">PrimeCoach</span>
          </Link>
        </header>

        <main className="flex flex-1 items-center justify-center px-6 pt-0 pb-12">
          <Card className="w-full max-w-md border-0 shadow-none">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome back</CardTitle>
              <CardDescription>
                Log in to continue your fitness journey
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive">{error}</p>
                )}

                <Button type="submit" size="lg" className="mt-2" disabled={loading}>
                  {loading ? "Logging in..." : "Login"}
                </Button>

                <p className="text-sm text-center text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-foreground font-medium underline underline-offset-4">
                    Sign Up
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>

      {/* Right — Animated Illustration (full height, hidden on mobile) */}
      <div className="hidden md:block w-1/2 h-screen sticky top-0 overflow-hidden bg-[#222222]">
        <SignupIllustration />
      </div>
    </div>
  );
}

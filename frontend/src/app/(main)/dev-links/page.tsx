import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Check, X } from "lucide-react";

const pages = [
  { href: "/", label: "Landing Page", done: true },
  { href: "/signup", label: "Sign Up", done: true },
  { href: "/login", label: "Login", done: true },
  { href: "/onboarding", label: "Onboarding", done: true },
  { href: "/dashboard", label: "Dashboard", done: true },
  { href: "/workout/log", label: "Log Workout", done: true },
  { href: "/workout/history", label: "Sessions History", done: false },
  { href: "/progress", label: "Progress", done: false },
  { href: "/recommendations/next-session", label: "Recommendations", done: false },
  { href: "/exercises", label: "Exercises", done: false },
  { href: "/profile", label: "Profile", done: false },
];

export default function DevLinksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dev Links</h1>
        <p className="text-muted-foreground mt-1">All pages — click to navigate</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {pages.map((page) => (
          <Link key={page.href} href={page.href}>
            <Card className="p-4 hover:shadow-md transition-shadow flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{page.label}</p>
                <p className="text-xs text-muted-foreground">{page.href}</p>
              </div>
              {page.done ? (
                <div className="size-6 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Check className="size-3 text-green-600" />
                </div>
              ) : (
                <div className="size-6 rounded-full bg-red-500/10 flex items-center justify-center">
                  <X className="size-3 text-red-500" />
                </div>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

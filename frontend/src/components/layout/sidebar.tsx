"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Dumbbell,
  LayoutDashboard,
  ClipboardPen,
  History,
  TrendingUp,
  Brain,
  Library,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, disabled: false },
  { href: "/workout/log", label: "Log Workout", icon: ClipboardPen, disabled: false },
  { href: "/workout/history", label: "Sessions", icon: History, disabled: false },
  { href: "/progress", label: "Progress", icon: TrendingUp, disabled: false },
  { href: "/recommendations/next-session", label: "Recommendations", icon: Brain, disabled: true },
  { href: "/exercises", label: "Exercises", icon: Library, disabled: false },
  { href: "/profile", label: "Profile", icon: User, disabled: false },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  function handleLogout() {
    localStorage.removeItem("userId");
    router.replace("/login");
  }

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-background border"
      >
        <Menu className="size-5" />
      </button>

      {/* Overlay (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-60 bg-background border-r flex flex-col transition-transform md:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:sticky md:top-0`}
      >
        {/* Logo + close button */}
        <div className="flex items-center justify-between px-5 py-5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Dumbbell className="size-6" />
            <span className="text-xl font-bold">PrimeCoach</span>
          </Link>
          <button onClick={() => setOpen(false)} className="md:hidden">
            <X className="size-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-2">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(item.href + "/");

              if (item.disabled) {
                return (
                  <li key={item.href}>
                    <span className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground/40 cursor-not-allowed">
                      <item.icon className="size-4" />
                      {item.label}
                      <span className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded">Soon</span>
                    </span>
                  </li>
                );
              }

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="size-4" />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t">
          <div className="flex items-center justify-between px-3">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center">
                <User className="size-4 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium">User</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Log out"
            >
              <LogOut className="size-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

"use client";

import Sidebar from "@/components/layout/sidebar";
import { useRequireAuth } from "@/lib/auth";
import { Loader2 } from "lucide-react";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userId = useRequireAuth();

  if (!userId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 px-6 py-6 md:px-10 md:py-8">
        {children}
      </main>
    </div>
  );
}

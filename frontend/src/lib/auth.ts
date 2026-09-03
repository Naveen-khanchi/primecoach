"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Guards client-side pages that require a logged-in user.
 * Redirects to /login if no userId is found in localStorage.
 *
 * Returns `userId: null` while the check is in flight — callers should
 * treat that as "not ready to render yet", not "logged out".
 */
export function useRequireAuth() {
  const router = useRouter();
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const stored = Number(localStorage.getItem("userId"));
    if (!stored) {
      router.replace("/login");
      return;
    }
    setUserId(stored);
  }, [router]);

  return userId;
}

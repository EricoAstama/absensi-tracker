"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function DashboardRefresh({ intervalMs = 60_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    let lastRefresh = Date.now();
    let timer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (document.visibilityState === "visible") {
          lastRefresh = Date.now();
          router.refresh();
        }
        schedule();
      }, intervalMs);
    };
    const refreshWhenReturning = () => {
      if (document.visibilityState === "visible" && Date.now() - lastRefresh >= intervalMs) {
        lastRefresh = Date.now();
        router.refresh();
        schedule();
      }
    };

    schedule();
    document.addEventListener("visibilitychange", refreshWhenReturning);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", refreshWhenReturning);
    };
  }, [intervalMs, router]);

  return null;
}

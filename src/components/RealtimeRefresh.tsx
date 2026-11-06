"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function RealtimeRefresh({ tables, intervalMs = 15000 }: { tables: string[]; intervalMs?: number }) {
  const router = useRouter();
  const key = tables.join(",");
  useEffect(() => {
    const supabase = createClient();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const refresh = () => { clearTimeout(timer); timer = setTimeout(() => router.refresh(), 350); };
    let channel = supabase.channel(`dashboard:${key}`);
    for (const table of key.split(",")) channel = channel.on("postgres_changes", { event: "*", schema: "public", table }, refresh);
    channel.subscribe();
    const poll = setInterval(() => router.refresh(), intervalMs);
    return () => { clearTimeout(timer); clearInterval(poll); void supabase.removeChannel(channel); };
  }, [intervalMs, key, router]);
  return null;
}

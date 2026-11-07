import { redirect } from "next/navigation";
import { cache } from "react";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/rbac";

export const getSessionProfile = cache(async function getSessionProfile() {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = error ? null : data?.claims?.sub;
  if (!userId) return null;
  const { data: profile } = await supabase.from("profiles").select("id, full_name, role, department").eq("id", userId).single();
  if (!profile) return null;
  return { user: { id: userId }, profile: profile as { id: string; full_name: string; role: AppRole; department: string | null } };
});

export async function requireRole(allowed: AppRole[]) {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  if (!allowed.includes(session.profile.role)) redirect(session.profile.role === "employee" ? "/employee" : "/hc");
  return session;
}

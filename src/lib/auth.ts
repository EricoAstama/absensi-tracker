import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { AppRole } from "@/lib/rbac";

export async function getSessionProfile() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("id, full_name, role, department").eq("id", user.id).single();
  if (!profile) return null;
  return { user, profile: profile as { id: string; full_name: string; role: AppRole; department: string | null } };
}

export async function requireRole(allowed: AppRole[]) {
  const session = await getSessionProfile();
  if (!session) redirect("/login");
  if (!allowed.includes(session.profile.role)) redirect(session.profile.role === "employee" ? "/employee" : "/hc");
  return session;
}

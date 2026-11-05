import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { createAttendanceWorkbook, type AttendanceExportRow } from "@/lib/export-xlsx";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const session = await getSessionProfile();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  if (!hasPermission(session.profile.role, "report:export")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const url = new URL(request.url);
  const date = url.searchParams.get("date") || new Date().toISOString().slice(0, 10);
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.from("attendances").select("date,slot_1_time,slot_1_status,slot_2_time,slot_2_status,slot_3_time,slot_3_status,slot_4_time,slot_4_status,profiles!inner(full_name)").eq("date", date);
  if (error) return NextResponse.json({ error: "Gagal mengambil laporan" }, { status: 500 });
  const time = (value: string | null) => value ? new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "";
  const rows: AttendanceExportRow[] = [];
  for (const row of data || []) {
    const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
    rows.push({ name: profile?.full_name || "-", date: row.date, s1: time(row.slot_1_time), st1: row.slot_1_status || "absent", s2: time(row.slot_2_time), st2: row.slot_2_status || "absent", s3: time(row.slot_3_time), st3: row.slot_3_status || "absent", s4: time(row.slot_4_time), st4: row.slot_4_status || "absent" });
  }
  const buffer = await createAttendanceWorkbook(rows);
  return new Response(buffer, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="laporan-absensi-${date}.xlsx"`, "Cache-Control": "private, no-store" } });
}

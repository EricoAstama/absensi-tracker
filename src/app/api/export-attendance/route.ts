import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { displaySlotStatus, type SlotStatus } from "@/lib/attendance";
import { createAttendanceWorkbook, type AttendanceExportRow } from "@/lib/export-xlsx";
import { fetchAll } from "@/lib/fetch-all";
import { jakartaDate } from "@/lib/date-time";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const session = await getSessionProfile();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  if (!hasPermission(session.profile.role, "report:export")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const url = new URL(request.url);
  const date = url.searchParams.get("date") || jakartaDate();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return NextResponse.json({ error: "Tanggal tidak valid" }, { status: 400 });
  const supabase = await createServerSupabaseClient();
  let employees, attendances;
  try {
    [employees, attendances] = await Promise.all([
      fetchAll((from, to) => supabase.from("profiles").select("id,full_name").eq("role", "employee").order("full_name").order("id").range(from, to)),
      fetchAll((from, to) => supabase.from("attendances").select("user_id,slot_1_time,slot_1_status,slot_2_time,slot_2_status,slot_3_time,slot_3_status,slot_4_time,slot_4_status").eq("date", date).order("user_id").range(from, to)),
    ]);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil laporan" }, { status: 500 });
  }
  const byUser = new Map(attendances.map(row => [row.user_id, row]));
  const time = (value: string | null) => value ? new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" }).format(new Date(value)) : "";
  const rows: AttendanceExportRow[] = [];
  for (const employee of employees) {
    const row = byUser.get(employee.id);
    rows.push({ name: employee.full_name, date, s1: time(row?.slot_1_time || null), st1: row?.slot_1_time ? row.slot_1_status || "on_time" : "absent", s2: time(row?.slot_2_time || null), st2: row?.slot_2_time ? row.slot_2_status || "on_time" : "absent", s3: time(row?.slot_3_time || null), st3: row?.slot_3_time ? row.slot_3_status || "on_time" : "absent", s4: time(row?.slot_4_time || null), st4: row?.slot_4_time ? displaySlotStatus(4, row.slot_4_time, row.slot_4_status as SlotStatus) : "absent" });
  }
  const buffer = await createAttendanceWorkbook(rows);
  return new Response(buffer, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="laporan-absensi-${date}.xlsx"`, "Cache-Control": "private, no-store" } });
}

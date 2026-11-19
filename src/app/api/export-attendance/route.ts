import { NextResponse } from "next/server";
import { getSessionProfile } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { attendanceExportRows, createAttendanceWorkbook } from "@/lib/export-xlsx";
import { exportDates } from "@/lib/export-period";
import { fetchAll } from "@/lib/fetch-all";
import { jakartaDate } from "@/lib/date-time";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const session = await getSessionProfile();
  if (!session) return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  if (!hasPermission(session.profile.role, "report:export")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const url = new URL(request.url);
  const date = url.searchParams.get("date") || jakartaDate();
  let dates: string[];
  try { dates = exportDates(date, url.searchParams.get("period") ?? "day"); }
  catch { return NextResponse.json({ error: "Tanggal atau periode ekspor tidak valid" }, { status: 400 }); }
  const supabase = await createServerSupabaseClient();
  let employees, attendances;
  try {
    [employees, attendances] = await Promise.all([
      fetchAll((from, to) => supabase.from("profiles").select("id,full_name").eq("role", "employee").order("full_name").order("id").range(from, to)),
      fetchAll((from, to) => supabase.from("attendances").select("user_id,date,slot_1_time,slot_1_status,slot_2_time,slot_2_status,slot_3_time,slot_3_status,slot_4_time,slot_4_status").gte("date", dates[0]).lte("date", date).order("date").order("user_id").range(from, to)),
    ]);
  } catch {
    return NextResponse.json({ error: "Gagal mengambil laporan" }, { status: 500 });
  }
  const rows = attendanceExportRows(employees, attendances, dates);
  const buffer = await createAttendanceWorkbook(rows);
  const filenameDate = dates.length === 1 ? date : `${dates[0]}_${date}`;
  return new Response(buffer, { headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="laporan-absensi-${filenameDate}.xlsx"`, "Cache-Control": "private, no-store" } });
}

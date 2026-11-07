import { AttendanceFlow } from "@/components/AttendanceFlow";
import { Topbar } from "@/components/Topbar";
import { getSessionProfile } from "@/lib/auth";
import { jakartaDate } from "@/lib/date-time";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Attendance() {
  const session = await getSessionProfile();
  const supabase = await createServerSupabaseClient();
  const { data: attendance } = await supabase
    .from("attendances")
    .select("slot_1_time,slot_2_time,slot_3_time,slot_4_time")
    .eq("user_id", session!.user.id)
    .eq("date", jakartaDate())
    .maybeSingle();

  return <><Topbar eyebrow="Presensi" title="Ambil selfie & lokasi"/><AttendanceFlow initialAttendance={attendance || {}}/></>;
}

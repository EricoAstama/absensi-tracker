import { ExternalLink } from "lucide-react";
import { AttendanceFlow } from "@/components/AttendanceFlow";
import { Topbar } from "@/components/Topbar";
import { slots } from "@/lib/attendance";
import { getSessionProfile } from "@/lib/auth";
import { formatTime, jakartaDate } from "@/lib/date-time";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Attendance() {
  const session = await getSessionProfile();
  const supabase = await createServerSupabaseClient();
  const { data: attendance } = await supabase
    .from("attendances")
    .select("slot_1_time,slot_1_photo_url,slot_2_time,slot_2_photo_url,slot_3_time,slot_3_photo_url,slot_4_time,slot_4_photo_url")
    .eq("user_id", session!.user.id)
    .eq("date", jakartaDate())
    .maybeSingle();

  const row = attendance as Record<string, string | null> | null;
  return <>
    <Topbar eyebrow="Presensi" title="Ambil selfie & lokasi"/>
    <AttendanceFlow initialAttendance={attendance || {}}/>
    <section className="panel p-5 mt-5">
      <h2 className="font-extrabold">Bukti selfie hari ini</h2>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3 mt-4">
        {slots.map(slot => {
          const time = row?.[`slot_${slot.id}_time`];
          const photoUrl = row?.[`slot_${slot.id}_photo_url`];
          return <div key={slot.id} className="rounded-xl border border-[var(--line)] p-4">
            <p className="text-sm font-bold">{slot.name}</p>
            <p className="text-xs text-[var(--muted)] mt-1">{time ? `${formatTime(time)} WIB` : "Belum tercatat"}</p>
            {photoUrl && <a href={photoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full mt-3 text-sm"><ExternalLink size={15}/>Lihat selfie</a>}
          </div>;
        })}
      </div>
    </section>
  </>;
}

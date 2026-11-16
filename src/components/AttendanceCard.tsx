import { Check, Clock, Coffee, DoorOpen, ExternalLink, Sunrise, Sunset } from "lucide-react";
import { statusBadgeClass, statusLabel, type SlotStatus } from "@/lib/attendance";

const icons = { sunrise: Sunrise, coffee: Coffee, door: DoorOpen, sunset: Sunset };

export function AttendanceCard({ slot, name, target, time, status, photoUrl, icon, active = false }: {
  slot: number;
  name: string;
  target: string;
  time?: string;
  status?: SlotStatus;
  photoUrl?: string | null;
  icon: keyof typeof icons;
  active?: boolean;
}) {
  const Icon = icons[icon];
  return <article className={`panel p-5 ${active ? "ring-2 ring-[#65a981] shadow-soft" : ""}`}>
    <div className="flex justify-between">
      <div className={`h-11 w-11 rounded-xl grid place-items-center ${time ? "bg-[#def3e7] text-[#196c4a]" : "bg-[#f0f2ee] text-[#718079]"}`}><Icon size={20}/></div>
      <span className="label">Slot {slot}</span>
    </div>
    <h3 className="mt-5 font-extrabold">{name}</h3>
    <p className="text-xs text-[var(--muted)] mt-1">Target {target}</p>
    <div className="h-px bg-[var(--line)] my-4"/>
    {time ? <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <strong className="text-xl">{time}</strong>
        <span className={`badge ${statusBadgeClass(status || "on_time")}`}><Check size={12}/>{statusLabel(status || "on_time")}</span>
      </div>
      {photoUrl && <a href={photoUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary w-full mt-4 text-sm"><ExternalLink size={15}/>Lihat selfie</a>}
    </> : <div className="flex items-center gap-2 text-sm text-[var(--muted)]"><Clock size={15}/>{active ? "Slot aktif — siap presensi" : "Belum tercatat"}</div>}
  </article>;
}

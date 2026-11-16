import { jakartaMinutes } from "./date-time";

export type SlotNumber = 1 | 2 | 3 | 4;
export type SlotStatus = "on_time" | "late" | "early_out" | "overtime" | "absent";

export const slots = [
  { id: 1, name: "Masuk pagi", target: "07:30", window: "00:00–09:30", icon: "sunrise" },
  { id: 2, name: "Keluar istirahat", target: "12:00", window: "09:31–12:15", icon: "coffee" },
  { id: 3, name: "Masuk istirahat", target: "13:00", window: "12:16–14:30", icon: "door" },
  { id: 4, name: "Pulang kerja", target: "16:30", window: "14:31–23:59", icon: "sunset" },
] as const;

export function getActiveSlot(date = new Date()): SlotNumber {
  const minutes = jakartaMinutes(date);
  if (minutes <= 570) return 1;
  if (minutes <= 735) return 2;
  if (minutes <= 870) return 3;
  return 4;
}

export function getSlotStatusForMinutes(slot: SlotNumber, minutes: number): SlotStatus {
  const target = { 1: 450, 2: 720, 3: 780, 4: 990 }[slot];
  if (slot === 4) return minutes < target ? "early_out" : minutes > target ? "overtime" : "on_time";
  if (slot === 2) return minutes < target ? "early_out" : "on_time";
  return minutes <= target ? "on_time" : "late";
}

export function getSlotStatus(slot: SlotNumber, date = new Date()): SlotStatus {
  return getSlotStatusForMinutes(slot, jakartaMinutes(date));
}

export function displaySlotStatus(slot: SlotNumber, time: string | null | undefined, status: SlotStatus | null | undefined): SlotStatus {
  if (slot === 4 && time && status === "on_time" && jakartaMinutes(new Date(time)) > 990) return "overtime";
  return status || "on_time";
}

export function statusLabel(status: SlotStatus) {
  return ({ on_time: "Tepat waktu", late: "Terlambat", early_out: "Pulang awal", overtime: "Overtime", absent: "Belum hadir" })[status];
}

export function statusBadgeClass(status: SlotStatus) {
  if (status === "late" || status === "early_out") return "bg-red-50 text-red-700";
  if (status === "overtime") return "bg-blue-50 text-blue-700";
  if (status === "absent") return "bg-gray-100 text-gray-600";
  return "bg-[#e5f7ed] text-[#176b49]";
}

import { AttendanceFlow } from "@/components/AttendanceFlow";
import { Topbar } from "@/components/Topbar";

export default function Attendance() {
  return <><Topbar eyebrow="Presensi" title="Ambil selfie & lokasi"/><AttendanceFlow/></>;
}

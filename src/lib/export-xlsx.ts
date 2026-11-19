import ExcelJS from "exceljs";
import { displaySlotStatus, type SlotStatus } from "./attendance";
import { formatTime } from "./date-time";
export type AttendanceExportRow = { name: string; date: string; s1: string; st1: string; s2: string; st2: string; s3: string; st3: string; s4: string; st4: string };
type Attendance = { user_id: string; date: string } & Partial<Record<`slot_${1 | 2 | 3 | 4}_${"time" | "status"}`, string | null>>;

export function attendanceExportRows(employees: { id: string; full_name: string }[], attendances: Attendance[], dates: string[]): AttendanceExportRow[] {
  const byUserDate = new Map(attendances.map(row => [`${row.user_id}:${row.date}`, row]));
  return dates.flatMap(date => employees.map(employee => {
    const row = byUserDate.get(`${employee.id}:${date}`);
    return {
      name: employee.full_name, date,
      s1: formatTime(row?.slot_1_time) || "", st1: row?.slot_1_time ? row.slot_1_status || "on_time" : "absent",
      s2: formatTime(row?.slot_2_time) || "", st2: row?.slot_2_time ? row.slot_2_status || "on_time" : "absent",
      s3: formatTime(row?.slot_3_time) || "", st3: row?.slot_3_time ? row.slot_3_status || "on_time" : "absent",
      s4: formatTime(row?.slot_4_time) || "", st4: row?.slot_4_time ? displaySlotStatus(4, row.slot_4_time, row.slot_4_status as SlotStatus) : "absent",
    };
  }));
}

export async function createAttendanceWorkbook(rows: AttendanceExportRow[]) {
  const workbook = new ExcelJS.Workbook(); workbook.creator = "Hadir Workforce"; workbook.created = new Date();
  const sheet = workbook.addWorksheet("Kehadiran", { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = [{header:"Nama Pekerja",key:"name",width:28},{header:"Tanggal",key:"date",width:14},{header:"Slot 1 (07:30)",key:"s1",width:20},{header:"Status 1",key:"st1",width:16},{header:"Slot 2 (12:00)",key:"s2",width:20},{header:"Status 2",key:"st2",width:16},{header:"Slot 3 (13:00)",key:"s3",width:20},{header:"Status 3",key:"st3",width:16},{header:"Slot 4 (16:30)",key:"s4",width:20},{header:"Status 4",key:"st4",width:16}];
  rows.forEach(row => sheet.addRow(row));
  sheet.getRow(1).eachCell(cell => { cell.font={bold:true,color:{argb:"FFFFFFFF"}};cell.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FF196C4A"}}; });
  sheet.autoFilter={from:"A1",to:"J1"};
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

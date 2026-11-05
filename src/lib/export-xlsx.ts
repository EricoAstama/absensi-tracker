import ExcelJS from "exceljs";
export type AttendanceExportRow = { name: string; date: string; s1: string; st1: string; s2: string; st2: string; s3: string; st3: string; s4: string; st4: string };
export async function createAttendanceWorkbook(rows: AttendanceExportRow[]) {
  const workbook = new ExcelJS.Workbook(); workbook.creator = "Hadir Workforce"; workbook.created = new Date();
  const sheet = workbook.addWorksheet("Kehadiran", { views: [{ state: "frozen", ySplit: 1 }] });
  sheet.columns = [{header:"Nama Pekerja",key:"name",width:28},{header:"Tanggal",key:"date",width:14},{header:"Slot 1 (07:30)",key:"s1",width:20},{header:"Status 1",key:"st1",width:16},{header:"Slot 2 (11:30)",key:"s2",width:20},{header:"Status 2",key:"st2",width:16},{header:"Slot 3 (13:00)",key:"s3",width:20},{header:"Status 3",key:"st3",width:16},{header:"Slot 4 (16:30)",key:"s4",width:20},{header:"Status 4",key:"st4",width:16}];
  rows.forEach(row => sheet.addRow(row));
  sheet.getRow(1).eachCell(cell => { cell.font={bold:true,color:{argb:"FFFFFFFF"}};cell.fill={type:"pattern",pattern:"solid",fgColor:{argb:"FF196C4A"}}; });
  sheet.autoFilter={from:"A1",to:"J1"};
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

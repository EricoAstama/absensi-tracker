import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { attendanceExportRows, createAttendanceWorkbook } from "./export-xlsx";
import { exportDates } from "./export-period";
describe("XLSX export",()=>{it("creates a readable workbook with ten columns",async()=>{const output=await createAttendanceWorkbook([{name:"User Test",date:"2026-11-05",s1:"07:20",st1:"on_time",s2:"",st2:"absent",s3:"",st3:"absent",s4:"",st4:"absent"}]);expect(output.subarray(0,2).toString()).toBe("PK");const workbook=new ExcelJS.Workbook();await workbook.xlsx.load(new Uint8Array(output).buffer as ArrayBuffer);const sheet=workbook.getWorksheet("Kehadiran");expect(sheet?.columnCount).toBe(10);expect(sheet?.getCell("A2").value).toBe("User Test")})});

describe("period export", () => {
  it.each([ ["day", 1], ["week", 7], ["month", 30] ] as const)("writes every employee and date for %s", async (period, days) => {
    const dates = exportDates("2026-11-19", period);
    const rows = attendanceExportRows(
      [{ id: "a", full_name: "A" }, { id: "b", full_name: "B" }],
      [
        { user_id: "a", date: "2026-11-18", slot_1_time: "2026-11-18T00:15:00Z", slot_1_status: "on_time" },
        { user_id: "a", date: "2026-11-19", slot_1_time: "2026-11-19T01:00:00Z", slot_1_status: "late" },
      ], dates,
    );
    expect(rows).toHaveLength(days * 2);
    expect(rows[rows.length - 2]).toMatchObject({ name: "A", date: "2026-11-19", st1: "late", st2: "absent" });
    expect(rows[rows.length - 1]).toMatchObject({ name: "B", date: "2026-11-19", s1: "", st1: "absent", st2: "absent", st3: "absent", st4: "absent" });
    if (days > 1) expect(rows.find(row => row.name === "A" && row.date === "2026-11-18")?.st1).toBe("on_time");
    const workbook = new ExcelJS.Workbook();
    const output = await createAttendanceWorkbook(rows);
    await workbook.xlsx.load(new Uint8Array(output).buffer as ArrayBuffer);
    const sheet = workbook.getWorksheet("Kehadiran")!;
    expect(sheet.rowCount).toBe(days * 2 + 1);
    expect(sheet.getCell("B2").value).toBe(dates[0]);
    expect(sheet.getCell(`B${sheet.rowCount}`).value).toBe("2026-11-19");
  });
});

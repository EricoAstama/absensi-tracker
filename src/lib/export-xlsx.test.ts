import { describe, expect, it } from "vitest";
import ExcelJS from "exceljs";
import { createAttendanceWorkbook } from "./export-xlsx";
describe("XLSX export",()=>{it("creates a readable workbook with ten columns",async()=>{const output=await createAttendanceWorkbook([{name:"User Test",date:"2026-11-05",s1:"07:20",st1:"on_time",s2:"",st2:"absent",s3:"",st3:"absent",s4:"",st4:"absent"}]);expect(output.subarray(0,2).toString()).toBe("PK");const workbook=new ExcelJS.Workbook();await workbook.xlsx.load(output);const sheet=workbook.getWorksheet("Kehadiran");expect(sheet?.columnCount).toBe(10);expect(sheet?.getCell("A2").value).toBe("User Test")})});

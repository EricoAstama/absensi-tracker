"use client";

import { useId, useState } from "react";
import { Download } from "lucide-react";
import { exportDates } from "@/lib/export-period";
import { formatDate } from "@/lib/date-time";

export function AttendanceExport({ endDate }: { endDate: string }) {
  const id = useId();
  const [date, setDate] = useState(endDate);
  const [period, setPeriod] = useState("day");
  let dates: string[] = [];
  try { dates = exportDates(date, period); } catch { /* Date input may be empty while editing. */ }

  return <form action="/api/export-attendance" method="get" className="panel p-4 mb-5">
    <p className="font-bold mb-3">Ekspor Excel</p>
    <div className="flex flex-col sm:flex-row sm:items-end gap-3">
      <div><label htmlFor={`${id}-period`} className="label">Periode</label>
        <select id={`${id}-period`} name="period" value={period} onChange={event => setPeriod(event.target.value)} className="field mt-1">
          <option value="day">1 hari</option>
          <option value="week">1 minggu (7 hari)</option>
          <option value="month">1 bulan (30 hari)</option>
        </select>
      </div>
      <div><label htmlFor={`${id}-date`} className="label">Tanggal akhir (WIB)</label>
        <input id={`${id}-date`} name="date" type="date" required value={date} onChange={event => setDate(event.target.value)} className="field mt-1"/>
      </div>
      <button type="submit" disabled={!dates.length} className="btn btn-primary disabled:opacity-50"><Download size={16}/>Unduh Excel</button>
    </div>
    {dates.length > 0 && <p className="text-xs text-[var(--muted)] mt-3">{formatDate(dates[0])} – {formatDate(dates[dates.length - 1])} · Termasuk tanggal akhir dan akhir pekan.</p>}
  </form>;
}

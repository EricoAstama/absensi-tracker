export function exportDates(endDate: string, period: string = "day"): string[] {
  const days = period === "day" ? 1 : period === "week" ? 7 : period === "month" ? 30 : 0;
  const end = new Date(`${endDate}T00:00:00.000Z`);
  if (!days || !/^\d{4}-\d{2}-\d{2}$/.test(endDate) || !Number.isFinite(end.getTime()) || end.toISOString().slice(0, 10) !== endDate) {
    throw new Error("Tanggal atau periode ekspor tidak valid");
  }
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end);
    date.setUTCDate(date.getUTCDate() - days + 1 + index);
    return date.toISOString().slice(0, 10);
  });
}

export const APP_TIME_ZONE = "Asia/Jakarta";

export function jakartaDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: APP_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

export function jakartaMinutes(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: APP_TIME_ZONE, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(date);
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value || 0);
  return value("hour") * 60 + value("minute");
}

export function formatTime(value: string | null | undefined) {
  if (!value) return undefined;
  return new Intl.DateTimeFormat("id-ID", { timeZone: APP_TIME_ZONE, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(value));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", { timeZone: APP_TIME_ZONE, day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00+07:00`));
}

export function monthRange(date = new Date()) {
  const [year, month] = jakartaDate(date).split("-").map(Number);
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const nextMonth = month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`;
  return { start, nextMonth };
}

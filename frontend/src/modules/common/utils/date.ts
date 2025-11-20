import { format, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

export function formatDate(date: Date | string, formatStr: string = "yyyy-MM-dd"): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: ko });
}

export function formatDateTime(date: Date | string): string {
  return formatDate(date, "yyyy-MM-dd HH:mm:ss");
}


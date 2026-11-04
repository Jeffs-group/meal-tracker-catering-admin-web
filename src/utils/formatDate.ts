/**
 * Date formatting utilities for Jeffs Group - Meal Tracker
 */

export function formatDateTimeIST(dateInput: string | number | Date): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    return (
      new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: "Asia/Kolkata",
      }).format(d) + " IST"
    );
  } catch {
    return String(dateInput);
  }
}

export function formatDateShort(dateInput: string | number | Date): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return String(dateInput);
  }
}

export function getTodayFormatted(): string {
  const now = new Date();
  return `Today, ${new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(now)}`;
}

export function formatTimeOnlyIST(dateInput?: string | number | Date | null): string {
  try {
    if (!dateInput) return "18:00 IST";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "18:00 IST";
    return (
      new Intl.DateTimeFormat("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Kolkata",
      }).format(d) + " IST"
    );
  } catch {
    return "18:00 IST";
  }
}

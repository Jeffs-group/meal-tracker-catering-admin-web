import { useState, useEffect } from "react";
import type { MealPeriodConfig, PeriodState } from "@/types/catering.types";
import {
  VITE_MOCK_NOW,
  getTodayDateString,
  getTodayHeaderFormatted,
} from "@/constants/catering";

// Deterministic mock clock during node/SSR test executions; live clock in browser
const MOCK_TIME_MS = new Date(VITE_MOCK_NOW).getTime();
const IS_MOCK = typeof window === "undefined";

/**
 * Returns current timestamp. In live mode returns real current date.
 */
export function getNow(): Date {
  if (IS_MOCK) {
    return new Date(MOCK_TIME_MS);
  }
  return new Date();
}

/**
 * Hook that updates every 30s.
 */
export function useNow(): Date {
  const [now, setNow] = useState<Date>(() => getNow());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(getNow());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return now;
}

/**
 * Parses "HH:mm" on a given date in IST into a Date object
 */
export function parseTimeToISTDate(timeStr: string, dateStr: string = getTodayDateString()): Date {
  const [hours, minutes] = timeStr.split(":").map(Number);
  // Formats to ISO with +05:30 offset
  const hStr = String(hours).padStart(2, "0");
  const mStr = String(minutes).padStart(2, "0");
  return new Date(`${dateStr}T${hStr}:${mStr}:00+05:30`);
}

/**
 * Evaluates the live operational state of a meal period
 */
export function getPeriodState(
  period: MealPeriodConfig,
  now: Date = getNow(),
  operatingDate: string = getTodayDateString(),
): PeriodState {
  if (!period.enabled) {
    return "disabled";
  }

  // If no start and end time configured (Meal 1 - Meal 4)
  if (!period.start || !period.end) {
    return "live";
  }

  const startDate = parseTimeToISTDate(period.start, operatingDate);
  const endDate = parseTimeToISTDate(period.end, operatingDate);
  const nowMs = now.getTime();

  if (nowMs < startDate.getTime()) {
    return "upcoming";
  }
  if (nowMs >= startDate.getTime() && nowMs < endDate.getTime()) {
    return "live";
  }
  return "closed";
}

/**
 * Formats countdown or window schedule string:
 * "Closes in 1h 38m" / "Opens in 5h 38m" / "Opens at 07:00 PM"
 */
export function formatCountdown(
  period: MealPeriodConfig,
  now: Date = getNow(),
  operatingDate: string = getTodayDateString(),
): string {
  const state = getPeriodState(period, now, operatingDate);

  if (state === "disabled") {
    return "Not served today";
  }

  if (!period.start || !period.end) {
    return "Active session";
  }

  const startDate = parseTimeToISTDate(period.start, operatingDate);
  const endDate = parseTimeToISTDate(period.end, operatingDate);
  const nowMs = now.getTime();

  if (state === "live") {
    const diffMs = endDate.getTime() - nowMs;
    const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    if (h > 0) {
      return `Closes in ${h}h ${m}m`;
    }
    return `Closes in ${m}m`;
  }

  if (state === "upcoming") {
    const diffMs = startDate.getTime() - nowMs;
    const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    const h = Math.floor(diffMins / 60);
    const m = diffMins % 60;
    if (h > 0) {
      return `Opens in ${h}h ${m}m`;
    }
    return `Opens in ${m}m`;
  }

  return `Window closed at ${formatIST12h(period.end)}`;
}

/**
 * Converts "HH:mm" 24h string to "hh:mm AM/PM"
 */
export function formatIST12h(time24?: string): string {
  if (!time24) return "--:--";
  const parts = time24.split(":");
  const hStr = parts[0] ?? "0";
  const mStr = parts[1] ?? "00";
  let h = parseInt(hStr, 10) || 0;
  const m = mStr;
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12;
  h = h ? h : 12; // 0 becomes 12
  return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
}

/**
 * Formats ISO timestamp or Date into "hh:mm AM/PM" in IST
 */
export function formatTimestampIST(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (isNaN(d.getTime())) return "--:--";

  return d.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Formats ISO timestamp to "Today, hh:mm AM" or "DD MMM YYYY, hh:mm AM"
 */
export function formatDateTimeIST(isoOrDate: string | Date): string {
  const d = typeof isoOrDate === "string" ? new Date(isoOrDate) : isoOrDate;
  if (isNaN(d.getTime())) return "--";

  const dateStr = d.toLocaleDateString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timeStr = formatTimestampIST(d);
  const todayStr = getTodayHeaderFormatted();
  if (dateStr === todayStr) {
    return `Today, ${timeStr}`;
  }
  return `${dateStr}, ${timeStr}`;
}

/**
 * Compute SHA-256 Ledger digest (SubtleCrypto) over ordered record IDs + timestamps
 * Returns first 8 hex characters.
 */
export async function computeLedgerDigest(
  records: Array<{ id: string; providedAt: string }>,
): Promise<string> {
  if (!records || records.length === 0) {
    return "00000000";
  }

  const sorted = [...records].sort(
    (a, b) => new Date(a.providedAt).getTime() - new Date(b.providedAt).getTime(),
  );

  const payload = sorted.map((r) => `${r.id}:${r.providedAt}`).join("|");

  try {
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    return hex.slice(0, 8).toUpperCase();
  } catch {
    // Fallback simple checksum if subtle crypto unavailable
    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      hash = (hash << 5) - hash + payload.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).padStart(8, "0").slice(0, 8).toUpperCase();
  }
}

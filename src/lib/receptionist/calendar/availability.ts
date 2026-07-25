/**
 * Availability model for discovery-call slots (pure, deterministic).
 *
 * `generateSlots` takes the config, the current time, and the busy intervals
 * returned by the provider, and produces up to N concrete, conflict-free slots
 * inside business hours over the booking horizon. It is fully deterministic
 * given its inputs (no randomness, time injected), so it is unit-testable across
 * timezones, DST, conflicts, and expiry.
 *
 * Availability is NEVER invented: a caller must pass real provider busy data,
 * and a provider error is represented as a null busy list upstream so the flow
 * fails closed.
 */
import { createHash } from "node:crypto";
import type { OfferedSlot } from "@/lib/receptionist/schema";

/** Busy interval in epoch milliseconds. */
export type Interval = { start: number; end: number };

export type AvailabilityConfig = {
  timezone: string; // IANA tz for business hours + labels
  businessStartHour: number; // local hour [0..23]
  businessEndHour: number; // local hour [0..23], exclusive end of the last start
  durationMinutes: number;
  bufferMinutes: number; // gap enforced around existing events AND between slots
  horizonDays: number; // how far ahead to look
  leadMinutes: number; // earliest a slot may start from "now"
  slotsToOffer: number; // 2..3 typically
  workdays: number[]; // JS getDay() 0=Sun..6=Sat
};

const num = (v: string | undefined, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

export function availabilityConfig(env: NodeJS.ProcessEnv = process.env): AvailabilityConfig {
  return {
    timezone: env.CALENDAR_TIMEZONE || "America/Toronto",
    businessStartHour: num(env.CALENDAR_BUSINESS_START_HOUR, 9),
    businessEndHour: num(env.CALENDAR_BUSINESS_END_HOUR, 17),
    durationMinutes: num(env.CALENDAR_SLOT_MINUTES, 30),
    bufferMinutes: num(env.CALENDAR_BUFFER_MINUTES, 15),
    horizonDays: num(env.CALENDAR_HORIZON_DAYS, 10),
    leadMinutes: num(env.CALENDAR_LEAD_MINUTES, 120),
    slotsToOffer: Math.max(1, Math.min(3, num(env.CALENDAR_SLOTS_TO_OFFER, 3))),
    workdays: (env.CALENDAR_WORKDAYS || "1,2,3,4,5").split(",").map((s) => Number(s.trim())).filter((n) => n >= 0 && n <= 6),
  };
}

/** Milliseconds to add to a UTC instant to get wall-clock time in `timeZone`. */
export function tzOffsetMs(instant: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
  const p = Object.fromEntries(dtf.formatToParts(instant).map((x) => [x.type, x.value])) as Record<string, string>;
  const hour = p.hour === "24" ? 0 : Number(p.hour);
  const asUTC = Date.UTC(Number(p.year), Number(p.month) - 1, Number(p.day), hour, Number(p.minute), Number(p.second));
  return asUTC - instant.getTime();
}

/** The UTC instant for a wall-clock time in `timeZone` (DST-correct). */
export function zonedWallTimeToUtc(y: number, mo1: number, d: number, h: number, mi: number, timeZone: string): Date {
  const naiveUtc = Date.UTC(y, mo1 - 1, d, h, mi, 0);
  const off1 = tzOffsetMs(new Date(naiveUtc), timeZone);
  const utc1 = naiveUtc - off1;
  const off2 = tzOffsetMs(new Date(utc1), timeZone);
  return new Date(off2 === off1 ? utc1 : naiveUtc - off2);
}

/** Wall-clock parts of a UTC instant in `timeZone`. */
function partsInTz(instant: Date, timeZone: string) {
  const dtf = new Intl.DateTimeFormat("en-US", { timeZone, hour12: false, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short" });
  const p = Object.fromEntries(dtf.formatToParts(instant).map((x) => [x.type, x.value])) as Record<string, string>;
  return { year: Number(p.year), month: Number(p.month), day: Number(p.day), hour: p.hour === "24" ? 0 : Number(p.hour) };
}

export function labelInTz(instant: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", hour12: true, timeZoneName: "short",
  }).format(instant);
}

export function slotId(startIso: string, endIso: string): string {
  return createHash("sha256").update(`${startIso}|${endIso}`).digest("hex").slice(0, 24);
}

/** Default minutes an offered slot set stays valid before it must be re-queried. */
export const SLOT_TTL_MINUTES = 15;

/** True while the offered slots are still fresh (and their start is still in the future). */
export function slotsAreFresh(offeredAtIso: string | null, now: Date, ttlMinutes = SLOT_TTL_MINUTES): boolean {
  if (!offeredAtIso) return false;
  const offeredAt = Date.parse(offeredAtIso);
  if (!Number.isFinite(offeredAt)) return false;
  return now.getTime() - offeredAt <= ttlMinutes * 60_000;
}

/** JS getDay() for a UTC instant, evaluated in `timeZone`. */
function weekdayInTz(instant: Date, timeZone: string): number {
  const wd = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(instant);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
}

/**
 * Deterministically produce up to `slotsToOffer` conflict-free slots. `busy` is
 * the provider's confirmed busy intervals (epoch ms). A slot conflicts if, when
 * padded by the buffer, it overlaps any busy interval.
 */
export function generateSlots(config: AvailabilityConfig, now: Date, busy: Interval[]): OfferedSlot[] {
  const durMs = config.durationMinutes * 60_000;
  const bufMs = config.bufferMinutes * 60_000;
  const stepMin = config.durationMinutes + config.bufferMinutes;
  const earliest = now.getTime() + config.leadMinutes * 60_000;
  const conflicts = (startMs: number, endMs: number) =>
    busy.some((b) => startMs - bufMs < b.end && endMs + bufMs > b.start);

  const out: OfferedSlot[] = [];
  const base = partsInTz(now, config.timezone);
  for (let dayOffset = 0; dayOffset <= config.horizonDays && out.length < config.slotsToOffer; dayOffset++) {
    // Normalize the target calendar day (in tz) by anchoring at local noon.
    const dp = partsInTz(zonedWallTimeToUtc(base.year, base.month, base.day + dayOffset, 12, 0, config.timezone), config.timezone);
    if (!config.workdays.includes(weekdayInTz(zonedWallTimeToUtc(dp.year, dp.month, dp.day, 12, 0, config.timezone), config.timezone))) continue;
    const businessEnd = zonedWallTimeToUtc(dp.year, dp.month, dp.day, config.businessEndHour, 0, config.timezone).getTime();
    for (let m = config.businessStartHour * 60; out.length < config.slotsToOffer; m += stepMin) {
      const hour = Math.floor(m / 60);
      const minute = m % 60;
      if (hour >= config.businessEndHour) break;
      const startMs = zonedWallTimeToUtc(dp.year, dp.month, dp.day, hour, minute, config.timezone).getTime();
      const endMs = startMs + durMs;
      if (endMs > businessEnd) break; // slot would run past business hours
      if (startMs < earliest) continue; // too soon
      if (conflicts(startMs, endMs)) continue; // overlaps a busy interval (with buffer)
      const startIso = new Date(startMs).toISOString();
      const endIso = new Date(endMs).toISOString();
      out.push({ slot_id: slotId(startIso, endIso), start: startIso, end: endIso, timezone: config.timezone, label: labelInTz(new Date(startMs), config.timezone) });
    }
  }
  return out.slice(0, config.slotsToOffer);
}

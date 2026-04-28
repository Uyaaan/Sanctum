import { formatInTimeZone, toZonedTime } from 'date-fns-tz';
import { format as fnsFormat, parseISO } from 'date-fns';

/**
 * Returns the user's local "today" as a YYYY-MM-DD string.
 * Pass the user's timezone (e.g. 'Asia/Manila' from profile.sanctum_bell_timezone).
 * Falls back to UTC if zone is missing.
 */
export function todayInZone(timezone = 'UTC') {
  return formatInTimeZone(new Date(), timezone, 'yyyy-MM-dd');
}

/**
 * Format a YYYY-MM-DD date string for display, using the system locale.
 * Parses as local midnight (not UTC) to avoid timezone drift on display.
 */
export function formatLogDate(dateStr, pattern = 'EEEE, MMMM d') {
  return fnsFormat(parseISO(dateStr), pattern);
}

/**
 * Convert a Date instance to the same instant in the given zone, returning a Date
 * whose getFullYear/getMonth/getDate reflect that zone. Useful when you need to
 * derive a local Y/M/D for queries or display.
 */
export { toZonedTime };

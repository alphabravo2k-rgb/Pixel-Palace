import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isValid } from "date-fns";

/**
 * 🎨 CLASS MERGER
 * Combines Tailwind classes safely (handles conflicts like px-4 + px-2)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * 📅 DATE FORMATTER
 * Converts ISO strings to readable formats
 * Standard: "Jan 12 • 14:30"
 */
export function formatDate(dateString, pattern = "MMM d • HH:mm") {
  if (!dateString) return "TBD";
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(date)) return "Invalid Date";
    return format(date, pattern);
  } catch (error) {
    return "TBD";
  }
}

/**
 * 📋 CLIPBOARD HELPER
 * Copies text (Server IP/Pass) and returns success/fail
 */
export async function copyToClipboard(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

/**
 * 🗺️ MAP NAME CLEANER
 * "de_mirage" -> "Mirage"
 */
export function formatMapName(rawName) {
  if (!rawName) return "TBA";
  // Remove 'de_' prefix and capitalize first letter
  return rawName.replace(/^de_/, '').replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * ✂️ TEXT TRUNCATOR
 * "Natus Vincere" -> "Natus..."
 */
export function truncate(str, length = 20) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

/**
 * 🔢 ELO COLOR GETTER
 * Returns a Tailwind text color class based on Faceit ELO
 */
export function getEloColor(elo) {
  if (!elo) return "text-gray-400";
  if (elo >= 3000) return "text-red-500";   // Pro
  if (elo >= 2500) return "text-orange-500"; // Challenger
  if (elo >= 2000) return "text-yellow-500"; // Master
  if (elo >= 1500) return "text-green-500";  // Diamond
  return "text-blue-400"; // Average
}

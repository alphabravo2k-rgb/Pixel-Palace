/**
 * 🛠️ PIXEL PALACE: UTILITY KERNEL (GENESIS OMNI)
 * VERSION: 2050.5.0
 * STATUS: OPERATIONAL // OPTIMIZED
 */

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isValid, formatDistanceToNow } from "date-fns";

/**
 * 🎨 CLASS MERGER (The cn() standard)
 * Perfectly merges Tailwind classes, resolving style conflicts.
 * Example: cn('px-4', 'px-8') -> 'px-8'
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * 📅 TEMPORAL FORMATTER
 * Converts ISO strings to Tactical Time formats.
 * Usage: formatDate('2025-01-01') -> "Jan 1 • 00:00"
 */
export function formatDate(dateString, pattern = "MMM d • HH:mm") {
  if (!dateString) return "TBD";
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
    if (!isValid(date)) return "INVALID_TIMESTAMP";
    return format(date, pattern);
  } catch (error) {
    return "TBD";
  }
}

/**
 * ⏳ RELATIVE TIME (Live Tracking)
 * Usage: "In 5 minutes" or "2 hours ago"
 */
export function getRelativeTime(dateString) {
  if (!dateString) return "";
  const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
  if (!isValid(date)) return "";
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * 📋 SECURE CLIPBOARD LINK
 * Essential for "Server IP" distribution.
 */
export async function copyToClipboard(text) {
  if (!text) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * 🗺️ MAP ID RESOLVER
 * Converts technical Map IDs to Clean Display Names.
 */
export function formatMapName(rawName) {
  if (!rawName) return "DECIDING...";
  const mapNames = {
    de_mirage: 'Mirage',
    de_inferno: 'Inferno',
    de_nuke: 'Nuke',
    de_vertigo: 'Vertigo',
    de_ancient: 'Ancient',
    de_anubis: 'Anubis',
    de_dust2: 'Dust 2'
  };
  return mapNames[rawName.toLowerCase()] || rawName.replace(/^de_/, '').replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * 🔢 ELO COLOR ENGINE
 * Synchronized with security/theme.js for visual consistency.
 */
export function getEloColor(elo) {
  const val = Number(elo) || 0;
  if (val >= 3000) return "text-fuchsia-400 drop-shadow-[0_0_8px_rgba(192,38,211,0.5)]"; // Titan Tier (Brand Glow)
  if (val >= 2500) return "text-red-500";    // Immortal
  if (val >= 2000) return "text-orange-500"; // Legend
  if (val >= 1500) return "text-yellow-500"; // Master
  if (val >= 1000) return "text-emerald-500"; // Elite
  return "text-zinc-500"; // Rookie
}

/**
 * 💰 CURRENCY FORMATTER
 * Handles Prize Pool distributions.
 */
export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * ✂️ TEXT TRUNCATOR
 * Safely shortens strings for mobile UIs.
 */
export function truncate(str, length = 20) {
  if (!str) return "";
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

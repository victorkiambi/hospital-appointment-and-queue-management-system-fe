import { format, parseISO } from 'date-fns'

/**
 * Formats a date string to a human-readable format.
 * @param {string} dateStr - The date string (ISO or 'YYYY-MM-DD HH:mm:ss').
 * @param {string} fmt - The date-fns format string (default: 'PPpp').
 * @returns {string} - Formatted date or '-' if invalid.
 */
export function formatDateTime(dateStr, fmt = 'PPpp') {
  if (!dateStr) return '-';
  try {
    // Support both ISO and 'YYYY-MM-DD HH:mm:ss' formats
    const iso = dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T');
    return format(parseISO(iso), fmt);
  } catch {
    return dateStr || '-';
  }
} 
/**
 * Centralized Date Formatting & Manipulation Utilities
 */

export function formatDisplayDate(val: any): string {
  if (!val) return '—';
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '—';
    const iso = val.toISOString();
    return iso.slice(0, 10) + ' ' + iso.slice(11, 19);
  }
  if (typeof val === 'string') {
    if (val.includes('T') && val.length >= 19) {
      return val.replace('T', ' ').slice(0, 19);
    }
    return val;
  }
  return String(val);
}

export function parseTransactionDate(val: any): string | null {
  if (!val) return null;
  if (typeof val === 'number') {
    // Excel epoch offset
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    return isNaN(date.getTime()) ? null : date.toISOString().split('T')[0];
  }
  const date = new Date(val);
  if (isNaN(date.getTime())) return String(val);
  return date.toISOString().split('T')[0];
}

/**
 * Keyword Detection and Illicit Substance / High-Risk Forensic Utilities
 */

export const HIGH_RISK_KEYWORDS = [
  'weed',
  'cann',
  'cannabis',
  'green',
  '420',
  'ganja',
  'vape',
  'bros',
  'cig',
  'leaf',
  'shrooms',
  'grow',
  'thc',
  'hash',
  'bud',
  'herb',
  'smoke',
  'happy',
  'kush',
  'cloud',
  'high',
  'bloom',
  'grass',
  '1519',
  'naked',
  'amigos',
  'micro',
  'lsd',
  'blaze'
];

export const KEYWORD_REGEX_PATTERN = HIGH_RISK_KEYWORDS.join('|');

/**
 * Checks if a string contains any high-risk keywords
 */
export function containsHighRiskKeyword(text: string | null | undefined): boolean {
  if (!text) return false;
  const regex = new RegExp(`\\b(${KEYWORD_REGEX_PATTERN})\\b`, 'i');
  return regex.test(String(text));
}

/**
 * Extracts matched keywords from text
 */
export function extractMatchedKeywords(text: string | null | undefined): string[] {
  if (!text) return [];
  const regex = new RegExp(`(${KEYWORD_REGEX_PATTERN})`, 'gi');
  const matches = String(text).match(regex);
  if (!matches) return [];
  return Array.from(new Set(matches.map(m => m.toLowerCase())));
}

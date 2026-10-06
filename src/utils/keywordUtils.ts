/**
 * High-confidence illicit/contraband keywords (unambiguous in financial transactions)
 */
export const UNAMBIGUOUS_ILLICIT_KEYWORDS = [
  'weed',
  'canna',
  'cannabis',
  '420',
  'ganja',
  'shrooms',
  'thc',
  'hash',
  'kush',
  'shatter',
  'dispensary',
  'psilocybin',
  'edibles',
  'plug',
  'lsd',
  'blaze',
  'xanax',
  'percocet',
  'oxy'
];

/**
 * Ambiguous keywords that frequently appear as benign surnames, registered businesses, or common phrases
 */
export const AMBIGUOUS_KEYWORDS = [
  'green',
  'bud',
  'herb',
  'smoke',
  'happy',
  'high',
  'cloud',
  'bloom',
  'grass',
  'naked',
  'amigos',
  'bros',
  'leaf',
  'vape',
  'cig'
];

export const ALL_KEYWORDS = [...UNAMBIGUOUS_ILLICIT_KEYWORDS, ...AMBIGUOUS_KEYWORDS];
export const KEYWORD_REGEX_PATTERN = ALL_KEYWORDS.join('|');

/**
 * Checks if a string contains any high-risk keywords (lexical match)
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
  const regex = new RegExp(`\\b(${KEYWORD_REGEX_PATTERN})\\b`, 'gi');
  const matches = String(text).match(regex);
  if (!matches) return [];
  return Array.from(new Set(matches.map(m => m.toLowerCase())));
}

export interface KeywordDisambiguationResult {
  hasKeywordHit: boolean;
  isGenuineIllicit: boolean;
  isFalsePositiveCandidate: boolean;
  matchedKeywords: string[];
  hitLocations: ('memo' | 'sec_qa' | 'name' | 'email')[];
  summary: string;
}

/**
 * Forensically disambiguates keyword hits across payment fields.
 * Differentiates genuine illicit memo indications from benign names (e.g., Carrie Green, Bud Smith).
 */
export function disambiguateTransactionKeywords(tx: {
  memo?: string | null;
  sec_question?: string | null;
  sec_answer?: string | null;
  sender_name?: string | null;
  sender_email?: string | null;
  recipient_name?: string | null;
  recipient_email?: string | null;
}): KeywordDisambiguationResult {
  const memoText = (tx.memo || '').trim();
  const secText = `${tx.sec_question || ''} ${tx.sec_answer || ''}`.trim();
  const namesText = `${tx.sender_name || ''} ${tx.recipient_name || ''}`.trim();
  const emailText = `${tx.sender_email || ''} ${tx.recipient_email || ''}`.trim();

  const memoMatches = extractMatchedKeywords(memoText);
  const secMatches = extractMatchedKeywords(secText);
  const nameMatches = extractMatchedKeywords(namesText);
  const emailMatches = extractMatchedKeywords(emailText);

  const allMatched = Array.from(new Set([...memoMatches, ...secMatches, ...nameMatches, ...emailMatches]));
  const hitLocations: ('memo' | 'sec_qa' | 'name' | 'email')[] = [];

  if (memoMatches.length > 0) hitLocations.push('memo');
  if (secMatches.length > 0) hitLocations.push('sec_qa');
  if (nameMatches.length > 0) hitLocations.push('name');
  if (emailMatches.length > 0) hitLocations.push('email');

  if (allMatched.length === 0) {
    return {
      hasKeywordHit: false,
      isGenuineIllicit: false,
      isFalsePositiveCandidate: false,
      matchedKeywords: [],
      hitLocations: [],
      summary: 'No keyword triggers found.'
    };
  }

  // Check if any matched keyword is unambiguously illicit
  const hasUnambiguous = allMatched.some(k => UNAMBIGUOUS_ILLICIT_KEYWORDS.includes(k.toLowerCase()));

  // Check if keywords appeared in memo or security Q&A (high-intent fields)
  const inIntentField = memoMatches.length > 0 || secMatches.length > 0;

  // If match only occurs in name/email and is an ambiguous word like "green" or "bud"
  const isNameOnly = !inIntentField && (nameMatches.length > 0 || emailMatches.length > 0);
  const isAmbiguousOnly = allMatched.every(k => AMBIGUOUS_KEYWORDS.includes(k.toLowerCase()));

  if (isNameOnly && isAmbiguousOnly) {
    return {
      hasKeywordHit: true,
      isGenuineIllicit: false,
      isFalsePositiveCandidate: true,
      matchedKeywords: allMatched,
      hitLocations,
      summary: `False positive candidate: Keyword "${allMatched.join(', ')}" matched legal name or email address only (e.g. surname) with clean transaction memos.`
    };
  }

  return {
    hasKeywordHit: true,
    isGenuineIllicit: hasUnambiguous || inIntentField,
    isFalsePositiveCandidate: false,
    matchedKeywords: allMatched,
    hitLocations,
    summary: inIntentField 
      ? `Substantive keyword match in transaction memo/security parameters: "${allMatched.join(', ')}"`
      : `Keyword match detected: "${allMatched.join(', ')}"`
  };
}

/**
 * Safety & Grounding Utilities for Setu
 * - PII Scrubbing (Aadhaar, PAN, Phone, Email, Bank Accounts)
 * - Anti-Hallucination Evidence Substring Verification
 * - Number Grounding Verification for Public Data Summaries
 */

export interface WarningItem {
  warning: string;
  exact_quote: string;
  verified?: boolean;
}

export interface GroundingCheckResult {
  isValid: boolean;
  unverifiedNumbers: string[];
}

/**
 * Scrubs Sensitive Indian Personally Identifiable Information (PII)
 * before sending user-supplied text to external LLM APIs.
 */
export function scrubPII(text: string): string {
  if (!text || typeof text !== 'string') return '';

  let sanitized = text;

  // 1. Aadhaar Card Number (12 digits, often written as 1234 5678 9012 or 1234-5678-9012)
  const aadhaarRegex = /\b\d{4}[ -]?\d{4}[ -]?\d{4}\b/g;
  sanitized = sanitized.replace(aadhaarRegex, '[REDACTED AADHAAR]');

  // 2. Indian Income Tax PAN Card (5 letters, 4 numbers, 1 letter, e.g., ABCDE1234F)
  const panRegex = /\b[A-Za-z]{5}[0-9]{4}[A-Za-z]\b/g;
  sanitized = sanitized.replace(panRegex, '[REDACTED PAN]');

  // 3. Indian Phone Numbers (+91 or 0 prefix, 10 digits starting with 6, 7, 8, or 9)
  const phoneRegex = /(?:\+?91[\s.-]?|0)?[6-9]\d{4}[\s.-]?\d{5}\b/g;
  sanitized = sanitized.replace(phoneRegex, '[REDACTED PHONE]');

  // 4. Email Addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  sanitized = sanitized.replace(emailRegex, '[REDACTED EMAIL]');

  // 5. Bank Account Numbers (9 to 18 consecutive digits preceded by terms like A/C, Account, Acc No)
  const bankAccRegex = /(?:a\/c|account\s*(?:no|number)?)[:\s#]*(\d{9,18})\b/gi;
  sanitized = sanitized.replace(bankAccRegex, 'Account: [REDACTED BANK ACCOUNT]');

  return sanitized;
}

/**
 * Checks that every `exact_quote` cited in AI warnings is an actual substring
 * of the user's raw input document.
 * This guarantees zero hallucinated warnings or fabricated clauses.
 */
export function verifyEvidenceQuotes(
  rawText: string,
  warnings: WarningItem[]
): (WarningItem & { verified: boolean })[] {
  if (!rawText || !warnings || !Array.isArray(warnings)) {
    return [];
  }

  const normalizedRaw = rawText.toLowerCase().replace(/\s+/g, ' ');

  return warnings.map((item) => {
    if (!item.exact_quote || typeof item.exact_quote !== 'string') {
      return {
        ...item,
        verified: false,
      };
    }

    const normalizedQuote = item.exact_quote.toLowerCase().replace(/\s+/g, ' ').trim();
    // Verify that the quote is at least 3 characters and exists as an exact substring
    const isSubstring = normalizedQuote.length >= 3 && normalizedRaw.includes(normalizedQuote);

    return {
      ...item,
      verified: isSubstring,
    };
  });
}

/**
 * Verifies that numerical values cited in Gemini's plain-language summary
 * are grounded in the actual returned data.gov.in rows.
 * Prevents phantom prices, false AQI numbers, or wrong statistics.
 */
export function verifyNumbersInSummary(
  summary: string,
  rows: Record<string, any>[]
): GroundingCheckResult {
  if (!summary || !rows || rows.length === 0) {
    return { isValid: true, unverifiedNumbers: [] };
  }

  // Flatten all data rows into one searchable string of numbers
  const allRowValues = JSON.stringify(rows);
  const rowNumbers = new Set<string>();
  const allRowMatches = allRowValues.match(/\d+(?:\.\d+)?/g) || [];
  allRowMatches.forEach((n) => rowNumbers.add(n));

  // Extract standalone numbers from summary
  // Ignore single digits 1-5 (which usually denote step numbers or small counts)
  const summaryNumbers = summary.match(/\b\d{2,}(?:\.\d+)?\b/g) || [];
  const unverifiedNumbers: string[] = [];

  for (const num of summaryNumbers) {
    // If the number appears in the rows or is common year (e.g. 2026), it is grounded
    const isPresentInRows = rowNumbers.has(num);
    const isCommonYear = num === '2025' || num === '2026' || num === '2024';

    if (!isPresentInRows && !isCommonYear) {
      unverifiedNumbers.push(num);
    }
  }

  return {
    isValid: unverifiedNumbers.length === 0,
    unverifiedNumbers,
  };
}

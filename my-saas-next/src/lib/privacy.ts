
/**
 * Privacy Layer for PII Protection
 * Ensures sensitive data never leaves the server infrastructure.
 */

const PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(\+62|62|0)8[1-9][0-9]{6,9}\b/g, // Indonesian Phone Format
  nik: /\b\d{16}\b/g, // 16 digit NIK
  creditCard: /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g,
  apiKey: /(sk-[a-zA-Z0-9]{20,T}|AIza[0-9A-Za-z-_]{35})/g,
  amount: /\b(Rp|IDR)\s?[\d,.]+\b/g // Optional: Financial masking
};

export const Privacy = {
  /**
   * Masks sensitive PII data from text
   */
  maskSensitiveData(text: string, options: { maskFinancials?: boolean } = { maskFinancials: false }): string {
    if (!text) return text;

    let masked = text;

    // 1. Mask Emails
    masked = masked.replace(PATTERNS.email, '[EMAIL_REDACTED]');

    // 2. Mask Phone Numbers
    masked = masked.replace(PATTERNS.phone, '[PHONE_REDACTED]');

    // 3. Mask NIK/KTP
    masked = masked.replace(PATTERNS.nik, '[NIK_REDACTED]');

    // 4. Mask Credit Cards
    masked = masked.replace(PATTERNS.creditCard, '[CC_REDACTED]');

    // 5. Mask API Keys (Safety net)
    masked = masked.replace(PATTERNS.apiKey, '[API_KEY_REDACTED]');

    // 6. Optional: Financial Data
    if (options.maskFinancials) {
       masked = masked.replace(PATTERNS.amount, '[AMOUNT_REDACTED]');
    }

    return masked;
  },

  /**
   * Check if text contains sensitive data (for alerts)
   */
  containssensitiveData(text: string): boolean {
    return (
      PATTERNS.email.test(text) ||
      PATTERNS.phone.test(text) ||
      PATTERNS.nik.test(text) ||
      PATTERNS.creditCard.test(text) ||
      PATTERNS.apiKey.test(text)
    );
  }
};

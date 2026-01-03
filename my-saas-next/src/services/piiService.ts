// src/services/piiService.ts

const patterns = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(\+62|62|0)8[1-9][0-9]{6,9}\b/g,
  nik: /\b\d{16}\b/g,
  creditCard: /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g
};

export const PiiService = {
  /**
   * Menyensor data sensitif dari text
   */
  mask(text: string): string {
    if (!text) return "";
    
    let maskedText = text;
    maskedText = maskedText.replace(patterns.email, '[REDACTED_EMAIL]');
    maskedText = maskedText.replace(patterns.phone, '[REDACTED_PHONE]');
    maskedText = maskedText.replace(patterns.nik, '[REDACTED_NIK]');
    maskedText = maskedText.replace(patterns.creditCard, '[REDACTED_CC]');

    return maskedText;
  }
};
// backend/src/services/piiService.js

class PiiService {
  constructor() {
    // Regex Patterns untuk data sensitif Indonesia & Umum
    this.patterns = {
      email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      phone: /(\+62|62|0)8[1-9][0-9]{6,9}\b/g, // Deteksi No HP Indonesia
      nik: /\b\d{16}\b/g, // Deteksi 16 digit angka (NIK KTP)
      creditCard: /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g // Kartu Kredit
    };
  }

  /**
   * Menyensor data sensitif dari text
   * @param {String} text - Text mentah
   * @returns {String} - Text yang sudah disensor
   */
  mask(text) {
    if (!text) return "";
    
    let maskedText = text;

    // Replace Email
    maskedText = maskedText.replace(this.patterns.email, '[REDACTED_EMAIL]');
    
    // Replace Phone
    maskedText = maskedText.replace(this.patterns.phone, '[REDACTED_PHONE]');
    
    // Replace NIK
    maskedText = maskedText.replace(this.patterns.nik, '[REDACTED_NIK]');
    
    // Replace CC
    maskedText = maskedText.replace(this.patterns.creditCard, '[REDACTED_CC]');

    return maskedText;
  }
}

module.exports = new PiiService();
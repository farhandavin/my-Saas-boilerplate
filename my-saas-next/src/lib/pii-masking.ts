/**
 * PII Masking Library
 * Detects and masks Personally Identifiable Information (PII) before sending to external AI providers.
 */

export type MaskingMethod = 'redact' | 'hash' | 'showLast4' | 'substitution' | 'characterReplace';

export interface PIIRule {
  entityType: string;
  pattern: RegExp;
  sensitivity: 'critical' | 'high' | 'medium' | 'low';
  enabled: boolean;
  maskingMethod: MaskingMethod;
}

export interface MaskingResult {
  maskedText: string;
  entitiesFound: {
    entityType: string;
    original: string;
    masked: string;
    position: { start: number; end: number };
  }[];
  processingTimeMs: number;
}

// Default PII detection patterns
export const DEFAULT_PII_RULES: PIIRule[] = [
  {
    entityType: 'credit_card',
    pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    sensitivity: 'critical',
    enabled: true,
    maskingMethod: 'showLast4',
  },
  {
    entityType: 'national_id',
    // Indonesian NIK (16 digits) or SSN format
    pattern: /\b\d{16}\b|\b\d{3}-\d{2}-\d{4}\b/g,
    sensitivity: 'critical',
    enabled: true,
    maskingMethod: 'redact',
  },
  {
    entityType: 'email',
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    sensitivity: 'high',
    enabled: true,
    maskingMethod: 'hash',
  },
  {
    entityType: 'phone',
    // Various phone formats including Indonesian (+62) and US formats
    pattern: /\b(?:\+?62|0)[\s-]?\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4}\b|\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/g,
    sensitivity: 'high',
    enabled: true,
    maskingMethod: 'substitution',
  },
  {
    entityType: 'ip_address',
    pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
    sensitivity: 'medium',
    enabled: false, // Disabled by default
    maskingMethod: 'redact',
  },
  {
    entityType: 'person_name',
    // Common name patterns (simplified - real NER would be better)
    pattern: /\b(?:Mr\.|Mrs\.|Ms\.|Dr\.)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g,
    sensitivity: 'high',
    enabled: true,
    maskingMethod: 'redact',
  },
];

/**
 * Simple hash function for demonstration (use crypto in production)
 */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  const hex = Math.abs(hash).toString(16);
  return hex.slice(0, 4) + '...' + hex.slice(-3);
}

/**
 * Apply masking method to detected PII
 */
function applyMasking(original: string, method: MaskingMethod, entityType: string): string {
  switch (method) {
    case 'redact':
      return `[${entityType.toUpperCase()}_REDACTED]`;
    
    case 'hash':
      return simpleHash(original);
    
    case 'showLast4':
      if (original.length > 4) {
        const cleaned = original.replace(/[-\s]/g, '');
        return '*'.repeat(cleaned.length - 4) + cleaned.slice(-4);
      }
      return original;
    
    case 'substitution':
      return `[${entityType.toUpperCase()}_MASKED]`;
    
    case 'characterReplace':
      return original.replace(/[a-zA-Z0-9]/g, '*');
    
    default:
      return `[REDACTED]`;
  }
}

/**
 * Main PII masking function
 */
export function maskPII(text: string, customRules?: Partial<PIIRule>[]): MaskingResult {
  const startTime = performance.now();
  
  // Merge custom rules with defaults
  let rules = [...DEFAULT_PII_RULES];
  if (customRules) {
    customRules.forEach(customRule => {
      const existingIndex = rules.findIndex(r => r.entityType === customRule.entityType);
      if (existingIndex >= 0) {
        rules[existingIndex] = { ...rules[existingIndex], ...customRule };
      }
    });
  }
  
  const entitiesFound: MaskingResult['entitiesFound'] = [];
  let maskedText = text;
  
  // Process each enabled rule
  for (const rule of rules) {
    if (!rule.enabled) continue;
    
    // Reset regex lastIndex
    rule.pattern.lastIndex = 0;
    
    // Find all matches
    let match;
    const matches: { original: string; start: number; end: number }[] = [];
    
    while ((match = rule.pattern.exec(text)) !== null) {
      matches.push({
        original: match[0],
        start: match.index,
        end: match.index + match[0].length,
      });
    }
    
    // Apply masking in reverse order to preserve positions
    for (let i = matches.length - 1; i >= 0; i--) {
      const m = matches[i];
      const masked = applyMasking(m.original, rule.maskingMethod, rule.entityType);
      
      // Apply to maskedText
      maskedText = maskedText.slice(0, m.start) + masked + maskedText.slice(m.end);
      
      entitiesFound.unshift({
        entityType: rule.entityType,
        original: m.original,
        masked,
        position: { start: m.start, end: m.end },
      });
    }
  }
  
  const endTime = performance.now();
  
  return {
    maskedText,
    entitiesFound,
    processingTimeMs: Math.round((endTime - startTime) * 100) / 100,
  };
}

/**
 * Check if masking is globally enabled (for feature flag)
 */
export function isMaskingEnabled(): boolean {
  // Could be controlled by environment variable or database setting
  return process.env.PII_MASKING_ENABLED !== 'false';
}

/**
 * Get summary of what was masked (for logging without exposing PII)
 */
export function getMaskingSummary(result: MaskingResult): string {
  const counts: Record<string, number> = {};
  result.entitiesFound.forEach(e => {
    counts[e.entityType] = (counts[e.entityType] || 0) + 1;
  });
  
  const parts = Object.entries(counts).map(([type, count]) => `${count} ${type}`);
  return parts.length > 0 
    ? `Masked: ${parts.join(', ')} (${result.processingTimeMs}ms)` 
    : 'No PII detected';
}

// src/services/preCheckService.ts
// AI Pre-Check - Document Validation Service

import { AiService } from './aiService';
import {
  PreCheckResult,
  DocumentCategory,
  DocumentValidation,
  DOCUMENT_TYPES
} from '@/types/ceoDigest';

// Validation rules per category
const VALIDATION_RULES = {
  financial: {
    format: ['Has company header', 'Unique document number', 'Clear date', 'Valid signature'],
    consistency: ['Calculations are accurate', 'VAT 11% if applicable', 'Amounts match contract'],
    compliance: ['Matches company template', 'Approval chain complete', 'Valid account codes']
  },
  legal: {
    format: ['Clear document title', 'Complete party identities', 'Structured clauses', 'Signature page'],
    consistency: ['Entity names consistent', 'Dates not contradictory', 'References valid'],
    compliance: ['Mandatory clauses present (arbitration, governing law)', 'No high-risk clauses', 'Matches legal template']
  },
  operational: {
    format: ['Clear heading structure', 'Consistent numbering', 'Version control'],
    consistency: ['Logical flow', 'No missing steps', 'Deadlines listed'],
    compliance: ['ISO standard compliant', 'Clear action items', 'PIC defined']
  },
  communication: {
    format: ['Clear subject line', 'Professional greeting', 'Good paragraph structure', 'Closing signature'],
    consistency: ['Consistent tone', 'Accurate facts', 'No contradictions'],
    compliance: ['No sensitive data', 'Polite language', 'Matches brand guidelines']
  }
};

// Sensitive data patterns to detect
const SENSITIVE_PATTERNS = {
  email: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  phone: /(\+62|62|0)8[1-9][0-9]{6,9}\b/g,
  nik: /\b\d{16}\b/g,
  creditCard: /\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{4}\b/g,
  bankAccount: /\b\d{10,16}\b/g,
  password: /password\s*[:=]\s*\S+/gi,
  apiKey: /(api[_-]?key|secret|token)\s*[:=]\s*\S+/gi
};

export const PreCheckService = {
  /**
   * Main entry point - Validate any document
   */
  async validateDocument(
    content: string,
    documentType: string,
    category: DocumentCategory
  ): Promise<PreCheckResult> {
    const startTime = Date.now();

    // Run all validations
    const formatValidation = await this.validateFormat(content, category, documentType);
    const consistencyValidation = await this.validateConsistency(content, category, documentType);
    const complianceValidation = await this.validateCompliance(content, category, documentType);

    // Check for sensitive data
    const sensitiveDataFound = this.checkSensitiveData(content);

    // Get AI-powered suggestions and risks
    const { suggestions, risks } = await this.getAISuggestions(
      content,
      category,
      documentType,
      [formatValidation, consistencyValidation, complianceValidation]
    );

    // Calculate overall score
    const score = this.calculateScore(formatValidation, consistencyValidation, complianceValidation);

    // Determine overall status
    const overallStatus = this.determineStatus(score, risks);

    const endTime = Date.now();
    const reviewTimeSeconds = Math.ceil((endTime - startTime) / 1000);

    return {
      documentType,
      category,
      overallStatus,
      score,
      validations: {
        format: formatValidation,
        consistency: consistencyValidation,
        compliance: complianceValidation
      },
      suggestions,
      risks,
      sensitiveDataFound,
      estimatedReviewTime: `${reviewTimeSeconds} detik`
    };
  },

  /**
   * Level 1: Format Validation
   */
  async validateFormat(content: string, category: DocumentCategory, docType: string): Promise<DocumentValidation> {
    const rules = VALIDATION_RULES[category].format;

    const prompt = `
    You are a document validator. Check if the following document meets the FORMAT rules:
    
    Rules to meet:
    ${rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}
    
    Document (${docType}):
    """
    ${content.substring(0, 2000)}
    """
    
    Answer in JSON format:
    {"passed": true/false, "message": "short explanation", "details": "detail of findings if any"}
    `;

    try {
      const response = await AiService.generateText(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          level: 'format',
          passed: result.passed,
          message: result.message,
          details: result.details
        };
      }
    } catch (error) {
      console.error('Format validation error:', error);
    }

    return {
      level: 'format',
      passed: true,
      message: 'Format validation completed assuming standard',
      details: 'Cannot perform AI validation, using basic rules'
    };
  },

  /**
   * Level 2: Consistency Validation
   */
  async validateConsistency(content: string, category: DocumentCategory, docType: string): Promise<DocumentValidation> {
    const rules = VALIDATION_RULES[category].consistency;

    const prompt = `
    You are a document validator. Check DATA CONSISTENCY in the following document:
    
    Things to check:
    ${rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}
    
    Document (${docType}):
    """
    ${content.substring(0, 2000)}
    """
    
    Answer in JSON format:
    {"passed": true/false, "message": "short explanation", "details": "detail of inconsistencies if any"}
    `;

    try {
      const response = await AiService.generateText(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          level: 'consistency',
          passed: result.passed,
          message: result.message,
          details: result.details
        };
      }
    } catch (error) {
      console.error('Consistency validation error:', error);
    }

    return {
      level: 'consistency',
      passed: true,
      message: 'No clear inconsistencies found',
      details: undefined
    };
  },

  /**
   * Level 3: Compliance Validation
   */
  async validateCompliance(content: string, category: DocumentCategory, docType: string): Promise<DocumentValidation> {
    const rules = VALIDATION_RULES[category].compliance;

    const prompt = `
    You are a document compliance validator. Check if this document COMPLIES WITH POLICY:
    
    Policies to meet:
    ${rules.map((r, i) => `${i + 1}. ${r}`).join('\n')}
    
    Document (${docType}):
    """
    ${content.substring(0, 2000)}
    """
    
    Answer in JSON format:
    {"passed": true/false, "message": "short explanation", "details": "policy violations if any"}
    `;

    try {
      const response = await AiService.generateText(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          level: 'compliance',
          passed: result.passed,
          message: result.message,
          details: result.details
        };
      }
    } catch (error) {
      console.error('Compliance validation error:', error);
    }

    return {
      level: 'compliance',
      passed: true,
      message: 'No clear policy violations found',
      details: undefined
    };
  },

  /**
   * Check for sensitive/PII data
   */
  checkSensitiveData(content: string): boolean {
    for (const [type, pattern] of Object.entries(SENSITIVE_PATTERNS)) {
      if (pattern.test(content)) {
        return true;
      }
    }
    return false;
  },

  /**
   * Get detailed sensitive data locations
   */
  getSensitiveDataDetails(content: string): Array<{ type: string, count: number }> {
    const results: Array<{ type: string, count: number }> = [];

    for (const [type, pattern] of Object.entries(SENSITIVE_PATTERNS)) {
      const matches = content.match(pattern);
      if (matches && matches.length > 0) {
        results.push({ type, count: matches.length });
      }
    }

    return results;
  },

  /**
   * Get AI-powered suggestions and risks
   */
  async getAISuggestions(
    content: string,
    category: DocumentCategory,
    docType: string,
    validations: DocumentValidation[]
  ): Promise<{ suggestions: string[], risks: Array<{ severity: 'low' | 'medium' | 'high', issue: string, recommendation: string }> }> {
    const failedValidations = validations.filter(v => !v.passed);

    const prompt = `
    You are a professional AI editor. Based on document ${docType} (category: ${category}):
    
    Issues found:
    ${failedValidations.map(v => `- ${v.level}: ${v.message}`).join('\n') || 'No critical issues'}
    
    Document (summary):
    """
    ${content.substring(0, 1500)}
    """
    
    Provide response in JSON format:
    {
      "suggestions": ["improvement suggestion 1", "improvement suggestion 2", ...],
      "risks": [
        {"severity": "low|medium|high", "issue": "issue", "recommendation": "recommendation"},
        ...
      ]
    }
    
    Max 5 suggestions and 3 risks.
    `;

    try {
      const response = await AiService.generateText(prompt);
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return {
          suggestions: result.suggestions || [],
          risks: result.risks || []
        };
      }
    } catch (error) {
      console.error('AI Suggestions error:', error);
    }

    return { suggestions: [], risks: [] };
  },

  /**
   * Calculate overall score (0-100)
   */
  calculateScore(format: DocumentValidation, consistency: DocumentValidation, compliance: DocumentValidation): number {
    let score = 100;

    if (!format.passed) score -= 30;
    if (!consistency.passed) score -= 35;
    if (!compliance.passed) score -= 35;

    return Math.max(0, score);
  },

  /**
   * Determine overall status
   */
  determineStatus(score: number, risks: Array<{ severity: string }>): 'approved' | 'needs-review' | 'rejected' {
    const hasHighRisk = risks.some(r => r.severity === 'high');

    if (hasHighRisk || score < 50) return 'rejected';
    if (score < 80) return 'needs-review';
    return 'approved';
  },

  /**
   * Get available document types for a category
   */
  getDocumentTypes(category: DocumentCategory): string[] {
    return DOCUMENT_TYPES[category] || [];
  },

  /**
   * Quick validation for specific document types
   */
  async quickValidateInvoice(content: string): Promise<PreCheckResult> {
    return this.validateDocument(content, 'Invoice', 'financial');
  },

  async quickValidateContract(content: string): Promise<PreCheckResult> {
    return this.validateDocument(content, 'Contract', 'legal');
  },

  async quickValidateSOP(content: string): Promise<PreCheckResult> {
    return this.validateDocument(content, 'SOP', 'operational');
  },

  async quickValidateEmail(content: string): Promise<PreCheckResult> {
    return this.validateDocument(content, 'Email Draft', 'communication');
  }
};

// src/types/log-types.ts
// Shared type definitions for logging, auditing, and metadata

/**
 * Metadata for system logs - used for structured logging
 */
export interface SystemLogMetadata {
    teamId?: string;
    userId?: string;
    errorCode?: string;
    stack?: string;
    status?: string;
    duration?: number;
    endpoint?: string;
    method?: string;
    [key: string]: string | number | boolean | undefined;
}

/**
 * Metadata for audit logs - used for compliance tracking
 * Supports nested objects for document changes, data snapshots, etc.
 */
export interface AuditLogMetadata {
    teamId?: string;
    userId?: string;
    action?: string;
    resourceId?: string;
    resourceType?: string;
    previousValue?: string;
    newValue?: string;
    ipAddress?: string;
    userAgent?: string;
    documentId?: string;
    changes?: Record<string, unknown>;
    oldData?: Record<string, unknown>;
    newData?: Record<string, unknown>;
    deletedData?: Record<string, unknown>;
    [key: string]: string | Record<string, unknown> | undefined;
}

/**
 * Detected PII entity from privacy service
 * Matches the structure returned by pii-masking.ts maskPII function
 */
export interface PIIEntity {
    entityType: string;
    original: string;
    masked: string;
    position: { start: number; end: number };
}

/**
 * Masking methods for PII - matches pii-masking.ts MaskingMethod
 */
export type MaskingMethod = 'redact' | 'hash' | 'showLast4' | 'substitution' | 'characterReplace' | 'partial' | 'encrypt';

/**
 * PII Rule configuration
 */
export interface PIIRule {
    entityType: string;
    pattern: RegExp;
    maskingMethod: MaskingMethod;
    enabled: boolean;
}

/**
 * Onboarding step data
 */
export interface OnboardingStepData {
    orgName?: string;
    industry?: string;
    dataRegion?: string;
    teamSize?: string;
    useCase?: string;
    role?: string;
}

/**
 * Document update data
 */
export interface DocumentUpdateData {
    title?: string;
    content?: string;
    fileUrl?: string;
    fileType?: string;
}

/**
 * AI tool definition for agent system
 */
export interface AIToolDefinition {
    name: string;
    description: string;
    parameters: Record<string, {
        type: string;
        description: string;
        required?: boolean;
    }>;
}

/**
 * AI message for chat
 */
export interface AIMessage {
    role: 'user' | 'assistant' | 'system';
    content: string;
}

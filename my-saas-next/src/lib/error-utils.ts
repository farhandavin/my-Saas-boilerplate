// src/lib/error-utils.ts
// Utility functions for type-safe error handling

/**
 * Extracts a user-friendly error message from any thrown value
 * Use this in catch blocks to safely access error.message
 */
export function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        return error.message;
    }
    if (typeof error === 'string') {
        return error;
    }
    if (error && typeof error === 'object' && 'message' in error) {
        return String((error as { message: unknown }).message);
    }
    return 'An unexpected error occurred';
}

/**
 * Type guard to check if error is an Error instance
 */
export function isError(error: unknown): error is Error {
    return error instanceof Error;
}

/**
 * Extracts error details for logging
 */
export function getErrorDetails(error: unknown): {
    message: string;
    stack?: string;
    name?: string;
} {
    if (error instanceof Error) {
        return {
            message: error.message,
            stack: error.stack,
            name: error.name,
        };
    }
    return {
        message: getErrorMessage(error),
    };
}

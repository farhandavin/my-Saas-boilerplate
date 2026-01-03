import type { GenerateTextResult } from 'ai';

export interface AIProvider {
    /**
     * Generates text from a prompt or chat history.
     * @param messages Array of messages (role: user/assistant/system, content: string)
     * @param options Optional parameters like temperature, masking, etc.
     */
    generateText(messages: any[], options?: AIOptions): Promise<any>;

    /**
     * Generates an embedding for a given text.
     * @param text The text to embed
     */
    embed(text: string): Promise<number[]>;
}

export type AIOptions = {
    temperature?: number;
    maxTokens?: number;
    tools?: any;
    /**
     * Helper to identify if we should mask PII before sending.
     * Default: true
     */
    maskPII?: boolean;
};

import type { ToolSet } from 'ai';

/**
 * Strongly typed AI message format
 */
export interface AIMessage {
    role: 'user' | 'assistant' | 'system' | 'tool';
    content: string;
    toolCallId?: string;
    name?: string;
}

/**
 * AI text generation result
 */
export interface AITextResult {
    text: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    toolCalls?: Array<{
        name: string;
        args: Record<string, unknown>;
        id: string;
    }>;
    finishReason?: 'stop' | 'length' | 'tool-calls' | 'content-filter' | 'error';
}

export interface AIProvider {
    /**
     * Generates text from a prompt or chat history.
     * @param messages Array of messages (role: user/assistant/system, content: string)
     * @param options Optional parameters like temperature, masking, etc.
     */
    generateText(messages: AIMessage[], options?: AIOptions): Promise<AITextResult>;

    /**
     * Generates an embedding for a given text.
     * @param text The text to embed
     */
    embed(text: string): Promise<number[]>;
}

export type AIOptions = {
    temperature?: number;
    maxTokens?: number;
    tools?: ToolSet;
    /**
     * Helper to identify if we should mask PII before sending.
     * Default: true
     */
    maskPII?: boolean;
};


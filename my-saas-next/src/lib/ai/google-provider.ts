import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText as aiGenerateText, embed as aiEmbed } from 'ai';
import type { AIProvider, AIOptions, AIMessage, AITextResult } from './types';
import { env } from '@/lib/env'; // Use our safe env accessor

export class GoogleAIProvider implements AIProvider {
    private client;

    constructor() {
        // Determine API Key safely
        // Note: We access process.env directly here via safeEnv or fallback
        // In production, this keys should be strictly validated at startup
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';

        if (!apiKey) {
            console.warn("GoogleAIProvider initialized without API Key. AI calls will fail.");
        }

        this.client = createGoogleGenerativeAI({
            apiKey,
        });
    }

    async generateText(messages: AIMessage[], options?: AIOptions): Promise<AITextResult> {
        // Default model
        const model = this.client('gemini-2.0-flash-exp');

        const result = await aiGenerateText({
            model,
            messages: messages.map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content })),
            tools: options?.tools,
        });

        return {
            text: result.text,
            usage: result.usage ? {
                promptTokens: (result.usage as { promptTokens?: number }).promptTokens ?? 0,
                completionTokens: (result.usage as { completionTokens?: number }).completionTokens ?? 0,
                totalTokens: result.usage.totalTokens ?? 0,
            } : undefined,
            finishReason: result.finishReason as AITextResult['finishReason'],
        };
    }

    async embed(text: string): Promise<number[]> {
        try {
            const { embedding } = await aiEmbed({
                model: this.client.textEmbeddingModel('text-embedding-004'),
                value: text,
            });
            return embedding;
        } catch (error) {
            console.error("GoogleAI Embed Error:", error);
            return [];
        }
    }
}

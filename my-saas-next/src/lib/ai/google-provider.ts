import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText as aiGenerateText, embed as aiEmbed } from 'ai';
import { AIProvider, AIOptions } from './types';
import { safeEnv } from '@/lib/env'; // Use our safe env accessor

export class GoogleAIProvider implements AIProvider {
    private client;

    constructor() {
        // Determine API Key safely
        // Note: We access process.env directly here via safeEnv or fallback
        // In production, this keys should be strictly validated at startup
        const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || '';

        if (!apiKey && safeEnv.isAIEnabled) {
            console.warn("GoogleAIProvider initialized without API Key. AI calls will fail.");
        }

        this.client = createGoogleGenerativeAI({
            apiKey,
        });
    }

    async generateText(messages: any[], options?: AIOptions) {
        // Default model
        const model = this.client('gemini-2.0-flash-exp');

        // @ts-ignore
        return await aiGenerateText({
            model,
            messages,
            // temperature: options?.temperature,
            // maxTokens: options?.maxTokens,
            tools: options?.tools,
        });
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

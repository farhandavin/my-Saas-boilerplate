// src/services/aiService.ts
import { AIModelFactory } from "@/lib/ai/factory";
import { PrivacyLayer } from "@/lib/ai/privacy-layer";
import type { AIMessage } from "@/types/log-types";

export const AiService = {
  // 1. CEO Digest & Pre-Check logic moved to Domain Services (ceoDigestService.ts, preCheckService.ts)

  // 3. Privacy Layer (Middleware Helper)
  // Re-exporting for convenience if widely used, but prefer direct PrivacyLayer usage
  maskPII: PrivacyLayer.mask,

  // 4. Embedding for RAG
  async generateEmbedding(text: string): Promise<number[]> {
    // Embeddings usually WANT semantic meaning, masking might lose context.
    // But for strict PII, we mask.
    const { maskedText: sanitizedText } = await PrivacyLayer.mask(text);

    try {
      const provider = AIModelFactory.getProvider(); // Default Google
      return await provider.embed(sanitizedText);
    } catch (error) {
      console.error("Embedding Error:", error);
      return [];
    }
  },

  // Legacy wrapper if needed, now using Factory
  async generateText(prompt: string, teamId: string = 'global', _userId?: string) {
    // 1. Masking (Pre-processing)
    // We pass teamId to create isolated redis keys if needed
    const { maskedText, mapId } = await PrivacyLayer.mask(prompt, teamId);

    const provider = AIModelFactory.getProvider();

    // Convert prompt to message format expected by provider
    const messages: AIMessage[] = [{ role: 'user', content: maskedText }];

    try {
      const result = await provider.generateText(messages, {
        temperature: 0.7
      });

      // 2. De-masking (Post-processing)
      // Restore PII in the response if the AI echoed it back
      const finalResponse = await PrivacyLayer.unmask(result.text, mapId);

      return finalResponse;
    } catch (error) {
      console.error("AI Generation Error:", error);
      throw error;
    }
  }
};
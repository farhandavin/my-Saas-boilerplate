// src/services/aiService.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(apiKey);

export const AiService = {
  async generateText(prompt: string) {
    if (!apiKey) throw new Error("GEMINI_API_KEY belum dikonfigurasi");
    
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error("AI Error:", error);
      throw new Error("Gagal menghubungi AI Service");
    }
  },

  // Fungsi PII Masking sederhana
  maskPII(text: string): string {
    return text
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[REDACTED_EMAIL]')
      .replace(/(\+62|62|0)8[1-9][0-9]{6,9}\b/g, '[REDACTED_PHONE]');
  }
};
// backend/src/services/aiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const AppError = require("../utils/AppError");

class AiService {
  constructor() {
    // 1. Initialize Google AI Client
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.error("❌ GEMINI_API_KEY is missing in .env");
      // We don't throw here to prevent crashing the server on startup,
      // but methods will fail if called.
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    // 2. Configure Models
    // "flash" is chosen for speed and cost-efficiency (Great for SaaS)
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // "text-embedding-004" creates 768-dimensional vectors for semantic search
    this.embedModel = this.genAI.getGenerativeModel({ model: "text-embedding-004" });
  }

  /**
   * Generates text response for Business Logic
   * @param {String} prompt - The user's input (cleaned/sanitized)
   * @returns {Promise<String>} - The AI's plain text response
   */
  async generateText(prompt) {
    try {
      this._validateConfig();

      // System Instruction to shape the AI's persona
      const systemInstruction = `
        You are the AI assistant for a "Business Operating System".
        Your goal is to provide professional, concise, and actionable business insights.
        If the data provided looks like financial records, briefly analyze margins or trends.
        Keep the tone helpful and strictly professional.
      `;

      const finalPrompt = `${systemInstruction}\n\nUser Query: ${prompt}`;

      const result = await this.model.generateContent(finalPrompt);
      const response = await result.response;
      
      return response.text();

    } catch (error) {
      console.error("❌ Gemini Text Gen Error:", error.message);
      throw new AppError("Failed to generate AI response. Please try again.", 502);
    }
  }

  /**
   * Converts text into a Vector (Array of Numbers)
   * Used for Semantic Search (RAG)
   * @param {String} text - The content to be indexed
   * @returns {Promise<Array<number>>} - 768-dimensional array
   */
  async generateEmbedding(text) {
    try {
      this._validateConfig();

      // Ensure text is a string and not empty
      if (!text || typeof text !== 'string') {
        throw new Error("Invalid text input for embedding");
      }

      const result = await this.embedModel.embedContent(text);
      return result.embedding.values;

    } catch (error) {
      console.error("❌ Gemini Embedding Error:", error.message);
      throw new AppError("Failed to create text vector.", 500);
    }
  }

  /**
   * Internal Helper: Check API Key existence before making requests
   */
  _validateConfig() {
    if (!process.env.GEMINI_API_KEY) {
      throw new AppError("Server configuration error: AI API Key missing", 500);
    }
  }
}

module.exports = new AiService();
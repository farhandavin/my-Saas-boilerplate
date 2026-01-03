# AI Services Documentation

## 🤖 Overview
The **AI Service** (`src/services/aiService.ts`) is the central gateway to Generative AI providers (Google Gemini). It includes privacy-first features like PII masking and RAG (Retrieval Augmented Generation) support.

## ⚙️ Configuration
- **Provider**: Google Generative AI (via Vercel AI SDK).
- **Environment Variable**: `GEMINI_API_KEY` or `GOOGLE_GENERATIVE_AI_API_KEY`.
- **Default Models**:
  - Generation: `gemini-2.5-flash` (Note: Check for model availability, fallback to `1.5-flash` if 2.5 is not released).
  - Embeddings: `text-embedding-004`.

## 🛡️ Privacy Layer
Before sending any prompt to the AI Provider, the system sanitizes data:
- **Function**: `Privacy.maskSensitiveData(text)`
- **Behavior**: Replaces sensitive patterns (Emails, Phone Numbers, NIK/ID) with placeholders like `[EMAIL]`.
- **Location**: `src/lib/privacy.ts` (called by `aiService`).

## 🧠 Features

### 1. Text Generation with Tools
The service supports **Function Calling** via Vercel AI SDK `tool()`.
- **Available Tools**:
  - `searchDocuments`: Queries internal Knowledge Base (RAG).
  - `createInvoice`: Generates an invoice based on natural language commands.
- **Context Awareness**: `teamId` and `userId` are injected into tool execution for security.

### 2. Embeddings (RAG)
- **Function**: `generateEmbedding(text)`
- **Use Case**: Converts text into vector arrays for semantic search.
- **Note**: Input text is also sanitized/masked before embedding.

## 🚀 Usage Example

```typescript
import { AiService } from '@/services/aiService';

// 1. Simple Generation
const response = await AiService.generateText(
  "Create an invoice for Budi for $50 for Web Design", 
  "team_id_123", 
  "user_id_456"
);

// 2. Embeddings
const vector = await AiService.generateEmbedding("Project documentation about auth");
```

## ⚠️ Best Practices
- **Never bypass masking**: Always use `AiService` methods, do not call `google-ai-sdk` directly in components to ensure Privacy compliance.
- **Error Handling**: AI calls can timeout. Use `try/catch` blocks and implement retries for critical background jobs.

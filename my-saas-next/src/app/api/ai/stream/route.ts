import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { BillingService } from '@/services/billingService';
import { getAuthUser } from '@/lib/middleware/auth';
import { getErrorMessage } from '@/lib/error-utils';


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { message, teamId, conversationHistory = [] } = await req.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Check AI quota
    const allowed = await BillingService.checkQuota(teamId, 1);
    if (!allowed) {
      return new Response(JSON.stringify({ 
        error: 'AI quota exceeded',
        message: 'You have reached your AI token limit.' 
      }), { 
        status: 429,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Build conversation context
    const conversationContext = conversationHistory
      .slice(-5) // Last 5 messages for context
      .map((msg: { role: string; content: string }) => 
        `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
      ).join('\n');

    const prompt = `You are a helpful business assistant. Be concise and professional.

${conversationContext ? `Previous conversation:\n${conversationContext}\n\n` : ''}User: ${message}

Provide a helpful response:`;

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const result = await model.generateContentStream(prompt);

          let totalTokens = 0;

          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              totalTokens += text.split(' ').length; // Approximate token count
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
          }

          // Track token usage
          await BillingService.deductToken(teamId, totalTokens * 4); // Approximate

          // Send completion signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error: unknown) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: getErrorMessage(error) })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: unknown) {
    console.error('AI Stream error:', error);
    return new Response(JSON.stringify({ error: getErrorMessage(error) }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

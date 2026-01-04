import { NextRequest, NextResponse } from 'next/server';
import { AiService } from '@/services/aiService';
import { db } from '@/db';
import { users, teams } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getErrorMessage } from '@/lib/error-utils';


export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { message, teamId } = await req.json();
    
    // Validate User/Team (In real app, extract from Session/Token)
    // For now assuming passed from client or middleware injected
    // Let's use headers or body for current context
    
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    // Mock Context (Replace with actual Auth lookup)
    const userId = req.headers.get('x-user-id');
    
    const responseText = await AiService.generateText(message, teamId, userId || undefined);

    // Generate a unique ID for this message so we can attach feedback to it
    const messageId = crypto.randomUUID();

    return NextResponse.json({ 
      id: messageId,
      role: 'assistant',
      content: responseText 
    });

  } catch (error: unknown) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

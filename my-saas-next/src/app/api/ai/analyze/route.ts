import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { AiService } from '@/services/aiService';
import { BillingService } from '@/services/billingService';
import { UserJwtPayload } from '@/types';

// Helper verifikasi token manual (karena middleware Next.js berjalan di Edge)
const verifyToken = (token: string) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as UserJwtPayload;
  } catch {
    return null;
  }
};

export async function POST(req: Request) {
  // 1. Auth Check
  const token = (await headers()).get('authorization')?.split(' ')[1];
  const user = token ? verifyToken(token) : null;
  
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { prompt } = await req.json();

    // 2. Billing Check (Gatekeeper)
    const cost = 50; // Estimasi biaya
    const hasQuota = await BillingService.checkQuota(user.teamId, cost);
    if (!hasQuota) return NextResponse.json({ error: "Quota habis" }, { status: 402 });

    // 3. AI Process (Masking -> Generate)
    const safePrompt = AiService.maskPII(prompt);
    const aiResponse = await AiService.generateText(safePrompt);

    // 4. Deduct Token
    await BillingService.deductToken(user.teamId, cost);

    return NextResponse.json({ data: aiResponse });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
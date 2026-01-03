
import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';
import { verifyAuth } from '@/lib/auth-helper';

export async function GET(req: NextRequest) {
    const token = req.cookies.get('token')?.value || req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyAuth(token);
    if (!user || !user.teamId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teamId = user.teamId;

    if (!redis) {
        return NextResponse.json({
            agents: [
                { id: 'weekly-report', name: 'Weekly Report Agent', status: 'THINKING', progress: 45, message: 'Analyzing sales data...' },
                { id: 'email-responder', name: 'Email Responder', status: 'IDLE', progress: 0, message: 'Waiting for new emails' }
            ]
        });
    }

    const keys = await redis.keys(`agent:status:${teamId}:*`);
    if (keys.length === 0) {
        return NextResponse.json({
            agents: [
                { id: 'weekly-report', name: 'Weekly Report Agent', status: 'IDLE', progress: 0, message: 'Ready' },
                { id: 'seo-optimizer', name: 'SEO Optimizer', status: 'IDLE', progress: 0, message: 'Ready' }
            ]
        });
    }

    const values = await redis.mget(...keys);
    const agents = keys.map((key, i) => {
        const data = values[i] as any;
        return typeof data === 'string' ? JSON.parse(data) : data;
    }).filter(Boolean);

    return NextResponse.json({ agents });
}

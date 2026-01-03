import { NextRequest, NextResponse } from 'next/server';
import { getAiStats } from '@/actions/get-ai-stats';

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const teamId = searchParams.get('teamId');

    if (!teamId) {
        return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
    }

    // Optional: Add Auth check here if needed, but getAiStats is read-only stats
    try {
        const data = await getAiStats(teamId);
        return NextResponse.json({
            success: true,
            data
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import { NextRequest, NextResponse } from 'next/server';
import { withTeam } from '@/lib/middleware/auth';
import { WebhookService } from '@/services/webhookService';

// GET /api/webhooks - List webhooks
export const GET = withTeam(async (req, { team }) => {
  if (!team || !team.teamId) return NextResponse.json({ error: 'Team context required' }, { status: 403 });
  const webhooks = await WebhookService.list(team.teamId);
  return NextResponse.json({ success: true, webhooks });
}, { roles: ['ADMIN', 'MANAGER'] });

// POST /api/webhooks - Create webhook
export const POST = withTeam(async (req, { team }) => {
  if (!team || !team.teamId) return NextResponse.json({ error: 'Team context required' }, { status: 403 });
  try {
    const body = await req.json();
    
    // Simple validation
    if (!body.url || !body.events || !Array.isArray(body.events)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const webhook = await WebhookService.create(team.teamId, {
      url: body.url,
      events: body.events
    });

    return NextResponse.json({ success: true, data: webhook });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, { roles: ['ADMIN', 'MANAGER'] });

import { NextRequest, NextResponse } from 'next/server';
import { withTeam } from '@/lib/middleware/auth';
import { WebhookService } from '@/services/webhookService';

export const DELETE = withTeam(async (req, { team }) => {
  if (!team || !team.teamId) return NextResponse.json({ error: 'Team context required' }, { status: 403 });
  try {
    // Extract webhookId from URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const webhookId = pathParts[pathParts.length - 1];

    if (!webhookId) {
      return NextResponse.json({ error: 'Webhook ID required' }, { status: 400 });
    }

    await WebhookService.delete(team.teamId, webhookId);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, { roles: ['ADMIN', 'MANAGER'] });

export const PATCH = withTeam(async (req, { team }) => {
  if (!team || !team.teamId) return NextResponse.json({ error: 'Team context required' }, { status: 403 });
  try {
    const url = new URL(req.url);
    const webhookId = url.pathname.split('/').pop();
    const body = await req.json();

    if (!webhookId) return NextResponse.json({ error: 'ID required' }, { status: 400 });

    const updated = await WebhookService.update(team.teamId, webhookId, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}, { roles: ['ADMIN', 'MANAGER'] });

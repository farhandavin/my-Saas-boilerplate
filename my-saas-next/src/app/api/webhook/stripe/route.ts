import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover', // Gunakan versi terbaru yang sesuai
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (!signature || !webhookSecret) return NextResponse.json({ error: "Missing signature/secret" }, { status: 400 });
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Handle Event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const teamId = session.client_reference_id;

    if (teamId) {
      console.log(`💰 Payment Success! Upgrading Team: ${teamId}`);
      
      // Update Database: Set Tier & Add Tokens
      await prisma.team.update({
        where: { id: teamId },
        data: {
          tier: 'PRO', // Logic bisa dibuat dinamis berdasarkan priceId
          aiTokenLimit: { increment: 50000 },
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        }
      });

      // Audit Log
      await prisma.auditLog.create({
        data: {
          teamId,
          userId: "SYSTEM_WEBHOOK",
          action: "SUBSCRIPTION_UPGRADE",
          details: `Upgraded via Stripe Session ${session.id}`
        }
      });
    }
  }

  return NextResponse.json({ received: true });
}
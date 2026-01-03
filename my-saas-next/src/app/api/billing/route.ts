
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/db';
import { teams, invoices, usageBillings } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getAuthUser, withTeam } from '@/lib/middleware/auth';

export const GET = withTeam(async (req, context: any) => {
  const { team } = context;
  try {
    if (!team) return NextResponse.json({ error: 'Team context required' }, { status: 403 });
    // 1. Fetch Team Details (Subscription & Limits)
    const [teamData] = await db
      .select()
      .from(teams)
      .where(eq(teams.id, team.teamId))
      .limit(1);

    if (!teamData) {
      return NextResponse.json({ error: 'Team not found' }, { status: 404 });
    }

    // 2. Fetch Usage (Current Period)
    // For simplicity, we'll check the latest usageBilling record or just use team stats
    // Assuming usageBillings tracks monthly usage
    const [currentUsage] = await db
      .select()
      .from(usageBillings)
      .where(eq(usageBillings.teamId, team.teamId))
      .orderBy(desc(usageBillings.createdAt))
      .limit(1);

    // 3. Fetch Invoices
    const recentInvoices = await db
      .select()
      .from(invoices)
      .where(eq(invoices.teamId, team.teamId))
      .orderBy(desc(invoices.createdAt))
      .limit(5);

    // 3.5 Fetch Stripe Payment Method
    let paymentMethodDesc = { brand: 'N/A', last4: '----', expiry: '' };
    let billingAddressDesc = { street: '', city: '', state: '', postalCode: '', country: '' };

    if (teamData.stripeCustomerId) {
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-02-24.acacia' });

        // Fetch Customer
        const customer = await stripe.customers.retrieve(teamData.stripeCustomerId) as Stripe.Customer;

        // Address from Customer
        if (customer.address) {
          billingAddressDesc = {
            street: customer.address.line1 || '',
            city: customer.address.city || '',
            state: customer.address.state || '',
            postalCode: customer.address.postal_code || '',
            country: customer.address.country || ''
          };
        }

        // Payment Method
        // If default_source is present (older) or invoice_settings.default_payment_method (newer)
        let pmId = customer.invoice_settings?.default_payment_method as string;

        if (!pmId && customer.default_source) {
          // Handle legacy cards if needed, but for now focus on PaymentMethods
          // pmId = customer.default_source as string; 
        }

        if (pmId) {
          const pm = await stripe.paymentMethods.retrieve(pmId);
          if (pm.card) {
            paymentMethodDesc = {
              brand: pm.card.brand.charAt(0).toUpperCase() + pm.card.brand.slice(1),
              last4: pm.card.last4,
              expiry: `${pm.card.exp_month}/${pm.card.exp_year}`
            };
          }
        }
      } catch (err) {
        console.error('Stripe fetch error:', err);
        // Optionally fetch fallback logic or just leave partial data
      }
    }

    // Construct Response
    const response = {
      plan: {
        type: teamData.tier || 'Free',
        price: teamData.tier === 'PRO' ? 49 : teamData.tier === 'ENTERPRISE' ? 199 : 0,
        billingCycle: 'Monthly', // Hardcoded for now, or add to schema
        nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Mock next month
        status: teamData.subscriptionStatus || 'active'
      },
      usage: {
        tokensUsed: teamData.aiUsageCount || 0,
        tokensLimit: teamData.aiTokenLimit || 1000,
        costSoFar: currentUsage?.usageAmount ? currentUsage.usageAmount / 100 : 0, // Assuming stored in cents
        projectedCost: currentUsage?.totalAmount ? currentUsage.totalAmount / 100 : 0
      },
      invoices: recentInvoices.map(inv => ({
        id: inv.id,
        amount: inv.amount / 100, // Cents to dollars
        status: inv.status, // PAID, UNPAID, VOID
        date: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        url: '#' // Placeholder for actual PDF link
      })),
      paymentMethod: paymentMethodDesc,
      billingAddress: billingAddressDesc
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Failed to fetch billing data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

// src/app/api/seed/route.ts
// Seed API - Access via: GET /api/seed?secret=demo-seed-secret
// This populates the database with demo data for testing

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { 
  users, teams, teamMembers, invoices, usageBillings, 
  auditLogs, notifications, apiKeys, webhooks, documents, privacyRules 
} from '@/db/schema';
import { randomUUID, createHash } from 'crypto';
import bcrypt from 'bcryptjs';
import { getErrorMessage } from '@/lib/error-utils';


const SEED_SECRET = 'demo-seed-secret'; // Change this in production

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  
  // Security check
  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: 'Invalid seed secret' }, { status: 403 });
  }

  const results: string[] = [];

  try {
    // 1. Create Demo User
    const hashedPassword = await bcrypt.hash('demo123456', 10);
    let demoUserId: string = randomUUID();
    
    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, 'demo@example.com')
    });
    
    if (existingUser) {
      demoUserId = existingUser.id;
      results.push('ℹ️ Demo user already exists: demo@example.com');
    } else {
      await db.insert(users).values({
        id: demoUserId,
        name: 'Demo User',
        email: 'demo@example.com',
        password: hashedPassword,
        phone: '+62812345678',
        bio: 'Demo account for testing Enterprise OS features',
        language: 'en',
        timezone: 'Asia/Jakarta',
        twoFactorEnabled: false,
      });
      results.push('✅ Created demo user: demo@example.com / demo123456');
    }

    // 2. Create Demo Team
    let demoTeamId: string = randomUUID();
    
    // Check if team already exists
    const existingTeam = await db.query.teams.findFirst({
      where: (teams, { eq }) => eq(teams.slug, 'demo-company')
    });
    
    if (existingTeam) {
      demoTeamId = existingTeam.id;
      results.push('ℹ️ Demo team already exists: Demo Company');
    } else {
      await db.insert(teams).values({
        id: demoTeamId,
        name: 'Demo Company',
        slug: 'demo-company',
        displayId: 'DEMO-001',
        supportEmail: 'support@democompany.com',
        industry: 'Technology',
        dataRegion: 'id',
        currency: 'IDR',
        timezone: 'asia_jakarta',
        language: 'en',
        tier: 'PRO',
        subscriptionStatus: 'active',
        aiTokenLimit: 100000,
        aiUsageCount: 45000,
        ssoEnabled: false,
        passwordRotationDays: 90,
        sessionTimeoutMinutes: 30,
      });
      results.push('✅ Created demo team: Demo Company');
    }

    // 3. Link User to Team as Owner (only if not already linked)
    const existingMember = await db.query.teamMembers.findFirst({
      where: (tm, { and, eq }) => and(eq(tm.userId, demoUserId), eq(tm.teamId, demoTeamId))
    });
    
    if (!existingMember) {
      await db.insert(teamMembers).values({
        userId: demoUserId,
        teamId: demoTeamId,
        role: 'owner',
      });
      results.push('✅ Linked user to team as ADMIN');
    } else {
      results.push('ℹ️ Team membership already exists');
    }

    // 4. Create Sample Invoices
    const invoiceData = [
      { amount: 1250000000, status: 'paid', dueDate: new Date('2024-11-15'), paidAt: new Date('2024-11-10') },
      { amount: 850000000, status: 'paid', dueDate: new Date('2024-12-01'), paidAt: new Date('2024-11-28') },
      { amount: 450000000, status: 'paid', dueDate: new Date('2024-12-15'), paidAt: new Date('2024-12-14') },
      { amount: 920000000, status: 'unpaid', dueDate: new Date('2025-01-10'), paidAt: null },
      { amount: 380000000, status: 'past_due', dueDate: new Date('2024-12-20'), paidAt: null },
    ];

    for (const inv of invoiceData) {
      await db.insert(invoices).values({
        teamId: demoTeamId,
        amount: inv.amount,
        status: inv.status,
        dueDate: inv.dueDate,
        paidAt: inv.paidAt,
      });
    }
    results.push('✅ Created 5 sample invoices');

    // 5. Create Usage Billing Records
    const usageData = [
      { tokensUsed: 15000, usageAmount: 75000, totalAmount: 575000, periodStart: new Date('2024-10-01'), periodEnd: new Date('2024-10-31') },
      { tokensUsed: 22000, usageAmount: 110000, totalAmount: 610000, periodStart: new Date('2024-11-01'), periodEnd: new Date('2024-11-30') },
      { tokensUsed: 45000, usageAmount: 225000, totalAmount: 725000, periodStart: new Date('2024-12-01'), periodEnd: new Date('2024-12-31') },
    ];

    for (const usage of usageData) {
      await db.insert(usageBillings).values({
        teamId: demoTeamId,
        tokensUsed: usage.tokensUsed,
        usageAmount: usage.usageAmount,
        totalAmount: usage.totalAmount,
        periodStart: usage.periodStart,
        periodEnd: usage.periodEnd,
        status: 'billed',
      });
    }
    results.push('✅ Created 3 usage billing records');

    // 6. Create Audit Logs
    const auditData = [
      { action: 'user.login', entity: 'auth', details: 'User logged in successfully' },
      { action: 'invoice.create', entity: 'invoice', details: 'Created invoice #INV-001' },
      { action: 'team.member.invite', entity: 'team', details: 'Invited john@example.com as Admin' },
      { action: 'api_key.create', entity: 'api_key', details: 'Generated new API key: prod-key' },
      { action: 'settings.update', entity: 'settings', details: 'Updated company timezone' },
      { action: 'document.upload', entity: 'document', details: 'Uploaded SOP-2024.pdf' },
      { action: 'privacy.rule.update', entity: 'privacy', details: 'Enabled email masking rule' },
      { action: 'webhook.create', entity: 'webhook', details: 'Created webhook for invoice.paid' },
    ];

    for (const log of auditData) {
      await db.insert(auditLogs).values({
        teamId: demoTeamId,
        userId: demoUserId,
        action: log.action,
        entity: log.entity,
        details: log.details,
        ipAddress: '192.168.1.100',
      });
    }
    results.push('✅ Created 8 audit log entries');

    // 7. Create Notifications
    const notificationData = [
      { title: 'Welcome to Enterprise OS!', message: 'Your workspace is ready. Start by exploring the dashboard.', type: 'INFO' },
      { title: 'Invoice Overdue', message: 'Invoice #INV-005 is past due. Please follow up with the client.', type: 'WARNING' },
      { title: 'AI Token Usage Alert', message: 'You have used 45% of your monthly AI token quota.', type: 'INFO' },
      { title: 'New Team Member Joined', message: 'Sarah K. has accepted the invitation and joined your team.', type: 'SUCCESS' },
    ];

    for (const notif of notificationData) {
      await db.insert(notifications).values({
        userId: demoUserId,
        teamId: demoTeamId,
        title: notif.title,
        message: notif.message,
        type: notif.type,
        isRead: false,
      });
    }
    results.push('✅ Created 4 notifications');

    // 8. Create API Keys
    const apiKeyData = [
      { name: 'Production API Key', type: 'live' },
      { name: 'Development Key', type: 'test' },
    ];

    for (const apiKey of apiKeyData) {
      const rawKey = `pk_${apiKey.type}_${randomUUID().replace(/-/g, '')}`;
      const prefix = rawKey.substring(0, 12);
      const keyHash = createHash('sha256').update(rawKey).digest('hex');

      await db.insert(apiKeys).values({
        teamId: demoTeamId,
        name: apiKey.name,
        prefix,
        keyHash, 
      });
      results.push(`   -> Key: ${rawKey}`);
    }
    results.push('✅ Created 2 API keys');

    // 9. Create Webhooks
    const webhookData = [
      { url: 'https://webhook.site/demo-endpoint-1', events: ['invoice.paid', 'invoice.created'], secret: `whsec_${randomUUID()}` },
      { url: 'https://api.example.com/webhooks/bos', events: ['team.member.added', 'team.member.removed'], secret: `whsec_${randomUUID()}` },
    ];

    for (const wh of webhookData) {
      await db.insert(webhooks).values({
        teamId: demoTeamId,
        url: wh.url,
        events: wh.events,
        secret: wh.secret,
        isActive: true,
      });
    }
    results.push('✅ Created 2 webhooks');

    // 10. Create Documents
    const documentData = [
      { title: 'Company SOP 2024', content: 'Standard Operating Procedures for all departments...', fileType: 'pdf', size: 2500000 },
      { title: 'Employee Handbook', content: 'Welcome to the company. This handbook contains...', fileType: 'pdf', size: 1800000 },
      { title: 'API Integration Guide', content: 'This guide explains how to integrate with our APIs...', fileType: 'docx', size: 450000 },
    ];

    for (const doc of documentData) {
      await db.insert(documents).values({
        teamId: demoTeamId,
        title: doc.title,
        content: doc.content,
        fileType: doc.fileType,
        size: doc.size,
        uploadedBy: demoUserId,
      });
    }
    results.push('✅ Created 3 documents');

    // 11. Create Privacy Rules
    const privacyRuleData = [
      { name: 'Credit Card Masking', pattern: '\\b(?:\\d{4}[- ]?){3}\\d{4}\\b', maskingMethod: 'redact', category: 'FINANCIAL' },
      { name: 'Email Protection', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', maskingMethod: 'partial', category: 'PII' },
      { name: 'Phone Number Masking', pattern: '\\+?[0-9]{10,15}', maskingMethod: 'partial', category: 'PII' },
      { name: 'NIK Protection', pattern: '\\b\\d{16}\\b', maskingMethod: 'hash', category: 'PII' },
    ];

    for (const rule of privacyRuleData) {
      await db.insert(privacyRules).values({
        teamId: demoTeamId,
        name: rule.name,
        pattern: rule.pattern,
        maskingMethod: rule.maskingMethod,
        category: rule.category,
        isEnabled: true,
      });
    }
    results.push('✅ Created 4 privacy rules');

    return NextResponse.json({
      success: true,
      message: '🎉 Database seeding completed successfully!',
      results,
      credentials: {
        email: 'demo@example.com',
        password: 'demo123456'
      }
    });

  } catch (error: unknown) {
    console.error('Seed error:', error);
    return NextResponse.json({
      success: false,
      error: getErrorMessage(error),
      results
    }, { status: 500 });
  }
}

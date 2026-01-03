// src/db/seed.ts
// Database Seed Script - Run with: npx tsx src/db/seed.ts

import { db } from './index';
import {
  users, teams, teamMembers, invoices, usageBillings,
  auditLogs, notifications, apiKeys, webhooks, documents, privacyRules,
  projects, projectMembers, tasks
} from './schema';
import { randomUUID, createHash } from 'crypto';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Starting database seed...');

  try {
    // 0. Create Superadmin User
    await db.insert(users).values({
      name: 'Platform Owner',
      email: 'superadmin@example.com',
      password: await bcrypt.hash('password123', 10),
      isSuperAdmin: true,
    }).onConflictDoNothing();

    // Fetch actual ID to ensure FK integrity
    const superadmin = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, 'superadmin@example.com')
    });

    console.log('✅ Created/Verified Superadmin: superadmin@example.com');

    // 1. Create Demo User
    const hashedPassword = await bcrypt.hash('demo123456', 10);

    await db.insert(users).values({
      name: 'Demo User',
      email: 'demo@example.com',
      password: hashedPassword,
      phone: '+62812345678',
      bio: 'Demo account for testing Enterprise OS features',
      language: 'en',
      timezone: 'Asia/Jakarta',
      twoFactorEnabled: false,
    }).onConflictDoNothing();

    // Fetch actual ID
    const demoUser = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, 'demo@example.com')
    });

    if (!demoUser) throw new Error("Failed to find demo user");
    const demoUserId = demoUser.id;

    console.log('✅ Created/Verified demo user: demo@example.com');

    // 2. Create Demo Team
    const proposedTeamId = randomUUID();

    await db.insert(teams).values({
      id: proposedTeamId,
      // Actually teams slug is unique usually. 
      // schema says: slug text not null unique
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
    }).onConflictDoNothing();

    const demoTeam = await db.query.teams.findFirst({
      where: (t, { eq }) => eq(t.slug, 'demo-company')
    });

    if (!demoTeam) throw new Error("Failed to find demo team");
    const demoTeamId = demoTeam.id;

    console.log('✅ Created/Verified demo team: Demo Company');

    // 3. Link User to Team as Owner
    await db.insert(teamMembers).values({
      userId: demoUserId,
      teamId: demoTeamId,
      role: 'ADMIN',
    }).onConflictDoNothing();

    console.log('✅ Linked user to team as ADMIN');

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
      }).onConflictDoNothing();
    }
    console.log('✅ Created 5 sample invoices');

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
      }).onConflictDoNothing();
    }
    console.log('✅ Created 3 usage billing records');

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
      }).onConflictDoNothing();
    }
    console.log('✅ Created 8 audit log entries');

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
      }).onConflictDoNothing();
    }
    console.log('✅ Created 4 notifications');

    // 8. Create API Keys
    const apiKeyData = [
      { name: 'Production API Key', type: 'live' },
      { name: 'Development Key', type: 'test' },
    ];

    for (const apiKey of apiKeyData) {
      const rawKey = `pk_${apiKey.type}_${randomUUID().replace(/-/g, '')} `;
      const prefix = rawKey.substring(0, 12);
      const keyHash = createHash('sha256').update(rawKey).digest('hex');

      await db.insert(apiKeys).values({
        teamId: demoTeamId,
        name: apiKey.name,
        prefix,
        keyHash,
      }).onConflictDoNothing();
      console.log(`   -> Key: ${rawKey} `);
    }
    console.log('✅ Created 2 API keys');

    // 9. Create Webhooks
    const webhookData = [
      { url: 'https://webhook.site/demo-endpoint-1', events: ['invoice.paid', 'invoice.created'], secret: `whsec_${randomUUID()} ` },
      { url: 'https://api.example.com/webhooks/bos', events: ['team.member.added', 'team.member.removed'], secret: `whsec_${randomUUID()} ` },
    ];

    for (const wh of webhookData) {
      await db.insert(webhooks).values({
        teamId: demoTeamId,
        url: wh.url,
        events: wh.events,
        secret: wh.secret,
        isActive: true,
      }).onConflictDoNothing();
    }
    console.log('✅ Created 2 webhooks');

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
      }).onConflictDoNothing();
    }
    console.log('✅ Created 3 documents');

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
      }).onConflictDoNothing();
    }
    console.log('✅ Created 4 privacy rules');

    // 12. Create Projects
    const projectData = [
      { name: 'Website Redesign', description: 'Overhaul the main marketing site with new branding.', status: 'active' },
      { name: 'Q1 Marketing Campaign', description: 'Execute the planned social media & email blitz.', status: 'active' },
      { name: 'Mobile App Beta', description: 'Prepare for the upcoming mobile app launch.', status: 'active' },
    ];

    const createdProjects = [];

    for (const proj of projectData) {
      const [newProject] = await db.insert(projects).values({
        teamId: demoTeamId,
        name: proj.name,
        description: proj.description,
        status: proj.status,
      }).returning().onConflictDoNothing();

      if (newProject) {
        createdProjects.push(newProject);

        // Add Demo User as Project Owner
        await db.insert(projectMembers).values({
          projectId: newProject.id,
          userId: demoUserId,
          role: 'owner',
        }).onConflictDoNothing();
      }
    }
    console.log(`✅ Created ${createdProjects.length} projects`);

    // 13. Create Tasks (Kanban)
    if (createdProjects.length > 0) {
      const websiteProject = createdProjects.find(p => p.name === 'Website Redesign');
      const marketingProject = createdProjects.find(p => p.name === 'Q1 Marketing Campaign');

      const tasksToCreate = [];

      if (websiteProject) {
        tasksToCreate.push(
          { projectId: websiteProject.id, title: 'Design Homepage Mockup', description: 'Create high-fidelity Figma mockup.', status: 'done', priority: 'high', dueDate: new Date('2024-11-20') },
          { projectId: websiteProject.id, title: 'Implement Hero Date', description: 'Develop the main hero section with animations.', status: 'in_progress', priority: 'medium', dueDate: new Date('2024-12-15') },
          { projectId: websiteProject.id, title: 'Write Copy for About Us', description: 'Draft compelling copy for the team section.', status: 'todo', priority: 'low', dueDate: new Date('2024-12-25') },
          { projectId: websiteProject.id, title: 'Setup CI/CD Pipeline', description: 'Configure GitHub Actions for deployment.', status: 'done', priority: 'critical', dueDate: new Date('2024-11-10') }
        );
      }

      if (marketingProject) {
        tasksToCreate.push(
          { projectId: marketingProject.id, title: 'Draft Email Sequence', description: 'Write 5 emails for the nurture sequence.', status: 'todo', priority: 'high', dueDate: new Date('2024-12-28') },
          { projectId: marketingProject.id, title: 'Create Social Assets', description: 'Design banners for Twitter and LinkedIn.', status: 'in_progress', priority: 'medium', dueDate: new Date('2024-12-22') }
        );
      }

      for (const t of tasksToCreate) {
        await db.insert(tasks).values({
          projectId: t.projectId,
          title: t.title,
          description: t.description,
          status: t.status,
          priority: t.priority,
          assigneeId: demoUserId,
          dueDate: t.dueDate,
        }).onConflictDoNothing();
      }
      console.log(`✅ Created ${tasksToCreate.length} tasks for Kanban board`);
    }

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📌 Demo Credentials:');
    console.log('   Email: demo@example.com');
    console.log('   Password: demo123456');
    console.log('\n');

  } catch (error) {
    console.error('❌ Seed error:', error);
    throw error;
  }
}

seed()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));

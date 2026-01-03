/**
 * Demo Data Generator
 * Generates realistic demo data for the playground/demo mode
 * This data is session-based and does not persist to database
 */

import { format, subDays, addDays } from 'date-fns';

export interface DemoUser {
    id: string;
    name: string;
    email: string;
    role: 'owner' | 'admin' | 'manager' | 'staff';
    image?: string;
    joinedAt: Date;
}

export interface DemoInvoice {
    id: string;
    amount: number;
    status: 'paid' | 'unpaid' | 'overdue' | 'void';
    dueDate: Date;
    description: string;
    customerName: string;
    paidAt?: Date;
    createdAt: Date;
}

export interface DemoDocument {
    id: string;
    title: string;
    content: string;
    fileType: 'pdf' | 'docx' | 'txt';
    size: number;
    uploadedBy: string;
    createdAt: Date;
}

export interface DemoCEODigest {
    summary: string;
    insights: string[];
    metrics: {
        totalRevenue: number;
        activeProjects: number;
        pendingTasks: number;
        teamMembers: number;
    };
    generatedAt: Date;
}

export interface DemoProject {
    id: string;
    name: string;
    description: string;
    status: 'active' | 'completed' | 'archived';
    completion: number;
    tasksCount: number;
    createdAt: Date;
}

export interface DemoAuditLog {
    id: string;
    action: string;
    entity: string;
    details: string;
    userName: string;
    userRole: string;
    ipAddress: string;
    createdAt: Date;
}

/**
 * Generate demo team members with different roles
 */
export function generateDemoTeam(): DemoUser[] {
    return [
        {
            id: 'demo-user-1',
            name: 'Sarah Chen',
            email: 'sarah@demo.com',
            role: 'owner',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            joinedAt: subDays(new Date(), 180),
        },
        {
            id: 'demo-user-2',
            name: 'Michael Rodriguez',
            email: 'michael@demo.com',
            role: 'admin',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
            joinedAt: subDays(new Date(), 90),
        },
        {
            id: 'demo-user-3',
            name: 'Priya Sharma',
            email: 'priya@demo.com',
            role: 'manager',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
            joinedAt: subDays(new Date(), 45),
        },
        {
            id: 'demo-user-4',
            name: 'James Wilson',
            email: 'james@demo.com',
            role: 'staff',
            image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
            joinedAt: subDays(new Date(), 14),
        },
    ];
}

/**
 * Generate demo invoices with varying statuses
 */
export function generateDemoInvoices(): DemoInvoice[] {
    return [
        {
            id: 'inv-001',
            amount: 149900, // $1,499.00
            status: 'paid',
            dueDate: subDays(new Date(), 3),
            description: 'Enterprise Plan - Annual Subscription',
            customerName: 'Acme Corporation',
            paidAt: subDays(new Date(), 1),
            createdAt: subDays(new Date(), 30),
        },
        {
            id: 'inv-002',
            amount: 49900, // $499.00
            status: 'paid',
            dueDate: subDays(new Date(), 15),
            description: 'Pro Plan - Monthly Subscription',
            customerName: 'TechStart Inc.',
            paidAt: subDays(new Date(), 14),
            createdAt: subDays(new Date(), 45),
        },
        {
            id: 'inv-003',
            amount: 29900, // $299.00
            status: 'unpaid',
            dueDate: addDays(new Date(), 7),
            description: 'Starter Plan - Monthly Subscription',
            customerName: 'Bootstrap LLC',
            createdAt: subDays(new Date(), 2),
        },
        {
            id: 'inv-004',
            amount: 79900, // $799.00
            status: 'overdue',
            dueDate: subDays(new Date(), 10),
            description: 'Pro Plan + AI Credits',
            customerName: 'Digital Solutions Co.',
            createdAt: subDays(new Date(), 40),
        },
        {
            id: 'inv-005',
            amount: 19900, // $199.00
            status: 'paid',
            dueDate: subDays(new Date(), 20),
            description: 'Basic Plan - Monthly',
            customerName: 'Freelancer Studios',
            paidAt: subDays(new Date(), 19),
            createdAt: subDays(new Date(), 50),
        },
    ];
}

/**
 * Generate demo documents for RAG demonstration
 */
export function generateDemoDocuments(): DemoDocument[] {
    return [
        {
            id: 'doc-001',
            title: 'Company Security Policy 2024',
            content: `# Enterprise Security Policy

## Password Requirements
- Minimum 12 characters
- Must include uppercase, lowercase, numbers, and special characters
- Password rotation every 90 days
- No password reuse for last 5 passwords

## Data Access
- All sensitive data must be encrypted at rest (AES-256)
- PII must be masked before sending to external AI services
- Audit logs required for all data access events

## Compliance
- SOC 2 Type II compliance mandatory
- GDPR right to deletion within 30 days
- Data residency: Indonesia region for local customers`,
            fileType: 'pdf',
            size: 245000,
            uploadedBy: 'Sarah Chen',
            createdAt: subDays(new Date(), 60),
        },
        {
            id: 'doc-002',
            title: 'Employee Handbook - Remote Work',
            content: `# Remote Work Guidelines

## Working Hours
- Core hours: 9 AM - 3 PM local time
- Flexible hours outside core time
- Team sync meetings: Fridays at 10 AM

## Equipment Policy
- Company provides laptop and monitor
- Internet stipend: $50/month
- Home office setup budget: $500 one-time

## Communication
- Slack for async communication
- Zoom for meetings
- Response time: within 4 hours during work hours`,
            fileType: 'pdf',
            size: 180000,
            uploadedBy: 'Michael Rodriguez',
            createdAt: subDays(new Date(), 90),
        },
        {
            id: 'doc-003',
            title: 'SOP - Invoice Validation Rules',
            content: `# Invoice Validation Standard Operating Procedure

## Discount Limits
- Maximum discount: 20% (requires manager approval)
- Discounts above 10% require justification note
- No discounts on Enterprise plans without VP approval

## Payment Terms
- Net 30 standard for all customers
- Net 60 only for Fortune 500 companies
- Late fees: 2% per month after due date

## Tax Compliance
- PPN (VAT) 11% for Indonesia customers
- Tax exemption requires valid NPWP certificate
- Foreign customers: zero-rated VAT with proper documentation`,
            fileType: 'txt',
            size: 95000,
            uploadedBy: 'Priya Sharma',
            createdAt: subDays(new Date(), 30),
        },
        {
            id: 'doc-004',
            title: 'API Integration Guidelines',
            content: `# API Integration Best Practices

## Authentication
- All requests must include API Key in header: X-API-Key
- Rate limit: 100 requests per 10 seconds
- Token expiration: 1 hour

## Webhooks
- Retry logic: 3 attempts with exponential backoff
- Timeout: 30 seconds
- Signature verification using HMAC-SHA256

## Error Handling
- 429: Rate limit exceeded - back off for 60 seconds
- 401: Invalid API key - regenerate key
- 500: Server error - contact support if persists`,
            fileType: 'pdf',
            size: 120000,
            uploadedBy: 'Sarah Chen',
            createdAt: subDays(new Date(), 15),
        },
        {
            id: 'doc-005',
            title: 'Compliance Checklist - SOC 2',
            content: `# SOC 2 Compliance Checklist

## Security Controls
✓ Multi-factor authentication enabled
✓ Role-based access control (RBAC)
✓ Encryption at rest and in transit
✓ Regular security audits (quarterly)

## Availability
✓ 99.9% uptime SLA
✓ Automated health checks every 5 minutes
✓ Incident response plan documented

## Confidentiality
✓ PII masking before AI processing
✓ Data segregation (multi-tenancy)
✓ Employee background checks

## Audit Logs
✓ 90-day retention minimum
✓ Immutable log storage
✓ Real-time anomaly detection`,
            fileType: 'docx',
            size: 210000,
            uploadedBy: 'Michael Rodriguez',
            createdAt: subDays(new Date(), 7),
        },
    ];
}

/**
 * Generate pre-computed CEO Digest
 */
export function generateDemoCEODigest(): DemoCEODigest {
    return {
        summary:
            "Strong performance this week with $2,748 in revenue (+15% vs last week). 3 enterprise deals in pipeline. Team velocity increased 22% with new onboarding automation. Watch: 1 overdue invoice ($799) requires follow-up.",
        insights: [
            '🎯 Revenue up 15% week-over-week, driven by 2 annual subscription upgrades',
            '⚠️ Customer churn risk: Digital Solutions Co. has overdue invoice for 10 days',
            '🚀 Team productivity spike: Task completion rate jumped from 68% to 83% after implementing AI Pre-Check',
        ],
        metrics: {
            totalRevenue: 274800, // $2,748.00
            activeProjects: 7,
            pendingTasks: 12,
            teamMembers: 4,
        },
        generatedAt: new Date(),
    };
}

/**
 * Generate demo projects
 */
export function generateDemoProjects(): DemoProject[] {
    return [
        {
            id: 'proj-001',
            name: 'Enterprise Dashboard Redesign',
            description: 'Modernize the analytics dashboard with real-time charts and AI insights',
            status: 'active',
            completion: 67,
            tasksCount: 15,
            createdAt: subDays(new Date(), 30),
        },
        {
            id: 'proj-002',
            name: 'Mobile App Launch',
            description: 'iOS and Android native apps with offline support',
            status: 'active',
            completion: 34,
            tasksCount: 28,
            createdAt: subDays(new Date(), 60),
        },
        {
            id: 'proj-003',
            name: 'SOC 2 Type II Certification',
            description: 'Complete audit preparation and documentation',
            status: 'active',
            completion: 89,
            tasksCount: 9,
            createdAt: subDays(new Date(), 90),
        },
        {
            id: 'proj-004',
            name: 'Q4 Marketing Campaign',
            description: 'Black Friday and year-end promotional campaign',
            status: 'completed',
            completion: 100,
            tasksCount: 12,
            createdAt: subDays(new Date(), 120),
        },
        {
            id: 'proj-005',
            name: 'Legacy System Migration',
            description: 'Migrate from MongoDB to PostgreSQL for better ACID compliance',
            status: 'active',
            completion: 45,
            tasksCount: 22,
            createdAt: subDays(new Date(), 45),
        },
    ];
}

/**
 * Generate demo audit logs showing RBAC in action
 */
export function generateDemoAuditLogs(): DemoAuditLog[] {
    const now = new Date();

    return [
        {
            id: 'log-001',
            action: 'invoice.created',
            entity: 'billing',
            details: 'Created invoice INV-003 for Bootstrap LLC ($299.00)',
            userName: 'Priya Sharma',
            userRole: 'manager',
            ipAddress: '203.0.113.42',
            createdAt: new Date(now.getTime() - 5 * 60000), // 5 mins ago
        },
        {
            id: 'log-002',
            action: 'team.member_invited',
            entity: 'team',
            details: 'Invited james@demo.com as Staff role',
            userName: 'Sarah Chen',
            userRole: 'owner',
            ipAddress: '198.51.100.10',
            createdAt: new Date(now.getTime() - 15 * 60000), // 15 mins ago
        },
        {
            id: 'log-003',
            action: 'document.uploaded',
            entity: 'knowledge_base',
            details: 'Uploaded "SOP - Invoice Validation Rules.pdf" (95 KB)',
            userName: 'Priya Sharma',
            userRole: 'manager',
            ipAddress: '203.0.113.42',
            createdAt: new Date(now.getTime() - 32 * 60000), // 32 mins ago
        },
        {
            id: 'log-004',
            action: 'settings.updated',
            entity: 'security',
            details: 'Changed session timeout from 60 to 30 minutes',
            userName: 'Michael Rodriguez',
            userRole: 'admin',
            ipAddress: '192.0.2.15',
            createdAt: new Date(now.getTime() - 47 * 60000), // 47 mins ago
        },
        {
            id: 'log-005',
            action: 'project.status_changed',
            entity: 'projects',
            details: 'Changed "SOC 2 Certification" status to 89% complete',
            userName: 'Michael Rodriguez',
            userRole: 'admin',
            ipAddress: '192.0.2.15',
            createdAt: new Date(now.getTime() - 58 * 60000), // 58 mins ago
        },
        {
            id: 'log-006',
            action: 'ai.precheck_rejected',
            entity: 'ai_validation',
            details: 'AI Pre-Check rejected invoice: Discount 35% exceeds max 20%',
            userName: 'James Wilson',
            userRole: 'staff',
            ipAddress: '198.51.100.88',
            createdAt: new Date(now.getTime() - 72 * 60000), // 1hr 12mins ago
        },
        {
            id: 'log-007',
            action: 'user.login',
            entity: 'auth',
            details: 'Successful login via OAuth (Google)',
            userName: 'Sarah Chen',
            userRole: 'owner',
            ipAddress: '198.51.100.10',
            createdAt: new Date(now.getTime() - 95 * 60000), // 1hr 35mins ago
        },
        {
            id: 'log-008',
            action: 'webhook.triggered',
            entity: 'integrations',
            details: 'Webhook sent to Slack: invoice.paid event',
            userName: 'System',
            userRole: 'system',
            ipAddress: '127.0.0.1',
            createdAt: new Date(now.getTime() - 110 * 60000), // 1hr 50mins ago
        },
    ];
}

/**
 * Simulated RAG responses for demo chat
 */
export function getDemoRAGResponse(question: string): string {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('password') || lowerQuestion.includes('security')) {
        return `Based on your company's Security Policy document:

**Password Requirements:**
- Minimum 12 characters
- Must include uppercase, lowercase, numbers, and special characters
- Password rotation every 90 days
- No password reuse for last 5 passwords

This ensures compliance with SOC 2 security controls.`;
    }

    if (lowerQuestion.includes('discount') || lowerQuestion.includes('invoice')) {
        return `According to the "SOP - Invoice Validation Rules" document:

**Discount Limits:**
- Maximum discount: 20% (requires manager approval)
- Discounts above 10% require justification note
- No discounts on Enterprise plans without VP approval

**Payment Terms:**
- Net 30 standard for all customers
- Late fees: 2% per month after due date`;
    }

    if (lowerQuestion.includes('remote') || lowerQuestion.includes('work')) {
        return `From the Employee Handbook - Remote Work:

**Working Hours:**
- Core hours: 9 AM - 3 PM local time
- Flexible hours outside core time
- Team sync meetings: Fridays at 10 AM

**Equipment Policy:**
- Company provides laptop and monitor
- Internet stipend: $50/month
- Home office setup budget: $500 one-time`;
    }

    if (lowerQuestion.includes('api') || lowerQuestion.includes('webhook')) {
        return `Per the API Integration Guidelines:

**Authentication:**
- All requests must include API Key in header: X-API-Key
- Rate limit: 100 requests per 10 seconds

**Webhooks:**
- Retry logic: 3 attempts with exponential backoff
- Timeout: 30 seconds
- Signature verification using HMAC-SHA256`;
    }

    if (lowerQuestion.includes('compliance') || lowerQuestion.includes('soc')) {
        return `From the SOC 2 Compliance Checklist:

**Security Controls:**
✓ Multi-factor authentication enabled
✓ Role-based access control (RBAC)
✓ Encryption at rest and in transit

**Audit Logs:**
✓ 90-day retention minimum
✓ Immutable log storage
✓ Real-time anomaly detection`;
    }

    // Default response
    return `I can help you find information from your company documents. Try asking about:
- Password and security policies
- Invoice discount rules
- Remote work guidelines
- API integration standards
- SOC 2 compliance requirements

All answers are based on your uploaded company documents, not the public internet.`;
}

/**
 * Simulate AI Pre-Check validation
 */
export function validateInvoiceWithAI(formData: {
    amount: number;
    discount: number;
    dueDate: string;
}): { valid: boolean; reason?: string } {
    // Check discount limit
    if (formData.discount > 20) {
        return {
            valid: false,
            reason: `🚫 Discount ${formData.discount}% exceeds maximum allowed 20%. Per SOP-003 Invoice Validation Rules, manager approval required for discounts above 10%.`,
        };
    }

    // Check minimum amount
    if (formData.amount < 1000) {
        return {
            valid: false,
            reason: '🚫 Invoice amount too low. Minimum invoice amount is $10.00 (1000 cents).',
        };
    }

    // Check due date logic
    const dueDate = new Date(formData.dueDate);
    const today = new Date();
    const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff < 7) {
        return {
            valid: false,
            reason: '⚠️ Due date is less than 7 days from today. Standard payment term is Net 30. Please adjust or provide business justification.',
        };
    }

    if (daysDiff > 90) {
        return {
            valid: false,
            reason: '⚠️ Due date is more than 90 days in the future. This may indicate a data entry error.',
        };
    }

    return {
        valid: true,
    };
}

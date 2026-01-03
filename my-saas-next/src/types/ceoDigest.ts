// src/types/ceoDigest.ts
// Types untuk CEO Digest feature

export interface FinancialSummary {
  cashFlow: {
    closingBalance: number;
    estimatedExpensesToday: number;
    trend: 'up' | 'down' | 'stable';
  };
  revenue: {
    yesterdayTotal: number;
    dailyTarget: number;
    achievementPercent: number;
  };
  receivables: {
    overdueAmount: number;
    overdueCount: number;
    urgentItems: Array<{
      clientName: string;
      amount: number;
      daysOverdue: number;
    }>;
  };
}

export interface OperationalSummary {
  kpiProgress: {
    monthlyTarget: number;
    currentProgress: number;
    percentComplete: number;
    daysRemaining: number;
  };
  salesPipeline: {
    newLeads: number;
    activeDeals: number;
    bigDealsInProgress: Array<{
      name: string;
      value: number;
      stage: string;
    }>;
  };
  customerHealth: {
    retentionRate: number;
    openTickets: number;
    criticalComplaints: number;
  };
}

export interface ProductivitySummary {
  strategicProjects: Array<{
    name: string;
    status: 'on-track' | 'at-risk' | 'behind';
    dueDate: string;
    completionPercent: number;
  }>;
  teamCapacity: {
    department: string;
    capacityPercent: number;
    activeMembers: number;
    totalMembers: number;
  }[];
}

export interface AnomalyRisk {
  anomalies: Array<{
    type: 'expense' | 'revenue' | 'activity' | 'info' | 'security';
    severity: 'low' | 'medium' | 'high';
    description: string;
    affectedArea: string;
  }>;
  compliance: Array<{
    type: 'license' | 'contract' | 'permit';
    name: string;
    expiryDate: string;
    daysUntilExpiry: number;
  }>;
}

export interface StrategicRecommendation {
  priority: number;
  category: 'finance' | 'sales' | 'operations' | 'risk' | 'hr';
  action: string;
  reason: string;
  urgency: 'immediate' | 'today' | 'this-week';
}

export interface CEODigest {
  generatedAt: Date;
  teamId: string;
  teamName: string;
  period: {
    date: string;
    dayOfWeek: string;
  };
  financial: FinancialSummary;
  operational: OperationalSummary;
  productivity: ProductivitySummary;
  risks: AnomalyRisk;
  recommendations: StrategicRecommendation[];
  briefingMessage: string; // WhatsApp-style short briefing
}

// AI Pre-Check Types
export type DocumentCategory = 'financial' | 'legal' | 'operational' | 'communication';

export interface DocumentValidation {
  level: 'format' | 'consistency' | 'compliance';
  passed: boolean;
  message: string;
  details?: string;
}

export interface PreCheckResult {
  documentType: string;
  category: DocumentCategory;
  overallStatus: 'approved' | 'needs-review' | 'rejected';
  score: number; // 0-100
  validations: {
    format: DocumentValidation;
    consistency: DocumentValidation;
    compliance: DocumentValidation;
  };
  suggestions: string[];
  risks: Array<{
    severity: 'low' | 'medium' | 'high';
    issue: string;
    recommendation: string;
  }>;
  sensitiveDataFound: boolean;
  estimatedReviewTime: string;
}

export const DOCUMENT_TYPES: Record<DocumentCategory, string[]> = {
  financial: ['Invoice', 'Purchase Order', 'Reimbursement', 'Budget Report'],
  legal: ['NDA', 'MOU', 'Employment Contract', 'Vendor Agreement'],
  operational: ['SOP', 'Meeting Notes', 'Project Plan', 'Status Report'],
  communication: ['Email Draft', 'Press Release', 'Proposal', 'Newsletter']
};

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface UpsellNotification {
  id: string;
  type: 'usage' | 'feature' | 'upgrade';
  title: string;
  message: string;
  action: string;
  actionUrl: string;
  priority: number;
}

// Generate smart upsell notifications based on team data
export function generateUpsellNotifications(teamData: {
  tier: string;
  aiUsagePercent: number;
  memberCount: number;
  memberLimit: number;
}): UpsellNotification[] {
  const notifications: UpsellNotification[] = [];

  // High AI usage - upsell more tokens
  if (teamData.aiUsagePercent >= 80 && teamData.tier !== 'ENTERPRISE') {
    notifications.push({
      id: 'high-usage',
      type: 'usage',
      title: 'Running Low on AI Tokens',
      message: `You've used ${teamData.aiUsagePercent}% of your monthly AI tokens. Upgrade for more capacity.`,
      action: 'Upgrade Now',
      actionUrl: '/pricing',
      priority: 1
    });
  }

  // Near member limit
  if (teamData.memberCount >= teamData.memberLimit - 1 && teamData.tier !== 'ENTERPRISE') {
    notifications.push({
      id: 'member-limit',
      type: 'feature',
      title: 'Team Growing Fast!',
      message: `You're close to your team member limit. Upgrade to add more members.`,
      action: 'Add More Seats',
      actionUrl: '/pricing',
      priority: 2
    });
  }

  // Free tier - general upgrade prompt
  if (teamData.tier === 'FREE') {
    notifications.push({
      id: 'free-upgrade',
      type: 'upgrade',
      title: 'Unlock Pro Features',
      message: 'Get CEO Digest, API access, webhooks, and 100x more AI tokens.',
      action: 'See Pro Plans',
      actionUrl: '/pricing',
      priority: 3
    });
  }

  // Pro tier - enterprise prompt
  if (teamData.tier === 'PRO' && teamData.memberCount >= 8) {
    notifications.push({
      id: 'enterprise-upgrade',
      type: 'upgrade',
      title: 'Ready for Enterprise?',
      message: 'Get dedicated database, SSO, and unlimited everything.',
      action: 'Learn More',
      actionUrl: '/pricing',
      priority: 4
    });
  }

  return notifications.sort((a, b) => a.priority - b.priority);
}

interface SmartUpsellProps {
  teamData?: {
    tier: string;
    aiUsagePercent: number;
    memberCount: number;
    memberLimit: number;
  };
}

export default function SmartUpsell({ teamData }: SmartUpsellProps) {
  const [notifications, setNotifications] = useState<UpsellNotification[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    // Load dismissed notifications from localStorage
    const savedDismissed = localStorage.getItem('dismissed_upsells');
    if (savedDismissed) {
      setDismissed(JSON.parse(savedDismissed));
    }
  }, []);

  useEffect(() => {
    if (teamData) {
      const newNotifications = generateUpsellNotifications(teamData);
      setNotifications(newNotifications.filter(n => !dismissed.includes(n.id)));
    }
  }, [teamData, dismissed]);

  const dismissNotification = (id: string) => {
    const newDismissed = [...dismissed, id];
    setDismissed(newDismissed);
    localStorage.setItem('dismissed_upsells', JSON.stringify(newDismissed));
  };

  if (notifications.length === 0) return null;

  // Show only the highest priority notification
  const notification = notifications[0];

  const bgColors = {
    usage: 'bg-gradient-to-r from-amber-500 to-orange-500',
    feature: 'bg-gradient-to-r from-blue-500 to-cyan-500',
    upgrade: 'bg-gradient-to-r from-purple-600 to-indigo-600'
  };

  const icons = {
    usage: '⚡',
    feature: '✨',
    upgrade: '🚀'
  };

  return (
    <div className={`${bgColors[notification.type]} rounded-xl p-4 text-white relative animate-fade-in`}>
      <button
        onClick={() => dismissNotification(notification.id)}
        className="absolute top-2 right-2 text-white/60 hover:text-white"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>

      <div className="flex items-start gap-3">
        <span className="text-2xl">{icons[notification.type]}</span>
        <div className="flex-1">
          <h4 className="font-semibold">{notification.title}</h4>
          <p className="text-sm text-white/80 mt-1">{notification.message}</p>
          <Link
            href={notification.actionUrl}
            className="inline-block mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
          >
            {notification.action} →
          </Link>
        </div>
      </div>
    </div>
  );
}

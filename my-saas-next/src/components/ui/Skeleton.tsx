'use client';

import { cn } from '@/lib/utils';
import { CSSProperties } from 'react';

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-slate-200 dark:bg-slate-700',
        'before:absolute before:inset-0 before:-translate-x-full',
        'before:animate-[shimmer_2s_infinite]',
        'before:bg-gradient-to-r',
        'before:from-transparent before:via-white/60 before:to-transparent',
        'dark:before:via-white/10',
        className
      )}
      style={style}
    />
  );
}

// Card Skeleton
export function CardSkeleton({ className }: SkeletonProps) {
  return (
    <div className={cn('bg-white rounded-2xl p-6 shadow-sm border border-gray-100', className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

// Table Skeleton
export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex gap-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-16" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b border-slate-100 flex gap-4 items-center">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}

// Chart Skeleton
export function ChartSkeleton({ className }: SkeletonProps) {
  const heights = ['60%', '80%', '45%', '90%', '70%', '55%', '75%'];
  
  return (
    <div className={cn('bg-white rounded-2xl p-6 shadow-sm border border-gray-100', className)}>
      <Skeleton className="h-5 w-40 mb-6" />
      <div className="h-[250px] flex items-end justify-between gap-2">
        {heights.map((height, i) => (
          <div key={i} className="flex-1 flex items-end">
            <Skeleton className={`w-full`} style={{ height }} />
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <Skeleton key={day} className="h-3 w-8" />
        ))}
      </div>
    </div>
  );
}

// AI Chat Skeleton (typing indicator)
export function AIChatSkeleton() {
  return (
    <div className="flex gap-3 p-4">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm">
        🤖
      </div>
      <div className="flex-1 max-w-[80%]">
        <div className="bg-slate-100 rounded-2xl rounded-tl-sm p-4">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Morning Briefing Skeleton
export function BriefingSkeleton() {
  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white mb-8">
      <div className="flex items-start justify-between mb-4">
        <div>
          <Skeleton className="h-6 w-48 bg-white/20 mb-2" />
          <Skeleton className="h-4 w-64 bg-white/20" />
        </div>
        <Skeleton className="h-10 w-10 rounded-full bg-white/20" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full bg-white/20" />
        <Skeleton className="h-4 w-[90%] bg-white/20" />
        <Skeleton className="h-4 w-[75%] bg-white/20" />
      </div>
    </div>
  );
}

// Dashboard Full Skeleton
export function DashboardSkeleton() {
  return (
    <div className="p-8">
      <BriefingSkeleton />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

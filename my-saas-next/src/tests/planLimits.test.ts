import { describe, it, expect } from 'vitest';
import { PLAN_LIMITS } from '@/types';

describe('PLAN_LIMITS', () => {
  it('should have correct limits for FREE tier', () => {
    expect(PLAN_LIMITS.FREE.maxMembers).toBe(2);
    expect(PLAN_LIMITS.FREE.aiTokenLimit).toBe(500);
  });

  it('should have correct limits for PRO tier', () => {
    expect(PLAN_LIMITS.PRO.maxMembers).toBe(10);
    expect(PLAN_LIMITS.PRO.aiTokenLimit).toBe(50000);
  });

  it('should have correct limits for ENTERPRISE tier', () => {
    expect(PLAN_LIMITS.ENTERPRISE.maxMembers).toBe(100);
    expect(PLAN_LIMITS.ENTERPRISE.aiTokenLimit).toBe(500000);
  });
});

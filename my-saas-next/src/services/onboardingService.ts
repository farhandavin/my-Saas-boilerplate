
import { db } from '@/db';
import { onboardingProgress, teams, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { OnboardingStepData } from '@/types/log-types';

export class OnboardingService {
  /**
   * Get current onboarding progress for a user
   */
  static async getProgress(userId: string) {
    const progress = await db.query.onboardingProgress.findFirst({
      where: eq(onboardingProgress.userId, userId)
    });

    return progress || {
      currentStep: 1,
      completedSteps: [],
      skipped: false,
      completedAt: null
    };
  }

  /**
   * Update onboarding step
   */
  static async updateStep(userId: string, step: number, _data?: OnboardingStepData) {
    const existing = await db.query.onboardingProgress.findFirst({
      where: eq(onboardingProgress.userId, userId)
    });

    const completedSteps = existing?.completedSteps
      ? [...(existing.completedSteps as number[]), step - 1].filter(s => s > 0)
      : [];

    // Prepare values with proper typing for JSONB field
    const completedStepsArray = [...new Set(completedSteps)];

    await db.insert(onboardingProgress).values({
      userId,
      currentStep: step,
      completedSteps: completedStepsArray,
    })
      .onConflictDoUpdate({
        target: onboardingProgress.userId,
        set: {
          currentStep: step,
          completedSteps: completedStepsArray
        }
      });

    return this.getProgress(userId);
  }

  /**
   * Complete onboarding
   */
  static async complete(userId: string, teamId: string, data: OnboardingStepData) {
    // Build typed update object
    const updateData: Partial<{
      name: string;
      industry: string;
      dataRegion: string;
    }> = {};

    if (data.orgName) updateData.name = data.orgName;
    if (data.industry) updateData.industry = data.industry;
    if (data.dataRegion) updateData.dataRegion = data.dataRegion;

    if (Object.keys(updateData).length > 0) {
      await db.update(teams)
        .set(updateData)
        .where(eq(teams.id, teamId));
    }

    // Mark onboarding as complete with properly typed values
    const completedStepsArray = [1, 2, 3, 4, 5];

    await db.insert(onboardingProgress).values({
      userId,
      currentStep: 5,
      completedSteps: completedStepsArray,
      completedAt: new Date(),
    })
      .onConflictDoUpdate({
        target: onboardingProgress.userId,
        set: {
          currentStep: 5,
          completedSteps: completedStepsArray,
          completedAt: new Date(),
        }
      });

    // Create audit log
    await db.insert(auditLogs).values({
      teamId,
      userId,
      action: 'ONBOARDING_COMPLETED',
      entity: 'onboarding',
      details: JSON.stringify(data),
    });

    return { success: true };
  }

  /**
   * Skip onboarding
   */
  static async skip(userId: string) {
    await db.insert(onboardingProgress).values({
      userId,
      currentStep: 5,
      skipped: true
    }).onConflictDoUpdate({
      target: onboardingProgress.userId,
      set: { skipped: true }
    });

    return { success: true };
  }

  /**
   * Check if user needs onboarding
   */
  static async needsOnboarding(userId: string): Promise<boolean> {
    const progress = await db.query.onboardingProgress.findFirst({
      where: eq(onboardingProgress.userId, userId)
    });

    if (!progress) return true;
    if (progress.skipped) return false;
    if (progress.completedAt) return false;

    return true;
  }
}

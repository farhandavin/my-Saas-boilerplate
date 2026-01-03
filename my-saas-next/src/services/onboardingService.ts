
import { db } from '@/db';
import { onboardingProgress, teams, auditLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';

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
  static async updateStep(userId: string, step: number, data?: Record<string, any>) {
    const existing = await db.query.onboardingProgress.findFirst({
      where: eq(onboardingProgress.userId, userId)
    });

    const completedSteps = existing?.completedSteps 
      ? [...(existing.completedSteps as number[]), step - 1].filter(s => s > 0)
      : [];
    
    // Upsert
    // Drizzle upsert
    // Cast strict type mismatch if needed, Drizzle JSON vs unknown
    const values = {
        userId,
        currentStep: step,
        completedSteps: JSON.stringify([...new Set(completedSteps)]) as unknown as any, // casting for json field quirks
    };

    await db.insert(onboardingProgress).values(values)
        .onConflictDoUpdate({
            target: onboardingProgress.userId,
            set: {
                currentStep: step,
                completedSteps: values.completedSteps
            }
        });
        
    return this.getProgress(userId);
  }

  /**
   * Complete onboarding
   */
  static async complete(userId: string, teamId: string, data: Record<string, any>) {
    // Update team with onboarding data
    const updateData: Record<string, any> = {};
    if (data.orgName) updateData.name = data.orgName;
    if (data.industry) updateData.industry = data.industry;
    if (data.dataRegion) updateData.dataRegion = data.dataRegion;

    if (Object.keys(updateData).length > 0) {
      await db.update(teams)
        .set(updateData)
        .where(eq(teams.id, teamId));
    }

    // Mark onboarding as complete
    const completedValues = {
        userId,
        currentStep: 5,
        completedSteps: JSON.stringify([1, 2, 3, 4, 5]) as unknown as any,
        completedAt: new Date(),
    };

    await db.insert(onboardingProgress).values(completedValues)
        .onConflictDoUpdate({
            target: onboardingProgress.userId,
            set: completedValues
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

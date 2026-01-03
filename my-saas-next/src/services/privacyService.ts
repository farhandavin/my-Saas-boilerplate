import { db } from '@/db';
import { privacyRules } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { DEFAULT_PII_RULES } from '@/lib/pii-masking';

export const PrivacyService = {
  /**
   * Get all privacy rules for a team.
   * If no rules exist, initialize with defaults.
   */
  async getRules(teamId: string) {
    const rules = await db.select().from(privacyRules).where(eq(privacyRules.teamId, teamId));

    if (rules.length === 0) {
      return await this.initDefaultRules(teamId);
    }

    return rules;
  },

  /**
   * Initialize default rules for a team in the database.
   */
  async initDefaultRules(teamId: string) {
    const defaultRules = DEFAULT_PII_RULES.map(rule => ({
      teamId,
      name: rule.entityType,
      pattern: rule.pattern.source, // Store regex source string
      maskingMethod: rule.maskingMethod,
      isEnabled: rule.enabled,
      category: 'PII'
    }));

    await db.insert(privacyRules).values(defaultRules);
    return await db.select().from(privacyRules).where(eq(privacyRules.teamId, teamId));
  },

  /**
   * Update a specific rule.
   */
  async updateRule(teamId: string, name: string, updates: { isEnabled?: boolean; maskingMethod?: string }) {
    await db.update(privacyRules)
      .set(updates)
      .where(and(
        eq(privacyRules.teamId, teamId),
        eq(privacyRules.name, name)
      ));
    
    return this.getRules(teamId);
  },

  /**
   * Reset to defaults.
   */
  async resetRules(teamId: string) {
    await db.delete(privacyRules).where(eq(privacyRules.teamId, teamId));
    return this.initDefaultRules(teamId);
  },

  /**
   * Mask content based on team's enabled rules.
   */
  async maskContent(teamId: string, content: string): Promise<{ maskedContent: string, entitiesFound: any[] }> {
    // 1. Get enabled rules from DB
    let rules = await this.getRules(teamId);
    
    // If no rules found, initialize defaults
    if (rules.length === 0) {
      rules = await this.initDefaultRules(teamId);
    }

    // 2. Filter only enabled rules and map to PII library format
    const activeRules = rules
      .filter(r => r.isEnabled)
      .map(r => ({
        entityType: r.name,
        // Reconstruct regex from source if needed (assuming pattern is stored as source string)
        pattern: new RegExp(r.pattern, 'g'), 
        maskingMethod: r.maskingMethod as any,
        enabled: true
      }));

    // 3. Apply masking
    // Import maskPII dynamically or assuming it's imported at top
    const { maskPII } = await import('@/lib/pii-masking');
    const result = maskPII(content, activeRules);

    return {
      maskedContent: result.maskedText,
      entitiesFound: result.entitiesFound
    };
  }
};

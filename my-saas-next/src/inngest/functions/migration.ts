
import { inngest } from "@/lib/inngest-client";
import { MigrationEngine } from "@/lib/migration-engine";

export const migrationFn = inngest.createFunction(
  { id: "tenant-migration" },
  { event: "tenant/migrate" },
  async ({ event, step }) => {
    const { teamId, targetDbUrl } = event.data;

    await step.run("lock-tenant", async () => {
      await MigrationEngine.lockTenant(teamId);
    });

    try {
      await step.run("copy-data", async () => {
        await MigrationEngine.copyData(teamId, targetDbUrl);
      });

      await step.run("switch-router", async () => {
        await MigrationEngine.switchTenantToIsolated(teamId, targetDbUrl);
      });
    } catch (error) {
      await step.run("rollback", async () => {
        await MigrationEngine.unlockTenant(teamId);
      });
      throw error;
    }

    return { success: true, teamId };
  }
);

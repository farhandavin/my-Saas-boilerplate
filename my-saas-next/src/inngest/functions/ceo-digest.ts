
import { inngest } from "@/lib/inngest-client";
import { db } from "@/db";
import { teams } from "@/db/schema";
import { Resend } from 'resend';
import { CEODigestService } from "@/services/ceoDigestService";

const resend = new Resend(process.env.RESEND_API_KEY);

export const ceoDigestFn = inngest.createFunction(
  { id: "ceo-digest" },
  { cron: "0 5 * * *" }, // Run at 5 AM
  async ({ step }) => {
    
    // 1. Fetch all active teams (Simulated for now, or fetch from DB)
    // In a real scenario, we'd paginate through teams.
    const teamsList = await step.run("fetch-teams", async () => {
       // Ideally: return db.select({ id: teams.id }).from(teams).where(eq(teams.subscriptionStatus, 'active'));
       // For MVP, likely getting passed to separate event per team is better for scalability.
       // But for Cron, iterating here or fanning out is needed.
       
       // Simplified: Just returning dummy or 'all'.
       const allTeams = await db.query.teams.findMany({ columns: { id: true } });
       return allTeams;
    });

    // 2. Process each team
    // Improved pattern: Fan-out events (e.g. 'app/digest.requested') for each team, 
    // so one failure doesn't block others. But keeping it simple for now.
    
    const results = await step.run("process-digests", async () => {
      const logs = [];
      for (const team of teamsList) {
        try {
           const result = await CEODigestService.sendDigestViaEmail(team.id);
           logs.push({ teamId: team.id, success: result.success });
        } catch (e) {
           logs.push({ teamId: team.id, success: false, error: String(e) });
        }
      }
      return logs;
    });

    return { body: { processed: results.length, details: results } };
  }
);

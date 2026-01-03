import { db } from '@/db';
import { campaigns } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export const campaignService = {
    async getAllCampaigns(teamId: string) {
        return await db.query.campaigns.findMany({
            where: eq(campaigns.teamId, teamId),
            orderBy: [desc(campaigns.createdAt)],
        });
    },

    async createCampaign(data: {
        teamId: string;
        name: string;
        description?: string;
        status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';
        budget?: number;
        startDate?: Date;
        endDate?: Date;
    }) {
        // @ts-ignore - budget type mismatch in inference vs schema sometimes
        return await db.insert(campaigns).values(data).returning();
    },

    async getCampaignById(id: string) {
        return await db.query.campaigns.findFirst({
            where: eq(campaigns.id, id),
        });
    },

    async deleteCampaign(id: string) {
        return await db.delete(campaigns).where(eq(campaigns.id, id));
    }
};

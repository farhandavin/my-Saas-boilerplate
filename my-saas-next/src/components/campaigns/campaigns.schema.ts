
    import { z } from 'zod';

    export const createCampaignsSchema = z.object({
      name: z.string().min(1, "Campaign Name is required"),
      description: z.string().optional(),
      status: z.enum(['DRAFT', 'PUBLISHED']).default('DRAFT'),
      createdAt: z.date().optional(),
    });

    export type CreateCampaignsInput = z.infer<typeof createCampaignsSchema>;
  
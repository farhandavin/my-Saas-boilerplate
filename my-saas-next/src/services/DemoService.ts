import { db } from '@/db';
import { eq } from 'drizzle-orm';
// import { demo } from '@/db/schema'; // TODO: Create this table in schema.ts

export const DemoService = {
  // Get All
  async getAll(teamId: string) {
    // return db.select().from(demo).where(eq(demo.teamId, teamId));
    return []; // Placeholder
  },

  // Create
  async create(data: Record<string, unknown>, userId: string) {
    // return db.insert(demo).values({ ...data, userId }).returning();
    return data;
  },

  // Get One
  async getById(id: string) {
    // return db.query.demo.findFirst({ where: eq(demo.id, id) });
    return null;
  },

  // Update
  async update(id: string, data: Record<string, unknown>) {
    // return db.update(demo).set(data).where(eq(demo.id, id)).returning();
    return null;
  },

  // Delete
  async delete(id: string) {
    // return db.delete(demo).where(eq(demo.id, id));
    return true;
  }
};
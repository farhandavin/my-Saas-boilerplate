import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL!;

// Connection pooling configuration for production scalability
// Prevents connection exhaustion at 50+ concurrent users
const client = postgres(connectionString, {
    prepare: false,
    max: 20, // Maximum pool size (handles ~1000 concurrent requests)
    idle_timeout: 30, // Close idle connections after 30s
    connect_timeout: 10, // Timeout after 10s if can't connect
    max_lifetime: 60 * 30, // Close connections after 30 minutes (prevents stale connections)
});

export const db = drizzle(client, { schema });

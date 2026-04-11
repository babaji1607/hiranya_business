import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;
// We use prepare: false for Neon Serverless/pooler compat
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

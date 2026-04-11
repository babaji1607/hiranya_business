import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { admins } from './schema';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/tauri_license';
const client = postgres(connectionString);
const db = drizzle(client);

async function seed() {
  const username = 'admin';
  const password = 'SuperSecretPassword!'; // You can change this
  const passwordHash = await bcrypt.hash(password, 10);
  
  try {
    await db.insert(admins).values({
      username,
      passwordHash,
    }).onConflictDoNothing();
    
    console.log('✅ Admin user created/seeded successfully.');
    console.log(`👤 Username: ${username}`);
    console.log(`🔑 Password: ${password}`);
  } catch (error) {
    console.error('❌ Failed to seed the admin user. Make sure your database is running and the schema is pushed.');
    console.error(error);
  }
  
  process.exit(0);
}

seed();

import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { logger } from '@/lib/logger';
import { auth } from '@/auth';

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     description: Returns the list of users
 *     responses:
 *       200:
 *         description: Hello Users
 */
export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const allUsers = await db.select().from(users);
    logger.info('Fetched users successfully');
    return NextResponse.json(allUsers);
  } catch (error) {
    logger.error({ error }, 'Failed to fetch users');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

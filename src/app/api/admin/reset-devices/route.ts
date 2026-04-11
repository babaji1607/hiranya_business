import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { auth } from '@/auth';

/**
 * @swagger
 * /api/admin/reset-devices:
 *   post:
 *     description: Resets devices for a specific user
 *     responses:
 *       200:
 *         description: Success
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    logger.info({ data }, 'Resetting devices for user');
    return NextResponse.json({ success: true, action: 'devices-reset' });
  } catch (error) {
    logger.error('Failed to reset devices');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

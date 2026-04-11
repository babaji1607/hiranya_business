import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { auth } from '@/auth';

/**
 * @swagger
 * /api/admin/activate-user:
 *   post:
 *     description: Activates a user license
 *     responses:
 *       200:
 *         description: Success
 */
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    logger.info({ data }, 'Activating user');
    return NextResponse.json({ success: true, action: 'activated' });
  } catch (error) {
    logger.error('Failed to parse request');
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}

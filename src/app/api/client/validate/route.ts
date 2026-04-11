import { NextResponse } from 'next/server';
import { db } from '@/db';
import { licenses, devices, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * @swagger
 * /api/client/validate:
 *   post:
 *     summary: Validate an existing license/device combination
 *     description: Checks if the license and device hardware ID are both still valid (not revoked, not banned, not expired). Heartbeat endpoint.
 *     tags:
 *       - Client
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [key, hwid]
 *             properties:
 *               key:
 *                 type: string
 *               hwid:
 *                 type: string
 *     responses:
 *       200:
 *         description: Validation successful, returns account tier.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 plan:
 *                   type: string
 *       400:
 *         description: Validation failed. Reason provided.
 *       403:
 *         description: Forbidden or revoked.
 *       404:
 *         description: License not found.
 */
export async function POST(req: Request) {
  try {
    const { key, hwid } = await req.json();

    if (!key || !hwid) {
      return NextResponse.json({ valid: false, error: 'Missing key or hwid' }, { status: 400 });
    }

    // Load license
    const [license] = await db
      .select({ id: licenses.id, userId: licenses.userId, type: licenses.type, isActive: licenses.isActive, expiryDate: licenses.expiryDate })
      .from(licenses)
      .where(eq(licenses.key, key))
      .limit(1);

    if (!license || !license.userId) {
      return NextResponse.json({ valid: false, error: 'License not found' }, { status: 404 });
    }

    if (!license.isActive) {
      return NextResponse.json({ valid: false, error: 'License is revoked' }, { status: 403 });
    }

    if (license.expiryDate && new Date(license.expiryDate) < new Date()) {
       return NextResponse.json({ valid: false, error: 'License has expired' }, { status: 403 });
    }

    // Verify Device
    const [existingDevice] = await db
      .select({ id: devices.id, isActive: devices.isActive })
      .from(devices)
      .where(and(eq(devices.hwid, hwid), eq(devices.userId, license.userId)))
      .limit(1);

    if (!existingDevice) {
      return NextResponse.json({ valid: false, error: 'Hardware ID not bound to this license' }, { status: 403 });
    }

    if (!existingDevice.isActive) {
       return NextResponse.json({ valid: false, error: 'Device has been unbound or deactivated' }, { status: 403 });
    }

    // Update lastSeen (heartbeat)
    await db.update(devices)
      .set({ lastSeen: new Date() })
      .where(eq(devices.id, existingDevice.id));

    // Get User Plan
    const [user] = await db.select({ plan: users.plan, isActive: users.isActive }).from(users).where(eq(users.id, license.userId)).limit(1);
    
    if (!user || !user.isActive) {
      return NextResponse.json({ valid: false, error: 'User account is inactive' }, { status: 403 });
    }

    return NextResponse.json({ valid: true, plan: user.plan, licenseType: license.type });
  } catch (error: any) {
    return NextResponse.json({ valid: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

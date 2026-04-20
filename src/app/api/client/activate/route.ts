import { NextResponse } from 'next/server';
import { db } from '@/db';
import { licenses, devices, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * @swagger
 * /api/client/activate:
 *   post:
 *     summary: Activate a license from a client device (Tauri App)
 *     description: Binds a hardware device to a specific license key.
 *     tags:
 *       - Client
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [key, hwid, deviceId]
 *             properties:
 *               key:
 *                 type: string
 *               hwid:
 *                 type: string
 *               deviceId:
 *                 type: string
 *               os:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully activated and bound the device.
 *       400:
 *         description: Invalid or revoked license.
 */
export async function POST(req: Request) {
  try {
    const { key, hwid, deviceId: incomingDeviceId, os: incomingOs } = await req.json();
    let deviceId = incomingDeviceId;
    let os = incomingOs;
    const osDeviceIds = new Set(['windows', 'linux', 'macos', 'mac']);
    const normalizedDeviceId = typeof deviceId === 'string' ? deviceId.toLowerCase() : '';

    // Workaround for client mistakenly sending OS name as deviceId
    if (osDeviceIds.has(normalizedDeviceId)) {
      if (!hwid) {
        return NextResponse.json({ error: 'Missing required field: hwid' }, { status: 400 });
      }
      os = os || incomingDeviceId; // Set OS if not provided
      deviceId = hwid; // Use hwid as the unique deviceId
    }

    if (!key || !hwid || !deviceId) {
      return NextResponse.json({ error: 'Missing required fields: key, hwid, deviceId' }, { status: 400 });
    }

    // Load license
    const [license] = await db
      .select({ id: licenses.id, userId: licenses.userId, isActive: licenses.isActive, expiryDate: licenses.expiryDate })
      .from(licenses)
      .where(eq(licenses.key, key))
      .limit(1);

    if (!license) {
      return NextResponse.json({ error: 'License not found' }, { status: 404 });
    }

    if (!license.isActive) {
      return NextResponse.json({ error: 'License is revoked or inactive' }, { status: 403 });
    }

    if (license.expiryDate && new Date(license.expiryDate) < new Date()) {
       return NextResponse.json({ error: 'License has expired' }, { status: 403 });
    }

    // Check if user is active
    if (!license.userId) {
       return NextResponse.json({ error: 'Invalid license assignment' }, { status: 400 });
    }
    const [user] = await db.select({ isActive: users.isActive }).from(users).where(eq(users.id, license.userId)).limit(1);
    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'User account is inactive' }, { status: 403 });
    }

    // Verify or Insert Device
    const [existingDevice] = await db
      .select()
      .from(devices)
      .where(and(eq(devices.hwid, hwid), eq(devices.userId, license.userId)))
      .limit(1);

    if (existingDevice) {
      // Just update last_seen and make sure it's active
      await db.update(devices)
        .set({ isActive: true, lastSeen: new Date(), deviceId, os: os || existingDevice.os })
        .where(eq(devices.id, existingDevice.id));
    } else {
      // Create new device
      await db.insert(devices).values({
        deviceId,
        userId: license.userId,
        os,
        hwid,
        isActive: true,
      });
    }

    return NextResponse.json({ message: 'Device successfully activated' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: error?.message }, { status: 500 });
  }
}

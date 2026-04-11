import { db } from '@/db';
import { devices, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function unbindDevice(formData: FormData) {
  'use server';
  const id = Number(formData.get('id'));
  if (id) {
    await db.update(devices).set({ isActive: false }).where(eq(devices.id, id));
  }
  redirect('/admin/devices');
}

export default async function DevicesPage() {
  const allDevices = await db
    .select({
      id: devices.id,
      deviceId: devices.deviceId,
      userId: devices.userId,
      userEmail: users.email,
      os: devices.os,
      hwid: devices.hwid,
      isActive: devices.isActive,
      lastSeen: devices.lastSeen,
    })
    .from(devices)
    .leftJoin(users, eq(devices.userId, users.id))
    .orderBy(devices.lastSeen);

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold tracking-tight mb-8">Connected Devices</h1>

      <div className="bg-white border text-sm border-zinc-200 shadow-sm rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 font-medium">
              <th className="p-4">Device ID & OS</th>
              <th className="p-4">User</th>
              <th className="p-4">HWID</th>
              <th className="p-4">Last Seen</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
             {allDevices.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-500 font-sans">No devices found.</td>
              </tr>
            ) : null}
            {allDevices.map(dev => (
              <tr key={dev.id} className="hover:bg-zinc-50 text-sm">
                <td className="p-4">
                  <div className="font-semibold text-zinc-900">{dev.deviceId}</div>
                  <div className="text-zinc-500 text-xs">{dev.os}</div>
                </td>
                <td className="p-4 font-mono text-xs">{dev.userEmail || dev.userId}</td>
                <td className="p-4 font-mono text-xs text-zinc-500">{dev.hwid}</td>
                <td className="p-4 text-zinc-500">{dev.lastSeen ? new Date(dev.lastSeen).toLocaleString() : 'N/A'}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${dev.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {dev.isActive ? 'Connected' : 'Offline'}
                  </span>
                </td>
                <td className="p-4 text-right flex justify-end">
                   {dev.isActive ? (
                    <form action={unbindDevice}>
                      <input type="hidden" name="id" value={dev.id} />
                      <button type="submit" className="px-3 py-1 font-sans text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 text-xs">
                        Unbind
                      </button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

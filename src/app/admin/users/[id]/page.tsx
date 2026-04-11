import Link from 'next/link';
import { db } from '@/db';
import { users, licenses, devices } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function updatePlan(formData: FormData) {
  'use server';
  const id = Number(formData.get('userId'));
  const plan = formData.get('plan') as string;
  if (id && plan) {
    await db.update(users).set({ plan }).where(eq(users.id, id));
  }
  redirect(`/admin/users/${id}`);
}

async function unbindDevice(formData: FormData) {
  'use server';
  const deviceId = Number(formData.get('deviceId'));
  const userId = Number(formData.get('userId'));
  if (deviceId) {
    await db.update(devices).set({ isActive: false }).where(eq(devices.id, deviceId));
  }
  redirect(`/admin/users/${userId}`);
}

async function addLicense(formData: FormData) {
  'use server';
  const userId = Number(formData.get('userId'));
  const type = formData.get('type') as string;
  if (userId && type) {
    const key = crypto.randomUUID().toUpperCase();
    let expiryDate = null;

    if (type === 'Monthly') {
      expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }
    
    await db.insert(licenses).values({
      key,
      userId,
      type,
      isActive: true,
      expiryDate,
    });
  }
  redirect(`/admin/users/${userId}`);
}

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const p = await params;
  const userId = Number(p.id);

  if (isNaN(userId)) {
    redirect('/admin/users');
  }

  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);

  if (!user) {
    redirect('/admin/users');
  }

  const userLicenses = await db.select().from(licenses).where(eq(licenses.userId, userId));
  const userDevices = await db.select().from(devices).where(eq(devices.userId, userId));

  return (
    <div className="p-8 w-full max-w-4xl mx-auto space-y-6">
      <div>
        <Link href="/admin/users" className="text-sm text-zinc-500 hover:text-zinc-900 mb-4 inline-block">&larr; Back to Users</Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">{user.email}</h1>
            <p className="text-zinc-500 text-sm">User ID: {user.id}</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {user.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-6 space-y-6">
          <div>
            <h2 className="font-bold text-lg mb-4">Subscription Plan</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-zinc-500">Plan:</span> <span className="font-medium">{user.plan}</span></div>
              <div className="flex justify-between"><span className="text-zinc-500">Created:</span> <span className="font-medium text-zinc-700">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span></div>
            </div>
            
            <form action={updatePlan} className="mt-6 flex gap-2">
              <input type="hidden" name="userId" value={user.id} />
              <select name="plan" defaultValue={user.plan} className="flex-1 px-3 py-1.5 border rounded-md text-sm">
                 <option value="Free">Free</option>
                 <option value="Monthly">Monthly</option>
                 <option value="Lifetime">Lifetime</option>
              </select>
              <button type="submit" className="py-1.5 px-3 bg-zinc-900 text-white rounded-md hover:bg-zinc-800 font-medium text-sm">Update Plan</button>
            </form>
          </div>

          <div className="pt-6 border-t border-zinc-200">
             <div className="flex justify-between items-center mb-4">
               <h2 className="font-bold text-lg">Licenses</h2>
             </div>
             
             <div className="space-y-3">
               {userLicenses.length === 0 ? <p className="text-sm text-zinc-500">No licenses found.</p> : null}
               {userLicenses.map(lic => (
                 <div key={lic.id} className="text-sm p-3 border rounded-md flex flex-col space-y-1">
                   <div className="flex justify-between font-mono text-xs">
                     <span className="font-semibold">{lic.key}</span>
                     <span className={lic.isActive ? 'text-green-600' : 'text-red-500'}>{lic.isActive ? 'Active' : 'Revoked'}</span>
                   </div>
                   <div className="text-xs text-zinc-500">Type: {lic.type}</div>
                 </div>
               ))}
             </div>

             <form action={addLicense} className="mt-4 flex gap-2">
                <input type="hidden" name="userId" value={user.id} />
                <select name="type" className="flex-1 px-3 py-1.5 border rounded-md text-sm" defaultValue="Monthly">
                  <option value="Free">Free</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Lifetime">Lifetime</option>
                </select>
                <button type="submit" className="py-1.5 px-3 bg-zinc-100 border rounded-md hover:bg-zinc-200 font-medium text-sm">Generate</button>
             </form>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 shadow-sm rounded-lg p-6">
          <h2 className="font-bold text-lg mb-4">Devices ({userDevices.length})</h2>
          <div className="space-y-4 mb-6">
            {userDevices.length === 0 ? <p className="text-sm text-zinc-500">No devices connected.</p> : null}
            {userDevices.map(dev => (
              <div key={dev.id} className={`text-sm border-l-2 pl-3 ${dev.isActive ? 'border-green-500' : 'border-red-500'}`}>
                <div className="font-medium flex justify-between">
                  <span>{dev.deviceId}</span>
                  <span className="text-xs text-zinc-500">{dev.isActive ? 'Connected' : 'Unbound'}</span>
                </div>
                <div className="text-xs text-zinc-500">OS: {dev.os} &bull; HWID: {dev.hwid}</div>
                <div className="text-xs text-zinc-500">Seen: {dev.lastSeen ? new Date(dev.lastSeen).toLocaleString() : 'N/A'}</div>
                {dev.isActive ? (
                  <form action={unbindDevice} className="mt-2">
                    <input type="hidden" name="deviceId" value={dev.id} />
                    <input type="hidden" name="userId" value={user.id} />
                    <button type="submit" className="text-xs text-red-600 hover:text-red-800 font-medium">Unbind Device</button>
                  </form>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

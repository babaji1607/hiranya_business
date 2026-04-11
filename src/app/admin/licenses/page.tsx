import { db } from '@/db';
import { licenses, users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

async function revokeLicense(formData: FormData) {
  'use server';
  const id = Number(formData.get('id'));
  if (id) {
    await db.update(licenses).set({ isActive: false }).where(eq(licenses.id, id));
  }
  redirect('/admin/licenses');
}

export default async function LicensesPage() {
  const allLicenses = await db
    .select({
      id: licenses.id,
      key: licenses.key,
      userId: licenses.userId,
      userEmail: users.email,
      type: licenses.type,
      isActive: licenses.isActive,
      expiryDate: licenses.expiryDate,
      createdAt: licenses.createdAt,
    })
    .from(licenses)
    .leftJoin(users, eq(licenses.userId, users.id))
    .orderBy(licenses.createdAt);

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Licenses</h1>
      </div>

      <div className="bg-white border text-sm border-zinc-200 shadow-sm rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 font-medium">
              <th className="p-4">License Key</th>
              <th className="p-4">User</th>
              <th className="p-4">Type</th>
              <th className="p-4">Status</th>
              <th className="p-4">Expiry</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {allLicenses.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-500 font-sans">No licenses found.</td>
              </tr>
            ) : null}
            {allLicenses.map(lic => (
              <tr key={lic.id} className="hover:bg-zinc-50 font-mono text-xs">
                <td className="p-4 font-semibold">{lic.key}</td>
                <td className="p-4 font-sans text-sm">{lic.userEmail || `User ID: ${lic.userId}`}</td>
                <td className="p-4 font-sans text-sm">{lic.type}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold font-sans ${lic.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {lic.isActive ? 'Active' : 'Revoked'}
                  </span>
                </td>
                <td className="p-4 font-sans text-sm text-zinc-500">{lic.expiryDate ? new Date(lic.expiryDate).toLocaleDateString() : 'Never'}</td>
                <td className="p-4 text-right flex items-center justify-end space-x-2">
                  {lic.isActive ? (
                    <form action={revokeLicense}>
                      <input type="hidden" name="id" value={lic.id} />
                      <button type="submit" className="px-3 py-1 font-sans text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100 text-xs">
                        Revoke
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

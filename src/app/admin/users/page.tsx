import Link from 'next/link';
import { db } from '@/db';
import { users, licenses, devices } from '@/db/schema';
import { eq, sql, count } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  // Query all users and left join to see how many devices they have
  // and maybe check if their license is active, or just get device count for now.
  const usersWithStats = await db
    .select({
      id: users.id,
      email: users.email,
      plan: users.plan,
      isActive: users.isActive,
      expiryDate: users.expiryDate,
      createdAt: users.createdAt,
      deviceCount: count(devices.id)
    })
    .from(users)
    .leftJoin(devices, eq(users.id, devices.userId))
    .groupBy(users.id)
    .orderBy(users.createdAt);

  return (
    <div className="p-8 w-full max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Users</h1>
        <Link href="/admin/users/new" className="px-4 py-2 bg-zinc-900 text-white rounded-md text-sm font-medium hover:bg-zinc-800">
          Add User
        </Link>
      </div>

      <div className="bg-white border text-sm border-zinc-200 shadow-sm rounded-lg overflow-hidden">
        <div className="p-4 border-b border-zinc-200">
          <input type="text" placeholder="Search users..." className="w-full max-w-sm px-3 py-2 border rounded-md" />
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 font-medium">
              <th className="p-4">Email</th>
              <th className="p-4">Plan</th>
              <th className="p-4">Status</th>
              <th className="p-4">Expiry</th>
              <th className="p-4 text-right">Devices</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200">
            {usersWithStats.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-500">No users found. Create one.</td>
              </tr>
            ) : null}
            {usersWithStats.map(user => (
              <tr key={user.id} className="hover:bg-zinc-50">
                <td className="p-4">{user.email}</td>
                <td className="p-4">{user.plan}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-4 text-zinc-500">{user.expiryDate ? new Date(user.expiryDate).toLocaleDateString() : 'Lifetime'}</td>
                <td className="p-4 text-right">{user.deviceCount}</td>
                <td className="p-4 text-right">
                  <Link href={`/admin/users/${user.id}`} className="px-3 py-1 bg-zinc-100 border rounded-md hover:bg-zinc-200 font-medium text-xs mr-2">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

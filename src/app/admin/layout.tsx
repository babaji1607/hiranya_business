import Link from 'next/link';
import { Home, Users, Key, Laptop, LogOut } from 'lucide-react';
import { auth, signOut } from '@/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  console.log("AdminLayout session check:", session);
  if (!session) {
    console.log("No session found in AdminLayout! Redirecting to /login");
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex font-sans text-zinc-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-zinc-200">
          <Link href="/" className="font-bold text-lg tracking-tight flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600" />
            TauriLicense
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 text-sm font-medium">
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-100 transition-colors">
            <Users className="w-4 h-4" /> Users
          </Link>
          <Link href="/admin/licenses" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-100 transition-colors">
            <Key className="w-4 h-4" /> Licenses
          </Link>
          <Link href="/admin/devices" className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-zinc-100 transition-colors">
            <Laptop className="w-4 h-4" /> Devices
          </Link>
        </nav>
        <div className="p-4 border-t border-zinc-200 text-sm flex items-center justify-between">
          <span className="text-zinc-500 font-medium">{session.user?.name || 'Admin'}</span>
          <form action={async () => { "use server"; await signOut({ redirectTo: '/login' }) }}>
            <button type="submit" className="text-red-600 hover:text-red-700 flex items-center gap-1 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  );
}

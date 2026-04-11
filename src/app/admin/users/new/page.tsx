import { db } from '@/db';
import { users, licenses } from '@/db/schema';
import { redirect } from 'next/navigation';
import Link from 'next/link';

async function createUser(formData: FormData) {
  'use server';
  
  const email = formData.get('email') as string;
  const plan = formData.get('plan') as string;
  const generateLicense = formData.get('generateLicense') === 'on';

  if (!email || !plan) {
    throw new Error('Email and Plan are required.');
  }

  // Insert user
  const [newUser] = await db.insert(users).values({
    email,
    plan,
    isActive: true,
  }).returning();

  // If requested, generate a free license
  if (generateLicense) {
    const key = crypto.randomUUID().toUpperCase();
    
    let expiryDate = null;
    if (plan === 'Monthly') {
      expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    }
    
    await db.insert(licenses).values({
      key,
      userId: newUser.id,
      type: plan || 'Free', // Matches the user's selected plan tier
      isActive: true,
      expiryDate,
    });
  }

  // Redirect to users page
  redirect('/admin/users');
}

export default function NewUserPage() {
  return (
    <div className="p-8 w-full max-w-2xl mx-auto">
      <div className="flex items-center space-x-4 mb-8">
        <Link href="/admin/users" className="text-zinc-500 hover:text-zinc-900">&larr; Back</Link>
        <h1 className="text-2xl font-bold tracking-tight">Create New User</h1>
      </div>

      <div className="bg-white border border-zinc-200 shadow-sm rounded-lg overflow-hidden p-6">
        <form action={createUser} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-1">Email Address</label>
            <input 
              name="email" 
              type="email" 
              required 
              className="w-full px-3 py-2 border rounded-md" 
              placeholder="user@example.com" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-900 mb-1">Plan</label>
            <select name="plan" className="w-full px-3 py-2 border rounded-md" defaultValue="Free">
              <option value="Free">Free</option>
              <option value="Monthly">Monthly</option>
              <option value="Lifetime">Lifetime</option>
            </select>
          </div>

          <div className="flex items-center">
            <input 
              name="generateLicense" 
              type="checkbox" 
              defaultChecked
              className="mr-2 h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600" 
            />
            <label className="text-sm font-medium text-zinc-900">
              Automatically assign a Free license key
            </label>
          </div>

          <div className="pt-4 border-t border-zinc-200 flex justify-end">
            <button type="submit" className="px-4 py-2 bg-zinc-900 text-white rounded-md text-sm font-medium hover:bg-zinc-800">
              Create User
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}

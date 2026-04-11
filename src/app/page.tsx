import Link from 'next/link';
import { DownloadCloud, ShieldCheck, KeyRound, MonitorSmartphone, ArrowRight } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col text-zinc-900 font-sans">
      <header className="px-6 py-4 flex flex-row justify-between items-center bg-white border-b border-zinc-200">
        <div className="font-bold text-xl tracking-tight flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-blue-600" />
          TauriLicense
        </div>
        <nav className="gap-4 flex">
          <Link href="/admin" className="inline-flex items-center gap-2 px-4 py-2 border rounded-md font-medium text-sm hover:bg-zinc-100 transition-colors">
            Admin Login
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero */}
        <section className="w-full max-w-4xl px-6 py-24 text-center flex flex-col items-center">
          <h1 className="text-5xl font-extrabold tracking-tight mb-6">
            Control Access. Manage Licenses. <br/><span className="text-blue-600">Ship Faster.</span>
          </h1>
          <p className="text-xl text-zinc-500 mb-8 max-w-2xl leading-relaxed">
            The ultimate lightweight licensing system for Tauri desktop apps. Manage user subscriptions, enforce custom device limits, and securely deliver app updates.
          </p>
          <div className="flex gap-4">
            <Link href="/admin" className="px-8 flex items-center justify-center gap-2 py-3 bg-zinc-900 text-white rounded-md font-medium hover:bg-zinc-800 transition-colors shadow">
              Get Started <ArrowRight className="w-4 h-4"/>
            </Link>
            <Link href="/api-docs" className="px-8 flex items-center justify-center py-3 bg-zinc-100 border text-zinc-900 rounded-md font-medium hover:bg-zinc-200 transition-colors">
              Read Docs
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="w-full max-w-5xl px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-12">Features Built for Desktop</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
            {[
              { icon: KeyRound, title: "Key Management", desc: "Generate, pause, and revoke license keys instantly." },
              { icon: MonitorSmartphone, title: "Hardware Tracking", desc: "Bind licenses to specific secure hardware signatures." },
              { icon: ShieldCheck, title: "Plan Control", desc: "Support ongoing subscriptions or legacy lifetime access." },
              { icon: DownloadCloud, title: "Secure Delivery", desc: "Require valid licenses to download any app updates." }
            ].map((f, i) => (
              <div key={i} className="bg-white p-6 rounded-xl border border-zinc-200 shadow-sm flex flex-col items-start hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-zinc-500 text-sm flex-1">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-zinc-200 bg-white py-8 text-center text-sm text-zinc-500 mt-auto">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-bold text-zinc-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600" />
            TauriLicense &copy; {new Date().getFullYear()}
          </div>
          <div className="flex gap-4 font-medium">
            <Link href="/api-docs" className="hover:text-zinc-900 transition-colors">API Reference</Link>
            <Link href="#" className="hover:text-zinc-900 transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

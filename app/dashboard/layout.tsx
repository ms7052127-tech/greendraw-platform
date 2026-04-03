'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, TrendingUp, Trophy, Heart, Settings, LogOut, Menu, X, CreditCard } from 'lucide-react';

const NAV = [
  { href: '/dashboard', icon: <LayoutDashboard size={18} />, label: 'Overview' },
  { href: '/dashboard/scores', icon: <TrendingUp size={18} />, label: 'My Scores' },
  { href: '/dashboard/draws', icon: <Trophy size={18} />, label: 'Draws & Wins' },
  { href: '/dashboard/charity', icon: <Heart size={18} />, label: 'My Charity' },
  { href: '/dashboard/subscription', icon: <CreditCard size={18} />, label: 'Subscription' },
  { href: '/dashboard/settings', icon: <Settings size={18} />, label: 'Settings' },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data } = await supabase.from('profiles').select('*, charities(name)').eq('id', user.id).single();
      setProfile(data);
    }
    load();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  const Sidebar = () => (
    <aside style={{
      width: 240, background: 'rgba(10,15,10,0.95)', borderRight: '1px solid var(--border-subtle)',
      display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0,
      padding: '24px 16px',
    }}>
      {/* Logo */}
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #4ade80, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⛳</div>
        <span className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>GreenDraw</span>
      </Link>

      {/* Nav */}
      <nav style={{ flex: 1 }}>
        {NAV.map(item => (
          <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href ? 'active' : ''}`} style={{ marginBottom: 4 }}>
            {item.icon}{item.label}
          </Link>
        ))}
      </nav>

      {/* User */}
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
        {profile && (
          <div style={{ padding: '10px 14px', marginBottom: 8 }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 2 }}>
              {profile.full_name || 'Golfer'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{profile.email}</div>
            <div style={{ marginTop: 8 }}>
              <span className={`badge ${profile.subscription_status === 'active' ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                {profile.subscription_status === 'active' ? '● Active' : '● Inactive'}
              </span>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="sidebar-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Desktop sidebar */}
      <div style={{ display: 'none' }} className="lg-sidebar">
        <Sidebar />
      </div>
      <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
        <Sidebar />
        {/* Main content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

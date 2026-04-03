'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, TrendingUp, Trophy, Heart, Settings, LogOut, CreditCard, Menu, X } from 'lucide-react';

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
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const SidebarContent = () => (
    <>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 40 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #4ade80, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⛳</div>
        <span className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>GreenDraw</span>
      </Link>
      <nav style={{ flex: 1 }}>
        {NAV.map(item => (
          <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`sidebar-link ${pathname === item.href ? 'active' : ''}`} style={{ marginBottom: 4 }}>
            {item.icon}{item.label}
          </Link>
        ))}
      </nav>
      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
        {profile && (
          <div style={{ padding: '10px 14px', marginBottom: 8 }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 2 }}>{profile.full_name || 'Golfer'}</div>
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
    </>
  );

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Desktop sidebar */}
      <aside style={{ width: 240, background: 'rgba(10,15,10,0.95)', borderRight: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0, padding: '24px 16px' }} className="desktop-sidebar">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div style={{ display: 'none', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,15,10,0.95)', borderBottom: '1px solid var(--border-subtle)', padding: '0 16px', height: 56, alignItems: 'center', justifyContent: 'space-between' }} className="mobile-header">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #4ade80, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>⛳</div>
          <span className="font-display" style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>GreenDraw</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', padding: 4 }}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99, background: 'rgba(0,0,0,0.5)' }} onClick={() => setMobileOpen(false)}>
          <aside style={{ width: 260, height: '100%', background: 'rgba(10,15,10,0.98)', padding: '70px 16px 24px', display: 'flex', flexDirection: 'column' }} onClick={e => e.stopPropagation()}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', padding: 'clamp(16px, 3vw, 32px)' }} className="dashboard-main">
        {children}
      </main>
    </div>
  );
}

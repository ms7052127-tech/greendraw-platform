'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LayoutDashboard, Users, Trophy, Heart, Award, BarChart2, LogOut, Shield } from 'lucide-react';

const NAV = [
  { href: '/admin', icon: <LayoutDashboard size={18} />, label: 'Overview' },
  { href: '/admin/users', icon: <Users size={18} />, label: 'Users' },
  { href: '/admin/draws', icon: <Trophy size={18} />, label: 'Draw Management' },
  { href: '/admin/charities', icon: <Heart size={18} />, label: 'Charities' },
  { href: '/admin/winners', icon: <Award size={18} />, label: 'Winners' },
  { href: '/admin/analytics', icon: <BarChart2 size={18} />, label: 'Analytics' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/login'); return; }
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data?.role !== 'admin') { router.push('/dashboard'); return; }
      setAdmin(data);
    }
    check();
  }, []);

  async function logout() {
    await supabase.auth.signOut();
    router.push('/');
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      <aside style={{
        width: 240, background: 'rgba(10,15,10,0.98)', borderRight: '1px solid var(--border-subtle)',
        display: 'flex', flexDirection: 'column', height: '100vh', position: 'sticky', top: 0,
        padding: '24px 16px',
      }}>
        {/* Logo + admin badge */}
        <div style={{ marginBottom: 32 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #4ade80, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>⛳</div>
            <span className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>GreenDraw</span>
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 4 }}>
            <Shield size={12} color="var(--accent-gold)" />
            <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Admin Panel</span>
          </div>
        </div>

        <nav style={{ flex: 1 }}>
          {NAV.map(item => (
            <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href ? 'active' : ''}`} style={{ marginBottom: 4 }}>
              {item.icon}{item.label}
            </Link>
          ))}
        </nav>

        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: 16 }}>
          {admin && (
            <div style={{ padding: '10px 14px', marginBottom: 8 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 2 }}>{admin.full_name || 'Admin'}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{admin.email}</div>
            </div>
          )}
          <button onClick={logout} className="sidebar-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', color: '#f87171' }}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, overflow: 'auto', padding: '32px' }}>
        {children}
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Users, CreditCard, Trophy, Heart, TrendingUp, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminPage() {
  const [stats, setStats] = useState<any>({});
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const [usersRes, activeRes, drawsRes, winnersRes, charityRes] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).neq('role', 'admin'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('subscription_status', 'active'),
        supabase.from('draws').select('total_prize_pool').eq('status', 'published'),
        supabase.from('winners').select('prize_amount').eq('payment_status', 'paid'),
        supabase.from('charity_contributions').select('amount'),
      ]);

      const totalPrizePool = drawsRes.data?.reduce((s, d) => s + d.total_prize_pool, 0) || 0;
      const totalPaid = winnersRes.data?.reduce((s, w) => s + w.prize_amount, 0) || 0;
      const totalCharity = charityRes.data?.reduce((s, c) => s + c.amount, 0) || 0;

      setStats({
        totalUsers: usersRes.count || 0,
        activeSubscribers: activeRes.count || 0,
        totalPrizePool,
        totalPaid,
        totalCharity,
        drawCount: drawsRes.data?.length || 0,
      });

      const { data: recent } = await supabase.from('profiles').select('id, full_name, email, subscription_status, subscription_plan, created_at').neq('role', 'admin').order('created_at', { ascending: false }).limit(5);
      setRecentUsers(recent || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return (
    <div style={{ display: 'grid', gap: 20 }}>
      {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 6 }}>Admin Overview</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Platform-wide statistics and controls.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { icon: <Users size={20} />, label: 'Total Users', value: stats.totalUsers, color: '#4ade80' },
          { icon: <CreditCard size={20} />, label: 'Active Subscribers', value: stats.activeSubscribers, color: '#10b981' },
          { icon: <Trophy size={20} />, label: 'Total Prize Pool', value: formatCurrency(stats.totalPrizePool), color: '#fbbf24' },
          { icon: <TrendingUp size={20} />, label: 'Prizes Paid Out', value: formatCurrency(stats.totalPaid), color: '#f472b6' },
          { icon: <Heart size={20} />, label: 'Charity Raised', value: formatCurrency(stats.totalCharity), color: '#fb7185' },
        ].map((card, i) => (
          <div key={i} className="glass-card" style={{ padding: 20 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(${card.color === '#4ade80' ? '74,222,128' : card.color === '#10b981' ? '16,185,129' : card.color === '#fbbf24' ? '251,191,36' : card.color === '#f472b6' ? '244,114,182' : '251,113,133'},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, marginBottom: 12 }}>
              {card.icon}
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 4 }}>{card.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 32 }}>
        {[
          { href: '/admin/draws', label: 'Run Monthly Draw', icon: '🎯', desc: 'Configure and execute draw' },
          { href: '/admin/winners', label: 'Verify Winners', icon: '✅', desc: 'Review proof submissions' },
          { href: '/admin/charities', label: 'Manage Charities', icon: '💚', desc: 'Add or edit charity listings' },
          { href: '/admin/users', label: 'User Management', icon: '👥', desc: 'View and edit user accounts' },
        ].map((action, i) => (
          <Link key={i} href={action.href} style={{ textDecoration: 'none' }}>
            <div className="glass-card" style={{ padding: 20, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, transition: 'all 0.2s' }}>
              <div style={{ fontSize: '1.8rem' }}>{action.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: 2 }}>{action.label}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{action.desc}</div>
              </div>
              <ArrowRight size={16} color="var(--text-muted)" />
            </div>
          </Link>
        ))}
      </div>

      {/* Recent users */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontWeight: 600 }}>Recent Sign-ups</h3>
          <Link href="/admin/users" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontSize: '0.85rem' }}>View all →</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {recentUsers.map(user => (
              <tr key={user.id}>
                <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user.full_name || 'Unknown'}</td>
                <td>{user.email}</td>
                <td>{user.subscription_plan ? <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>{user.subscription_plan}</span> : '—'}</td>
                <td><span className={`badge ${user.subscription_status === 'active' ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.75rem' }}>
                  {user.subscription_status}
                </span></td>
                <td>{formatDate(user.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

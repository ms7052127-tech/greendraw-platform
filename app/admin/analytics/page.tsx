'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';
import { TrendingUp, Users, Heart, Trophy, BarChart2 } from 'lucide-react';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<any>({});
  const [draws, setDraws] = useState<any[]>([]);
  const [charityBreakdown, setCharityBreakdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const [
        totalUsersRes,
        activeRes,
        monthlyRes,
        yearlyRes,
        drawsRes,
        winnersRes,
        charityRes,
        contribRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact' }).neq('role', 'admin'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('subscription_status', 'active'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('subscription_plan', 'monthly').eq('subscription_status', 'active'),
        supabase.from('profiles').select('id', { count: 'exact' }).eq('subscription_plan', 'yearly').eq('subscription_status', 'active'),
        supabase.from('draws').select('*').eq('status', 'published').order('draw_year', { ascending: true }).order('draw_month', { ascending: true }),
        supabase.from('winners').select('prize_amount, payment_status'),
        supabase.from('charities').select('name, total_raised').eq('is_active', true).order('total_raised', { ascending: false }),
        supabase.from('charity_contributions').select('amount').not('amount', 'is', null),
      ]);

      const totalRevenue = ((monthlyRes.count || 0) * 9.99) + ((yearlyRes.count || 0) * (89.99 / 12));
      const totalPaid = winnersRes.data?.filter(w => w.payment_status === 'paid').reduce((s, w) => s + w.prize_amount, 0) || 0;
      const totalCharity = contribRes.data?.reduce((s, c) => s + c.amount, 0) || 0;
      const totalPool = drawsRes.data?.reduce((s, d) => s + d.total_prize_pool, 0) || 0;

      setStats({
        totalUsers: totalUsersRes.count || 0,
        activeSubscribers: activeRes.count || 0,
        monthlySubscribers: monthlyRes.count || 0,
        yearlySubscribers: yearlyRes.count || 0,
        monthlyRevenue: totalRevenue,
        totalPaid,
        totalCharity,
        totalPool,
        drawCount: drawsRes.data?.length || 0,
        totalWinners: winnersRes.data?.length || 0,
      });

      setDraws(drawsRes.data || []);
      setCharityBreakdown(charityRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <div style={{ display: 'grid', gap: 20 }}>{[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 120 }} />)}</div>;

  const maxPool = Math.max(...draws.map(d => d.total_prize_pool), 1);
  const maxCharity = Math.max(...charityBreakdown.map(c => c.total_raised), 1);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 6 }}>Analytics</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Platform-wide statistics and reporting.</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Users', value: stats.totalUsers, icon: <Users size={18} />, color: '#4ade80' },
          { label: 'Active Subscribers', value: stats.activeSubscribers, icon: <TrendingUp size={18} />, color: '#10b981' },
          { label: 'Monthly Revenue', value: formatCurrency(stats.monthlyRevenue), icon: <BarChart2 size={18} />, color: '#fbbf24' },
          { label: 'Total Prizes Paid', value: formatCurrency(stats.totalPaid), icon: <Trophy size={18} />, color: '#f472b6' },
          { label: 'Total Prize Pool', value: formatCurrency(stats.totalPool), icon: <Trophy size={18} />, color: '#fb923c' },
          { label: 'Charity Raised', value: formatCurrency(stats.totalCharity), icon: <Heart size={18} />, color: '#fb7185' },
        ].map((kpi, i) => (
          <div key={i} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <div style={{ color: kpi.color }}>{kpi.icon}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{kpi.label}</span>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: kpi.color }}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Subscription split */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Subscription Split</h3>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ flex: 1, height: 28, borderRadius: 6, background: 'rgba(74,222,128,0.15)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${stats.activeSubscribers > 0 ? (stats.monthlySubscribers / stats.activeSubscribers * 100) : 0}%`, background: 'linear-gradient(90deg, #4ade80, #10b981)', borderRadius: 6 }} />
              </div>
              <span style={{ color: '#4ade80', fontWeight: 600, whiteSpace: 'nowrap', minWidth: 60, textAlign: 'right' }}>
                {stats.monthlySubscribers} monthly
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ flex: 1, height: 28, borderRadius: 6, background: 'rgba(251,191,36,0.15)', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${stats.activeSubscribers > 0 ? (stats.yearlySubscribers / stats.activeSubscribers * 100) : 0}%`, background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', borderRadius: 6 }} />
              </div>
              <span style={{ color: '#fbbf24', fontWeight: 600, whiteSpace: 'nowrap', minWidth: 60, textAlign: 'right' }}>
                {stats.yearlySubscribers} yearly
              </span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { label: 'Monthly Revenue', value: formatCurrency(stats.monthlySubscribers * 9.99) },
              { label: 'Yearly Revenue', value: formatCurrency(stats.yearlySubscribers * 89.99) },
              { label: 'Monthly Plan MRR', value: formatCurrency(stats.monthlySubscribers * 9.99) },
              { label: 'Yearly Plan MRR', value: formatCurrency(stats.yearlySubscribers * 89.99 / 12) },
            ].map((item, i) => (
              <div key={i} style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Draw stats */}
      {draws.length > 0 && (
        <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Draw History — Prize Pools</h3>
          <div style={{ overflowX: 'auto' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', minWidth: draws.length * 72, height: 160, paddingBottom: 28, position: 'relative' }}>
              {draws.map((draw, i) => {
                const height = (draw.total_prize_pool / maxPool) * 120;
                return (
                  <div key={draw.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flex: '0 0 60px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#fbbf24', fontWeight: 500 }}>{formatCurrency(draw.total_prize_pool)}</div>
                    <div style={{ width: '100%', height: `${height}px`, background: 'linear-gradient(180deg, #fbbf24, rgba(251,191,36,0.3))', borderRadius: '6px 6px 0 0', minHeight: 4, transition: 'all 0.3s' }} title={`${MONTHS[draw.draw_month - 1]} ${draw.draw_year}: ${formatCurrency(draw.total_prize_pool)}`} />
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center' }}>{MONTHS[draw.draw_month - 1]}<br />{draw.draw_year}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border-subtle)' }}>
            {[
              { label: 'Total Draws Run', value: stats.drawCount },
              { label: 'Total Winners', value: stats.totalWinners },
              { label: 'Avg Pool / Draw', value: formatCurrency(stats.totalPool / Math.max(stats.drawCount, 1)) },
              { label: 'Avg Winners / Draw', value: (stats.totalWinners / Math.max(stats.drawCount, 1)).toFixed(1) },
            ].map((item, i) => (
              <div key={i} style={{ padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontWeight: 600 }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charity breakdown */}
      <div className="glass-card" style={{ padding: 28 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Charity Contributions</h3>
        {charityBreakdown.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>No contributions yet.</div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {charityBreakdown.map((charity, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '200px 1fr auto', gap: 16, alignItems: 'center' }}>
                <div style={{ fontWeight: 500, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{charity.name}</div>
                <div style={{ height: 12, background: 'rgba(255,255,255,0.06)', borderRadius: 6, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(charity.total_raised / maxCharity) * 100}%`, background: 'linear-gradient(90deg, #f472b6, #ec4899)', borderRadius: 6 }} />
                </div>
                <div style={{ fontWeight: 600, color: '#f472b6', minWidth: 80, textAlign: 'right' }}>{formatCurrency(charity.total_raised)}</div>
              </div>
            ))}
          </div>
        )}
        <div style={{ marginTop: 20, padding: '14px 16px', background: 'rgba(244,114,182,0.08)', borderRadius: 10, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Total charity raised (all time)</span>
          <span style={{ fontWeight: 700, color: '#f472b6', fontSize: '1.05rem' }}>{formatCurrency(stats.totalCharity)}</span>
        </div>
      </div>
    </div>
  );
}

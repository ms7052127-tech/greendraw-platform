'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CreditCard, CheckCircle, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { formatDate, formatCurrency } from '@/lib/utils';
import Link from 'next/link';

export default function SubscriptionPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      setLoading(false);
    }
    load();
  }, []);

  async function openPortal() {
    setPortalLoading(true);
    const res = await fetch('/api/stripe/portal', { method: 'POST' });
    const { url, error } = await res.json();
    if (error) { alert(error); setPortalLoading(false); return; }
    window.location.href = url;
  }

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  const isActive = profile?.subscription_status === 'active';
  const monthlyPrice = profile?.subscription_plan === 'yearly' ? 89.99 : 9.99;
  const charityAmount = monthlyPrice * (profile?.charity_contribution_percentage || 10) / 100;
  const prizeAmount = monthlyPrice * 0.5;

  const statusConfig = {
    active: { color: '#4ade80', icon: <CheckCircle size={16} />, label: 'Active' },
    inactive: { color: '#f87171', icon: <XCircle size={16} />, label: 'Inactive' },
    cancelled: { color: '#f87171', icon: <XCircle size={16} />, label: 'Cancelled' },
    lapsed: { color: '#fbbf24', icon: <AlertTriangle size={16} />, label: 'Lapsed' },
  };
  const status = statusConfig[profile?.subscription_status as keyof typeof statusConfig] || statusConfig.inactive;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 6 }}>Subscription</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your GreenDraw subscription and billing.</p>
      </div>

      {/* Status card */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(74,222,128,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CreditCard size={20} color="var(--accent-green)" />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>GreenDraw {profile?.subscription_plan === 'yearly' ? 'Yearly' : 'Monthly'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, color: status.color, fontSize: '0.85rem' }}>
                  {status.icon} {status.label}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              {[
                { label: 'Plan', value: profile?.subscription_plan === 'yearly' ? 'Yearly (£89.99)' : 'Monthly (£9.99)' },
                { label: 'Status', value: profile?.subscription_status || 'inactive' },
                { label: 'Renews / Expires', value: profile?.subscription_end_date ? formatDate(profile.subscription_end_date) : '—' },
                { label: 'Member since', value: profile?.subscription_start_date ? formatDate(profile.subscription_start_date) : '—' },
              ].map((row, i) => (
                <div key={i}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{row.label}</div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{row.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {isActive ? (
              <button onClick={openPortal} disabled={portalLoading} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: portalLoading ? 0.7 : 1 }}>
                <RefreshCw size={16} /> {portalLoading ? 'Loading...' : 'Manage Billing'}
              </button>
            ) : (
              <Link href="/subscribe" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
                Reactivate Subscription
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Breakdown */}
      {isActive && (
        <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Monthly Breakdown</h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {[
              { label: 'Prize Pool (50%)', value: formatCurrency(prizeAmount), color: '#fbbf24', desc: 'Goes into monthly draw prize pools' },
              { label: `Charity (${profile?.charity_contribution_percentage || 10}%)`, value: formatCurrency(charityAmount), color: '#f472b6', desc: 'Donated directly to your chosen charity' },
              { label: 'Platform (remaining)', value: formatCurrency(monthlyPrice - prizeAmount - charityAmount), color: 'var(--text-muted)', desc: 'Covers platform & operational costs' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                <div>
                  <div style={{ fontWeight: 500, marginBottom: 2 }}>{row.label}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{row.desc}</div>
                </div>
                <div style={{ fontWeight: 700, color: row.color }}>{row.value}</div>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'rgba(74,222,128,0.08)', borderRadius: 10, borderTop: '1px solid rgba(74,222,128,0.15)', marginTop: 4 }}>
              <div style={{ fontWeight: 600 }}>Total Monthly</div>
              <div style={{ fontWeight: 700, color: 'var(--accent-green)', fontSize: '1.1rem' }}>{formatCurrency(monthlyPrice)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Plans comparison */}
      {!isActive && (
        <div className="glass-card" style={{ padding: 28 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Choose a Plan</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {[
              { plan: 'monthly', price: '£9.99/month', label: 'Monthly', features: ['Monthly draws', 'Score tracking', 'Charity giving'] },
              { plan: 'yearly', price: '£89.99/year', label: 'Yearly — Save 25%', features: ['All monthly features', '£7.50/month effective', 'Priority support'], recommended: true },
            ].map((p, i) => (
              <Link key={i} href={`/subscribe?plan=${p.plan}`} style={{ textDecoration: 'none' }}>
                <div className="glass-card" style={{ padding: 20, border: p.recommended ? '1px solid rgba(74,222,128,0.3)' : '1px solid var(--border-subtle)', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {p.recommended && <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-green)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Best Value</div>}
                  <div style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 4 }}>{p.price}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 12 }}>{p.label}</div>
                  {p.features.map((f, j) => (
                    <div key={j} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 4 }}>✓ {f}</div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

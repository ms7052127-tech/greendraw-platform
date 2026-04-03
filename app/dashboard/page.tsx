'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { TrendingUp, Trophy, Heart, CreditCard, AlertCircle, ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [recentWin, setRecentWin] = useState<any>(null);
  const [upcomingDraw, setUpcomingDraw] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile separately first
      const profileRes = await supabase
        .from('profiles')
        .select('*, charities(name, image_url)')
        .eq('id', user.id)
        .single();

      const [scoresRes, winRes, drawRes] = await Promise.all([
        supabase.from('golf_scores').select('*').eq('user_id', user.id).order('played_at', { ascending: false }).limit(5),
        supabase.from('winners').select('*, draws(draw_month, draw_year)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single(),
        supabase.from('draws').select('*').eq('status', 'published').order('draw_year', { ascending: false }).order('draw_month', { ascending: false }).limit(1).single(),
      ]);

      setProfile(profileRes.data);
      setScores(scoresRes.data || []);
      setRecentWin(winRes.data);
      setUpcomingDraw(drawRes.data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'grid', gap: 20 }}>
        {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100 }} />)}
      </div>
    );
  }

  const isActive = profile?.subscription_status === 'active';
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 6 }}>
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Golfer'} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Here&apos;s your GreenDraw overview for this month.</p>
      </div>

      {!isActive && (
        <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertCircle size={20} color="#fbbf24" />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: '#fbbf24', marginBottom: 2 }}>Subscription Inactive</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Subscribe to enter monthly draws and support charity.</div>
          </div>
          <Link href="/subscribe" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 16px', fontSize: '0.875rem' }}>Subscribe Now</Link>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          {
            icon: <CreditCard size={20} />,
            label: 'Subscription',
            value: isActive ? (profile.subscription_plan === 'yearly' ? 'Yearly' : 'Monthly') : 'Inactive',
            sub: isActive ? `Renews ${profile.subscription_end_date ? formatDate(profile.subscription_end_date) : 'soon'}` : 'Not subscribed',
            color: isActive ? '#4ade80' : '#f87171',
          },
          {
            icon: <TrendingUp size={20} />,
            label: 'Scores Entered',
            value: `${scores.length}/5`,
            sub: scores.length === 5 ? 'All 5 scores entered' : `${5 - scores.length} more needed`,
            color: scores.length === 5 ? '#4ade80' : '#fbbf24',
          },
          {
            icon: <Trophy size={20} />,
            label: 'Total Won',
            value: recentWin ? formatCurrency(recentWin.prize_amount) : '£0.00',
            sub: recentWin ? `${monthNames[recentWin.draws?.draw_month - 1]} ${recentWin.draws?.draw_year}` : 'No wins yet',
            color: '#fbbf24',
          },
          {
            icon: <Heart size={20} />,
            label: 'Charity',
            value: `${profile?.charity_contribution_percentage || 10}%`,
            sub: profile?.charities?.name || 'No charity selected',
            color: '#f472b6',
          },
        ].map((card, i) => (
          <div key={i} className="glass-card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `rgba(${card.color === '#4ade80' ? '74,222,128' : card.color === '#fbbf24' ? '251,191,36' : card.color === '#f87171' ? '248,113,113' : '244,114,182'},0.12)`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                {card.icon}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>{card.label}</span>
            </div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{card.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{card.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>My Scores</h3>
            <Link href="/dashboard/scores" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              Manage <ArrowRight size={14} />
            </Link>
          </div>
          {scores.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>⛳</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 16 }}>No scores entered yet</div>
              <Link href="/dashboard/scores" className="btn-primary" style={{ textDecoration: 'none', padding: '8px 20px', fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Plus size={14} /> Add Score
              </Link>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
                {scores.map((s) => (
                  <div key={s.id} className="score-ball" title={formatDate(s.played_at)}>{s.score}</div>
                ))}
                {Array(5 - scores.length).fill(0).map((_, i) => (
                  <div key={i} style={{ width: 48, height: 48, borderRadius: '50%', border: '2px dashed var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>+</div>
                ))}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>These are your draw numbers for the next draw</div>
            </div>
          )}
        </div>

        <div className="glass-card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h3 style={{ fontWeight: 600, fontSize: '1rem' }}>Latest Draw</h3>
            <Link href="/dashboard/draws" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
              All draws <ArrowRight size={14} />
            </Link>
          </div>
          {!upcomingDraw ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>🎯</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No draws published yet</div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                {monthNames[upcomingDraw.draw_month - 1]} {upcomingDraw.draw_year} Draw
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {upcomingDraw.winning_numbers.map((n: number) => (
                  <div key={n} className="score-ball winner" style={{ width: 42, height: 42, fontSize: '1rem' }}>{n}</div>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                <div style={{ padding: '10px', background: 'rgba(251,191,36,0.08)', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>Jackpot</div>
                  <div style={{ fontWeight: 600, color: '#fbbf24' }}>{formatCurrency(upcomingDraw.jackpot_amount)}</div>
                </div>
                <div style={{ padding: '10px', background: 'rgba(74,222,128,0.08)', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 2 }}>Total Pool</div>
                  <div style={{ fontWeight: 600, color: '#4ade80' }}>{formatCurrency(upcomingDraw.total_prize_pool)}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Play, Eye, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generateRandomNumbers, generateAlgorithmicNumbers, countMatches, getPrizeTier, calculatePrizePool, getUserNumbersFromScores } from '@/lib/draw-engine';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function AdminDrawsPage() {
  const [draws, setDraws] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [drawType, setDrawType] = useState<'random' | 'algorithmic'>('random');
  const [simResult, setSimResult] = useState<any>(null);
  const [confirmPublish, setConfirmPublish] = useState(false);
  const supabase = createClient();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  useEffect(() => {
    fetchDraws();
  }, []);

  async function fetchDraws() {
    const { data } = await supabase.from('draws').select('*').order('draw_year', { ascending: false }).order('draw_month', { ascending: false });
    setDraws(data || []);
    setLoading(false);
  }

  async function runSimulation() {
    setRunning(true);
    setSimResult(null);

    // Get all active subscriber scores
    const { data: profiles } = await supabase.from('profiles').select('id').eq('subscription_status', 'active');
    const subscriberIds = profiles?.map(p => p.id) || [];

    let allScores: number[] = [];
    if (subscriberIds.length > 0) {
      const { data: scores } = await supabase.from('golf_scores').select('score, user_id').in('user_id', subscriberIds);
      allScores = scores?.map(s => s.score) || [];
    }

    // Generate winning numbers
    const winningNumbers = drawType === 'algorithmic'
      ? generateAlgorithmicNumbers(allScores)
      : generateRandomNumbers();

    // Calculate prize pool
    const { total, jackpot, fourMatch, threeMatch } = calculatePrizePool(subscriberIds.length, { monthly: subscriberIds.length, yearly: 0 });

    // Check previous jackpot rollover
    const { data: lastDraw } = await supabase.from('draws').select('jackpot_rolled_over, jackpot_amount').eq('status', 'published').order('draw_year', { ascending: false }).order('draw_month', { ascending: false }).limit(1).single();
    const rolledOver = lastDraw?.jackpot_rolled_over ? lastDraw.jackpot_amount : 0;

    // Calculate matches for each user
    const { data: userScores } = await supabase.from('golf_scores').select('user_id, score').in('user_id', subscriberIds);

    const userScoreMap: Record<string, number[]> = {};
    userScores?.forEach(s => {
      if (!userScoreMap[s.user_id]) userScoreMap[s.user_id] = [];
      userScoreMap[s.user_id].push(s.score);
    });

    const entries = Object.entries(userScoreMap).map(([uid, scores]) => {
      const matches = countMatches(scores, winningNumbers);
      const tier = getPrizeTier(matches);
      return { user_id: uid, numbers: scores, matches, tier };
    });

    const jackpotWinners = entries.filter(e => e.tier === '5-match');
    const fourWinners = entries.filter(e => e.tier === '4-match');
    const threeWinners = entries.filter(e => e.tier === '3-match');

    setSimResult({
      winningNumbers,
      total,
      jackpot: jackpot + rolledOver,
      fourMatch,
      threeMatch,
      rolledOver,
      jackpotWinners: jackpotWinners.length,
      fourMatchWinners: fourWinners.length,
      threeMatchWinners: threeWinners.length,
      subscriberCount: subscriberIds.length,
    });

    setRunning(false);
  }

  async function publishDraw() {
    if (!simResult) return;
    setRunning(true);

    const { data: existing } = await supabase.from('draws').select('id').eq('draw_month', currentMonth).eq('draw_year', currentYear).single();

    const drawData = {
      draw_month: currentMonth,
      draw_year: currentYear,
      status: 'published',
      draw_type: drawType,
      winning_numbers: simResult.winningNumbers,
      total_prize_pool: simResult.total,
      jackpot_amount: simResult.jackpot,
      four_match_amount: simResult.fourMatch,
      three_match_amount: simResult.threeMatch,
      jackpot_rolled_over: simResult.jackpotWinners === 0,
      rolled_over_amount: simResult.jackpotWinners === 0 ? simResult.jackpot : 0,
      published_at: new Date().toISOString(),
    };

    let drawId: string;
    if (existing) {
      await supabase.from('draws').update(drawData).eq('id', existing.id);
      drawId = existing.id;
    } else {
      const { data } = await supabase.from('draws').insert(drawData).select().single();
      drawId = data.id;
    }

    // Process entries via API
    await fetch('/api/draws/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ drawId }),
    });

    setSimResult(null);
    setConfirmPublish(false);
    await fetchDraws();
    setRunning(false);
    alert('Draw published successfully!');
  }

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 6 }}>Draw Management</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure, simulate, and publish monthly draws.</p>
      </div>

      {/* Run draw */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Run {MONTHS[currentMonth - 1]} {currentYear} Draw</h3>

        {/* Draw type */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 10, color: 'var(--text-secondary)' }}>Draw Logic</label>
          <div style={{ display: 'flex', gap: 12 }}>
            {[
              { key: 'random', label: 'Random', desc: 'Standard lottery-style' },
              { key: 'algorithmic', label: 'Algorithmic', desc: 'Weighted by score frequency' },
            ].map(opt => (
              <div
                key={opt.key}
                onClick={() => setDrawType(opt.key as any)}
                style={{
                  padding: '12px 20px', borderRadius: 10, cursor: 'pointer',
                  border: drawType === opt.key ? '2px solid rgba(74,222,128,0.4)' : '1px solid var(--border-subtle)',
                  background: drawType === opt.key ? 'rgba(74,222,128,0.08)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 2, color: drawType === opt.key ? 'var(--accent-green)' : 'var(--text-primary)' }}>{opt.label}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{opt.desc}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={runSimulation} disabled={running} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: running ? 0.7 : 1 }}>
            <Eye size={16} /> {running ? 'Simulating...' : 'Run Simulation'}
          </button>
          {simResult && (
            <button onClick={() => setConfirmPublish(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Play size={16} /> Publish Draw
            </button>
          )}
        </div>

        {/* Simulation result */}
        {simResult && (
          <div style={{ marginTop: 24, padding: 20, background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 16, color: 'var(--accent-green)' }}>Simulation Result</div>

            {/* Numbers */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              {simResult.winningNumbers.map((n: number) => (
                <div key={n} className="score-ball winner" style={{ width: 44, height: 44 }}>{n}</div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              {[
                { label: 'Subscribers', value: simResult.subscriberCount },
                { label: 'Total Pool', value: formatCurrency(simResult.total) },
                { label: `Jackpot ${simResult.rolledOver > 0 ? '(+rollover)' : ''}`, value: formatCurrency(simResult.jackpot) },
                { label: '4-Match Pool', value: formatCurrency(simResult.fourMatch) },
                { label: '3-Match Pool', value: formatCurrency(simResult.threeMatch) },
                { label: 'Jackpot Winners', value: simResult.jackpotWinners },
                { label: '4-Match Winners', value: simResult.fourMatchWinners },
                { label: '3-Match Winners', value: simResult.threeMatchWinners },
              ].map((row, i) => (
                <div key={i} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{row.label}</div>
                  <div style={{ fontWeight: 600 }}>{row.value}</div>
                </div>
              ))}
            </div>

            {simResult.jackpotWinners === 0 && (
              <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 8, color: '#fbbf24', fontSize: '0.875rem' }}>
                <AlertTriangle size={16} /> No jackpot winner — jackpot will roll over to next month.
              </div>
            )}
          </div>
        )}

        {/* Confirm publish */}
        {confirmPublish && (
          <div style={{ marginTop: 16, padding: '16px 20px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 10 }}>
            <div style={{ fontWeight: 600, color: '#f87171', marginBottom: 8 }}>⚠️ Confirm Publish</div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 16 }}>Publishing this draw is irreversible. Winners will be notified and entries will be recorded.</p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmPublish(false)} className="btn-secondary" style={{ padding: '8px 20px' }}>Cancel</button>
              <button onClick={publishDraw} disabled={running} style={{ background: '#f87171', color: 'white', border: 'none', padding: '8px 20px', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
                {running ? 'Publishing...' : 'Yes, Publish Draw'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Past draws */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontWeight: 600 }}>Draw History</h3>
        </div>
        {draws.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>No draws yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Winning Numbers</th>
                <th>Prize Pool</th>
                <th>Jackpot</th>
                <th>Status</th>
                <th>Type</th>
                <th>Published</th>
              </tr>
            </thead>
            <tbody>
              {draws.map(draw => (
                <tr key={draw.id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{MONTHS[draw.draw_month - 1]} {draw.draw_year}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      {draw.winning_numbers.map((n: number) => (
                        <div key={n} className="score-ball winner" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>{n}</div>
                      ))}
                    </div>
                  </td>
                  <td>{formatCurrency(draw.total_prize_pool)}</td>
                  <td>
                    <span style={{ color: '#fbbf24', fontWeight: 500 }}>{formatCurrency(draw.jackpot_amount)}</span>
                    {draw.jackpot_rolled_over && <span className="badge badge-warning" style={{ fontSize: '0.7rem', marginLeft: 6 }}>Rolled</span>}
                  </td>
                  <td><span className={`badge ${draw.status === 'published' ? 'badge-success' : 'badge-neutral'}`}>{draw.status}</span></td>
                  <td><span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>{draw.draw_type}</span></td>
                  <td>{draw.published_at ? formatDate(draw.published_at) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

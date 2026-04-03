'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Trophy, Upload, CheckCircle, XCircle, Clock } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export default function DrawsPage() {
  const [draws, setDraws] = useState<any[]>([]);
  const [myEntries, setMyEntries] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [drawsRes, entriesRes, winnersRes] = await Promise.all([
        supabase.from('draws').select('*').eq('status', 'published').order('draw_year', { ascending: false }).order('draw_month', { ascending: false }),
        supabase.from('draw_entries').select('*, draws(draw_month, draw_year, winning_numbers)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('winners').select('*, draws(draw_month, draw_year)').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      setDraws(drawsRes.data || []);
      setMyEntries(entriesRes.data || []);
      setWinners(winnersRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function uploadProof(winnerId: string, file: File) {
    setUploadingFor(winnerId);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const path = `winner-proofs/${user.id}/${winnerId}/${file.name}`;
    const { data: uploadData, error: uploadError } = await supabase.storage.from('proofs').upload(path, file);

    if (uploadError) {
      alert('Upload failed: ' + uploadError.message);
      setUploadingFor(null);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from('proofs').getPublicUrl(path);
    await supabase.from('winners').update({ proof_url: publicUrl, submitted_at: new Date().toISOString() }).eq('id', winnerId);

    // Refresh
    const { data } = await supabase.from('winners').select('*, draws(draw_month, draw_year)').eq('user_id', user.id);
    setWinners(data || []);
    setUploadingFor(null);
  }

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  const totalWon = winners.filter(w => w.payment_status === 'paid').reduce((sum, w) => sum + w.prize_amount, 0);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 6 }}>Draws & Winnings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View draw results and manage your winnings.</p>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Draws Entered', value: myEntries.length, icon: '🎯' },
          { label: 'Total Wins', value: winners.length, icon: '🏆' },
          { label: 'Total Paid Out', value: formatCurrency(totalWon), icon: '💰' },
          { label: 'Pending Verification', value: winners.filter(w => w.verification_status === 'pending').length, icon: '⏳' },
        ].map((card, i) => (
          <div key={i} className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{card.icon}</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{card.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* My Winnings */}
      {winners.length > 0 && (
        <div className="glass-card" style={{ marginBottom: 24, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Trophy size={18} color="var(--accent-gold)" />
            <h3 style={{ fontWeight: 600 }}>My Winnings</h3>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Draw Period</th>
                <th>Prize Tier</th>
                <th>Amount</th>
                <th>Verification</th>
                <th>Payment</th>
                <th>Proof</th>
              </tr>
            </thead>
            <tbody>
              {winners.map(winner => (
                <tr key={winner.id}>
                  <td style={{ color: 'var(--text-primary)' }}>{MONTH_NAMES[winner.draws?.draw_month - 1]} {winner.draws?.draw_year}</td>
                  <td>
                    <span className={`badge ${winner.prize_tier === '5-match' ? 'badge-warning' : 'badge-success'}`}>
                      {winner.prize_tier === '5-match' ? '👑' : winner.prize_tier === '4-match' ? '🥈' : '🥉'} {winner.prize_tier}
                    </span>
                  </td>
                  <td style={{ color: '#fbbf24', fontWeight: 600 }}>{formatCurrency(winner.prize_amount)}</td>
                  <td>
                    <span className={`badge ${winner.verification_status === 'approved' ? 'badge-success' : winner.verification_status === 'rejected' ? 'badge-error' : 'badge-neutral'}`}>
                      {winner.verification_status === 'approved' ? <CheckCircle size={12} /> : winner.verification_status === 'rejected' ? <XCircle size={12} /> : <Clock size={12} />}
                      {winner.verification_status}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${winner.payment_status === 'paid' ? 'badge-success' : 'badge-neutral'}`}>
                      {winner.payment_status}
                    </span>
                  </td>
                  <td>
                    {winner.proof_url ? (
                      <a href={winner.proof_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-green)', fontSize: '0.85rem' }}>View proof</a>
                    ) : winner.verification_status === 'pending' ? (
                      <label style={{ cursor: 'pointer', color: 'var(--accent-green)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Upload size={14} />
                        {uploadingFor === winner.id ? 'Uploading...' : 'Upload'}
                        <input type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && uploadProof(winner.id, e.target.files[0])} />
                      </label>
                    ) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Draw Results */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontWeight: 600 }}>Published Draws</h3>
        </div>
        {draws.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🎰</div>
            No draws published yet. Check back after the next monthly draw.
          </div>
        ) : (
          <div style={{ padding: 24, display: 'grid', gap: 16 }}>
            {draws.map(draw => {
              const myEntry = myEntries.find(e => e.draw_id === draw.id);
              return (
                <div key={draw.id} style={{ border: '1px solid var(--border-subtle)', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, marginBottom: 4 }}>{MONTH_NAMES[draw.draw_month - 1]} {draw.draw_year} Draw</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Published {formatDate(draw.published_at)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Total Prize Pool</div>
                      <div style={{ fontWeight: 700, color: '#fbbf24' }}>{formatCurrency(draw.total_prize_pool)}</div>
                    </div>
                  </div>

                  {/* Winning numbers */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>Winning Numbers</div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {draw.winning_numbers.map((n: number) => (
                        <div key={n} className="score-ball winner" style={{ width: 40, height: 40, fontSize: '0.95rem' }}>{n}</div>
                      ))}
                    </div>
                  </div>

                  {/* My entry */}
                  {myEntry && (
                    <div style={{ padding: '12px 16px', background: myEntry.is_winner ? 'rgba(251,191,36,0.1)' : 'rgba(74,222,128,0.06)', border: `1px solid ${myEntry.is_winner ? 'rgba(251,191,36,0.25)' : 'rgba(74,222,128,0.12)'}`, borderRadius: 10 }}>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 8 }}>My Numbers</div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        {myEntry.numbers_played.map((n: number) => (
                          <div key={n} className={`score-ball ${draw.winning_numbers.includes(n) ? 'winner' : ''}`} style={{ width: 36, height: 36, fontSize: '0.9rem' }}>{n}</div>
                        ))}
                        <span style={{ marginLeft: 8, fontWeight: 500, color: myEntry.is_winner ? '#fbbf24' : 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          {myEntry.is_winner ? `🎉 ${myEntry.prize_tier} — ${formatCurrency(myEntry.prize_amount)}` : `${myEntry.match_count} match${myEntry.match_count !== 1 ? 'es' : ''}`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Prize tiers */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
                    {[
                      { label: '5-Match Jackpot', amount: draw.jackpot_amount + (draw.rolled_over_amount || 0), icon: '👑' },
                      { label: '4-Match Prize', amount: draw.four_match_amount, icon: '🥈' },
                      { label: '3-Match Prize', amount: draw.three_match_amount, icon: '🥉' },
                    ].map((tier, i) => (
                      <div key={i} style={{ padding: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: 8, textAlign: 'center' }}>
                        <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{tier.icon}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 2 }}>{tier.label}</div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{formatCurrency(tier.amount)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

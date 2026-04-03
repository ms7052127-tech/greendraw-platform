'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CheckCircle, XCircle, ExternalLink, DollarSign } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminWinnersPage() {
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const supabase = createClient();

  useEffect(() => {
    fetchWinners();
  }, []);

  async function fetchWinners() {
    const { data } = await supabase
      .from('winners')
      .select('*, profiles(full_name, email), draws(draw_month, draw_year)')
      .order('created_at', { ascending: false });
    setWinners(data || []);
    setLoading(false);
  }

  async function updateVerification(id: string, status: 'approved' | 'rejected') {
    await supabase.from('winners').update({
      verification_status: status,
      reviewed_at: new Date().toISOString(),
    }).eq('id', id);
    fetchWinners();
  }

  async function markPaid(id: string) {
    await supabase.from('winners').update({
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
    }).eq('id', id);
    fetchWinners();
  }

  const filtered = filter === 'all' ? winners : winners.filter(w =>
    filter === 'pending-verify' ? w.verification_status === 'pending' && w.proof_url :
    filter === 'approved' ? w.verification_status === 'approved' :
    filter === 'unpaid' ? w.verification_status === 'approved' && w.payment_status === 'pending' : true
  );

  const pendingCount = winners.filter(w => w.verification_status === 'pending' && w.proof_url).length;

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 6 }}>Winners Management</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Verify winner submissions and manage payouts.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Winners', value: winners.length, color: '#4ade80' },
          { label: 'Pending Review', value: pendingCount, color: '#fbbf24' },
          { label: 'Approved', value: winners.filter(w => w.verification_status === 'approved').length, color: '#10b981' },
          { label: 'Paid Out', value: winners.filter(w => w.payment_status === 'paid').length, color: '#f472b6' },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: s.color, marginBottom: 4 }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All Winners' },
          { key: 'pending-verify', label: `Pending Review ${pendingCount > 0 ? `(${pendingCount})` : ''}` },
          { key: 'approved', label: 'Approved' },
          { key: 'unpaid', label: 'Unpaid' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: '6px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: filter === f.key ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.04)',
              color: filter === f.key ? 'var(--accent-green)' : 'var(--text-secondary)',
              fontFamily: 'DM Sans, sans-serif', fontWeight: filter === f.key ? 600 : 400, fontSize: '0.875rem',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Winner</th>
              <th>Draw</th>
              <th>Tier</th>
              <th>Prize</th>
              <th>Verification</th>
              <th>Payment</th>
              <th>Proof</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(winner => (
              <tr key={winner.id}>
                <td>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>{winner.profiles?.full_name || 'Unknown'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{winner.profiles?.email}</div>
                </td>
                <td>{MONTHS[winner.draws?.draw_month - 1]} {winner.draws?.draw_year}</td>
                <td>
                  <span className={`badge ${winner.prize_tier === '5-match' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.75rem' }}>
                    {winner.prize_tier === '5-match' ? '👑' : winner.prize_tier === '4-match' ? '🥈' : '🥉'} {winner.prize_tier}
                  </span>
                </td>
                <td style={{ fontWeight: 600, color: '#fbbf24' }}>{formatCurrency(winner.prize_amount)}</td>
                <td>
                  <span className={`badge ${winner.verification_status === 'approved' ? 'badge-success' : winner.verification_status === 'rejected' ? 'badge-error' : 'badge-neutral'}`} style={{ fontSize: '0.75rem' }}>
                    {winner.verification_status}
                  </span>
                </td>
                <td>
                  <span className={`badge ${winner.payment_status === 'paid' ? 'badge-success' : 'badge-neutral'}`} style={{ fontSize: '0.75rem' }}>
                    {winner.payment_status}
                  </span>
                </td>
                <td>
                  {winner.proof_url ? (
                    <a href={winner.proof_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.85rem', textDecoration: 'none' }}>
                      View <ExternalLink size={12} />
                    </a>
                  ) : <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Not submitted</span>}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {winner.verification_status === 'pending' && winner.proof_url && (
                      <>
                        <button onClick={() => updateVerification(winner.id, 'approved')} style={{ background: 'rgba(74,222,128,0.15)', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#4ade80', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                          <CheckCircle size={12} /> Approve
                        </button>
                        <button onClick={() => updateVerification(winner.id, 'rejected')} style={{ background: 'rgba(248,113,113,0.1)', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#f87171', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                          <XCircle size={12} /> Reject
                        </button>
                      </>
                    )}
                    {winner.verification_status === 'approved' && winner.payment_status === 'pending' && (
                      <button onClick={() => markPaid(winner.id)} style={{ background: 'rgba(251,191,36,0.15)', border: 'none', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                        <DollarSign size={12} /> Mark Paid
                      </button>
                    )}
                    {winner.payment_status === 'paid' && (
                      <span style={{ color: '#4ade80', fontSize: '0.8rem' }}>✓ Complete</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No winners found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}

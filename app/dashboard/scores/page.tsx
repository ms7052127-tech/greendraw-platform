'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Trash2, Info, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function ScoresPage() {
  const [scores, setScores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newScore, setNewScore] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      await fetchScores(user.id);
      setLoading(false);
    }
    load();
  }, []);

  async function fetchScores(uid: string) {
    const { data } = await supabase.from('golf_scores').select('*').eq('user_id', uid).order('played_at', { ascending: false });
    setScores(data || []);
  }

  async function addScore() {
    const scoreNum = parseInt(newScore);
    if (isNaN(scoreNum) || scoreNum < 1 || scoreNum > 45) {
      setError('Score must be between 1 and 45.');
      return;
    }
    if (!newDate) {
      setError('Please select a date.');
      return;
    }
    setError('');
    setSaving(true);

    const { error: err } = await supabase.from('golf_scores').insert({
      user_id: userId,
      score: scoreNum,
      played_at: newDate,
    });

    if (err) {
      setError(err.message);
    } else {
      await fetchScores(userId);
      setNewScore('');
      setNewDate(new Date().toISOString().split('T')[0]);
      setAdding(false);
    }
    setSaving(false);
  }

  async function deleteScore(id: string) {
    if (!confirm('Remove this score?')) return;
    await supabase.from('golf_scores').delete().eq('id', id);
    await fetchScores(userId);
  }

  if (loading) return <div className="skeleton" style={{ height: 300 }} />;

  const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length) : null;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 6 }}>My Scores</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Your last 5 Stableford scores. These become your monthly draw numbers.</p>
      </div>

      {/* Score balls */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h3 style={{ fontWeight: 600 }}>Current Draw Numbers</h3>
          {avgScore && <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Average: <strong style={{ color: 'var(--accent-green)' }}>{avgScore}</strong></span>}
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 16 }}>
          {scores.map((s, i) => (
            <div key={s.id} style={{ textAlign: 'center' }}>
              <div className="score-ball" style={{ width: 56, height: 56, fontSize: '1.2rem', margin: '0 auto 6px' }}>{s.score}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDate(s.played_at)}</div>
            </div>
          ))}
          {Array(5 - scores.length).fill(0).map((_, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', border: '2px dashed var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '1.2rem', margin: '0 auto 6px' }}>?</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>empty</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 16px', background: 'rgba(74,222,128,0.06)', borderRadius: 10, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          <Info size={16} color="var(--accent-green)" style={{ marginTop: 1, flexShrink: 0 }} />
          <span>You need exactly 5 scores to participate in monthly draws. Adding a 6th score automatically removes the oldest one.</span>
        </div>
      </div>

      {/* Add score */}
      {!adding ? (
        <button onClick={() => setAdding(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <Plus size={18} /> Add New Score
        </button>
      ) : (
        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 600, marginBottom: 20 }}>Add Score</h3>
          {error && (
            <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#f87171', fontSize: '0.875rem' }}>{error}</div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>Stableford Score (1–45)</label>
              <input type="number" min={1} max={45} value={newScore} onChange={e => setNewScore(e.target.value)} className="input-field" placeholder="e.g. 32" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>Date Played</label>
              <input type="date" value={newDate} onChange={e => setNewDate(e.target.value)} className="input-field" max={new Date().toISOString().split('T')[0]} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => { setAdding(false); setError(''); }} className="btn-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
            <button onClick={addScore} disabled={saving} className="btn-primary" style={{ padding: '10px 24px', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Saving...' : 'Save Score'}
            </button>
          </div>
        </div>
      )}

      {/* Score history */}
      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)' }}>
          <h3 style={{ fontWeight: 600 }}>Score History ({scores.length}/5)</h3>
        </div>
        {scores.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>⛳</div>
            No scores entered yet. Add your first Stableford score above.
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Score</th>
                <th>Date Played</th>
                <th>Added</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score, i) => (
                <tr key={score.id}>
                  <td><span style={{ color: 'var(--text-muted)' }}>{i + 1}</span></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="score-ball" style={{ width: 36, height: 36, fontSize: '0.95rem' }}>{score.score}</div>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{score.score} pts</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Calendar size={14} color="var(--text-muted)" />
                      {formatDate(score.played_at)}
                    </div>
                  </td>
                  <td>{formatDate(score.created_at)}</td>
                  <td>
                    <button onClick={() => deleteScore(score.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, borderRadius: 6, transition: 'color 0.2s' }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

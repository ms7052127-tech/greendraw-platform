'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Heart, ExternalLink, Save } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export default function CharityPage() {
  const [profile, setProfile] = useState<any>(null);
  const [charities, setCharities] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [percentage, setPercentage] = useState(10);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [profileRes, charitiesRes] = await Promise.all([
        supabase.from('profiles').select('*, charities(*)').eq('id', user.id).single(),
        supabase.from('charities').select('*').eq('is_active', true),
      ]);

      if (profileRes.data) {
        setProfile(profileRes.data);
        setSelectedId(profileRes.data.charity_id || '');
        setPercentage(profileRes.data.charity_contribution_percentage || 10);
      }
      setCharities(charitiesRes.data || []);
      setLoading(false);
    }
    load();
  }, []);

  async function save() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from('profiles').update({
      charity_id: selectedId,
      charity_contribution_percentage: percentage,
    }).eq('id', user.id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const monthlyFee = profile?.subscription_plan === 'yearly' ? 89.99 / 12 : 9.99;
  const donationAmount = monthlyFee * percentage / 100;

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  const selectedCharity = charities.find(c => c.id === selectedId);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 6 }}>My Charity</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Choose the cause you want to support with your subscription.</p>
      </div>

      {/* Current charity */}
      {selectedCharity && (
        <div className="glass-card" style={{ padding: 24, marginBottom: 28, border: '1px solid rgba(74,222,128,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-green)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Heart size={12} fill="currentColor" /> Currently Supporting
              </div>
              <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 6 }}>{selectedCharity.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 16 }}>{selectedCharity.description}</p>
              {selectedCharity.website_url && (
                <a href={selectedCharity.website_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-green)', textDecoration: 'none', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                  Visit website <ExternalLink size={14} />
                </a>
              )}
            </div>
            <div style={{ textAlign: 'center', padding: '16px 24px', background: 'rgba(74,222,128,0.08)', borderRadius: 12 }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>Your monthly donation</div>
              <div className="font-display" style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent-green)' }}>{formatCurrency(donationAmount)}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{percentage}% of subscription</div>
            </div>
          </div>
        </div>
      )}

      {/* Contribution slider */}
      <div className="glass-card" style={{ padding: 24, marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Heart size={18} color="var(--accent-green)" />
            <span style={{ fontWeight: 600 }}>Contribution Percentage</span>
          </div>
          <span style={{ color: 'var(--accent-green)', fontWeight: 700, fontSize: '1.3rem' }}>{percentage}%</span>
        </div>
        <input type="range" min={10} max={50} step={5} value={percentage} onChange={e => setPercentage(Number(e.target.value))} style={{ width: '100%', accentColor: '#4ade80', marginBottom: 8 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          <span>10% minimum</span><span>50% maximum</span>
        </div>
        <div style={{ padding: '14px', background: 'rgba(74,222,128,0.06)', borderRadius: 10, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          At <strong style={{ color: 'var(--accent-green)' }}>{percentage}%</strong> you donate <strong style={{ color: 'var(--accent-green)' }}>{formatCurrency(donationAmount)}/month</strong> to charity.
          The remainder goes towards prize pools and platform costs.
        </div>
      </div>

      {/* Charity selection */}
      <h3 style={{ fontWeight: 600, marginBottom: 16, fontSize: '1rem' }}>Select a Charity</h3>
      <div style={{ display: 'grid', gap: 12, marginBottom: 28 }}>
        {charities.map((charity, i) => (
          <div
            key={charity.id}
            onClick={() => setSelectedId(charity.id)}
            className="glass-card"
            style={{
              padding: '20px 24px', cursor: 'pointer',
              border: selectedId === charity.id ? '2px solid rgba(74,222,128,0.4)' : '1px solid var(--border-subtle)',
              transition: 'all 0.2s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={{ fontSize: '2.5rem' }}>{['🏌️','🎖️','🌿','💚'][i % 4]}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                  {charity.name}
                  {charity.is_featured && <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>Featured</span>}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: 8, lineHeight: 1.5 }}>{charity.description}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total raised: <span style={{ color: 'var(--accent-green)', fontWeight: 500 }}>{formatCurrency(charity.total_raised)}</span></div>
              </div>
              <div style={{ width: 22, height: 22, borderRadius: '50%', border: `2px solid ${selectedId === charity.id ? '#4ade80' : 'var(--text-muted)'}`, background: selectedId === charity.id ? '#4ade80' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>
                {selectedId === charity.id && <svg width="10" height="10" viewBox="0 0 10 10"><path d="M2 5l2 2 4-4" stroke="#0a0f0a" strokeWidth="1.5" fill="none" strokeLinecap="round" /></svg>}
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={save} disabled={saving || !selectedId} className="btn-primary" style={{ padding: '14px 32px', display: 'flex', alignItems: 'center', gap: 8, opacity: saving || !selectedId ? 0.7 : 1 }}>
        <Save size={18} />
        {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Charity Preferences'}
      </button>
    </div>
  );
}

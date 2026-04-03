'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plus, Edit2, Trash2, Save, X, Star } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminCharitiesPage() {
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', image_url: '', website_url: '', is_featured: false });
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => { fetchCharities(); }, []);

  async function fetchCharities() {
    const { data } = await supabase.from('charities').select('*').order('created_at', { ascending: false });
    setCharities(data || []);
    setLoading(false);
  }

  function resetForm() { setForm({ name: '', description: '', image_url: '', website_url: '', is_featured: false }); }

  async function addCharity() {
    if (!form.name) return;
    setSaving(true);
    await supabase.from('charities').insert({ ...form, is_active: true });
    resetForm();
    setAdding(false);
    setSaving(false);
    fetchCharities();
  }

  async function updateCharity() {
    if (!editing) return;
    setSaving(true);
    await supabase.from('charities').update(form).eq('id', editing);
    setEditing(null);
    resetForm();
    setSaving(false);
    fetchCharities();
  }

  async function toggleActive(id: string, current: boolean) {
    await supabase.from('charities').update({ is_active: !current }).eq('id', id);
    fetchCharities();
  }

  async function toggleFeatured(id: string, current: boolean) {
    // Only one can be featured at a time
    await supabase.from('charities').update({ is_featured: false }).neq('id', id);
    await supabase.from('charities').update({ is_featured: !current }).eq('id', id);
    fetchCharities();
  }

  async function deleteCharity(id: string) {
    if (!confirm('Delete this charity?')) return;
    await supabase.from('charities').delete().eq('id', id);
    fetchCharities();
  }

  function startEdit(charity: any) {
    setEditing(charity.id);
    setForm({ name: charity.name, description: charity.description, image_url: charity.image_url || '', website_url: charity.website_url || '', is_featured: charity.is_featured });
  }

  const FormFields = ({ onSubmit, onCancel }: { onSubmit: () => void; onCancel: () => void }) => (
    <div className="glass-card" style={{ padding: 24, marginBottom: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>Charity Name *</label>
          <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" placeholder="Charity name" />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>Website URL</label>
          <input type="url" value={form.website_url} onChange={e => setForm({ ...form, website_url: e.target.value })} className="input-field" placeholder="https://..." />
        </div>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>Description</label>
        <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field" rows={3} placeholder="Charity description..." style={{ resize: 'vertical' }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>Image URL</label>
        <input type="url" value={form.image_url} onChange={e => setForm({ ...form, image_url: e.target.value })} className="input-field" placeholder="https://images.unsplash.com/..." />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <input type="checkbox" id="featured" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} style={{ accentColor: '#4ade80' }} />
        <label htmlFor="featured" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>Feature on homepage</label>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={onCancel} className="btn-secondary" style={{ padding: '10px 20px' }}>Cancel</button>
        <button onClick={onSubmit} disabled={saving || !form.name} className="btn-primary" style={{ padding: '10px 24px', opacity: saving || !form.name ? 0.7 : 1 }}>
          {saving ? 'Saving...' : 'Save Charity'}
        </button>
      </div>
    </div>
  );

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 6 }}>Charities</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage charity listings and featured selections.</p>
        </div>
        <button onClick={() => { setAdding(true); setEditing(null); resetForm(); }} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> Add Charity
        </button>
      </div>

      {adding && !editing && (
        <FormFields onSubmit={addCharity} onCancel={() => { setAdding(false); resetForm(); }} />
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {charities.map(charity => (
          <div key={charity.id}>
            {editing === charity.id ? (
              <FormFields onSubmit={updateCharity} onCancel={() => { setEditing(null); resetForm(); }} />
            ) : (
              <div className="glass-card" style={{ padding: 24, opacity: charity.is_active ? 1 : 0.6 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                  {charity.image_url && (
                    <img src={charity.image_url} alt={charity.name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }} />
                  )}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 600, fontSize: '1.05rem' }}>{charity.name}</span>
                      {charity.is_featured && <span className="badge badge-warning" style={{ fontSize: '0.7rem' }}><Star size={10} /> Featured</span>}
                      {!charity.is_active && <span className="badge badge-error" style={{ fontSize: '0.7rem' }}>Inactive</span>}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: 10, lineHeight: 1.5 }}>{charity.description}</p>
                    <div style={{ display: 'flex', gap: 20, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>Total raised: <strong style={{ color: 'var(--accent-green)' }}>{formatCurrency(charity.total_raised)}</strong></span>
                      <span>Added: {formatDate(charity.created_at)}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
                    <button onClick={() => toggleFeatured(charity.id, charity.is_featured)} style={{ background: charity.is_featured ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: charity.is_featured ? '#fbbf24' : 'var(--text-muted)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Star size={12} /> {charity.is_featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button onClick={() => toggleActive(charity.id, charity.is_active)} style={{ background: charity.is_active ? 'rgba(248,113,113,0.1)' : 'rgba(74,222,128,0.1)', border: 'none', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: charity.is_active ? '#f87171' : '#4ade80', fontSize: '0.8rem' }}>
                      {charity.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button onClick={() => startEdit(charity)} style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                      <Edit2 size={12} /> Edit
                    </button>
                    <button onClick={() => deleteCharity(charity.id)} style={{ background: 'rgba(248,113,113,0.08)', border: 'none', borderRadius: 8, padding: '6px 10px', cursor: 'pointer', color: '#f87171' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {charities.length === 0 && !adding && (
        <div style={{ textAlign: 'center', padding: '64px 24px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>💚</div>
          <div>No charities yet. Add the first one!</div>
        </div>
      )}
    </div>
  );
}

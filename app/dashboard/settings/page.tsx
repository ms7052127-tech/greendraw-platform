'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Save, User, Lock } from 'lucide-react';

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState('');
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      setFullName(data?.full_name || '');
      setLoading(false);
    }
    load();
  }, []);

  async function saveProfile() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  async function changePassword() {
    if (newPassword.length < 8) { setPasswordMsg('Password must be at least 8 characters.'); return; }
    setPasswordSaving(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) { setPasswordMsg(error.message); }
    else { setPasswordMsg('Password updated successfully!'); setNewPassword(''); }
    setPasswordSaving(false);
    setTimeout(() => setPasswordMsg(''), 4000);
  }

  if (loading) return <div className="skeleton" style={{ height: 300 }} />;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 6 }}>Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Manage your account details and preferences.</p>
      </div>

      {/* Profile */}
      <div className="glass-card" style={{ padding: 28, marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <User size={18} color="var(--accent-green)" />
          <h3 style={{ fontWeight: 600 }}>Profile Information</h3>
        </div>
        <div style={{ display: 'grid', gap: 16, maxWidth: 480 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>Full Name</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="input-field" placeholder="Your full name" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>Email Address</label>
            <input type="email" value={profile?.email || ''} className="input-field" disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 6 }}>Email cannot be changed here. Contact support if needed.</div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>Role</label>
            <input type="text" value={profile?.role || 'subscriber'} className="input-field" disabled style={{ opacity: 0.6, cursor: 'not-allowed', textTransform: 'capitalize' }} />
          </div>
          <button onClick={saveProfile} disabled={saving} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, width: 'fit-content', opacity: saving ? 0.7 : 1 }}>
            <Save size={16} /> {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Password */}
      <div className="glass-card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <Lock size={18} color="var(--accent-green)" />
          <h3 style={{ fontWeight: 600 }}>Change Password</h3>
        </div>
        <div style={{ display: 'grid', gap: 16, maxWidth: 480 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, marginBottom: 8, color: 'var(--text-secondary)' }}>New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input-field" placeholder="Min. 8 characters" />
          </div>
          {passwordMsg && (
            <div style={{ padding: '10px 14px', borderRadius: 8, fontSize: '0.875rem', background: passwordMsg.includes('success') ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)', color: passwordMsg.includes('success') ? '#4ade80' : '#f87171', border: `1px solid ${passwordMsg.includes('success') ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}` }}>
              {passwordMsg}
            </div>
          )}
          <button onClick={changePassword} disabled={passwordSaving || !newPassword} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8, width: 'fit-content', opacity: passwordSaving || !newPassword ? 0.7 : 1 }}>
            <Lock size={16} /> {passwordSaving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

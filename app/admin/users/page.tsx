'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Search, Edit2, Save, X } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [editPlan, setEditPlan] = useState('');
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('profiles').select('*, charities(name)').neq('role', 'admin').order('created_at', { ascending: false });
      setUsers(data || []);
      setFiltered(data || []);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(users.filter(u =>
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.subscription_status?.toLowerCase().includes(q)
    ));
  }, [search, users]);

  function startEdit(user: any) {
    setEditing(user.id);
    setEditName(user.full_name || '');
    setEditStatus(user.subscription_status || 'inactive');
    setEditPlan(user.subscription_plan || 'monthly');
  }

  async function saveEdit(userId: string) {
    await supabase.from('profiles').update({
      full_name: editName,
      subscription_status: editStatus,
      subscription_plan: editPlan,
    }).eq('id', userId);

    setUsers(prev => prev.map(u => u.id === userId ? { ...u, full_name: editName, subscription_status: editStatus, subscription_plan: editPlan } : u));
    setEditing(null);
  }

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 className="font-display" style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 6 }}>User Management</h1>
        <p style={{ color: 'var(--text-secondary)' }}>View and manage subscriber accounts.</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 24, maxWidth: 400 }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field"
          placeholder="Search by name, email, or status..."
          style={{ paddingLeft: 42 }}
        />
      </div>

      <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 16 }}>
        Showing {filtered.length} of {users.length} users
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Charity</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user.id}>
                {editing === user.id ? (
                  <>
                    <td>
                      <input value={editName} onChange={e => setEditName(e.target.value)} className="input-field" style={{ padding: '6px 10px', fontSize: '0.85rem' }} />
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{user.email}</td>
                    <td>
                      <select value={editPlan} onChange={e => setEditPlan(e.target.value)} className="input-field" style={{ padding: '6px 10px', fontSize: '0.85rem' }}>
                        <option value="monthly">Monthly</option>
                        <option value="yearly">Yearly</option>
                      </select>
                    </td>
                    <td>
                      <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="input-field" style={{ padding: '6px 10px', fontSize: '0.85rem' }}>
                        {['active','inactive','cancelled','lapsed'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>{user.charities?.name || '—'}</td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button onClick={() => saveEdit(user.id)} style={{ background: 'rgba(74,222,128,0.15)', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#4ade80' }}>
                          <Save size={14} />
                        </button>
                        <button onClick={() => setEditing(null)} style={{ background: 'rgba(248,113,113,0.1)', border: 'none', borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: '#f87171' }}>
                          <X size={14} />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{user.full_name || 'Unknown'}</td>
                    <td>{user.email}</td>
                    <td>{user.subscription_plan ? <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>{user.subscription_plan}</span> : '—'}</td>
                    <td>
                      <span className={`badge ${user.subscription_status === 'active' ? 'badge-success' : user.subscription_status === 'cancelled' ? 'badge-error' : 'badge-neutral'}`} style={{ fontSize: '0.75rem' }}>
                        {user.subscription_status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.85rem' }}>{user.charities?.name || <span style={{ color: 'var(--text-muted)' }}>None</span>}</td>
                    <td>{formatDate(user.created_at)}</td>
                    <td>
                      <button onClick={() => startEdit(user)} style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.15)', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', color: 'var(--accent-green)', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
                        <Edit2 size={12} /> Edit
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</div>
        )}
      </div>
    </div>
  );
}

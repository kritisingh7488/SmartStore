import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getProfile, updateProfile } from '../services/api';
import { User, Mail, Save, Edit3 } from 'lucide-react';

const UserProfile = () => {
  const { user, login, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: '', bio: '', password: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await getProfile(user.token);
        setProfile(data);
        setForm({ name: data.name, bio: data.bio || '', password: '' });
      } catch (err) {
        console.error(err);
        if (err.message.includes('Not authorized')) {
           logout(); // Automatically log out if token is invalid
        }
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user.token, logout]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const updateData = { name: form.name, bio: form.bio };
      if (form.password) updateData.password = form.password;
      const updated = await updateProfile(user.token, updateData);
      login(updated); // Update context with new data
      setProfile({ ...profile, name: updated.name, bio: updated.bio });
      setEditing(false);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2FA084]"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-500">
        <p>Failed to load profile. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">My Profile</h1>

      {message && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-300 p-3 rounded-lg text-sm text-center">
          {message}
        </div>
      )}

      <div className="glass-panel p-8">
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-full bg-[#6FCF97]/10 border-2 border-[#6FCF97]/30 flex items-center justify-center">
            <User className="h-10 w-10 text-[#2FA084] dark:text-[#6FCF97]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{profile.name}</h2>
            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
              <Mail className="h-4 w-4" /> {profile.email}
            </p>
            <span className={`inline-block mt-2 text-xs font-semibold px-2.5 py-1 rounded-full ${profile.isAdmin ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'}`}>
              {profile.isAdmin ? 'Admin' : 'User'}
            </span>
          </div>
        </div>

        {!editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Bio</label>
              <p className="text-slate-700 dark:text-slate-200">{profile.bio || 'No bio set.'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Member Since</label>
              <p className="text-slate-700 dark:text-slate-200">{new Date(profile.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <button onClick={() => setEditing(true)} className="btn-primary mt-4">
              <Edit3 className="h-4 w-4 mr-2" /> Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Bio</label>
              <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} className="input-field min-h-[80px]" placeholder="Tell us about yourself..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">New Password (leave blank to keep current)</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="input-field" placeholder="••••••••" />
            </div>
            <div className="flex gap-3 mt-6">
              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? <span className="animate-pulse">Saving...</span> : <><Save className="h-4 w-4 mr-2" /> Save Changes</>}
              </button>
              <button type="button" onClick={() => { setEditing(false); setForm({ name: profile.name, bio: profile.bio || '', password: '' }); }} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfile;

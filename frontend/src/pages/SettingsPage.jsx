import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updates = {};
      if (name) updates.name = name;
      if (password) updates.password = password;
      await updateUser(user.email, updates);
      setMsg('Profile updated successfully.');
    } catch(err) {
      setMsg(err.message || 'Error updating profile.');
    }
  };

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/app" className="w-8 h-8 rounded-full bg-brand-canvas flex items-center justify-center text-brand-ink/60 hover:text-brand-teal transition-colors">
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        </Link>
        <h1 className="font-editorial text-3xl text-brand-ink">Settings</h1>
      </div>
      
      {msg && <div className="mb-4 p-3 bg-brand-softerTeal text-brand-teal text-xs font-bold rounded-xl">{msg}</div>}
      
      <form onSubmit={handleUpdate} className="space-y-4 bg-white p-6 rounded-3xl border border-brand-border/40 shadow-sm">
        <div>
          <label className="block text-xs font-bold text-brand-ink mb-1">Email</label>
          <input type="text" value={user?.email} disabled className="w-full px-4 py-2 bg-brand-canvas text-brand-ink/50 text-sm rounded-xl cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-xs font-bold text-brand-ink mb-1">Display Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 bg-brand-canvas border border-brand-border focus:border-brand-teal text-brand-ink text-sm rounded-xl outline-none" />
        </div>
        <div>
          <label className="block text-xs font-bold text-brand-ink mb-1">New Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Leave blank to keep current" className="w-full px-4 py-2 bg-brand-canvas border border-brand-border focus:border-brand-teal text-brand-ink text-sm rounded-xl outline-none" />
        </div>
        <button type="submit" className="px-6 py-2.5 bg-brand-ink text-white text-xs font-bold rounded-full hover:bg-brand-teal transition-colors shadow-sm">
          Save Changes
        </button>
      </form>
    </div>
  );
}

import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchAllUsers, deleteUser } from '../services/api';
import { Users as UsersIcon, Trash2, Shield, User, Mail, Calendar } from 'lucide-react';

const UsersPage = () => {
  const { user } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    try {
      const data = await fetchAllUsers(user.token);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, [user.token]);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteUser(user.token, id);
      await loadUsers();
    } catch (error) {
      alert(error.message);
    }
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2FA084]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">User Management</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{users.length} registered users</p>
      </div>

      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left bg-slate-50 dark:bg-slate-700/30">
                <th className="p-4 text-slate-500 dark:text-slate-400 font-medium">User</th>
                <th className="p-4 text-slate-500 dark:text-slate-400 font-medium">Email</th>
                <th className="p-4 text-slate-500 dark:text-slate-400 font-medium">Role</th>
                <th className="p-4 text-slate-500 dark:text-slate-400 font-medium">Joined</th>
                <th className="p-4 text-slate-500 dark:text-slate-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-t border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#6FCF97]/10 border border-[#6FCF97]/20 flex items-center justify-center">
                        <User className="h-4 w-4 text-[#2FA084] dark:text-[#6FCF97]" />
                      </div>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{u.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" /> {u.email}
                  </td>
                  <td className="p-4">
                    {u.isAdmin ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                        <Shield className="h-3 w-3" /> Admin
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
                        <User className="h-3 w-3" /> User
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" /> {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    {!u.isAdmin ? (
                      <button
                        onClick={() => handleDelete(u._id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UsersPage;

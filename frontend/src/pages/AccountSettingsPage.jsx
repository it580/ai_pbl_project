import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Settings,
  User,
  Shield,
  KeyRound,
  LogOut,
  Info,
  Calendar,
  Mail,
  CheckCircle2,
} from 'lucide-react';

export default function AccountSettingsPage() {
  const { user, isAdmin, logout } = useAuth();
  const { success, info } = useToast();

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [updatingPass, setUpdatingPass] = useState(false);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      info('New passwords do not match.');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      info('Password must be at least 6 characters.');
      return;
    }

    setUpdatingPass(true);
    setTimeout(() => {
      setUpdatingPass(false);
      success('Password credentials updated successfully for demonstration.');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    }, 600);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-teal-600" />
          Account & Security Settings
        </h1>
        <p className="text-sm text-slate-500">
          Manage your credentials, authentication session, and system profile preferences.
        </p>
      </div>

      {/* User Information Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
            <User className="w-4 h-4 text-teal-600" />
            <span>Profile Identity</span>
          </div>
          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200 capitalize">
            {user?.role} Account
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block">Full Name</span>
            <span className="font-bold text-slate-900 text-sm">{user?.name}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block">Email Address</span>
            <span className="font-bold text-slate-900 text-sm">{user?.email}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block">Account Role</span>
            <span className="font-bold text-indigo-700 capitalize">{user?.role}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-slate-500 uppercase tracking-wider text-[10px] block">Session Token</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Active JWT Bearer
            </span>
          </div>
        </div>
      </div>

      {/* Security: Password Update Form */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
          <KeyRound className="w-4 h-4 text-indigo-600" />
          <span>Security & Password</span>
        </div>

        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-md text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Current Password</label>
            <input
              type="password"
              required
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">New Password</label>
            <input
              type="password"
              required
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <button
            type="submit"
            disabled={updatingPass}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors"
          >
            {updatingPass ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Sign Out Card */}
      <div className="bg-rose-50/50 p-6 rounded-3xl border border-rose-200 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-rose-900">Sign Out of Current Device</h4>
          <p className="text-xs text-rose-700 mt-0.5">
            Clears your authentication token from this browser session.
          </p>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}

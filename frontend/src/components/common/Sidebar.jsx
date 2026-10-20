import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Sparkles,
  Briefcase,
  GitCompare,
  Kanban,
  Bookmark,
  Bot,
  UserCheck,
  Cpu,
  Shield,
  Layers,
  Settings,
  Target,
} from 'lucide-react';

export default function Sidebar() {
  const { user, isAdmin, isStudent } = useAuth();

  const studentNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Matches', path: '/recommendations', icon: Sparkles, badge: 'Smart' },
    { label: 'Opportunities', path: '/opportunities', icon: Briefcase },
    { label: 'Skill Gap Matrix', path: '/skill-gap', icon: Target },
    { label: 'Compare Roles', path: '/compare', icon: GitCompare },
    { label: 'Applications', path: '/applications', icon: Kanban },
    { label: 'Saved Items', path: '/saved', icon: Bookmark },
    { label: 'Career AI Bot', path: '/assistant', icon: Bot },
    { label: 'My Profile', path: '/profile', icon: UserCheck },
    { label: 'AI Architecture', path: '/ai-architecture', icon: Cpu },
  ];

  const adminNavItems = [
    { label: 'Admin Analytics', path: '/admin', icon: Shield },
    { label: 'Manage Postings', path: '/admin/opportunities', icon: Layers },
    { label: 'Browse Public', path: '/opportunities', icon: Briefcase },
    { label: 'AI Architecture', path: '/ai-architecture', icon: Cpu },
  ];

  const navItems = isAdmin ? adminNavItems : studentNavItems;

  return (
    <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 border-r border-slate-800 text-slate-300 min-h-[calc(100vh-4rem)] p-4 shrink-0">
      <div className="mb-4 px-3 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Account Active</p>
        <p className="text-sm font-bold text-white truncate">{user?.name}</p>
        <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30 capitalize">
          {user?.role} Portal
        </span>
      </div>

      <div className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-teal-500/20 to-indigo-500/10 text-teal-300 font-semibold border border-teal-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-teal-500 text-slate-950">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-800 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              isActive ? 'text-teal-400 bg-slate-800' : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
            }`
          }
        >
          <Settings className="w-4 h-4" />
          <span>Account Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}

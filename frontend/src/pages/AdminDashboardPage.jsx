import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi, adminApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Shield,
  Users,
  Briefcase,
  Kanban,
  Award,
  Layers,
  TrendingUp,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Plus,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';

const PIE_COLORS = ['#0D9488', '#6366F1', '#F59E0B', '#10B981', '#EF4444', '#64748B'];

export default function AdminDashboardPage() {
  const { error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await analyticsApi.getAdminDashboard();
        if (res.data.success) {
          setAdminData(res.data);
        }
      } catch (err) {
        toastError('Failed to load administrator analytics.');
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return <LoadingSpinner message="Aggregating system-wide placement metrics..." size="lg" />;
  }

  const metrics = adminData?.metrics || {};
  const topSkills = adminData?.top_skills || [];
  const popularRoles = adminData?.popular_roles || [];
  const appsByStatus = adminData?.applications_by_status || {};

  const statusPieData = Object.entries(appsByStatus).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-bold uppercase tracking-wider mb-2 border border-rose-200">
            <Shield className="w-3.5 h-3.5" />
            <span>Placement Officer Portal</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            Institutional Placement Analytics
          </h1>
          <p className="text-sm text-slate-500">
            System overview of registered candidates, active recruitment drives, and interview conversions.
          </p>
        </div>

        <Link
          to="/admin/opportunities"
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors w-fit"
        >
          <Layers className="w-4 h-4" />
          <span>Manage Placement Postings</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Registered Students</span>
            <Users className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-3xl font-black text-slate-900">{metrics.total_students}</span>
          <p className="text-xs text-slate-400 mt-2">Active campus candidates</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Placement Drives</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{metrics.total_opportunities}</span>
            <span className="text-xs text-emerald-600 font-bold">{metrics.open_opportunities} Open</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">{metrics.closed_opportunities} completed drives</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Applications Recorded</span>
            <Kanban className="w-4 h-4 text-violet-600" />
          </div>
          <span className="text-3xl font-black text-slate-900">{metrics.total_applications}</span>
          <p className="text-xs text-emerald-600 font-bold mt-2">
            {metrics.total_offers} Confirmed Offers
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase">Average Student CGPA</span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <span className="text-3xl font-black text-slate-900">{metrics.average_student_cgpa}</span>
          <p className="text-xs text-slate-400 mt-2">Across registered candidates</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Requested Skills Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">
            Top In-Demand Placement Skills (Market Frequency)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSkills} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="skill" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip formatter={(val) => [`${val} points`, 'Market Frequency']} />
                <Bar dataKey="count" fill="#0D9488" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Job Roles */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">
            Recruitment Drives by Job Role Distribution
          </h3>
          <div className="space-y-3 pt-2">
            {popularRoles.map((r, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="font-bold text-slate-800">{r.role}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-200">
                  {r.count} Position(s)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

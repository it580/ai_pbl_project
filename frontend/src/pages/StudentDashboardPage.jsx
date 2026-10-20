import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { analyticsApi, savedOpportunitiesApi, applicationsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ScoreBadge from '../components/common/ScoreBadge';
import EligibilityBadge from '../components/common/EligibilityBadge';
import {
  Sparkles,
  Briefcase,
  Target,
  CheckCircle2,
  Clock,
  ArrowRight,
  Bookmark,
  TrendingUp,
  Award,
  AlertCircle,
  Building,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export default function StudentDashboardPage() {
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await analyticsApi.getStudentDashboard();
      if (res.data.success) {
        setDashboardData(res.data);
      }
    } catch (err) {
      toastError('Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleQuickSave = async (oppId, e) => {
    e.preventDefault();
    try {
      await savedOpportunitiesApi.save(oppId);
      success('Opportunity bookmarked!');
      fetchDashboard();
    } catch (err) {
      toastError(err.response?.data?.message || 'Could not bookmark.');
    }
  };

  const handleQuickApply = async (oppId, e) => {
    e.preventDefault();
    try {
      await applicationsApi.create({ opportunity_id: oppId, status: 'Applied' });
      success('Application recorded in tracker!');
      fetchDashboard();
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to record application.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Calculating real-time placement analytics..." size="lg" />;
  }

  const metrics = dashboardData?.metrics || {};
  const topMarketSkills = dashboardData?.top_market_skills || [];
  const topRecommendations = dashboardData?.top_recommendations || [];
  const recentApplications = dashboardData?.recent_applications || [];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
      {/* Welcome Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-6 sm:p-8 border border-slate-700/80 shadow-xl text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Recommendation Engine Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">
              Welcome, {user?.name}! 👋
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Your placement profile is currently matched against{' '}
              <span className="text-teal-300 font-bold">{metrics.total_open_opportunities}</span> active opportunities.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/recommendations"
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-teal-500/20 transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4" />
              <span>View Ranked Matches</span>
            </Link>
            <Link
              to="/profile"
              className="px-4 py-2.5 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Profile Readiness Meter */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Profile Readiness</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{metrics.profile_completeness}%</span>
            <span className="text-xs font-semibold text-teal-600">
              {metrics.is_profile_complete ? 'Complete' : 'Needs tuning'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${metrics.profile_completeness}%` }}
            />
          </div>
        </div>

        {/* Eligible Opportunities Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Eligible Drives</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{metrics.eligible_opportunities_count}</span>
            <span className="text-xs text-slate-500">out of {metrics.total_open_opportunities}</span>
          </div>
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Zero criteria restrictions violated
          </p>
        </div>

        {/* Average Match Score */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Avg Match Fit</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-900">{metrics.average_compatibility}%</span>
            <span className="text-xs text-indigo-600 font-semibold">Weighted</span>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Calculated across top 24 active drives
          </p>
        </div>

        {/* Application Statuses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Applications</span>
            <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{metrics.total_applications}</span>
            <span className="text-xs text-emerald-600 font-semibold">
              {metrics.offers_count} Offer(s)
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-3 flex items-center gap-2">
            <span className="text-indigo-600 font-semibold">{metrics.interviews_count} Interviews</span>
            <span>•</span>
            <span>{metrics.saved_opportunities_count} Bookmarks</span>
          </p>
        </div>
      </div>

      {/* Main Grid: Top Recommendations + Skill Demand Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Top Recommended Opportunities */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-600" />
                Top AI Opportunities For You
              </h2>
              <p className="text-xs text-slate-500">
                Ranked by 6-factor compatibility and strict eligibility clearance
              </p>
            </div>
            <Link
              to="/recommendations"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <span>See All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {topRecommendations.map((rec) => {
              const opp = rec.opportunity;
              return (
                <div
                  key={opp.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm hover:border-teal-500/50 hover:shadow-md transition-all group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {opp.company}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                        <Link to={`/opportunities/${opp.id}`}>{opp.title}</Link>
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {opp.location} ({opp.work_mode})
                        </span>
                        <span>•</span>
                        <span className="font-semibold text-slate-700">{opp.salary_range}</span>
                        <span>•</span>
                        <span>Min CGPA: {opp.min_cgpa || 'None'}</span>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-start sm:items-end gap-2 shrink-0">
                      <ScoreBadge score={rec.compatibility_score} category={rec.score_category} size="md" />
                      <EligibilityBadge status={rec.eligibility_status} size="sm" />
                    </div>
                  </div>

                  {/* Skills badges */}
                  <div className="flex flex-wrap items-center gap-1.5 my-3">
                    {opp.required_skills?.slice(0, 4).map((s, idx) => {
                      const isMatched = rec.matched_required_skills?.includes(s);
                      return (
                        <span
                          key={idx}
                          className={`text-xs px-2.5 py-0.5 rounded-md font-medium border ${
                            isMatched
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          {isMatched ? '✓' : '✗'} {s}
                        </span>
                      );
                    })}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                    <p className="text-slate-500 text-[11px] line-clamp-1 italic max-w-sm">
                      {rec.explanation}
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleQuickSave(opp.id, e)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-teal-600 transition-colors"
                        title="Bookmark"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleQuickApply(opp.id, e)}
                        className="px-3 py-1.5 rounded-lg font-semibold bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition-colors"
                      >
                        Track Application
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Col: Skill Demand vs Possessed Chart & Quick AI Assistant */}
        <div className="space-y-6">
          {/* Market Skill Demand Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              In-Demand Skills Market Radar
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Green indicates skills currently verified in your profile.
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={topMarketSkills}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="skill"
                    type="category"
                    tick={{ fontSize: 11, fill: '#475569' }}
                    width={75}
                  />
                  <Tooltip
                    formatter={(val, name, props) => [
                      `${val} points`,
                      props.payload.student_has ? 'Possessed (In Profile)' : 'Skill Gap',
                    ]}
                  />
                  <Bar dataKey="demand_count" radius={[0, 4, 4, 0]}>
                    {topMarketSkills.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.student_has ? '#0D9488' : '#CBD5E1'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-4 text-xs mt-3 pt-3 border-t border-slate-100">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-teal-600" />
                Possessed by You
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-slate-300" />
                Target Skill Gap
              </span>
            </div>
          </div>

          {/* Assistant Banner */}
          <div className="rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 p-5 text-white border border-indigo-800 shadow-md">
            <div className="flex items-center gap-2 mb-2 text-indigo-300">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">CareerMatch AI Assistant</span>
            </div>
            <h4 className="text-base font-bold text-white mb-2">
              Have doubts about eligibility or interview prep?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Ask our database-grounded advisor why you matched with certain companies and which skills to learn next.
            </p>
            <Link
              to="/assistant"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 transition-all"
            >
              <span>Launch AI Assistant</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

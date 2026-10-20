import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { opportunitiesApi } from '../services/api';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Target,
  BarChart3,
  CheckCircle,
  Briefcase,
  Users,
  Compass,
  Zap,
} from 'lucide-react';
import ScoreBadge from '../components/common/ScoreBadge';

export default function LandingPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalOpps: 24, topRole: 'Full Stack Engineer' });
  const [loadingDemo, setLoadingDemo] = useState(false);

  useEffect(() => {
    opportunitiesApi.list({ limit: 1 }).then((res) => {
      if (res.data.success && res.data.pagination) {
        setStats((prev) => ({
          ...prev,
          totalOpps: res.data.pagination.total,
        }));
      }
    }).catch(() => {});
  }, []);

  const handleQuickDemo = async (email, password) => {
    try {
      setLoadingDemo(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      navigate('/login');
    } finally {
      setLoadingDemo(false);
    }
  };

  return (
    <div className="flex flex-col bg-slate-900 text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Glow background accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-teal-500/15 via-indigo-500/15 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-semibold text-teal-300 mb-6 shadow-inner backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>AI-Powered Placement Opportunity Recommendation System</span>
            </div>

            {/* Main Tagline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
              “Your Skills. Your Potential.{' '}
              <span className="bg-gradient-to-r from-teal-400 via-teal-200 to-indigo-400 bg-clip-text text-transparent">
                Your Next Opportunity.
              </span>”
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 mb-8 leading-relaxed max-w-2xl mx-auto font-normal">
              Bridge the campus placement divide with explainable algorithmic matching,
              mandatory eligibility verification, and personalized skill-gap roadmaps.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white shadow-xl shadow-teal-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
                >
                  <span>Go to My Dashboard</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-base bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white shadow-xl shadow-teal-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105"
                  >
                    <span>Create Student Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/opportunities"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl font-bold text-base bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 border border-slate-700 flex items-center justify-center gap-2 transition-all"
                  >
                    <Briefcase className="w-5 h-5 text-slate-400" />
                    <span>Explore Opportunities</span>
                  </Link>
                </>
              )}
            </div>

            {/* Quick Demo One-Click Login Buttons */}
            <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 backdrop-blur-sm max-w-2xl mx-auto">
              <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                Instant Evaluator One-Click Logins:
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  disabled={loadingDemo}
                  onClick={() => handleQuickDemo('aarav.sharma@college.edu', 'Student@123')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-teal-900/40 text-teal-300 border border-slate-700 hover:border-teal-500/50 transition-all"
                >
                  ⚡ Aarav (CS / 9.1 CGPA)
                </button>
                <button
                  disabled={loadingDemo}
                  onClick={() => handleQuickDemo('priya.patel@college.edu', 'Student@123')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-indigo-900/40 text-indigo-300 border border-slate-700 hover:border-indigo-500/50 transition-all"
                >
                  ⚡ Priya (IT / AI-ML)
                </button>
                <button
                  disabled={loadingDemo}
                  onClick={() => handleQuickDemo('rohan.verma@college.edu', 'Student@123')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-amber-900/40 text-amber-300 border border-slate-700 hover:border-amber-500/50 transition-all"
                >
                  ⚡ Rohan (ECE / 6.4 CGPA)
                </button>
                <button
                  disabled={loadingDemo}
                  onClick={() => handleQuickDemo('admin@careermatch.ai', 'Admin@123')}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-rose-900/40 text-rose-300 border border-slate-700 hover:border-rose-500/50 transition-all"
                >
                  🛡️ Admin Officer
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Feature Mockup Grid */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-md hover:border-teal-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Mandatory Eligibility Gate</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Pre-screens cutoffs, backlogs, branch relevance, and graduation batches before ranking.
                Zero false hope for unverified candidates.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-md hover:border-indigo-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-4">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">6-Factor Weighted Scoring</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Normalized formula evaluating technical skill coverage (35%), preferred skills (15%),
                academic surplus (15%), projects (15%), and preferences (20%).
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-md hover:border-violet-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center mb-4">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Explainable Skill Gap Matrix</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Transparent breakdown of possessed vs missing skills with actionable learning milestones,
                difficulty ratings, and estimated weeks to qualify.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recommendation Workflow Section */}
      <section className="py-16 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold text-white mb-3">
              How the AI Recommendation Engine Works
            </h2>
            <p className="text-slate-400 text-sm">
              End-to-end data pipeline transforming student academic and skill profiles into ranked placement fits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-left">
              <div className="text-2xl font-black text-teal-400 mb-2">01</div>
              <h4 className="font-bold text-white mb-1">Profile Extraction</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Aggregates student CGPA, backlogs, normalized technical skills, verified projects, and work-mode preferences.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-left">
              <div className="text-2xl font-black text-indigo-400 mb-2">02</div>
              <h4 className="font-bold text-white mb-1">Mandatory Filter Gate</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Applies hard constraint filters: Minimum CGPA, Max Allowed Backlogs, Degree & Branch, and Batch Year.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-left">
              <div className="text-2xl font-black text-violet-400 mb-2">03</div>
              <h4 className="font-bold text-white mb-1">Compatibility Math</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculates weighted sum: <code className="text-teal-300 text-[11px]">Σ(Component × Weight)</code>, mapping to Excellent, Good, or Moderate tiers.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-left">
              <div className="text-2xl font-black text-teal-400 mb-2">04</div>
              <h4 className="font-bold text-white mb-1">Explainable Ranking</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Presents ranked opportunities with clear natural language rationale, skill badges, and a custom learning roadmap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Live Metrics Showcase */}
      <section className="py-12 bg-slate-900 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <p className="text-3xl font-extrabold text-teal-400">{stats.totalOpps}</p>
              <p className="text-xs font-medium text-slate-400 uppercase mt-1">Active Placements</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <p className="text-3xl font-extrabold text-indigo-400">6</p>
              <p className="text-xs font-medium text-slate-400 uppercase mt-1">Scoring Factors</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <p className="text-3xl font-extrabold text-emerald-400">100%</p>
              <p className="text-xs font-medium text-slate-400 uppercase mt-1">Explainable Logic</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/50">
              <p className="text-3xl font-extrabold text-violet-400">REST API</p>
              <p className="text-xs font-medium text-slate-400 uppercase mt-1">Backend Engine</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

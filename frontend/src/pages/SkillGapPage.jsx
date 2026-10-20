import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { opportunitiesApi, skillGapsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Target,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  BookOpen,
  ArrowRight,
  Sparkles,
  Layers,
  Briefcase,
  GraduationCap,
} from 'lucide-react';

export default function SkillGapPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { studentProfile } = useAuth();
  const { error: toastError } = useToast();

  const [opportunities, setOpportunities] = useState([]);
  const [selectedOppId, setSelectedOppId] = useState(
    searchParams.get('opportunity_id') ? parseInt(searchParams.get('opportunity_id')) : ''
  );
  const [loadingOpps, setLoadingOpps] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  // Load all opportunities for the selector dropdown
  useEffect(() => {
    opportunitiesApi.list({ limit: 50 }).then((res) => {
      if (res.data.success) {
        setOpportunities(res.data.opportunities);
        if (!selectedOppId && res.data.opportunities.length > 0) {
          setSelectedOppId(res.data.opportunities[0].id);
        }
      }
    }).catch(() => {
      toastError('Failed to load opportunities list.');
    }).finally(() => {
      setLoadingOpps(false);
    });
  }, []);

  // When selectedOppId changes, run analysis
  useEffect(() => {
    if (!selectedOppId) return;

    const runAnalysis = async () => {
      try {
        setAnalyzing(true);
        const res = await skillGapsApi.analyze(selectedOppId);
        if (res.data.success) {
          setAnalysis(res.data.analysis);
        }
      } catch (err) {
        toastError(err.response?.data?.message || 'Failed to analyze skill gap.');
      } finally {
        setAnalyzing(false);
      }
    };

    runAnalysis();
    setSearchParams({ opportunity_id: selectedOppId });
  }, [selectedOppId]);

  if (loadingOpps) {
    return <LoadingSpinner message="Loading placement opportunities directory..." size="lg" />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Target className="w-6 h-6 text-teal-600" />
          Skill-Gap & Readiness Analyzer
        </h1>
        <p className="text-sm text-slate-500">
          Compare your verified competencies against employer requirements and follow customized upskilling roadmaps.
        </p>
      </div>

      {/* Target Opportunity Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
          Select Target Opportunity to Analyze:
        </label>
        <select
          value={selectedOppId}
          onChange={(e) => setSelectedOppId(parseInt(e.target.value))}
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-semibold focus:outline-none focus:border-teal-500"
        >
          {opportunities.map((opp) => (
            <option key={opp.id} value={opp.id}>
              {opp.company} — {opp.title} ({opp.location} • {opp.work_mode})
            </option>
          ))}
        </select>
      </div>

      {analyzing ? (
        <LoadingSpinner message="Performing deep skill coverage comparison..." />
      ) : analysis ? (
        <div className="space-y-6">
          {/* Readiness Verdict Banner */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold border border-teal-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Readiness Evaluation</span>
              </div>
              <h2 className="text-xl font-extrabold text-white">
                {analysis.company} — {analysis.opportunity_title}
              </h2>
              <p className="text-sm text-slate-300 max-w-xl">
                {analysis.readiness_verdict}
              </p>
            </div>

            {/* Coverage Dial */}
            <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-800/80 border border-slate-700 shrink-0">
              <span className="text-3xl font-black text-teal-400">
                {analysis.coverage_percentage}%
              </span>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Skill Overlap
              </span>
            </div>
          </div>

          {/* 4 Quadrant Skill Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 1. Matched Required */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-sm text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Mandatory Skills Possessed
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  {analysis.matched_required_skills.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.matched_required_skills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No mandatory skills currently match.</p>
                ) : (
                  analysis.matched_required_skills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                      ✓ {s}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* 2. Missing Mandatory (High Urgency) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-sm text-rose-800 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Missing Mandatory Skills (Gaps)
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                  {analysis.missing_required_skills.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missing_required_skills.length === 0 ? (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Zero mandatory skill gaps! Perfect core match.
                  </p>
                ) : (
                  analysis.missing_required_skills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                      ✗ {s}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* 3. Matched Preferred */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-sm text-teal-800 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Preferred Bonus Skills Possessed
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800">
                  {analysis.matched_preferred_skills.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.matched_preferred_skills.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">None yet.</p>
                ) : (
                  analysis.matched_preferred_skills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-700 text-xs font-semibold border border-teal-200">
                      ★ {s}
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* 4. Missing Preferred */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="font-bold text-sm text-amber-800 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Optional / Preferred Gaps
                </span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                  {analysis.missing_preferred_skills.length}
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {analysis.missing_preferred_skills.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">All preferred skills present!</p>
                ) : (
                  analysis.missing_preferred_skills.map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                      {s}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Prioritized Learning Roadmap */}
          {analysis.learning_priorities?.length > 0 && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-900">
                  Targeted Learning Roadmap & Preparation Milestones
                </h3>
              </div>

              <div className="space-y-3">
                {analysis.learning_priorities.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 hover:border-teal-500/50 bg-slate-50/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded ${
                          item.priority === 'High'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {item.priority} Priority
                        </span>
                        <h4 className="font-bold text-sm text-slate-900">{item.skill}</h4>
                        <span className="text-xs text-slate-400 font-medium">({item.focus_area})</span>
                      </div>
                      <p className="text-xs text-slate-600">{item.action_item}</p>
                      <p className="text-[11px] text-teal-700 font-medium">
                        Resource: {item.recommended_resource}
                      </p>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center shrink-0 text-xs text-slate-500">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {item.estimated_time}
                      </span>
                      <span className="text-[11px] text-slate-400 capitalize">
                        {item.difficulty} Level
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

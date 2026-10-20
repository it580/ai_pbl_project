import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { recommendationsApi, savedOpportunitiesApi, applicationsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ScoreBadge from '../components/common/ScoreBadge';
import EligibilityBadge from '../components/common/EligibilityBadge';
import {
  Sparkles,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
  Bookmark,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Target,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export default function RecommendationsPage() {
  const { studentProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [summary, setSummary] = useState(null);

  // Filters
  const [eligibilityFilter, setEligibilityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Custom weights panel
  const [weightsOpen, setWeightsOpen] = useState(false);
  const [weights, setWeights] = useState({
    required_skills: 0.35,
    preferred_skills: 0.15,
    academic_fit: 0.15,
    projects_certs: 0.15,
    role_industry: 0.10,
    location_workmode: 0.10,
  });

  // Expanded card explanations
  const [expandedCard, setExpandedCard] = useState(null);

  const fetchRecommendations = async (customWeights = null) => {
    try {
      setLoading(true);
      const params = {
        eligibility: eligibilityFilter !== 'all' ? eligibilityFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
      };

      const res = await recommendationsApi.getRecommendations(params, customWeights);
      if (res.data.success) {
        setRecommendations(res.data.recommendations);
        setSummary(res.data.summary);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to generate recommendations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [eligibilityFilter, categoryFilter]);

  const handleApplyWeights = (e) => {
    e.preventDefault();
    fetchRecommendations(weights);
    success('Re-calculated recommendations with custom weighting parameters!');
  };

  const handleResetWeights = () => {
    const defaults = {
      required_skills: 0.35,
      preferred_skills: 0.15,
      academic_fit: 0.15,
      projects_certs: 0.15,
      role_industry: 0.10,
      location_workmode: 0.10,
    };
    setWeights(defaults);
    fetchRecommendations(defaults);
  };

  const handleSave = async (oppId, e) => {
    e.preventDefault();
    try {
      await savedOpportunitiesApi.save(oppId);
      success('Opportunity bookmarked!');
    } catch (err) {
      toastError(err.response?.data?.message || 'Could not bookmark.');
    }
  };

  const handleQuickApply = async (oppId, e) => {
    e.preventDefault();
    try {
      await applicationsApi.create({ opportunity_id: oppId, status: 'Applied' });
      success('Recorded in Application Tracker!');
    } catch (err) {
      toastError(err.response?.data?.message || 'Could not record application.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-teal-600" />
            AI Placement Recommendations
          </h1>
          <p className="text-sm text-slate-500">
            Personalized opportunity ranking driven by multi-component compatibility math & eligibility gates.
          </p>
        </div>

        <button
          onClick={() => setWeightsOpen(!weightsOpen)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4 text-teal-600" />
          <span>{weightsOpen ? 'Close Weights Tuner' : 'Tune Scoring Weights'}</span>
        </button>
      </div>

      {/* Weights Tuner Collapsible Panel */}
      {weightsOpen && (
        <form onSubmit={handleApplyWeights} className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl border border-slate-800 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                Algorithm Scoring Weights Tuner
              </h3>
              <p className="text-xs text-slate-400">
                Adjust the importance assigned to each of the 6 recommendation components (Must sum to 1.0 / 100%).
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetWeights}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset to Defaults
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-300">Required Skills</span>
                <span className="text-teal-400 font-bold">{Math.round(weights.required_skills * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={weights.required_skills}
                onChange={(e) => setWeights({ ...weights, required_skills: parseFloat(e.target.value) })}
                className="w-full accent-teal-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-300">Preferred / Bonus Skills</span>
                <span className="text-teal-400 font-bold">{Math.round(weights.preferred_skills * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weights.preferred_skills}
                onChange={(e) => setWeights({ ...weights, preferred_skills: parseFloat(e.target.value) })}
                className="w-full accent-teal-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-300">Academic & CGPA Fit</span>
                <span className="text-teal-400 font-bold">{Math.round(weights.academic_fit * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weights.academic_fit}
                onChange={(e) => setWeights({ ...weights, academic_fit: parseFloat(e.target.value) })}
                className="w-full accent-teal-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-300">Projects & Certifications</span>
                <span className="text-teal-400 font-bold">{Math.round(weights.projects_certs * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.40"
                step="0.05"
                value={weights.projects_certs}
                onChange={(e) => setWeights({ ...weights, projects_certs: parseFloat(e.target.value) })}
                className="w-full accent-teal-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-300">Role & Industry Preference</span>
                <span className="text-teal-400 font-bold">{Math.round(weights.role_industry * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.05"
                value={weights.role_industry}
                onChange={(e) => setWeights({ ...weights, role_industry: parseFloat(e.target.value) })}
                className="w-full accent-teal-500"
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-300">Location & Work Mode</span>
                <span className="text-teal-400 font-bold">{Math.round(weights.location_workmode * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.30"
                step="0.05"
                value={weights.location_workmode}
                onChange={(e) => setWeights({ ...weights, location_workmode: parseFloat(e.target.value) })}
                className="w-full accent-teal-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-800">
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs"
            >
              Re-Calculate Recommendations
            </button>
          </div>
        </form>
      )}

      {/* Summary Stats & Filter Pills */}
      {summary && (
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setEligibilityFilter('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                eligibilityFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Matches ({summary.total_evaluated})
            </button>
            <button
              onClick={() => setEligibilityFilter('Eligible')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                eligibilityFilter === 'Eligible'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Eligible Only ({summary.eligible_count})
            </button>
            <button
              onClick={() => setEligibilityFilter('Potentially eligible')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                eligibilityFilter === 'Potentially eligible'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              Potentially Eligible ({summary.potentially_eligible_count})
            </button>
            <button
              onClick={() => setEligibilityFilter('Not eligible')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${
                eligibilityFilter === 'Not eligible'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              Ineligible ({summary.ineligible_count})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">Fit Tier:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-semibold"
            >
              <option value="all">All Tiers</option>
              <option value="Excellent">Excellent (80-100%)</option>
              <option value="Good">Good (65-79%)</option>
              <option value="Moderate">Moderate (45-64%)</option>
              <option value="Low">Low (&lt; 45%)</option>
            </select>
          </div>
        </div>
      )}

      {/* Recommendations Cards Listing */}
      {loading ? (
        <LoadingSpinner message="Evaluating 24 placement opportunities with weighted compatibility formula..." size="lg" />
      ) : recommendations.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-md mx-auto">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No matching recommendations</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try switching eligibility filters or lowering score criteria.
          </p>
          <button
            onClick={() => { setEligibilityFilter('all'); setCategoryFilter('all'); }}
            className="px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl text-xs font-semibold"
          >
            Show All Placements
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const opp = rec.opportunity;
            const isExpanded = expandedCard === opp.id;

            return (
              <div
                key={opp.id}
                className={`bg-white rounded-2xl border shadow-sm transition-all overflow-hidden ${
                  rec.is_eligible
                    ? 'border-slate-200 hover:border-teal-500/60'
                    : rec.is_potentially_eligible
                    ? 'border-amber-200 bg-amber-50/10'
                    : 'border-slate-200 opacity-90'
                }`}
              >
                {/* Main Card Row */}
                <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        #{index + 1} • {opp.company}
                      </span>
                      <EligibilityBadge status={rec.eligibility_status} size="sm" />
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-bold uppercase">
                        {opp.opportunity_type}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 hover:text-teal-600 transition-colors">
                      <Link to={`/opportunities/${opp.id}`}>{opp.title}</Link>
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {opp.location} ({opp.work_mode})
                      </span>
                      <span>•</span>
                      <span className="font-bold text-teal-700">{opp.salary_range}</span>
                      <span>•</span>
                      <span>Min CGPA: {opp.min_cgpa || 'None'}</span>
                    </div>

                    {/* Skill Pills preview */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {opp.required_skills?.map((skill, sIdx) => {
                        const isMatched = rec.matched_required_skills?.includes(skill);
                        return (
                          <span
                            key={sIdx}
                            className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${
                              isMatched
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            {isMatched ? '✓' : '✗'} {skill}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Score & Actions */}
                  <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                    <div className="flex items-center gap-2">
                      <ScoreBadge score={rec.compatibility_score} category={rec.score_category} size="lg" />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleSave(opp.id, e)}
                        className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-teal-600"
                        title="Bookmark"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleQuickApply(opp.id, e)}
                        className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                      >
                        Track Application
                      </button>
                      <button
                        onClick={() => setExpandedCard(isExpanded ? null : opp.id)}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                        title="Toggle Explanation"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible Deep Explanation Accordion */}
                {isExpanded && (
                  <div className="bg-slate-50/80 border-t border-slate-100 p-5 sm:p-6 space-y-4 text-xs animate-in fade-in">
                    {/* Natural language AI statement */}
                    <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                      <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                        AI Rationale & Score Explanation
                      </span>
                      <p className="text-slate-700 leading-relaxed text-xs">
                        {rec.explanation}
                      </p>
                    </div>

                    {/* 6-Component Breakdown Table */}
                    <div>
                      <span className="font-bold text-slate-700 uppercase tracking-wider block mb-2">
                        6-Factor Compatibility Scoring Contributions
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                          <span className="text-[10px] text-slate-500 block">Req Skills (35%)</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {rec.components?.required_skills?.score}%
                          </span>
                          <span className="text-[10px] text-teal-600 block">
                            +{rec.components?.required_skills?.weighted_contribution} pts
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                          <span className="text-[10px] text-slate-500 block">Pref Skills (15%)</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {rec.components?.preferred_skills?.score}%
                          </span>
                          <span className="text-[10px] text-teal-600 block">
                            +{rec.components?.preferred_skills?.weighted_contribution} pts
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                          <span className="text-[10px] text-slate-500 block">Academics (15%)</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {rec.components?.academic_fit?.score}%
                          </span>
                          <span className="text-[10px] text-teal-600 block">
                            +{rec.components?.academic_fit?.weighted_contribution} pts
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                          <span className="text-[10px] text-slate-500 block">Projects (15%)</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {rec.components?.projects_certs?.score}%
                          </span>
                          <span className="text-[10px] text-teal-600 block">
                            +{rec.components?.projects_certs?.weighted_contribution} pts
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                          <span className="text-[10px] text-slate-500 block">Role Fit (10%)</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {rec.components?.role_industry?.score}%
                          </span>
                          <span className="text-[10px] text-teal-600 block">
                            +{rec.components?.role_industry?.weighted_contribution} pts
                          </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-center">
                          <span className="text-[10px] text-slate-500 block">Location (10%)</span>
                          <span className="font-bold text-slate-900 text-sm">
                            {rec.components?.location_workmode?.score}%
                          </span>
                          <span className="text-[10px] text-teal-600 block">
                            +{rec.components?.location_workmode?.weighted_contribution} pts
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actionable Next Steps */}
                    {rec.suggested_next_steps?.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/80 space-y-1.5">
                        <span className="font-bold text-indigo-900 uppercase tracking-wider text-[11px] block">
                          Suggested Preparation Steps to Boost Competitiveness
                        </span>
                        <ul className="space-y-1 text-slate-700">
                          {rec.suggested_next_steps.map((step, sIdx) => (
                            <li key={sIdx} className="flex items-start gap-1.5">
                              <span className="text-teal-600 font-bold">•</span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <Link
                        to={`/skill-gap?opportunity_id=${opp.id}`}
                        className="font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 text-xs"
                      >
                        <span>Open Detailed Skill-Gap Roadmap Matrix</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

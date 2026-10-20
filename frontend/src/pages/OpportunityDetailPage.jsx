import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { opportunitiesApi, recommendationsApi, skillGapsApi, savedOpportunitiesApi, applicationsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ScoreBadge from '../components/common/ScoreBadge';
import EligibilityBadge from '../components/common/EligibilityBadge';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Bookmark,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  Target,
  Clock,
  BookOpen,
} from 'lucide-react';

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isStudent } = useAuth();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [opportunity, setOpportunity] = useState(null);
  const [recommendationData, setRecommendationData] = useState(null);
  const [skillGapData, setSkillGapData] = useState(null);

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        // 1. Fetch opportunity
        const oppRes = await opportunitiesApi.getById(id);
        if (oppRes.data.success) {
          setOpportunity(oppRes.data.opportunity);
        }

        // 2. If student is logged in, fetch AI recommendation explanation and skill-gap
        if (isAuthenticated && isStudent) {
          try {
            const [recRes, gapRes] = await Promise.all([
              recommendationsApi.getExplanation(id),
              skillGapsApi.analyze(id),
            ]);
            if (recRes.data.success) {
              setRecommendationData(recRes.data.recommendation_detail);
            }
            if (gapRes.data.success) {
              setSkillGapData(gapRes.data.analysis);
            }
          } catch (e) {
            console.warn("Could not calculate user-specific match:", e);
          }
        }
      } catch (err) {
        toastError('Failed to load opportunity details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [id, isAuthenticated, isStudent]);

  const handleSave = async () => {
    try {
      await savedOpportunitiesApi.save(id);
      success('Opportunity bookmarked!');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to bookmark.');
    }
  };

  const handleApply = async () => {
    try {
      await applicationsApi.create({ opportunity_id: id, status: 'Applied' });
      success('Application added to tracker!');
    } catch (err) {
      toastError(err.response?.data?.message || 'Already tracked.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading opportunity and calculating AI alignment..." size="lg" />;
  }

  if (!opportunity) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-lg font-bold text-slate-800">Opportunity not found</h2>
        <Link to="/opportunities" className="text-teal-600 text-sm mt-2 inline-block">Back to Directory</Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Opportunities</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{opportunity.company}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              {opportunity.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-2">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {opportunity.location} ({opportunity.work_mode})
              </span>
              <span>•</span>
              <span className="font-bold text-teal-700 text-sm">{opportunity.salary_range}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Deadline: {opportunity.deadline || 'Open until filled'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSave}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
              title="Bookmark"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              onClick={handleApply}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition-all"
            >
              Track in Pipeline
            </button>
            {opportunity.application_url && (
              <a
                href={opportunity.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl font-bold text-xs bg-teal-600 hover:bg-teal-500 text-white flex items-center gap-1.5 shadow-md shadow-teal-600/20 transition-all"
              >
                <span>External Link</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>

        {/* AI Fit Callout if logged in */}
        {recommendationData && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50/80 via-indigo-50/50 to-slate-50 border border-teal-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                <span className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                  Your Compatibility Match
                </span>
                <EligibilityBadge status={recommendationData.eligibility_status} size="sm" />
              </div>
              <p className="text-xs text-slate-700 max-w-xl">
                {recommendationData.explanation}
              </p>
            </div>
            <ScoreBadge
              score={recommendationData.compatibility_score}
              category={recommendationData.score_category}
              size="lg"
            />
          </div>
        )}

        {/* Job Description */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Role Overview & Responsibilities</h3>
          <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
            {opportunity.description}
          </p>
        </div>

        {/* Skill Requirements Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <span className="text-xs font-bold text-slate-700 uppercase block mb-2">
              Mandatory Required Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {opportunity.required_skills?.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-slate-700 uppercase block mb-2">
              Preferred / Bonus Skills
            </span>
            <div className="flex flex-wrap gap-1.5">
              {opportunity.preferred_skills?.map((s, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-teal-50 text-teal-800 text-xs font-semibold border border-teal-200"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Mandatory Eligibility Criteria Matrix */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
            Mandatory Eligibility Rules
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Minimum CGPA</span>
              <span className="font-bold text-slate-900 text-sm">{opportunity.min_cgpa ? `>= ${opportunity.min_cgpa}` : 'None'}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Max Active Backlogs</span>
              <span className="font-bold text-slate-900 text-sm">{opportunity.max_backlogs} allowed</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Batch Years</span>
              <span className="font-bold text-slate-900 text-sm">
                {opportunity.eligible_graduation_years?.join(', ') || 'All'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-500 block">Experience Required</span>
              <span className="font-bold text-slate-900 text-sm">
                {opportunity.experience_required_years > 0 ? `${opportunity.experience_required_years} years` : 'Freshers welcome'}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <span className="font-bold">Eligible Branches: </span>
            <span>{opportunity.eligible_branches?.join(', ') || 'Open to all branches'}</span>
          </div>
        </div>
      </div>

      {/* Skill Gap Matrix (If authenticated) */}
      {skillGapData && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-teal-600" />
                Personalized Skill-Gap Analysis
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeted breakdown based on your profile skills vs {opportunity.company}'s requirements
              </p>
            </div>
            <span className="text-xs font-bold text-slate-700 px-3 py-1 bg-slate-100 rounded-lg">
              {skillGapData.coverage_percentage}% Skill Coverage
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Matched */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 space-y-2">
              <span className="font-bold text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Skills You Possess ({skillGapData.matched_required_skills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skillGapData.matched_required_skills.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-white text-emerald-700 rounded border border-emerald-300 font-semibold">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Mandatory */}
            <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-200 space-y-2">
              <span className="font-bold text-rose-800 flex items-center gap-1.5">
                <XCircle className="w-4 h-4 text-rose-600" />
                Missing Core Skills ({skillGapData.missing_required_skills.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {skillGapData.missing_required_skills.length === 0 ? (
                  <span className="text-emerald-700 italic">None! 100% of required skills covered.</span>
                ) : (
                  skillGapData.missing_required_skills.map((s, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-white text-rose-700 rounded border border-rose-300 font-semibold">
                      ✗ {s}
                    </span>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Learning priorities */}
          {skillGapData.learning_priorities?.length > 0 && (
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Recommended Upskilling Action Plan
              </h4>
              <div className="space-y-2">
                {skillGapData.learning_priorities.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <span className={`font-bold mr-2 ${item.priority === 'High' ? 'text-rose-600' : 'text-amber-600'}`}>
                        [{item.priority} Priority]
                      </span>
                      <span className="font-bold text-slate-900">{item.skill}</span>
                      <p className="text-slate-500 text-[11px] mt-0.5">{item.action_item}</p>
                    </div>
                    <span className="text-slate-500 font-medium shrink-0">
                      Est. {item.estimated_time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

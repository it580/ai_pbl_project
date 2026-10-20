import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { opportunitiesApi, recommendationsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ScoreBadge from '../components/common/ScoreBadge';
import EligibilityBadge from '../components/common/EligibilityBadge';
import {
  GitCompare,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Sparkles,
} from 'lucide-react';

export default function OpportunityComparePage() {
  const { isAuthenticated, isStudent } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selected 2 or 3 opportunity IDs to compare
  const [selectedIds, setSelectedIds] = useState([]);
  const [recLookup, setRecLookup] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const oppRes = await opportunitiesApi.list({ limit: 50 });
        if (oppRes.data.success) {
          const list = oppRes.data.opportunities;
          setOpportunities(list);
          if (list.length >= 2) {
            setSelectedIds([list[0].id, list[1].id]);
          }
        }

        if (isAuthenticated && isStudent) {
          const recRes = await recommendationsApi.getRecommendations();
          if (recRes.data.success) {
            const map = {};
            recRes.data.recommendations.forEach((r) => {
              map[r.opportunity_id] = r;
            });
            setRecLookup(map);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated, isStudent]);

  const handleSelectSlot = (slotIndex, newId) => {
    const next = [...selectedIds];
    next[slotIndex] = parseInt(newId);
    setSelectedIds(next);
  };

  const addSlot = () => {
    if (selectedIds.length < 3 && opportunities.length > selectedIds.length) {
      const unused = opportunities.find((o) => !selectedIds.includes(o.id));
      if (unused) setSelectedIds([...selectedIds, unused.id]);
    }
  };

  const removeSlot = (idx) => {
    if (selectedIds.length > 2) {
      setSelectedIds(selectedIds.filter((_, i) => i !== idx));
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading opportunity comparison matrix..." size="lg" />;
  }

  const comparedOpps = selectedIds.map((id) => opportunities.find((o) => o.id === id)).filter(Boolean);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <GitCompare className="w-6 h-6 text-teal-600" />
            Side-by-Side Opportunity Comparison
          </h1>
          <p className="text-sm text-slate-500">
            Compare compensation, mandatory criteria, skill overlap, and AI match compatibility across target roles.
          </p>
        </div>

        {selectedIds.length < 3 && (
          <button
            onClick={addSlot}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
          >
            + Add 3rd Opportunity
          </button>
        )}
      </div>

      {/* Comparison Grid Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/60">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-44">
                Placement Drive
              </th>
              {comparedOpps.map((opp, idx) => (
                <th key={opp.id} className="p-4 w-72">
                  <div className="space-y-2">
                    <select
                      value={opp.id}
                      onChange={(e) => handleSelectSlot(idx, e.target.value)}
                      className="w-full text-xs font-semibold p-1.5 rounded-lg border border-slate-200 bg-white"
                    >
                      {opportunities.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.company} — {o.title}
                        </option>
                      ))}
                    </select>
                    {selectedIds.length > 2 && (
                      <button
                        onClick={() => removeSlot(idx)}
                        className="text-[11px] text-rose-500 hover:underline block"
                      >
                        Remove column
                      </button>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {/* AI Fit Score */}
            <tr className="bg-teal-50/20">
              <td className="p-4 font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                AI Compatibility Fit
              </td>
              {comparedOpps.map((opp) => {
                const rec = recLookup[opp.id];
                return (
                  <td key={opp.id} className="p-4">
                    {rec ? (
                      <div className="space-y-1">
                        <ScoreBadge score={rec.compatibility_score} category={rec.score_category} size="md" />
                        <div className="mt-1">
                          <EligibilityBadge status={rec.eligibility_status} size="sm" />
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-400">Log in to view fit</span>
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Compensation */}
            <tr>
              <td className="p-4 font-bold text-slate-700">Salary / Stipend</td>
              {comparedOpps.map((opp) => (
                <td key={opp.id} className="p-4 font-black text-slate-900 text-sm">
                  {opp.salary_range}
                </td>
              ))}
            </tr>

            {/* Location & Work Mode */}
            <tr>
              <td className="p-4 font-bold text-slate-700">Location & Mode</td>
              {comparedOpps.map((opp) => (
                <td key={opp.id} className="p-4 text-slate-700 font-medium">
                  {opp.location} • <span className="font-bold">{opp.work_mode}</span>
                </td>
              ))}
            </tr>

            {/* Min CGPA */}
            <tr>
              <td className="p-4 font-bold text-slate-700">Minimum CGPA</td>
              {comparedOpps.map((opp) => (
                <td key={opp.id} className="p-4 font-semibold text-slate-800">
                  {opp.min_cgpa ? `>= ${opp.min_cgpa}` : 'No threshold'}
                </td>
              ))}
            </tr>

            {/* Allowed Backlogs */}
            <tr>
              <td className="p-4 font-bold text-slate-700">Backlogs Allowed</td>
              {comparedOpps.map((opp) => (
                <td key={opp.id} className="p-4 font-semibold text-slate-800">
                  {opp.max_backlogs} max
                </td>
              ))}
            </tr>

            {/* Required Skills */}
            <tr>
              <td className="p-4 font-bold text-slate-700">Required Skills</td>
              {comparedOpps.map((opp) => (
                <td key={opp.id} className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {opp.required_skills?.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Preferred Skills */}
            <tr>
              <td className="p-4 font-bold text-slate-700">Preferred Skills</td>
              {comparedOpps.map((opp) => (
                <td key={opp.id} className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {opp.preferred_skills?.map((s, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-teal-50 text-teal-700 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </td>
              ))}
            </tr>

            {/* Deadline */}
            <tr>
              <td className="p-4 font-bold text-slate-700">Application Deadline</td>
              {comparedOpps.map((opp) => (
                <td key={opp.id} className="p-4 text-slate-600">
                  {opp.deadline || 'Rolling Basis'}
                </td>
              ))}
            </tr>

            {/* Actions */}
            <tr>
              <td className="p-4 font-bold text-slate-700">Action</td>
              {comparedOpps.map((opp) => (
                <td key={opp.id} className="p-4">
                  <Link
                    to={`/opportunities/${opp.id}`}
                    className="inline-block px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs"
                  >
                    View Details
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

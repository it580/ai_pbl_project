import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { savedOpportunitiesApi, applicationsApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Bookmark,
  Trash2,
  MapPin,
  Calendar,
  ExternalLink,
  ArrowRight,
  Briefcase,
} from 'lucide-react';

export default function SavedOpportunitiesPage() {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [savedItems, setSavedItems] = useState([]);

  const fetchSaved = async () => {
    try {
      setLoading(true);
      const res = await savedOpportunitiesApi.list();
      if (res.data.success) {
        setSavedItems(res.data.saved_opportunities);
      }
    } catch (err) {
      toastError('Failed to load saved opportunities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  const handleUnsave = async (oppId) => {
    try {
      await savedOpportunitiesApi.unsave(oppId);
      success('Opportunity removed from saved list.');
      setSavedItems(savedItems.filter((item) => item.opportunity_id !== oppId));
    } catch (err) {
      toastError(err.response?.data?.message || 'Could not remove bookmark.');
    }
  };

  const handleTrackApplication = async (oppId) => {
    try {
      await applicationsApi.create({ opportunity_id: oppId, status: 'Applied' });
      success('Added to your Application Tracker pipeline!');
    } catch (err) {
      toastError(err.response?.data?.message || 'Already in application tracker.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your bookmarked opportunities..." size="lg" />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto w-full space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-teal-600" />
            Saved Opportunities & Bookmarks
          </h1>
          <p className="text-sm text-slate-500">
            Review and organize your shortlisted placement drives.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700">
          {savedItems.length} Bookmarked
        </span>
      </div>

      {savedItems.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-md mx-auto">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No saved opportunities yet</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Click the bookmark icon on any placement opportunity card to save it here for later review.
          </p>
          <Link
            to="/opportunities"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-sm transition-colors inline-block"
          >
            Explore Placement Opportunities
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {savedItems.map((item) => {
            const opp = item.opportunity;
            if (!opp) return null;

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                        {opp.company}
                      </span>
                      <h3 className="text-base font-bold text-slate-900 hover:text-teal-600">
                        <Link to={`/opportunities/${opp.id}`}>{opp.title}</Link>
                      </h3>
                    </div>
                    <button
                      onClick={() => handleUnsave(opp.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg border border-transparent hover:border-rose-200 hover:bg-rose-50 transition-colors"
                      title="Remove Bookmark"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 my-3">
                    <p className="font-bold text-teal-700 text-sm">{opp.salary_range}</p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{opp.location} • <span className="font-semibold text-slate-800">{opp.work_mode}</span></span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Deadline: {opp.deadline || 'Rolling Basis'}</span>
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1 my-3">
                    {opp.required_skills?.map((s, idx) => (
                      <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <Link
                    to={`/opportunities/${opp.id}`}
                    className="font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                  >
                    <span>View Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={() => handleTrackApplication(opp.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-colors"
                  >
                    Track in Pipeline
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

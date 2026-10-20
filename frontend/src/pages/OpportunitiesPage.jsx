import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { opportunitiesApi, savedOpportunitiesApi, applicationsApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Briefcase,
  Search,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  Bookmark,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Building,
} from 'lucide-react';

export default function OpportunitiesPage() {
  const { isAuthenticated } = useAuth();
  const { success, error: toastError } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [filtersData, setFiltersData] = useState({ locations: [], types: [], work_modes: [] });

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [workMode, setWorkMode] = useState(searchParams.get('work_mode') || 'all');
  const [oppType, setOppType] = useState(searchParams.get('type') || 'all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 9,
        search: search.trim() || undefined,
        work_mode: workMode !== 'all' ? workMode : undefined,
        opportunity_type: oppType !== 'all' ? oppType : undefined,
        sort: sortBy,
      };

      const res = await opportunitiesApi.list(params);
      if (res.data.success) {
        setOpportunities(res.data.opportunities);
        setPagination(res.data.pagination);
        if (res.data.filters) {
          setFiltersData(res.data.filters);
        }
      }
    } catch (err) {
      toastError('Failed to fetch placement opportunities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [page, workMode, oppType, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchOpportunities();
  };

  const handleSave = async (oppId, e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toastError('Please log in to save opportunities.');
      return;
    }
    try {
      await savedOpportunitiesApi.save(oppId);
      success('Opportunity bookmarked!');
    } catch (err) {
      toastError(err.response?.data?.message || 'Could not bookmark.');
    }
  };

  const handleQuickApply = async (oppId, e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toastError('Please log in to track applications.');
      return;
    }
    try {
      await applicationsApi.create({ opportunity_id: oppId, status: 'Applied' });
      success('Application added to tracker!');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to record application.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-teal-600" />
            Placement Opportunities Directory
          </h1>
          <p className="text-sm text-slate-500">
            Explore active campus placements, internships, and hiring drives.
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 w-fit">
          {pagination.total} Available Positions
        </span>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by job title, company name, skill or keyword..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium">Work Mode:</span>
              <select
                value={workMode}
                onChange={(e) => { setWorkMode(e.target.value); setPage(1); }}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value="all">All Modes</option>
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="On-Site">On-Site</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="font-medium">Type:</span>
              <select
                value={oppType}
                onChange={(e) => { setOppType(e.target.value); setPage(1); }}
                className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
              >
                <option value="all">All Types</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-medium">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value); setPage(1); }}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium"
            >
              <option value="newest">Newest First</option>
              <option value="deadline">Upcoming Deadline</option>
              <option value="cgpa_asc">Lowest CGPA Cutoff</option>
              <option value="cgpa_desc">Highest CGPA Cutoff</option>
            </select>
          </div>
        </div>
      </div>

      {/* Opportunities Card Grid */}
      {loading ? (
        <LoadingSpinner message="Filtering placement listings..." />
      ) : opportunities.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-md mx-auto">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No opportunities found</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Try adjusting your search keywords or clearing applied filters.
          </p>
          <button
            onClick={() => { setSearch(''); setWorkMode('all'); setOppType('all'); }}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:border-teal-500/50 hover:shadow-md transition-all flex flex-col justify-between p-5 group"
            >
              <div>
                {/* Top Company & Type */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      {opp.company}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                      <Link to={`/opportunities/${opp.id}`}>{opp.title}</Link>
                    </h3>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">
                    {opp.opportunity_type}
                  </span>
                </div>

                {/* Salary & Meta */}
                <div className="space-y-1.5 my-3 text-xs text-slate-600">
                  <div className="font-bold text-slate-900 text-sm text-teal-700">
                    {opp.salary_range}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{opp.location} • <span className="font-medium text-slate-800">{opp.work_mode}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Deadline: {opp.deadline || 'Rolling basis'}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-500 line-clamp-2 my-2 leading-relaxed">
                  {opp.description}
                </p>

                {/* Skill chips */}
                <div className="flex flex-wrap gap-1 my-3">
                  {opp.required_skills?.slice(0, 3).map((skill, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                  {opp.required_skills?.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-50 text-slate-500 font-medium">
                      +{opp.required_skills.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <Link
                  to={`/opportunities/${opp.id}`}
                  className="font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
                >
                  <span>Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => handleSave(opp.id, e)}
                    className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-teal-600 transition-colors"
                    title="Bookmark"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleQuickApply(opp.id, e)}
                    className="px-3 py-1.5 rounded-lg font-semibold bg-slate-900 hover:bg-slate-800 text-white transition-colors"
                  >
                    Apply / Track
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-700 px-3 py-1">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            disabled={page >= pagination.pages}
            onClick={() => setPage(page + 1)}
            className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationsApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Kanban,
  Building2,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';

const STAGES = [
  'Saved',
  'Planning to Apply',
  'Applied',
  'Assessment',
  'Interview',
  'Offer',
  'Rejected',
  'Withdrawn',
];

const STAGE_COLORS = {
  'Saved': 'border-slate-300 bg-slate-50 text-slate-700',
  'Planning to Apply': 'border-blue-300 bg-blue-50 text-blue-700',
  'Applied': 'border-indigo-300 bg-indigo-50 text-indigo-700',
  'Assessment': 'border-amber-300 bg-amber-50 text-amber-700',
  'Interview': 'border-teal-300 bg-teal-50 text-teal-700',
  'Offer': 'border-emerald-300 bg-emerald-50 text-emerald-700 font-bold',
  'Rejected': 'border-rose-300 bg-rose-50 text-rose-700',
  'Withdrawn': 'border-gray-300 bg-gray-50 text-gray-600',
};

export default function ApplicationTrackerPage() {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [activeTab, setActiveTab] = useState('all');

  // Edit Modal State
  const [editingApp, setEditingApp] = useState(null);
  const [editStatus, setEditStatus] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editInterviewDate, setEditInterviewDate] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const res = await applicationsApi.list({ status: activeTab !== 'all' ? activeTab : undefined });
      if (res.data.success) {
        setApplications(res.data.applications);
        setStatusCounts(res.data.status_counts || {});
      }
    } catch (err) {
      toastError('Failed to load tracked applications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [activeTab]);

  const openEditModal = (app) => {
    setEditingApp(app);
    setEditStatus(app.status);
    setEditNotes(app.notes || '');
    setEditInterviewDate(app.interview_date || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingApp) return;

    try {
      setUpdating(true);
      const res = await applicationsApi.update(editingApp.id, {
        status: editStatus,
        notes: editNotes,
        interview_date: editInterviewDate || null,
      });
      if (res.data.success) {
        success(`Application status updated to ${editStatus}!`);
        setEditingApp(null);
        fetchApplications();
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update application.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application record?')) return;
    try {
      await applicationsApi.delete(appId);
      success('Application removed.');
      fetchApplications();
    } catch (err) {
      toastError('Failed to remove application.');
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading application tracking pipeline..." size="lg" />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Kanban className="w-6 h-6 text-teal-600" />
            Placement Application Tracker
          </h1>
          <p className="text-sm text-slate-500">
            Monitor submission status, upcoming technical interviews, and recruitment offers.
          </p>
        </div>

        <Link
          to="/opportunities"
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Track New Opportunity</span>
        </Link>
      </div>

      {/* Mandatory Disclaimer / Notice Box */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
        <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Demonstration Notice: </span>
          <span>
            These application records represent student self-reported progress in campus recruitment pipelines for academic demonstration. Official employer submissions occur through designated institutional portals.
          </span>
        </div>
      </div>

      {/* Status Stage Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-xl font-bold shrink-0 transition-colors ${
            activeTab === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          All Stages ({applications.length})
        </button>
        {STAGES.map((stage) => {
          const count = statusCounts[stage] || 0;
          return (
            <button
              key={stage}
              onClick={() => setActiveTab(stage)}
              className={`px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-colors flex items-center gap-1.5 ${
                activeTab === stage
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{stage}</span>
              <span className="text-[10px] opacity-75 font-bold">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center max-w-md mx-auto">
          <Kanban className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No applications recorded in this stage</h3>
          <p className="text-xs text-slate-500 mt-1 mb-4">
            Click 'Track Application' from any opportunity listing to monitor your placement journey.
          </p>
          <Link
            to="/opportunities"
            className="px-5 py-2.5 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-sm inline-block"
          >
            Explore Opportunities
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map((app) => {
            const opp = app.opportunity;
            if (!opp) return null;

            return (
              <div
                key={app.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      {opp.company}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${STAGE_COLORS[app.status] || 'bg-slate-100 text-slate-700'}`}>
                      {app.status}
                    </span>
                    <span className="text-xs text-slate-400">• Recorded {app.applied_date}</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    <Link to={`/opportunities/${opp.id}`} className="hover:text-teal-600 transition-colors">
                      {opp.title}
                    </Link>
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <span>{opp.location} ({opp.work_mode})</span>
                    <span>•</span>
                    <span className="font-semibold text-teal-700">{opp.salary_range}</span>
                    {app.interview_date && (
                      <>
                        <span>•</span>
                        <span className="font-bold text-indigo-600 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          Interview: {app.interview_date}
                        </span>
                      </>
                    )}
                  </div>

                  {app.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mt-2 italic">
                      “{app.notes}”
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <button
                    onClick={() => openEditModal(app)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    <span>Update Status</span>
                  </button>
                  <button
                    onClick={() => handleDelete(app.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Withdraw Application"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Status Modal */}
      {editingApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-lg font-bold text-slate-900">
              Update Application Status
            </h3>
            <p className="text-xs text-slate-500">
              {editingApp.opportunity?.title} at {editingApp.opportunity?.company}
            </p>

            <form onSubmit={handleUpdate} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Pipeline Stage</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-medium"
                >
                  {STAGES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Interview Date (Optional)</label>
                <input
                  type="date"
                  value={editInterviewDate}
                  onChange={(e) => setEditInterviewDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Notes & Feedback</label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Coding assessment notes, interview questions asked, HR offer details..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingApp(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { opportunitiesApi } from '../services/api';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle,
  XCircle,
  ExternalLink,
  MapPin,
  Calendar,
} from 'lucide-react';

const INITIAL_FORM = {
  company: '',
  title: '',
  description: '',
  opportunity_type: 'Full-Time',
  industry: 'Technology',
  salary_range: '₹8.0 - 12.0 LPA',
  required_skills: '',
  preferred_skills: '',
  min_cgpa: '7.0',
  max_backlogs: '0',
  eligible_branches: 'Computer Science, Information Technology',
  eligible_degrees: 'B.Tech, B.E.',
  eligible_graduation_years: '2025, 2026',
  experience_required_years: '0.0',
  location: 'Bangalore',
  work_mode: 'Hybrid',
  deadline: '2026-12-31',
  application_url: '',
  is_open: true,
};

export default function AdminOpportunitiesPage() {
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState([]);
  const [search, setSearch] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await opportunitiesApi.list({ limit: 100, search: search.trim() || undefined });
      if (res.data.success) {
        setOpportunities(res.data.opportunities);
      }
    } catch (err) {
      toastError('Failed to load opportunities.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [search]);

  const openCreateModal = () => {
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setModalOpen(true);
  };

  const openEditModal = (opp) => {
    setEditingId(opp.id);
    setFormData({
      company: opp.company,
      title: opp.title,
      description: opp.description,
      opportunity_type: opp.opportunity_type,
      industry: opp.industry || 'Technology',
      salary_range: opp.salary_range,
      required_skills: (opp.required_skills || []).join(', '),
      preferred_skills: (opp.preferred_skills || []).join(', '),
      min_cgpa: opp.min_cgpa?.toString() || '0',
      max_backlogs: opp.max_backlogs?.toString() || '0',
      eligible_branches: (opp.eligible_branches || []).join(', '),
      eligible_degrees: (opp.eligible_degrees || []).join(', '),
      eligible_graduation_years: (opp.eligible_graduation_years || []).join(', '),
      experience_required_years: opp.experience_required_years?.toString() || '0',
      location: opp.location,
      work_mode: opp.work_mode,
      deadline: opp.deadline || '',
      application_url: opp.application_url || '',
      is_open: opp.is_open,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const payload = {
        company: formData.company,
        title: formData.title,
        description: formData.description,
        opportunity_type: formData.opportunity_type,
        industry: formData.industry,
        salary_range: formData.salary_range,
        required_skills: formData.required_skills.split(',').map((s) => s.trim()).filter(Boolean),
        preferred_skills: formData.preferred_skills.split(',').map((s) => s.trim()).filter(Boolean),
        min_cgpa: parseFloat(formData.min_cgpa) || 0.0,
        max_backlogs: parseInt(formData.max_backlogs) || 0,
        eligible_branches: formData.eligible_branches.split(',').map((s) => s.trim()).filter(Boolean),
        eligible_degrees: formData.eligible_degrees.split(',').map((s) => s.trim()).filter(Boolean),
        eligible_graduation_years: formData.eligible_graduation_years.split(',').map((s) => parseInt(s.trim())).filter((n) => !isNaN(n)),
        experience_required_years: parseFloat(formData.experience_required_years) || 0.0,
        location: formData.location,
        work_mode: formData.work_mode,
        deadline: formData.deadline || null,
        application_url: formData.application_url || null,
        is_open: formData.is_open,
      };

      if (editingId) {
        await opportunitiesApi.update(editingId, payload);
        success('Opportunity updated successfully!');
      } else {
        await opportunitiesApi.create(payload);
        success('New placement opportunity created!');
      }

      setModalOpen(false);
      fetchOpportunities();
    } catch (err) {
      toastError(err.response?.data?.message || 'Operation failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete '${title}'?`)) return;
    try {
      await opportunitiesApi.delete(id);
      success('Opportunity deleted.');
      fetchOpportunities();
    } catch (err) {
      toastError('Failed to delete opportunity.');
    }
  };

  const handleToggleStatus = async (opp) => {
    try {
      await opportunitiesApi.update(opp.id, { is_open: !opp.is_open });
      success(`Drive status changed to ${!opp.is_open ? 'Open' : 'Closed'}.`);
      fetchOpportunities();
    } catch (err) {
      toastError('Failed to toggle status.');
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Layers className="w-6 h-6 text-teal-600" />
            Manage Placement Opportunities
          </h1>
          <p className="text-sm text-slate-500">
            Create, update criteria, and manage active recruitment postings in the database.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-colors w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Opportunity</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter opportunities by company or title..."
          className="w-full px-2 py-1 text-xs sm:text-sm focus:outline-none"
        />
      </div>

      {/* Opportunities Table */}
      {loading ? (
        <LoadingSpinner message="Loading opportunities..." />
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 uppercase tracking-wider font-bold">
                <th className="p-4">Company & Title</th>
                <th className="p-4">Type & Location</th>
                <th className="p-4">Compensation</th>
                <th className="p-4">Eligibility Cutoff</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {opportunities.map((opp) => (
                <tr key={opp.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="p-4">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">
                      {opp.company}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">{opp.title}</span>
                  </td>
                  <td className="p-4 text-slate-600">
                    <div>{opp.opportunity_type}</div>
                    <div className="text-slate-400">{opp.location} • {opp.work_mode}</div>
                  </td>
                  <td className="p-4 font-bold text-teal-700 text-xs">
                    {opp.salary_range}
                  </td>
                  <td className="p-4 text-slate-600">
                    <div>CGPA: <span className="font-bold text-slate-900">{opp.min_cgpa || 'None'}</span></div>
                    <div>Backlogs: {opp.max_backlogs} max</div>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggleStatus(opp)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                        opp.is_open
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                      }`}
                    >
                      {opp.is_open ? 'Open' : 'Closed'}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEditModal(opp)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                        title="Edit Opportunity"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(opp.id, opp.title)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        title="Delete Opportunity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900">
              {editingId ? 'Edit Placement Opportunity' : 'Create New Placement Opportunity'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Job Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 uppercase">Job Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Type</label>
                  <select
                    value={formData.opportunity_type}
                    onChange={(e) => setFormData({ ...formData, opportunity_type: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Full-Time">Full-Time</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Industry</label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Salary / Stipend *</label>
                  <input
                    type="text"
                    required
                    value={formData.salary_range}
                    onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Required Skills (Comma separated)</label>
                  <input
                    type="text"
                    value={formData.required_skills}
                    onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Preferred Skills</label>
                  <input
                    type="text"
                    value={formData.preferred_skills}
                    onChange={(e) => setFormData({ ...formData, preferred_skills: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Min CGPA</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.min_cgpa}
                    onChange={(e) => setFormData({ ...formData, min_cgpa: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Max Backlogs</label>
                  <input
                    type="number"
                    value={formData.max_backlogs}
                    onChange={(e) => setFormData({ ...formData, max_backlogs: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Experience (Yrs)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={formData.experience_required_years}
                    onChange={(e) => setFormData({ ...formData, experience_required_years: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Work Mode</label>
                  <select
                    value={formData.work_mode}
                    onChange={(e) => setFormData({ ...formData, work_mode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="On-Site">On-Site</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1 uppercase">Application URL</label>
                  <input
                    type="url"
                    value={formData.application_url}
                    onChange={(e) => setFormData({ ...formData, application_url: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Opportunity' : 'Create Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

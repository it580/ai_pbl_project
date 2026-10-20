import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { studentsApi } from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  User,
  GraduationCap,
  Code2,
  FolderGit2,
  Award,
  Compass,
  FileText,
  Plus,
  Trash2,
  Save,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

export default function StudentProfilePage() {
  const { studentProfile, refreshProfile } = useAuth();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [parsingResume, setParsingResume] = useState(false);

  const [formData, setFormData] = useState({
    college: '',
    degree: 'B.Tech',
    branch: '',
    graduation_year: 2026,
    cgpa: '',
    backlogs_count: 0,
    technical_skills: [],
    soft_skills: [],
    projects: [],
    certifications: [],
    experience: [],
    preferred_roles: [],
    preferred_industries: [],
    preferred_locations: [],
    preferred_work_mode: 'Hybrid',
    resume_text: '',
  });

  const [newSkill, setNewSkill] = useState('');
  const [newSoftSkill, setNewSoftSkill] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newLoc, setNewLoc] = useState('');

  // Project state
  const [projInput, setProjInput] = useState({ title: '', tech_stack: '', description: '', live_url: '' });
  // Cert state
  const [certInput, setCertInput] = useState({ name: '', issuer: '', year: '2025' });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await studentsApi.getMyProfile();
        if (res.data.success) {
          const p = res.data.profile;
          setFormData({
            college: p.college || '',
            degree: p.degree || 'B.Tech',
            branch: p.branch || '',
            graduation_year: p.graduation_year || 2026,
            cgpa: p.cgpa !== null ? p.cgpa : '',
            backlogs_count: p.backlogs_count || 0,
            technical_skills: p.technical_skills || [],
            soft_skills: p.soft_skills || [],
            projects: p.projects || [],
            certifications: p.certifications || [],
            experience: p.experience || [],
            preferred_roles: p.preferred_roles || [],
            preferred_industries: p.preferred_industries || [],
            preferred_locations: p.preferred_locations || [],
            preferred_work_mode: p.preferred_work_mode || 'Hybrid',
            resume_text: p.resume_text || '',
          });
        }
      } catch (err) {
        toastError('Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      await studentsApi.updateMyProfile({
        ...formData,
        cgpa: formData.cgpa !== '' ? parseFloat(formData.cgpa) : null,
        graduation_year: formData.graduation_year ? parseInt(formData.graduation_year) : null,
        backlogs_count: parseInt(formData.backlogs_count) || 0,
      });
      await refreshProfile();
      success('Profile updated successfully!');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleParseResume = async () => {
    if (!formData.resume_text.trim()) {
      toastError('Please paste your resume text first.');
      return;
    }

    try {
      setParsingResume(true);
      const res = await studentsApi.parseResume(formData.resume_text);
      if (res.data.success) {
        const extracted = res.data.extracted_skills;
        const merged = Array.from(new Set([...formData.technical_skills, ...extracted]));
        setFormData({ ...formData, technical_skills: merged });
        success(`NLP parsed ${extracted.length} skill(s) from your resume!`);
      }
    } catch (err) {
      toastError('Failed to parse resume text.');
    } finally {
      setParsingResume(false);
    }
  };

  const addSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !formData.technical_skills.includes(newSkill.trim())) {
      setFormData({
        ...formData,
        technical_skills: [...formData.technical_skills, newSkill.trim()],
      });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      technical_skills: formData.technical_skills.filter((s) => s !== skillToRemove),
    });
  };

  const addProject = () => {
    if (!projInput.title.trim()) return;
    const techs = projInput.tech_stack.split(',').map((s) => s.trim()).filter(Boolean);
    setFormData({
      ...formData,
      projects: [...formData.projects, { ...projInput, tech_stack: techs }],
    });
    setProjInput({ title: '', tech_stack: '', description: '', live_url: '' });
  };

  const removeProject = (index) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index),
    });
  };

  const addCertification = () => {
    if (!certInput.name.trim()) return;
    setFormData({
      ...formData,
      certifications: [...formData.certifications, certInput],
    });
    setCertInput({ name: '', issuer: '', year: '2025' });
  };

  const removeCertification = (index) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return <LoadingSpinner message="Loading your student profile..." size="lg" />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6 text-teal-600" />
            Student Profile & Qualifications
          </h1>
          <p className="text-sm text-slate-500">
            Keep your profile current to maximize your AI recommendation accuracy.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {saving ? (
            <span>Saving...</span>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Save Changes</span>
            </>
          )}
        </button>
      </div>

      {/* Main Sections */}
      <div className="space-y-6">
        {/* Section 1: Academics (Eligibility Factors) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-bold text-base">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
            <span>Academic Qualifications (Mandatory Eligibility Gates)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                College / University
              </label>
              <input
                type="text"
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Degree
              </label>
              <select
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm"
              >
                <option value="B.Tech">B.Tech / B.E.</option>
                <option value="M.Tech">M.Tech</option>
                <option value="MCA">MCA</option>
                <option value="BCA">BCA</option>
                <option value="B.Sc">B.Sc Computer Science</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Branch / Specialization
              </label>
              <input
                type="text"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                placeholder="Computer Science, IT, ECE"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Graduation Year
              </label>
              <select
                value={formData.graduation_year}
                onChange={(e) => setFormData({ ...formData, graduation_year: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm"
              >
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
                <option value={2027}>2027</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Current CGPA (0 - 10)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="10"
                value={formData.cgpa}
                onChange={(e) => setFormData({ ...formData, cgpa: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Active Backlogs Count
              </label>
              <input
                type="number"
                min="0"
                value={formData.backlogs_count}
                onChange={(e) => setFormData({ ...formData, backlogs_count: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Technical Skills (35% Weight) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <Code2 className="w-5 h-5 text-teal-600" />
              <span>Technical Skills (Weight: 35%)</span>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              {formData.technical_skills.length} skills listed
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {formData.technical_skills.map((skill, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold shadow-sm"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="text-teal-500 hover:text-rose-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={addSkill} className="flex gap-2 pt-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="Type skill name (e.g. Docker, TypeScript, PyTorch) and press Add..."
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-teal-500"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </button>
          </form>
        </div>

        {/* Section 3: NLP Resume Keyword Parser */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 rounded-2xl border border-slate-800 shadow-md text-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-teal-400" />
              <h3 className="font-bold text-base text-white">NLP Resume Text Skill Extractor</h3>
            </div>
            <span className="text-xs text-teal-300 font-medium bg-teal-900/50 px-2 py-0.5 rounded border border-teal-700">
              AI Powered
            </span>
          </div>
          <p className="text-xs text-slate-300">
            Paste your raw resume summary or bullet points below. Our natural language parser will extract recognized tech skills directly into your profile.
          </p>
          <textarea
            rows={4}
            value={formData.resume_text}
            onChange={(e) => setFormData({ ...formData, resume_text: e.target.value })}
            placeholder="Paste raw resume text here: 'Graduating student with experience in Python, Flask microservices, React, Docker containerization and PostgreSQL databases...'"
            className="w-full px-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-slate-100 text-xs placeholder-slate-500 focus:outline-none focus:border-teal-400"
          />
          <button
            type="button"
            disabled={parsingResume}
            onClick={handleParseResume}
            className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-md shadow-teal-500/20"
          >
            {parsingResume ? (
              <span>Extracting Skills...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Parse Skills from Resume Text</span>
              </>
            )}
          </button>
        </div>

        {/* Section 4: Projects (15% Weight) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
              <FolderGit2 className="w-5 h-5 text-indigo-600" />
              <span>Projects Portfolio (Weight: 15%)</span>
            </div>
          </div>

          <div className="space-y-3">
            {formData.projects.map((proj, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{proj.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{proj.description}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {proj.tech_stack?.map((t, i) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => removeProject(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 space-y-3">
            <span className="text-xs font-bold text-slate-700 uppercase">Add Project</span>
            <input
              type="text"
              placeholder="Project Title"
              value={projInput.title}
              onChange={(e) => setProjInput({ ...projInput, title: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
            />
            <input
              type="text"
              placeholder="Tech Stack (comma separated: React, Python, Docker)"
              value={projInput.tech_stack}
              onChange={(e) => setProjInput({ ...projInput, tech_stack: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
            />
            <textarea
              rows={2}
              placeholder="Project description..."
              value={projInput.description}
              onChange={(e) => setProjInput({ ...projInput, description: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900"
            />
            <button
              type="button"
              onClick={addProject}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project to Portfolio</span>
            </button>
          </div>
        </div>

        {/* Section 5: Certifications */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-bold text-base">
            <Award className="w-5 h-5 text-amber-600" />
            <span>Certifications & Credentials</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {formData.certifications.map((c, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{c.name}</p>
                  <p className="text-[11px] text-slate-500">{c.issuer} • {c.year}</p>
                </div>
                <button onClick={() => removeCertification(idx)} className="text-slate-400 hover:text-rose-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <input
              type="text"
              placeholder="Certification Name (e.g. AWS Cloud Practitioner)"
              value={certInput.name}
              onChange={(e) => setCertInput({ ...certInput, name: e.target.value })}
              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
            <input
              type="text"
              placeholder="Issuer (e.g. AWS, Coursera)"
              value={certInput.issuer}
              onChange={(e) => setCertInput({ ...certInput, issuer: e.target.value })}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
            />
            <button
              type="button"
              onClick={addCertification}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs rounded-xl"
            >
              Add Cert
            </button>
          </div>
        </div>

        {/* Section 6: Preferences (Role, Location, Mode - 20% Weight) */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 text-slate-900 font-bold text-base">
            <Compass className="w-5 h-5 text-violet-600" />
            <span>Placement Preferences (Weight: 20%)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Preferred Work Mode
              </label>
              <select
                value={formData.preferred_work_mode}
                onChange={(e) => setFormData({ ...formData, preferred_work_mode: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm"
              >
                <option value="Hybrid">Hybrid</option>
                <option value="Remote">Remote</option>
                <option value="On-Site">On-Site</option>
                <option value="Any">Any Mode</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Preferred Locations
              </label>
              <input
                type="text"
                placeholder="Comma separated: Bangalore, Pune, Remote"
                value={formData.preferred_locations?.join(', ')}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    preferred_locations: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                  })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button Float */}
      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-500 text-white shadow-xl shadow-teal-600/25 flex items-center gap-2 transition-all"
        >
          {saving ? <span>Saving...</span> : <><Save className="w-4 h-4" /><span>Save All Profile Changes</span></>}
        </button>
      </div>
    </div>
  );
}

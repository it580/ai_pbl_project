import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { studentsApi } from '../services/api';
import {
  Sparkles,
  Code2,
  FolderGit2,
  Compass,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  X,
  Target,
} from 'lucide-react';

const POPULAR_SKILLS = [
  'Python', 'React', 'Node.js', 'Docker', 'PostgreSQL', 'JavaScript', 'TypeScript',
  'Java', 'Spring Boot', 'SQL', 'Git', 'AWS', 'Kubernetes', 'Flask', 'Machine Learning',
  'Tailwind CSS', 'C++', 'Linux', 'REST API', 'Pandas'
];

export default function StudentOnboardingPage() {
  const { studentProfile, refreshProfile } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Skills
  const [selectedSkills, setSelectedSkills] = useState(studentProfile?.technical_skills || ['Python', 'SQL']);
  const [customSkill, setCustomSkill] = useState('');

  // Projects
  const [projects, setProjects] = useState(
    studentProfile?.projects?.length > 0
      ? studentProfile.projects
      : [{ title: 'Full Stack Web Platform', tech_stack: ['React', 'Python'], description: 'Capstone web application with REST APIs and database storage.' }]
  );
  const [newProject, setNewProject] = useState({ title: '', tech_stack: '', description: '' });

  // Preferences
  const [preferredRoles, setPreferredRoles] = useState(
    studentProfile?.preferred_roles || ['Full Stack Developer', 'Software Engineer']
  );
  const [roleInput, setRoleInput] = useState('');
  const [workMode, setWorkMode] = useState(studentProfile?.preferred_work_mode || 'Hybrid');
  const [location, setLocation] = useState(studentProfile?.preferred_locations?.[0] || 'Bangalore');

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = (e) => {
    e.preventDefault();
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills([...selectedSkills, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleAddProject = () => {
    if (!newProject.title.trim()) return;
    const techs = newProject.tech_stack.split(',').map((s) => s.trim()).filter(Boolean);
    setProjects([...projects, { ...newProject, tech_stack: techs }]);
    setNewProject({ title: '', tech_stack: '', description: '' });
  };

  const handleFinish = async () => {
    try {
      setLoading(true);
      await studentsApi.updateMyProfile({
        technical_skills: selectedSkills,
        projects: projects,
        preferred_roles: preferredRoles,
        preferred_work_mode: workMode,
        preferred_locations: [location],
      });
      await refreshProfile();
      success('Onboarding completed! Your recommendation matches are now ready.');
      navigate('/dashboard');
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-3 border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Profile Personalization Wizard</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Let’s Tune Your AI Match Profile</h1>
          <p className="text-slate-400 text-sm mt-1">
            The CareerMatch engine uses these factors to rank placements and identify skill gaps.
          </p>

          {/* Stepper Progress */}
          <div className="flex items-center justify-center gap-3 mt-8">
            <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border ${step === 1 ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              <span>1. Technical Skills</span>
            </div>
            <div className={`w-8 h-0.5 ${step >= 2 ? 'bg-teal-500' : 'bg-slate-700'}`} />
            <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border ${step === 2 ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              <span>2. Portfolio Projects</span>
            </div>
            <div className={`w-8 h-0.5 ${step >= 3 ? 'bg-teal-500' : 'bg-slate-700'}`} />
            <div className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl border ${step === 3 ? 'bg-teal-500/20 border-teal-500 text-teal-300' : 'bg-slate-800 border-slate-700 text-slate-400'}`}>
              <span>3. Placement Preferences</span>
            </div>
          </div>
        </div>

        {/* Wizard Box */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* STEP 1: SKILLS */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-teal-400" />
                  Select Your Core Technical Skills
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Click to select skills you are comfortable answering questions on in placement interviews.
                </p>
              </div>

              {/* Skill chips */}
              <div className="flex flex-wrap gap-2">
                {POPULAR_SKILLS.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => toggleSkill(skill)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-teal-500 text-white font-semibold shadow-md shadow-teal-500/25 ring-2 ring-teal-400/50'
                          : 'bg-slate-900 text-slate-300 border border-slate-700 hover:border-slate-500'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{skill}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add custom skill input */}
              <div className="pt-2">
                <form onSubmit={addCustomSkill} className="flex gap-2">
                  <input
                    type="text"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    placeholder="Add other skill (e.g. Next.js, Redis, OpenCV)..."
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-teal-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </form>
              </div>

              <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs text-slate-400">
                Selected: <span className="text-teal-300 font-bold">{selectedSkills.length}</span> skill(s)
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-teal-500/20"
                >
                  <span>Next: Add Projects</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: PROJECTS */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-indigo-400" />
                  Showcase Your Practical Projects
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Projects validate that you have applied skills in code. Contributes 15% to your match weight.
                </p>
              </div>

              {/* Existing projects */}
              <div className="space-y-3">
                {projects.map((proj, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-700 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-bold text-white">{proj.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{proj.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {proj.tech_stack?.map((t, i) => (
                          <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Project Form */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/60 space-y-3">
                <p className="text-xs font-bold text-teal-400 uppercase tracking-wider">Add New Project</p>
                <input
                  type="text"
                  placeholder="Project Title (e.g. Real-Time Chat System)"
                  value={newProject.title}
                  onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                />
                <input
                  type="text"
                  placeholder="Tech Stack (comma separated: React, Node.js, Socket.io)"
                  value={newProject.tech_stack}
                  onChange={(e) => setNewProject({ ...newProject, tech_stack: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                />
                <textarea
                  placeholder="Brief description of architecture and features..."
                  rows={2}
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddProject}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Project</span>
                </button>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-teal-500 hover:bg-teal-400 text-slate-950 flex items-center gap-2 shadow-lg shadow-teal-500/20"
                >
                  <span>Next: Preferences</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PREFERENCES */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-violet-400" />
                  Preferred Placement Roles & Location
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Adjusting these aligns the recommendation engine with your career goals.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Target Roles</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {preferredRoles.map((role, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/20 text-teal-300 text-xs border border-teal-500/30">
                      {role}
                      <button
                        type="button"
                        onClick={() => setPreferredRoles(preferredRoles.filter((_, i) => i !== idx))}
                        className="hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    placeholder="Add target role (e.g. Frontend Developer)..."
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (roleInput.trim() && !preferredRoles.includes(roleInput.trim())) {
                        setPreferredRoles([...preferredRoles, roleInput.trim()]);
                        setRoleInput('');
                      }
                    }}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-xl"
                  >
                    Add
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Work Mode</label>
                  <select
                    value={workMode}
                    onChange={(e) => setWorkMode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                    <option value="On-Site">On-Site</option>
                    <option value="Any">Any Mode</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Preferred Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                  >
                    <option value="Bangalore">Bangalore</option>
                    <option value="Pune">Pune</option>
                    <option value="Hyderabad">Hyderabad</option>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Chennai">Chennai</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white flex items-center gap-1"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleFinish}
                  className="px-8 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-white flex items-center gap-2 shadow-lg shadow-teal-500/25"
                >
                  {loading ? (
                    <span>Saving Profile...</span>
                  ) : (
                    <>
                      <span>Generate Recommendations</span>
                      <Sparkles className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

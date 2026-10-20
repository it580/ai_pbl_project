import React, { useState } from 'react';
import {
  Cpu,
  ShieldCheck,
  Calculator,
  Layers,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Code2,
  Table,
} from 'lucide-react';

export default function AIArchitecturePage() {
  // Interactive Math Simulator State
  const [simReq, setSimReq] = useState(80);
  const [simPref, setSimPref] = useState(60);
  const [simAcad, setSimAcad] = useState(85);
  const [simProj, setSimProj] = useState(75);
  const [simRole, setSimRole] = useState(90);
  const [simLoc, setSimLoc] = useState(100);

  const calculatedScore = Math.round(
    simReq * 0.35 +
    simPref * 0.15 +
    simAcad * 0.15 +
    simProj * 0.15 +
    simRole * 0.10 +
    simLoc * 0.10
  );

  const getCategory = (score) => {
    if (score >= 80) return { label: 'Excellent', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (score >= 65) return { label: 'Good', color: 'text-teal-600 bg-teal-50 border-teal-200' };
    if (score >= 45) return { label: 'Moderate', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    return { label: 'Low', color: 'text-rose-600 bg-rose-50 border-rose-200' };
  };

  const cat = getCategory(calculatedScore);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full space-y-10">
      {/* Title */}
      <div className="pb-4 border-b border-slate-200">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3 border border-indigo-200">
          <Cpu className="w-3.5 h-3.5" />
          <span>Artificial Intelligence PBL Project Architecture</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900">
          Recommendation Algorithm & System Architecture
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl">
          Detailed mathematical formulation, eligibility filtration gates, and explainable AI design.
        </p>
      </div>

      {/* High-Level Architecture Flowchart */}
      <section className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center gap-2 text-teal-400 font-bold text-sm uppercase tracking-wider">
          <Layers className="w-5 h-5" />
          <span>1. High-Level System Architecture</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="text-[10px] font-bold text-teal-400 uppercase">Layer 1: Presentation</span>
            <h4 className="font-bold text-white text-sm">React 18 + Vite</h4>
            <p className="text-slate-400 leading-relaxed">
              Tailwind CSS responsive design, Recharts interactive visualizations, Lucide React iconography, Axios HTTP interceptors.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="text-[10px] font-bold text-indigo-400 uppercase">Layer 2: API Gateway</span>
            <h4 className="font-bold text-white text-sm">Python Flask REST API</h4>
            <p className="text-slate-400 leading-relaxed">
              Blueprint routing, Flask-JWT-Extended authentication, Werkzeug SHA-256 password hashing, Flask-CORS controlled access.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="text-[10px] font-bold text-violet-400 uppercase">Layer 3: AI Engine</span>
            <h4 className="font-bold text-white text-sm">Matching & NLP Services</h4>
            <p className="text-slate-400 leading-relaxed">
              Mandatory eligibility gating, 6-factor normalized weighted scoring, skill gap prioritization, cosine text similarity.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
            <span className="text-[10px] font-bold text-emerald-400 uppercase">Layer 4: Persistence</span>
            <h4 className="font-bold text-white text-sm">SQLAlchemy ORM + SQLite</h4>
            <p className="text-slate-400 leading-relaxed">
              Relational models for Users, Students, Opportunities, Applications, and Bookmarks. Modular for PostgreSQL migration.
            </p>
          </div>
        </div>
      </section>

      {/* Step A: Eligibility Gate */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-wider">
          <ShieldCheck className="w-5 h-5" />
          <span>2. Mandatory Eligibility Filtration Gate (Hard Constraints)</span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Before numerical scoring occurs, candidate profiles pass through strict Boolean filters. If any mandatory criterion fails, the student is flagged as <span className="font-bold text-rose-600">Not Eligible</span>. If data is omitted, they are classified as <span className="font-bold text-amber-600">Potentially Eligible</span>.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Academic Cutoff Rule</span>
            <code className="text-indigo-600 font-mono text-[11px] block">Student.CGPA ≥ Opp.Min_CGPA</code>
            <p className="text-slate-500 text-[11px] mt-1">Prevents institutional shortlisting rejection.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Backlog Restriction Rule</span>
            <code className="text-indigo-600 font-mono text-[11px] block">Student.Backlogs ≤ Opp.Max_Backlogs</code>
            <p className="text-slate-500 text-[11px] mt-1">Strict adherence to company recruitment guidelines.</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="font-bold text-slate-900 block mb-1">Batch & Branch Gate</span>
            <code className="text-indigo-600 font-mono text-[11px] block">Student.Branch ∈ Opp.EligibleBranches</code>
            <p className="text-slate-500 text-[11px] mt-1">Verifies departmental alignment.</p>
          </div>
        </div>
      </section>

      {/* Step B: Mathematical Weighting Scheme */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-teal-600 font-bold text-sm uppercase tracking-wider">
          <Calculator className="w-5 h-5" />
          <span>3. Multi-Factor Compatibility Formula & Normalization</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 text-teal-300 font-mono text-xs sm:text-sm text-center shadow-inner">
          Final Compatibility Score = Σ (Component Score × Component Weight)
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
            <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
              <tr>
                <th className="p-3">Component</th>
                <th className="p-3">Weight</th>
                <th className="p-3">Evaluation Logic & Range</th>
                <th className="p-3">Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-600">
              <tr>
                <td className="p-3 font-bold text-slate-900">Required Skills Coverage</td>
                <td className="p-3 font-bold text-teal-700">35%</td>
                <td className="p-3"><code className="font-mono text-[11px] text-indigo-600">(Matched Required / Total Required) × 100</code></td>
                <td className="p-3">Primary technical threshold for passing initial interview rounds.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900">Preferred-Skill Match</td>
                <td className="p-3 font-bold text-teal-700">15%</td>
                <td className="p-3"><code className="font-mono text-[11px] text-indigo-600">(Matched Preferred / Total Preferred) × 100</code></td>
                <td className="p-3">Bonus qualifications and secondary tool proficiency.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900">Academic & CGPA Fit</td>
                <td className="p-3 font-bold text-teal-700">15%</td>
                <td className="p-3"><code className="font-mono text-[11px] text-indigo-600">Surplus Scale: Base 70 + (CGPA - Min_CGPA)*10</code></td>
                <td className="p-3">Rewards consistent collegiate academic performance.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900">Projects & Certifications</td>
                <td className="p-3 font-bold text-teal-700">15%</td>
                <td className="p-3"><code className="font-mono text-[11px] text-indigo-600">Portfolio Tech Stack Overlap + Credentials Count</code></td>
                <td className="p-3">Validates hands-on production code deployment.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900">Role & Industry Fit</td>
                <td className="p-3 font-bold text-teal-700">10%</td>
                <td className="p-3"><code className="font-mono text-[11px] text-indigo-600">Preferred Role & Industry Keyword Intersections</code></td>
                <td className="p-3">Ensures candidate motivation and career alignment.</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900">Location & Work Mode</td>
                <td className="p-3 font-bold text-teal-700">10%</td>
                <td className="p-3"><code className="font-mono text-[11px] text-indigo-600">Hybrid / Remote / City Preferences Alignment</code></td>
                <td className="p-3">Logistical feasibility and relocation readiness.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Step C: Interactive Live Compatibility Simulator */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex items-center gap-2 text-violet-600 font-bold text-sm uppercase tracking-wider">
          <Sparkles className="w-5 h-5" />
          <span>4. Live Interactive Scoring Formula Simulator</span>
        </div>
        <p className="text-xs text-slate-600">
          Slide the component sliders below to observe how changing student sub-scores influences the final weighted compatibility metric in real time:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
          <div>
            <div className="flex justify-between font-bold mb-1">
              <span>Required Skills Coverage</span>
              <span className="text-teal-600">{simReq}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={simReq}
              onChange={(e) => setSimReq(parseInt(e.target.value))}
              className="w-full accent-teal-600"
            />
          </div>

          <div>
            <div className="flex justify-between font-bold mb-1">
              <span>Preferred Skills Overlap</span>
              <span className="text-teal-600">{simPref}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={simPref}
              onChange={(e) => setSimPref(parseInt(e.target.value))}
              className="w-full accent-teal-600"
            />
          </div>

          <div>
            <div className="flex justify-between font-bold mb-1">
              <span>Academic Surplus Fit</span>
              <span className="text-teal-600">{simAcad}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={simAcad}
              onChange={(e) => setSimAcad(parseInt(e.target.value))}
              className="w-full accent-teal-600"
            />
          </div>

          <div>
            <div className="flex justify-between font-bold mb-1">
              <span>Projects Portfolio Quality</span>
              <span className="text-teal-600">{simProj}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={simProj}
              onChange={(e) => setSimProj(parseInt(e.target.value))}
              className="w-full accent-teal-600"
            />
          </div>

          <div>
            <div className="flex justify-between font-bold mb-1">
              <span>Role / Industry Match</span>
              <span className="text-teal-600">{simRole}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={simRole}
              onChange={(e) => setSimRole(parseInt(e.target.value))}
              className="w-full accent-teal-600"
            />
          </div>

          <div>
            <div className="flex justify-between font-bold mb-1">
              <span>Location / Mode Fit</span>
              <span className="text-teal-600">{simLoc}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={simLoc}
              onChange={(e) => setSimLoc(parseInt(e.target.value))}
              className="w-full accent-teal-600"
            />
          </div>
        </div>

        {/* Simulator Output Box */}
        <div className="p-6 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-teal-400 uppercase tracking-wider block">
              Calculated Overall Compatibility Fit
            </span>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-4xl font-black text-white">{calculatedScore}%</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${cat.color}`}>
                {cat.label} Match Tier
              </span>
            </div>
          </div>

          <div className="text-right text-xs text-slate-400">
            <code className="text-slate-300 font-mono text-[11px]">
              {simReq}×0.35 + {simPref}×0.15 + {simAcad}×0.15 + {simProj}×0.15 + {simRole}×0.10 + {simLoc}×0.10
            </code>
            <p className="mt-1 text-teal-300 font-semibold">= {calculatedScore} Total Normalized Score</p>
          </div>
        </div>
      </section>
    </div>
  );
}

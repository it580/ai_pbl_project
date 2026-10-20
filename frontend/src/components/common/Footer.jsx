import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Github, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="font-bold text-white text-base">CareerMatch AI</span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm mb-3">
              “Your Skills. Your Potential. Your Next Opportunity.”
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              An Artificial Intelligence PBL Project engineering student-to-job recommendation matching,
              mandatory eligibility filtration, multi-component weighted scoring, and explainable AI.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">System Navigation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/opportunities" className="hover:text-teal-400 transition-colors">Placement Directory</Link></li>
              <li><Link to="/recommendations" className="hover:text-teal-400 transition-colors">AI Match Engine</Link></li>
              <li><Link to="/skill-gap" className="hover:text-teal-400 transition-colors">Skill Gap Matrix</Link></li>
              <li><Link to="/compare" className="hover:text-teal-400 transition-colors">Opportunity Comparison</Link></li>
              <li><Link to="/applications" className="hover:text-teal-400 transition-colors">Application Tracker</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-3">AI & Documentation</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/ai-architecture" className="hover:text-teal-400 transition-colors">Mathematical Formulation</Link></li>
              <li><Link to="/assistant" className="hover:text-teal-400 transition-colors">Placement AI Assistant</Link></li>
              <li><span className="text-slate-500 text-xs">Weights: 35% Skills, 15% Academic, 15% Projects, 15% Pref Skills, 10% Role, 10% Location</span></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 CareerMatch AI. Artificial Intelligence PBL Project.</p>
          <div className="flex items-center gap-6">
            <span>Prototype Demonstration Dataset</span>
            <span>REST API v1.0.0</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

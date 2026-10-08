"use client";

import { useState } from 'react';
import { Bell, Check, X, Sparkles } from 'lucide-react';

export default function JobAlertsModal({ isOpen, onClose }) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [frequency, setFrequency] = useState('Daily');
  const [minSalary, setMinSalary] = useState('₹6,00,000/yr');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSaveAlert = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="glass-panel bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-2 text-blue-400">
          <Bell className="w-5 h-5" />
          <h3 className="text-lg font-bold text-white">Create Job Alert</h3>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Receive email notifications when new jobs match your exact criteria.
        </p>

        {saved ? (
          <div className="py-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Job Alert Saved!</h4>
            <p className="text-xs text-slate-400">We will notify you when matching jobs are posted.</p>
          </div>
        ) : (
          <form onSubmit={handleSaveAlert} className="mt-4 space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Target Role / Keywords
              </label>
              <input
                type="text"
                required
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="e.g. React Developer, Full Stack, Product Manager"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Location / Remote
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, New York, NY, San Francisco"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Minimum Salary
                </label>
                <select
                  value={minSalary}
                  onChange={(e) => setMinSalary(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="₹4,00,000/yr">₹4,00,000 / yr (4 LPA)</option>
                  <option value="₹6,00,000/yr">₹6,00,000 / yr (6 LPA)</option>
                  <option value="₹10,00,000/yr">₹10,00,000 / yr (10 LPA)</option>
                  <option value="₹15,00,000/yr">₹15,00,000 / yr (15 LPA)</option>
                  <option value="₹25,00,000/yr">₹25,00,000+ / yr (25+ LPA)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alert Frequency
                </label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Instant">Instant (Real-time)</option>
                  <option value="Daily">Daily Summary</option>
                  <option value="Weekly">Weekly Digest</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Save Alert</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}


"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  Clock, 
  Bookmark, 
  Briefcase, 
  ArrowUpRight,
  Send,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { authService } from '../services/api';
import { setUser } from '../store/slices/authSlice';
import ApplyModal from './ApplyModal';

export default function JobCard({ job, isSaved = false, onSaveToggle = () => {}, onApplySuccess = () => {} }) {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const dispatch = useDispatch();
  const [saved, setSaved] = useState(isSaved);
  const [saving, setSaving] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Parse skills safely
  let skills = [];
  try {
    if (typeof job.requiredSkills === 'string') {
      if (job.requiredSkills.startsWith('[')) {
        skills = JSON.parse(job.requiredSkills);
      } else {
        skills = job.requiredSkills.split(',').map(s => s.trim());
      }
    } else if (Array.isArray(job.requiredSkills)) {
      skills = job.requiredSkills;
    }
  } catch (e) {
    skills = job.requiredSkills ? [job.requiredSkills] : [];
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const isExpired = !!(job.deadline && job.deadline < todayStr);
  const isPaused = job.status === 'paused';

  const handleSaveToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      router.push(`/login?redirect=/jobs/${job.id}`);
      return;
    }
    setSaving(true);
    const newSaved = !saved;
    setSaved(newSaved);

    try {
      let rawList = [];
      try {
        rawList = typeof user.savedJobs === 'string' ? JSON.parse(user.savedJobs) : (user.savedJobs || []);
      } catch (err) {
        rawList = [];
      }
      let savedList = Array.isArray(rawList) ? [...rawList] : [];

      if (newSaved) {
        if (!savedList.includes(job.id)) {
          savedList.push(job.id);
        }
      } else {
        savedList = savedList.filter(id => id !== job.id);
      }

      await authService.updateProfile(user.id, {
        savedJobs: JSON.stringify(savedList)
      });

      dispatch(setUser({ ...user, savedJobs: JSON.stringify(savedList) }));

      if (onSaveToggle) onSaveToggle(job.id, newSaved);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleOpenApply = () => {
    if (!isAuthenticated || !user) {
      router.push(`/login?redirect=/jobs/${job.id}`);
      return;
    }
    if (user?.role === 'employer' || user?.role === 'admin') {
      alert("Only Job Seekers can apply for jobs. Please log in with a Job Seeker account.");
      return;
    }
    setShowApplyModal(true);
  };

  return (
    <>
      <div className="glass-card bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/80 hover:border-blue-500 rounded-2xl p-6 transition-all duration-200 group flex flex-col justify-between relative overflow-hidden shadow-sm hover:shadow-md">
        
        {/* Top accent glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />

        <div>
          {/* Header Row: Company Avatar + Title + Bookmark */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                {job.companyName ? job.companyName.charAt(0).toUpperCase() : <Building2 className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                  <Link href={`/jobs/${job.id}`}>
                    {job.title}
                  </Link>
                </h3>
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 mt-0.5">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>{job.companyName}</span>
                </p>
              </div>
            </div>

            {/* Bookmark button */}
            <button
              onClick={handleSaveToggle}
              disabled={saving}
              className={`p-2.5 rounded-xl border transition ${saved ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-600 dark:text-amber-400' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/60 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              title={saved ? "Saved" : "Save Job"}
            >
              <Bookmark className={`w-4 h-4 ${saved ? 'fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400' : ''}`} />
            </button>
          </div>

          {/* Badges / Meta Info */}
          <div className="flex flex-wrap gap-2 mt-4 text-xs font-bold">
            {isExpired ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-700">
                Closed (Expired)
              </span>
            ) : isPaused ? (
              <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-700">
                Paused
              </span>
            ) : null}

            {job.location && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {job.location}
              </span>
            )}
            {job.salaryRange && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 font-bold">
                <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                {job.salaryRange.replace(/^\s*[$₹]\s*/, '').replace(/\$/g, '₹')}
              </span>
            )}
            {job.jobType && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
                <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                {job.jobType}
              </span>
            )}
            {job.experienceLevel && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                {job.experienceLevel}
              </span>
            )}
          </div>

          {/* Description Snippet */}
          <p className="text-sm text-slate-700 dark:text-slate-300 mt-3.5 line-clamp-2 leading-relaxed">
            {job.description || "Exciting opportunity to join our rapidly growing team. Competitive benefits and flexible working environment."}
          </p>

          {/* Skill chips */}
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {skills.slice(0, 4).map((skill, index) => (
                <span 
                  key={index} 
                  className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="text-xs font-medium px-2 py-1 rounded-md text-slate-500">
                  +{skills.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer: Posted time + Action buttons */}
        <div className="mt-5 pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'Recently posted'}
          </span>

          <div className="flex items-center space-x-2.5">
            <Link 
              href={`/jobs/${job.id}`}
              className="text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white px-3.5 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5"
            >
              <span>Details</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>

            {isExpired ? (
              <button
                disabled
                className="text-sm font-bold bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 px-4 py-2 rounded-xl cursor-not-allowed border border-slate-200 dark:border-slate-700"
                title="Application deadline has expired"
              >
                Closed
              </button>
            ) : isPaused ? (
              <button
                disabled
                className="text-sm font-bold bg-slate-100 dark:bg-slate-800 text-amber-600/70 dark:text-amber-400/70 px-4 py-2 rounded-xl cursor-not-allowed border border-slate-200 dark:border-slate-700"
                title="Listing currently paused by recruiter"
              >
                Paused
              </button>
            ) : (
              <button
                onClick={handleOpenApply}
                className="text-sm font-bold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl shadow-md shadow-blue-600/30 transition hover:scale-105"
              >
                Apply
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <ApplyModal
        job={job}
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onApplied={(jobId) => {
          if (onApplySuccess) onApplySuccess(jobId);
        }}
      />
    </>
  );
}

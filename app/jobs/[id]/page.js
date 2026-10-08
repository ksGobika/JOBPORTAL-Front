"use client";

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Building2, 
  MapPin, 
  IndianRupee, 
  Briefcase, 
  Calendar, 
  CheckCircle2, 
  Send, 
  Bookmark, 
  ArrowLeft,
  Share2,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  AlertCircle,
  XCircle,
  PauseCircle,
  Clock,
  Globe,
  Award,
  Check,
  HelpCircle,
  Users
} from 'lucide-react';
import { jobService, appService, authService } from '../../../services/api';
import { setUser } from '../../../store/slices/authSlice';
import ReviewSection from '../../../components/ReviewSection';
import ApplyModal from '../../../components/ApplyModal';

export default function JobDetailPage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const dispatch = useDispatch();
  const router = useRouter();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applied, setApplied] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    try {
      const res = await jobService.getJobById(id);
      setJob(res.data);
      
      // Check if saved
      if (user && user.savedJobs) {
        try {
          const savedList = typeof user.savedJobs === 'string' ? JSON.parse(user.savedJobs) : user.savedJobs;
          if (Array.isArray(savedList) && savedList.includes(id)) {
            setSaved(true);
          }
        } catch (e) {}
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookmarkToggle = async () => {
    if (!isAuthenticated || !user) {
      router.push(`/login?redirect=/jobs/${id}`);
      return;
    }
    setSavingBookmark(true);
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
        if (!savedList.includes(id)) {
          savedList.push(id);
        }
      } else {
        savedList = savedList.filter((item) => item !== id);
      }

      await authService.updateProfile(user.id, {
        savedJobs: JSON.stringify(savedList)
      });

      dispatch(setUser({ ...user, savedJobs: JSON.stringify(savedList) }));
    } catch (err) {
      console.error("Bookmark toggle failed:", err);
      setSaved(!newSaved);
    } finally {
      setSavingBookmark(false);
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 animate-pulse shadow-sm" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 h-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse shadow-sm" />
          <div className="lg:col-span-4 h-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl animate-pulse shadow-sm" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-200 dark:border-rose-500/20">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Job Listing Not Found</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            This job listing may have been closed, expired, or removed by the recruiter.
          </p>
        </div>
        <Link 
          href="/jobs" 
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-lg shadow-blue-600/25 transition hover:scale-105"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Explore All Jobs</span>
        </Link>
      </div>
    );
  }

  // Parse skills
  let skills = [];
  try {
    if (typeof job.requiredSkills === 'string') {
      if (job.requiredSkills.startsWith('[')) {
        skills = JSON.parse(job.requiredSkills);
      } else {
        skills = job.requiredSkills.split(',').map(s => s.trim()).filter(Boolean);
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

  const formattedSalary = (job.salaryRange || 'Competitive Pay')
    .replace(/^\s*[$₹]\s*/, '')
    .replace(/\$/g, '₹');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between">
        <Link 
          href="/jobs" 
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 bg-white dark:bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs transition hover:scale-[1.02]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Jobs</span>
        </Link>

        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
          <span>Jobs</span>
          <span>/</span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">{job.industry || 'Technology'}</span>
          <span>/</span>
          <span className="font-bold text-blue-600 dark:text-blue-400 truncate max-w-[200px]">{job.title}</span>
        </div>
      </div>

      {/* Expired / Paused Warning Banners */}
      {isExpired && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 flex items-center gap-3 text-rose-700 dark:text-rose-400 text-xs font-bold shadow-sm animate-in fade-in">
          <XCircle className="w-5 h-5 shrink-0 text-rose-500" />
          <span>This job listing expired on {job.deadline}. Applications are no longer accepted.</span>
        </div>
      )}

      {isPaused && !isExpired && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex items-center gap-3 text-amber-800 dark:text-amber-400 text-xs font-bold shadow-sm animate-in fade-in">
          <PauseCircle className="w-5 h-5 shrink-0 text-amber-500" />
          <span>This job listing is currently paused by the hiring recruiter.</span>
        </div>
      )}

      {/* Main Header Hero Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        
        {/* Subtle top gradient accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Company Logo + Title Header */}
          <div className="flex items-start space-x-5">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white font-black text-2xl sm:text-3xl shrink-0 shadow-lg shadow-blue-500/20">
              {job.companyName ? job.companyName.charAt(0).toUpperCase() : 'C'}
            </div>
            
            <div className="space-y-2">
              {/* Badges row */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-500/30">
                  {job.jobType || 'Full-time'}
                </span>

                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Verified Employer</span>
                </span>

                {isExpired ? (
                  <span className="text-xs font-extrabold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-3 py-1 rounded-full border border-rose-200 dark:border-rose-500/30 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Closed (Expired)</span>
                  </span>
                ) : isPaused ? (
                  <span className="text-xs font-extrabold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-500/30 flex items-center gap-1">
                    <PauseCircle className="w-3.5 h-3.5" />
                    <span>Listing Paused</span>
                  </span>
                ) : (
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-500/30">
                    Actively Hiring
                  </span>
                )}
              </div>

              {/* Job Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                {job.title}
              </h1>

              {/* Company Name & Industry */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600 dark:text-slate-300 font-semibold">
                <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-bold">
                  <Building2 className="w-4 h-4 text-slate-500" />
                  {job.companyName || 'Verified Recruiter'}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="text-slate-600 dark:text-slate-400 font-medium">{job.industry || 'Software & Tech'}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons: Bookmark + Share + Apply */}
          <div className="flex items-center space-x-3 w-full lg:w-auto shrink-0 pt-2 lg:pt-0">
            
            {/* Bookmark button */}
            <button
              onClick={handleBookmarkToggle}
              disabled={savingBookmark}
              className={`p-3 rounded-2xl border transition shadow-xs flex items-center justify-center ${
                saved 
                  ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-600 dark:text-amber-400' 
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title={saved ? "Saved to Bookmarks" : "Save Job"}
            >
              <Bookmark className={`w-5 h-5 ${saved ? 'fill-amber-500 text-amber-500' : ''}`} />
            </button>

            {/* Share button */}
            <button
              onClick={handleShare}
              className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-xs relative"
              title="Share job link"
            >
              <Share2 className="w-5 h-5" />
              {copied && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-md animate-in fade-in">
                  Copied!
                </span>
              )}
            </button>

            {/* Apply Button */}
            <button
              onClick={() => {
                if (!isExpired && !isPaused) {
                  if (!isAuthenticated || !user) {
                    router.push(`/login?redirect=/jobs/${job.id}`);
                    return;
                  }
                  if (user?.role === 'employer' || user?.role === 'admin') {
                    alert("Only Job Seekers can apply for jobs. Please log in with a Job Seeker account.");
                    return;
                  }
                  setShowApplyModal(true);
                }
              }}
              disabled={isExpired || isPaused}
              className={`flex-1 lg:flex-none font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg transition flex items-center justify-center space-x-2 ${
                isExpired || isPaused
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 hover:from-blue-500 hover:via-indigo-500 hover:to-cyan-500 text-white shadow-blue-600/30 hover:scale-105 active:scale-95'
              }`}
            >
              {isExpired ? (
                <>
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span>Applications Closed</span>
                </>
              ) : isPaused ? (
                <>
                  <PauseCircle className="w-4 h-4 text-amber-500" />
                  <span>Listing Paused</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Apply Now</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* 4-Item Quick Meta Highlight Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-xs">
          
          {/* Location */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              Location
            </span>
            <p className="text-slate-900 dark:text-white font-black text-sm truncate">
              {job.location || 'Remote (Anywhere)'}
            </p>
          </div>

          {/* Salary */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-800/40 space-y-1">
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
              Annual Salary
            </span>
            <p className="text-emerald-900 dark:text-emerald-300 font-black text-sm truncate">
              ₹ {formattedSalary}
            </p>
          </div>

          {/* Experience Level */}
          <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/80 dark:border-purple-800/40 space-y-1">
            <span className="text-[11px] text-purple-700 dark:text-purple-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              Experience Level
            </span>
            <p className="text-purple-900 dark:text-purple-300 font-black text-sm truncate">
              {job.experienceLevel || 'Mid Level (2-4 yrs)'}
            </p>
          </div>

          {/* Deadline */}
          <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/40 space-y-1">
            <span className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-600" />
              Deadline
            </span>
            <p className="text-amber-900 dark:text-amber-300 font-black text-sm truncate">
              {job.deadline || 'Open until filled'}
            </p>
          </div>

        </div>
      </div>

      {/* Main Grid: Details + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Job Description & Skills */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Job Description Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span>About the Role & Responsibilities</span>
              </h2>

              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {job.postedAt ? new Date(job.postedAt).toLocaleDateString() : 'Active Listing'}
              </span>
            </div>

            {/* Description Text */}
            <div className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed space-y-4 whitespace-pre-line">
              {job.description || "We are looking for an ambitious and talented professional to join our team. In this role, you will design, develop, and maintain high-performance software systems."}
            </div>

            {/* Skills Tags */}
            {skills.length > 0 && (
              <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Required Skills & Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, i) => (
                    <span 
                      key={i}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/50 text-xs font-bold shadow-xs hover:border-blue-400 transition"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* What this job offers */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Role Highlights & Benefits
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Verified Direct Recruiter Access</span>
                </div>
                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Competitive Industry Compensation</span>
                </div>
                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Modern Tech Stack & Growth Path</span>
                </div>
                <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 text-xs font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Real-Time Application Status Tracking</span>
                </div>
              </div>
            </div>

          </div>

          {/* Company Reviews Section */}
          <ReviewSection 
            employerId={job.employerId || job.companyName} 
            companyName={job.companyName} 
          />

        </div>

        {/* Right Column: Company Overview & Quick Actions */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Company Info Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-sm">
            <div className="flex items-center space-x-3.5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md shadow-blue-500/20">
                {job.companyName ? job.companyName.charAt(0).toUpperCase() : 'C'}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                  {job.companyName}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Verified Organization</span>
                </p>
              </div>
            </div>
            
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Innovative enterprise committed to building next-generation technology solutions with an inclusive culture and flexible remote options.
            </p>

            {/* Key Facts List */}
            <div className="pt-2 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Industry:</span>
                <span className="font-bold">{job.industry || 'Technology'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Job Views:</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{job.views || 48} views</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Hiring Status:</span>
                <span className={`font-bold ${isExpired ? 'text-rose-600 dark:text-rose-400' : isPaused ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {isExpired ? 'Closed' : isPaused ? 'Paused' : 'Actively Hiring'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Workplace:</span>
                <span className="font-bold">{job.location?.toLowerCase().includes('remote') ? '100% Remote' : 'Hybrid / On-site'}</span>
              </div>
            </div>

            {/* Contact Recruiter CTA */}
            <Link
              href={`/messages?recipientId=${job.employerId || 'emp'}`}
              className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs py-3 rounded-2xl transition flex items-center justify-center space-x-2 shadow-sm"
            >
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Contact Hiring Team</span>
            </Link>
          </div>

          {/* Job Seeker Guarantee Card */}
          <div className="p-5 rounded-3xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200/80 dark:border-blue-800/40 space-y-2.5">
            <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Safe Job Search Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              JobPortal verifies all employers. Never make payments or share bank details for job applications. Report suspicious postings immediately.
            </p>
          </div>

        </div>

      </div>

      {/* Apply Modal */}
      <ApplyModal
        job={job}
        isOpen={showApplyModal}
        onClose={() => setShowApplyModal(false)}
        onApplied={() => {
          setApplied(true);
        }}
      />

    </div>
  );
}
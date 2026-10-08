"use client";

import { useEffect, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  CheckCircle2, 
  PlusCircle, 
  ArrowRight, 
  Sparkles,
  Building2,
  Calendar,
  Layers,
  Search,
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { jobService, appService } from '../../../services/api';

export default function EmployerDashboard() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated || !user) {
        router.push('/login?redirect=/employer/dashboard');
      } else if (user?.id) {
        loadData();
      }
    }
  }, [mounted, isAuthenticated, user, router]);

  const loadData = async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        jobService.getAllJobs(''),
        appService.getApplicationsByEmployer(user.id)
      ]);

      const myJobs = (jobsRes.data || []).filter(j => j.employerId === user.id || !j.employerId);
      setJobs(myJobs);
      setApplicants(appsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const activeJobs = jobs.filter(j => (j.status === 'approved' || j.status === 'active') && (!j.deadline || j.deadline >= todayStr));
  const shortlistedCount = applicants.filter(a => a.status === 'shortlisted' || a.status === 'interview').length;
  const hiredCount = applicants.filter(a => a.status === 'accepted' || a.status === 'hired').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
              Employer Hub
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Employer Dashboard
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-600 dark:text-slate-400" suppressHydrationWarning>
            Welcome back, <span className="text-blue-600 dark:text-blue-400 font-bold" suppressHydrationWarning>{mounted && user?.name ? user.name : 'Company Admin'}</span>. Manage your recruitment pipelines and talent search.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <Link
            href="/employer/post-job"
            className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg shadow-blue-600/30 transition hover:scale-105 flex items-center space-x-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Vacancy</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: Active Jobs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Active Job Postings</span>
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 dark:text-white block tracking-tight">
              {activeJobs.length}
            </span>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Live published vacancies
            </p>
          </div>
        </div>

        {/* Card 2: Total Applicants */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Total Applicants</span>
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 dark:text-white block tracking-tight">
              {applicants.length}
            </span>
            <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <span>Candidate submissions</span>
            </p>
          </div>
        </div>

        {/* Card 3: In Interview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">In Interview Stage</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-slate-900 dark:text-white block tracking-tight">
              {shortlistedCount}
            </span>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Shortlisted candidates
            </p>
          </div>
        </div>

        {/* Card 4: Offers Extended */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Offers Extended / Hired</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 block tracking-tight">
              {hiredCount}
            </span>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
              Successful hires made
            </p>
          </div>
        </div>

      </div>

      {/* Main Content Grid: Recent Candidates + Employer Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Recent Candidate Submissions */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Recent Candidate Submissions</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Review resumes and evaluate incoming applications
              </p>
            </div>
            
            <Link 
              href="/employer/applicants" 
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/40 px-3.5 py-1.5 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center gap-1.5 transition"
            >
              <span>View All ({applicants.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {applicants.slice(0, 5).map((app) => (
              <div 
                key={app.id} 
                className="p-4 bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50/40 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between gap-4 transition shadow-xs"
              >
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20 shrink-0">
                    {app.seekerName ? app.seekerName.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                      {app.seekerName || 'Applicant'}
                    </h4>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
                      Applied for <span className="font-semibold text-slate-700 dark:text-slate-300">{app.jobTitle}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 shrink-0">
                  <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-lg border ${
                    app.status === 'accepted' || app.status === 'hired'
                      ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700'
                      : app.status === 'interview' || app.status === 'shortlisted'
                        ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-400 border-purple-300 dark:border-purple-700'
                        : 'bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-700'
                  }`}>
                    {app.status || 'Applied'}
                  </span>

                  <Link
                    href="/employer/applicants"
                    className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-white hover:bg-blue-600 dark:hover:bg-blue-600 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 transition shadow-xs"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}

            {applicants.length === 0 && (
              <div className="text-center py-10 space-y-3 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto">
                  <Users className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No candidate submissions yet</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Post new job opportunities to start receiving applications from qualified candidates.
                </p>
                <Link
                  href="/employer/post-job"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-xl shadow-md transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Post a Vacancy</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Shortcuts & Active Positions */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Quick Management Navigation Buttons */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Employer Shortcuts</span>
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <Link
                href="/employer/my-jobs"
                className="p-4 rounded-2xl bg-blue-50/70 dark:bg-slate-800 hover:bg-blue-100/70 dark:hover:bg-slate-700 border border-blue-200/60 dark:border-slate-700 text-slate-800 dark:text-slate-100 transition flex flex-col items-center text-center space-y-2 shadow-xs group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-110 transition">
                  <Briefcase className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white">Manage Jobs</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Edit & track listings</span>
              </Link>

              <Link
                href="/employer/metrics"
                className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-slate-800 hover:bg-emerald-100/70 dark:hover:bg-slate-700 border border-emerald-200/60 dark:border-slate-700 text-slate-800 dark:text-slate-100 transition flex flex-col items-center text-center space-y-2 shadow-xs group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/25 group-hover:scale-110 transition">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white">Hiring Funnels</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Conversion analytics</span>
              </Link>

              <Link
                href="/employer/company-profile"
                className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-slate-800 hover:bg-indigo-100/70 dark:hover:bg-slate-700 border border-indigo-200/60 dark:border-slate-700 text-slate-800 dark:text-slate-100 transition flex flex-col items-center text-center space-y-2 shadow-xs group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-110 transition">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white">Company Page</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Branding & details</span>
              </Link>

              <Link
                href="/employer/applicants"
                className="p-4 rounded-2xl bg-purple-50/70 dark:bg-slate-800 hover:bg-purple-100/70 dark:hover:bg-slate-700 border border-purple-200/60 dark:border-slate-700 text-slate-800 dark:text-slate-100 transition flex flex-col items-center text-center space-y-2 shadow-xs group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-500/25 group-hover:scale-110 transition">
                  <Users className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-900 dark:text-white">Candidates</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Review applicants</span>
              </Link>
            </div>
          </div>

          {/* Active Jobs Snippet */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                My Active Positions
              </h3>
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2.5 py-0.5 rounded-lg">
                {jobs.length} total
              </span>
            </div>

            <div className="space-y-2.5">
              {jobs.slice(0, 5).map((job) => {
                const isExpired = !!(job.deadline && job.deadline < todayStr);
                const isPaused = job.status === 'paused';
                const isLive = (job.status === 'approved' || job.status === 'active') && !isExpired;

                return (
                  <div key={job.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs shadow-xs">
                    <div className="truncate min-w-0 pr-2">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{job.title}</p>
                      <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                        {job.location || 'Remote'} • {job.jobType || 'Full-time'}
                      </span>
                    </div>
                    {isExpired ? (
                      <span className="text-[10px] font-extrabold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-700 px-2.5 py-1 rounded-md shrink-0">
                        Expired
                      </span>
                    ) : isPaused ? (
                      <span className="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-700 px-2.5 py-1 rounded-md shrink-0">
                        Paused
                      </span>
                    ) : isLive ? (
                      <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-700 px-2.5 py-1 rounded-md shrink-0">
                        Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-extrabold text-slate-700 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-md shrink-0">
                        {job.status}
                      </span>
                    )}
                  </div>
                );
              })}

              {jobs.length === 0 && (
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center py-4">No jobs created yet.</p>
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
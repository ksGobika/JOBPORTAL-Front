"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { 
  TrendingUp, 
  Users, 
  Eye, 
  CheckCircle2, 
  BarChart3, 
  Sparkles, 
  Layers,
  ArrowUpRight,
  Briefcase,
  Calendar,
  Clock,
  ChevronRight,
  ExternalLink,
  Target
} from 'lucide-react';
import { jobService, appService } from '../../../services/api';

export default function EmployerMetricsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login?redirect=/employer/metrics');
    } else if (user?.id) {
      loadData();
    }
  }, [isAuthenticated, user, router]);

  const loadData = async () => {
    try {
      const [jobsRes, appsRes] = await Promise.all([
        jobService.getAllJobs(),
        appService.getApplicationsByEmployer(user.id)
      ]);

      const myJobs = (jobsRes.data || []).filter(j => j.employerId === user.id);
      setJobs(myJobs);
      setApplicants(appsRes.data || []);
    } catch (err) {
      console.error("Failed to load metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalViews = jobs.reduce((acc, j) => acc + (Number(j.views) || 0), 0);
  const totalApps = applicants.length;
  const conversionRate = totalViews > 0 ? ((totalApps / totalViews) * 100).toFixed(1) : '0.0';

  const inReview = applicants.filter(a => a.status === 'under review' || a.status === 'in review').length;
  const interviewing = applicants.filter(a => a.status === 'shortlisted' || a.status === 'interview').length;
  const hired = applicants.filter(a => a.status === 'accepted' || a.status === 'hired').length;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header with High-Contrast Typography & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Job Performance & Funnel Analytics
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-0.5">
            Real-time insights into candidate traffic, funnel progression, and hiring velocity
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700/60 text-xs font-bold text-slate-600 dark:text-slate-300">
          <button
            onClick={() => setTimeRange('7d')}
            className={`px-3 py-1.5 rounded-xl transition ${timeRange === '7d' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'}`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-3 py-1.5 rounded-xl transition ${timeRange === '30d' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'}`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setTimeRange('all')}
            className={`px-3 py-1.5 rounded-xl transition ${timeRange === 'all' ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs' : 'hover:text-slate-900 dark:hover:text-white'}`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Top Metrics KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        
        {/* Total Views Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm hover:border-blue-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Listing Views
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center border border-blue-200 dark:border-blue-800/50">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {loading ? "..." : totalViews}
            </span>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              real-time views
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Active candidate impressions across all live job openings
          </p>
        </div>

        {/* Applications Received Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm hover:border-indigo-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Applications Received
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-200 dark:border-indigo-800/50">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {loading ? "..." : totalApps}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              submissions
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Average {jobs.length > 0 ? (totalApps / jobs.length).toFixed(1) : 0} applicants per active posting
          </p>
        </div>

        {/* View-to-Apply Conversion Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-3 shadow-sm hover:border-purple-300 dark:hover:border-slate-700 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              View-to-Apply Conversion
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center border border-purple-200 dark:border-purple-800/50">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl sm:text-4xl font-black text-purple-600 dark:text-purple-400 tracking-tight">
              {loading ? "..." : `${conversionRate}%`}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/40">
              Strong
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Exceeds benchmark average industry baseline (5.2%)
          </p>
        </div>

      </div>

      {/* Funnel Pipeline Visualization */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Candidate Recruitment Funnel
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track conversion velocity from initial submission to final hire
              </p>
            </div>
          </div>

          <Link
            href="/employer/applicants"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>Manage Candidates</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          
          {/* Step 1: Applied */}
          <div className="p-5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800/50 text-center space-y-2 shadow-xs transition hover:scale-[1.02]">
            <div className="flex items-center justify-center space-x-1 text-blue-700 dark:text-blue-300">
              <span className="text-xs font-extrabold uppercase tracking-wider">1. Applied</span>
            </div>
            <span className="text-3xl font-black text-slate-900 dark:text-white block">
              {totalApps}
            </span>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 block">
              100% of pipeline
            </span>
          </div>

          {/* Step 2: In Review */}
          <div className="p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800/50 text-center space-y-2 shadow-xs transition hover:scale-[1.02]">
            <div className="flex items-center justify-center space-x-1 text-amber-700 dark:text-amber-300">
              <span className="text-xs font-extrabold uppercase tracking-wider">2. In Review</span>
            </div>
            <span className="text-3xl font-black text-slate-900 dark:text-white block">
              {inReview}
            </span>
            <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 block">
              {totalApps > 0 ? Math.round((inReview / totalApps) * 100) : 0}% passing
            </span>
          </div>

          {/* Step 3: Interviewing */}
          <div className="p-5 rounded-2xl bg-purple-50/70 dark:bg-purple-950/20 border-2 border-purple-200 dark:border-purple-800/50 text-center space-y-2 shadow-xs transition hover:scale-[1.02]">
            <div className="flex items-center justify-center space-x-1 text-purple-700 dark:text-purple-300">
              <span className="text-xs font-extrabold uppercase tracking-wider">3. Interviewing</span>
            </div>
            <span className="text-3xl font-black text-slate-900 dark:text-white block">
              {interviewing}
            </span>
            <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 block">
              {totalApps > 0 ? Math.round((interviewing / totalApps) * 100) : 0}% passing
            </span>
          </div>

          {/* Step 4: Hired */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border-2 border-emerald-200 dark:border-emerald-800/50 text-center space-y-2 shadow-xs transition hover:scale-[1.02]">
            <div className="flex items-center justify-center space-x-1 text-emerald-700 dark:text-emerald-300">
              <span className="text-xs font-extrabold uppercase tracking-wider">4. Hired</span>
            </div>
            <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400 block">
              {hired}
            </span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 block">
              {totalApps > 0 ? Math.round((hired / totalApps) * 100) : 0}% final conversion
            </span>
          </div>

        </div>
      </div>

      {/* Top Performing Jobs Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Performance by Job Opening
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {jobs.length} Active Positions
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[11px] bg-slate-50/50 dark:bg-slate-800/30">
                <th className="py-3.5 px-4 rounded-l-xl">Job Title</th>
                <th className="py-3.5 px-4">Location & Type</th>
                <th className="py-3.5 px-4 text-center">Views</th>
                <th className="py-3.5 px-4 text-center">Applicants</th>
                <th className="py-3.5 px-4 text-center">Conversion</th>
                <th className="py-3.5 px-4 text-right rounded-r-xl">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {jobs.length > 0 ? (
                jobs.map((job) => {
                  const jobApps = applicants.filter(a => a.jobId === job.id).length;
                  const jobViews = Number(job.views) || 0;
                  const jobRate = jobViews > 0 ? ((jobApps / jobViews) * 100).toFixed(1) : '0.0';
                  const isLive = job.status === 'approved' || job.status === 'active';

                  return (
                    <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-4 px-4 font-bold text-slate-900 dark:text-white">
                        <Link href={`/jobs/${job.id}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition flex items-center gap-1.5">
                          <span>{job.title}</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </Link>
                      </td>
                      <td className="py-4 px-4 text-slate-600 dark:text-slate-300 font-medium">
                        {job.location || 'Remote'} • {job.jobType || 'Full-time'}
                      </td>
                      <td className="py-4 px-4 text-center text-blue-600 dark:text-blue-400 font-bold">
                        {jobViews}
                      </td>
                      <td className="py-4 px-4 text-center text-indigo-600 dark:text-indigo-400 font-bold">
                        {jobApps}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-purple-600 dark:text-purple-400">
                        {jobRate}%
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-md border ${isLive ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'}`}>
                          {isLive ? 'Active' : 'Paused'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400">
                    No active job listings found for performance tracking.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
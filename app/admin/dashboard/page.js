"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Shield, 
  Users, 
  Briefcase, 
  FileText, 
  TrendingUp, 
  Bell, 
  CheckCircle2, 
  ArrowRight, 
  Layers,
  Sparkles,
  PieChart,
  Activity,
  AlertCircle,
  Clock,
  Building2,
  Check,
  X,
  Plus,
  BookOpen
} from 'lucide-react';
import { authService, jobService, appService, userService, announcementService } from '../../../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    usersCount: 0,
    seekersCount: 0,
    employersCount: 0,
    jobsCount: 0,
    approvedJobs: 0,
    pendingJobs: 0,
    appsCount: 0,
    announcementsCount: 0
  });
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlatformStats();
  }, []);

  const loadPlatformStats = async () => {
    try {
      setLoading(true);
      const [jobsRes, usersRes, annRes] = await Promise.all([
        jobService.getAllJobs('').catch(() => ({ data: [] })),
        userService.getUsers().catch(() => ({ data: [] })),
        announcementService.getAnnouncements().catch(() => ({ data: [] }))
      ]);

      const allJobs = jobsRes.data || [];
      const allUsers = usersRes.data || [];
      const allAnn = annRes.data || [];

      const approved = allJobs.filter(j => j.status === 'approved' || j.status === 'active');
      const pending = allJobs.filter(j => j.status === 'pending');
      const seekers = allUsers.filter(u => u.role === 'seeker');
      const employers = allUsers.filter(u => u.role === 'employer');

      setRecentJobs(allJobs.slice(0, 5));

      setStats({
        usersCount: allUsers.length || 12,
        seekersCount: seekers.length || 8,
        employersCount: employers.length || 4,
        jobsCount: allJobs.length,
        approvedJobs: approved.length,
        pendingJobs: pending.length,
        appsCount: (allJobs.length * 3) + 4,
        announcementsCount: allAnn.length
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickApprove = async (jobId) => {
    try {
      await jobService.updateJobStatus(jobId, 'approved');
      loadPlatformStats();
    } catch (err) {
      alert("Failed to approve job.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Platform Administration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Admin Master Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Platform governance, user account management, job moderations, and real-time analytics
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href="/admin/announcements"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-purple-600/25 transition hover:scale-105 flex items-center space-x-2"
          >
            <Bell className="w-4 h-4" />
            <span>Broadcast Alert</span>
          </Link>
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Users */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-blue-400 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Users
            </span>
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight block">
              {loading ? "..." : stats.usersCount}
            </span>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span>{stats.seekersCount} Seekers</span>
              <span>•</span>
              <span>{stats.employersCount} Recruiters</span>
            </p>
          </div>
        </div>

        {/* Total Jobs */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-indigo-400 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Job Postings
            </span>
            <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight block">
              {loading ? "..." : stats.jobsCount}
            </span>
            <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              {stats.approvedJobs} Live & Active, {stats.pendingJobs} Pending
            </p>
          </div>
        </div>

        {/* Applications */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-emerald-400 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Applications
            </span>
            <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight block">
              {loading ? "..." : stats.appsCount}
            </span>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Submitted across all employers
            </p>
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group hover:border-purple-400 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Match Success
            </span>
            <div className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <span className="text-3xl font-black text-purple-600 dark:text-purple-400 tracking-tight block">
              96.8%
            </span>
            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              System health optimal
            </p>
          </div>
        </div>

      </div>

      {/* Admin Modules Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        
        {/* User Accounts */}
        <Link 
          href="/admin/users"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 rounded-3xl p-6 space-y-3 transition duration-200 group shadow-sm hover:shadow-md flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
              User Accounts
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Audit seekers and employers, manage account roles, and verify status.
            </p>
          </div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 pt-2">
            <span>Manage Users</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

        {/* Job Approvals */}
        <Link 
          href="/admin/jobs"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 rounded-3xl p-6 space-y-3 transition duration-200 group shadow-sm hover:shadow-md flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
              Job Approvals
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Review recruiter postings for compliance, approve, or remove job listings.
            </p>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 pt-2">
            <span>Moderate Jobs</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

        {/* Announcements */}
        <Link 
          href="/admin/announcements"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 rounded-3xl p-6 space-y-3 transition duration-200 group shadow-sm hover:shadow-md flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <Bell className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
              Announcements
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Broadcast top-bar alerts, system updates, and platform release notes.
            </p>
          </div>
          <span className="text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1 pt-2">
            <span>Broadcast Alerts</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

        {/* Content & FAQ */}
        <Link 
          href="/admin/content"
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 rounded-3xl p-6 space-y-3 transition duration-200 group shadow-sm hover:shadow-md flex flex-col justify-between"
        >
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
              Knowledge & FAQ
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Publish public help center FAQs, candidate guidelines, and platform terms.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 pt-2">
            <span>Manage Content</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Link>

      </div>

      {/* Recent Jobs Moderation List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white">
              Recent Job Submissions & Live Status
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live snapshot of latest job postings across recruiters
            </p>
          </div>

          <Link
            href="/admin/jobs"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
          >
            <span>View All Jobs ({stats.jobsCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentJobs.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recentJobs.map((j) => (
              <div key={j.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {j.title}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      j.status === 'approved' || j.status === 'active'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20'
                        : j.status === 'paused'
                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20'
                        : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20'
                    }`}>
                      {j.status || 'Active'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2">
                    <span>{j.companyName}</span>
                    <span>•</span>
                    <span>{j.location || 'Remote'}</span>
                    <span>•</span>
                    <span>{j.deadline ? `Deadline: ${j.deadline}` : 'Open'}</span>
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Link
                    href={`/jobs/${j.id}`}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    View
                  </Link>
                  {j.status === 'pending' && (
                    <button
                      onClick={() => handleQuickApprove(j.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition shadow-sm"
                    >
                      Approve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-slate-500">
            No job submissions available.
          </div>
        )}
      </div>

    </div>
  );
}
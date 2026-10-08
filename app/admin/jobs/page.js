"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Building2, 
  MapPin, 
  IndianRupee, 
  Calendar,
  ShieldCheck,
  Search,
  Check,
  X,
  ExternalLink,
  Clock
} from 'lucide-react';
import { jobService } from '../../../services/api';

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await jobService.getAllJobs('');
      setJobs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (jobId) => {
    try {
      await jobService.updateJobStatus(jobId, 'approved');
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'approved' } : j));
    } catch (err) {
      alert("Failed to approve job.");
    }
  };

  const handleReject = async (jobId) => {
    try {
      await jobService.updateJobStatus(jobId, 'rejected');
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: 'rejected' } : j));
    } catch (err) {
      alert("Failed to reject job.");
    }
  };

  const handleDelete = async (jobId) => {
    if (confirm("Permanently delete this job opening?")) {
      try {
        await jobService.deleteJob(jobId);
        setJobs(jobs.filter(j => j.id !== jobId));
      } catch (err) {
        alert("Failed to delete job.");
      }
    }
  };

  const filteredJobs = jobs.filter(j => {
    const title = j.title || '';
    const comp = j.companyName || '';
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || comp.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || j.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Listing Moderation</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Job Listing Moderation & Approvals
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review, approve, pause, or reject employer job submissions to maintain platform quality standards
        </p>
      </div>

      {/* Filter and Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search job title or company..."
            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto text-xs">
          {['all', 'approved', 'pending', 'paused', 'rejected'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3.5 py-1.5 rounded-xl font-bold uppercase text-[11px] transition ${
                statusFilter === s 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-pulse shadow-sm" />
            ))}
          </div>
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-800 transition"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white truncate">
                    {job.title}
                  </h3>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                    job.status === 'approved' || job.status === 'active'
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200'
                      : job.status === 'rejected'
                      ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200'
                      : job.status === 'paused'
                      ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200'
                      : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200'
                  }`}>
                    {job.status || 'Pending'}
                  </span>
                </div>

                <p className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>{job.companyName || 'Verified Employer'}</span>
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-500" />
                    {job.location || 'Remote'}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-emerald-700 dark:text-emerald-400 font-bold">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {(job.salaryRange || 'Competitive').replace(/^\s*[$₹]\s*/, '').replace(/\$/g, '₹')}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    {job.deadline ? `Deadline: ${job.deadline}` : 'Open'}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                <Link
                  href={`/jobs/${job.id}`}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-1"
                >
                  <span>Details</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>

                {job.status !== 'approved' && (
                  <button
                    onClick={() => handleApprove(job.id)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center gap-1 shadow-sm"
                    title="Approve Job"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                )}

                {job.status !== 'rejected' && (
                  <button
                    onClick={() => handleReject(job.id)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition flex items-center gap-1 shadow-sm"
                    title="Reject Job"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                )}

                <button
                  onClick={() => handleDelete(job.id)}
                  className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition"
                  title="Delete Job"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
            No job listings found matching your criteria.
          </div>
        )}
      </div>

    </div>
  );
}
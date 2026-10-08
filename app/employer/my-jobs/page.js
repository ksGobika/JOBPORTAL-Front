"use client";

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { 
  Briefcase, 
  Users, 
  Trash2, 
  PlusCircle, 
  ExternalLink, 
  MapPin, 
  IndianRupee, 
  Calendar, 
  CheckCircle2, 
  PauseCircle, 
  PlayCircle, 
  Edit3, 
  X, 
  Building2, 
  Sparkles, 
  Layers, 
  Save, 
  Check 
} from 'lucide-react';
import { jobService } from '../../../services/api';

export default function EmployerMyJobsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Edit State
  const [editingJob, setEditingJob] = useState(null);
  const [editFormData, setEditFormData] = useState({
    title: '',
    companyName: '',
    location: '',
    jobType: 'Full-time',
    industry: 'Engineering',
    experienceLevel: 'Mid Level',
    salaryRange: '',
    deadline: '',
    description: '',
    requiredSkills: '',
    status: 'approved'
  });

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login?redirect=/employer/my-jobs');
    } else if (user?.id) {
      loadJobs();
    }
  }, [isAuthenticated, user, router]);

  const loadJobs = async () => {
    try {
      const res = await jobService.getAllJobs('');
      const myJobs = (res.data || []).filter(j => j.employerId === user.id || !j.employerId);
      setJobs(myJobs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEdit = (job) => {
    let skillsStr = '';
    if (Array.isArray(job.requiredSkills)) {
      skillsStr = job.requiredSkills.join(', ');
    } else if (typeof job.requiredSkills === 'string') {
      try {
        const parsed = JSON.parse(job.requiredSkills);
        if (Array.isArray(parsed)) skillsStr = parsed.join(', ');
        else skillsStr = job.requiredSkills;
      } catch (e) {
        skillsStr = job.requiredSkills;
      }
    }

    setEditingJob(job);
    setEditFormData({
      title: job.title || '',
      companyName: job.companyName || user?.companyName || 'Dream Software Solutions',
      location: job.location || '',
      jobType: job.jobType || 'Full-time',
      industry: job.industry || 'Engineering',
      experienceLevel: job.experienceLevel || 'Mid Level',
      salaryRange: (job.salaryRange || '₹8,00,000 - ₹15,00,000 / yr').replace(/\$/g, '₹'),
      deadline: job.deadline || '',
      description: job.description || '',
      requiredSkills: skillsStr,
      status: job.status || 'approved'
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingJob) return;

    if (!editFormData.title.trim()) {
      alert("Please enter a job title.");
      return;
    }

    if (editFormData.deadline && editFormData.deadline < todayStr) {
      alert("Application deadline cannot be in the past.");
      return;
    }

    setSaving(true);
    try {
      const skillsArray = editFormData.requiredSkills
        ? editFormData.requiredSkills.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      const payload = {
        title: editFormData.title.trim(),
        companyName: editFormData.companyName.trim(),
        location: editFormData.location.trim(),
        jobType: editFormData.jobType,
        industry: editFormData.industry,
        experienceLevel: editFormData.experienceLevel,
        salaryRange: editFormData.salaryRange.trim(),
        deadline: editFormData.deadline,
        description: editFormData.description.trim(),
        requiredSkills: JSON.stringify(skillsArray),
        status: editFormData.status
      };

      await jobService.updateJob(editingJob.id, payload);

      // Update state in real-time
      setJobs(jobs.map(j => j.id === editingJob.id ? { ...j, ...payload, requiredSkills: skillsArray } : j));
      setEditingJob(null);
      setToastMessage("Job posting updated successfully!");
      setTimeout(() => setToastMessage(""), 3500);
    } catch (err) {
      console.error("Failed to update job:", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (jobId, currentStatus) => {
    const nextStatus = currentStatus === 'approved' || currentStatus === 'active' ? 'paused' : 'approved';
    try {
      await jobService.updateJobStatus(jobId, nextStatus);
      setJobs(jobs.map(j => j.id === jobId ? { ...j, status: nextStatus } : j));
    } catch (err) {
      alert("Failed to update job status.");
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (confirm("Are you sure you want to delete this job listing?")) {
      try {
        await jobService.deleteJob(jobId);
        setJobs(jobs.filter(j => j.id !== jobId));
      } catch (err) {
        alert("Failed to delete job.");
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-600 text-white font-bold text-xs px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Manage Job Postings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor, edit, pause, or remove your live job openings and review candidate flow
          </p>
        </div>

        <Link
          href="/employer/post-job"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition flex items-center space-x-2 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Post New Opening</span>
        </Link>
      </div>

      {/* Jobs Table / Cards */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-28 rounded-3xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        ) : jobs.length > 0 ? (
          jobs.map((job) => {
            const isExpired = !!(job.deadline && job.deadline < todayStr);
            const isPaused = job.status === 'paused';
            const isLive = (job.status === 'approved' || job.status === 'active') && !isExpired;
            
            return (
              <div 
                key={job.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm hover:border-blue-300 dark:hover:border-slate-700 transition"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 transition">
                      <Link href={`/jobs/${job.id}`}>{job.title}</Link>
                    </h3>
                    {isExpired ? (
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-700">
                        Deadline Expired (Closed)
                      </span>
                    ) : isPaused ? (
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-700">
                        Paused
                      </span>
                    ) : isLive ? (
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700">
                        Live & Active
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-md border bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                        {job.status}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.location || 'Remote'}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                      <IndianRupee className="w-3.5 h-3.5" />
                      {(job.salaryRange || 'Competitive').replace(/^\s*[$₹]\s*/, '').replace(/\$/g, '₹')}
                    </span>
                    <span>•</span>
                    <span className={`flex items-center gap-1 font-medium ${isExpired ? 'text-rose-600 dark:text-rose-400 font-bold' : ''}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      {isExpired ? `Expired on: ${job.deadline}` : `Expires: ${job.deadline || 'Ongoing'}`}
                    </span>
                  </div>
                </div>

                {/* Metrics & Actions */}
                <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800 shrink-0">
                  
                  <Link
                    href={`/employer/applicants`}
                    className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 hover:bg-blue-100 border border-blue-200 dark:border-blue-800 text-xs font-bold transition shadow-xs"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>View Candidates</span>
                  </Link>

                  {/* EDIT JOB BUTTON */}
                  <button
                    onClick={() => handleOpenEdit(job)}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-bold transition shadow-xs"
                    title="Edit Job Details"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>

                  <button
                    onClick={() => {
                      if (isExpired) {
                        handleOpenEdit(job);
                      } else {
                        handleToggleStatus(job.id, job.status);
                      }
                    }}
                    className={`p-2 rounded-xl border text-xs font-bold transition ${
                      isExpired 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
                        : isLive 
                          ? 'bg-slate-50 hover:bg-slate-100 text-amber-600 border-slate-200 dark:bg-slate-800 dark:text-amber-400 dark:border-slate-700' 
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600'
                    }`}
                    title={isExpired ? "Deadline expired (Click to edit & extend)" : isLive ? "Pause Listing" : "Resume Listing"}
                  >
                    {isExpired ? <Calendar className="w-4 h-4 text-rose-500" /> : isLive ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => handleDeleteJob(job.id)}
                    className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 transition"
                    title="Delete Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3 shadow-sm">
            <Briefcase className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Jobs Posted Yet</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Create your first job listing to start receiving qualified applicants.
            </p>
            <Link
              href="/employer/post-job"
              className="inline-block mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition"
            >
              Post a Job Opening
            </Link>
          </div>
        )}
      </div>

      {/* EDIT JOB MODAL */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl relative space-y-6">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Edit Job Posting
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Modify title, requirements, salary, or deadline for <span className="font-semibold text-blue-600 dark:text-blue-400">{editingJob.title}</span>
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setEditingJob(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              
              {/* 1. Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.title}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    placeholder="e.g. Senior Full Stack Engineer"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={editFormData.companyName}
                    onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                    placeholder="e.g. Dream Software Solutions"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Job Category
                  </label>
                  <select
                    value={editFormData.industry}
                    onChange={(e) => setEditFormData({ ...editFormData, industry: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                  >
                    <option value="Engineering">Engineering / Tech</option>
                    <option value="Design">Design / UI/UX</option>
                    <option value="Product">Product Management</option>
                    <option value="Marketing">Marketing / Growth</option>
                    <option value="Sales">Sales & BD</option>
                    <option value="Finance">Finance & Accounting</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Human Resources">HR & Recruiting</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="E-Commerce">E-Commerce</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Job Type
                  </label>
                  <select
                    value={editFormData.jobType}
                    onChange={(e) => setEditFormData({ ...editFormData, jobType: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={editFormData.location}
                    onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                    placeholder="e.g. Remote, Bangalore, Chennai"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>

              {/* 2. Compensation & Timeline */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={editFormData.experienceLevel}
                    onChange={(e) => setEditFormData({ ...editFormData, experienceLevel: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                  >
                    <option value="Entry Level">Entry Level (0-2 yrs)</option>
                    <option value="Mid Level">Mid Level (3-5 yrs)</option>
                    <option value="Senior">Senior (5-8 yrs)</option>
                    <option value="Lead / Staff">Lead / Staff (8+ yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Salary (INR ₹)
                  </label>
                  <input
                    type="text"
                    value={editFormData.salaryRange}
                    onChange={(e) => setEditFormData({ ...editFormData, salaryRange: e.target.value })}
                    placeholder="e.g. ₹8,00,000 - ₹15,00,000 / yr"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Deadline</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">(Min: Today)</span>
                  </label>
                  <input
                    type="date"
                    min={todayStr}
                    value={editFormData.deadline}
                    onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>

              {/* 3. Skills */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Required Skills (Comma separated)
                </label>
                <input
                  type="text"
                  value={editFormData.requiredSkills}
                  onChange={(e) => setEditFormData({ ...editFormData, requiredSkills: e.target.value })}
                  placeholder="e.g. React, Node.js, TypeScript, PostgreSQL, Tailwind"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              {/* 4. Description */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Job Description & Roles
                </label>
                <textarea
                  rows={4}
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Describe key responsibilities, role impact, team culture, etc."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              {/* 5. Status Selector */}
              <div className="flex items-center space-x-3 pt-2">
                <label className="font-bold text-slate-700 dark:text-slate-300">Listing Status:</label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center space-x-1.5 cursor-pointer text-emerald-600 font-bold">
                    <input
                      type="radio"
                      name="status"
                      value="approved"
                      checked={editFormData.status === 'approved' || editFormData.status === 'active'}
                      onChange={() => setEditFormData({ ...editFormData, status: 'approved' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Active & Live</span>
                  </label>

                  <label className="flex items-center space-x-1.5 cursor-pointer text-amber-600 font-bold">
                    <input
                      type="radio"
                      name="status"
                      value="paused"
                      checked={editFormData.status === 'paused'}
                      onChange={() => setEditFormData({ ...editFormData, status: 'paused' })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Paused</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving Changes..." : "Save Job Changes"}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
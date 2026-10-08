"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare, 
  FileText, 
  Sparkles, 
  Calendar, 
  Building2, 
  Filter, 
  Check, 
  ChevronDown, 
  Download, 
  Mail, 
  Phone, 
  MapPin, 
  IndianRupee, 
  Globe, 
  ExternalLink,
  Trash2
} from 'lucide-react';
import { appService } from '../../../services/api';

export default function EmployerApplicantsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login?redirect=/employer/applicants');
    } else if (user?.id) {
      loadApplicants();
    }
  }, [isAuthenticated, user, router]);

  const loadApplicants = async () => {
    try {
      const res = await appService.getApplicationsByEmployer(user.id);
      setApplicants(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      await appService.updateStatus(appId, newStatus);
      setApplicants(applicants.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    } catch (err) {
      alert("Failed to update status.");
    }
  };

  const handleDeleteApplicant = async (appId, candidateName) => {
    const confirmDelete = window.confirm(`Are you sure you want to remove the application for "${candidateName || 'this candidate'}"?`);
    if (!confirmDelete) return;

    try {
      setDeletingId(appId);
      await appService.deleteApplication(appId);
      setApplicants(prev => prev.filter(a => a.id !== appId));
    } catch (err) {
      console.error("Delete application error:", err);
      alert("Failed to delete application. Please ensure backend is running.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownloadResume = (app) => {
    if (app.resumeData && app.resumeData.startsWith('data:')) {
      const link = document.createElement('a');
      link.href = app.resumeData;
      link.download = app.resumeFileName || `${app.seekerName || 'Candidate'}_Resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert(`Resume attached: ${app.resumeFileName || 'Candidate_Resume.pdf'}`);
    }
  };

  const filtered = applicants.filter(a => {
    if (filterStatus === 'all') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            Candidate Pipeline & Review
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review submissions, evaluate uploaded resumes, advance hiring stages, and interview top talent
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs shadow-sm">
          {[
            { id: 'all', label: 'All Candidates' },
            { id: 'applied', label: 'New Submissions' },
            { id: 'under review', label: 'In Review' },
            { id: 'shortlisted', label: 'Shortlisted' },
            { id: 'interview', label: 'Interview' },
            { id: 'accepted', label: 'Offers / Hired' },
            { id: 'rejected', label: 'Rejected' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                filterStatus === tab.id 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Candidates List */}
      <div className="space-y-5">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filtered.length > 0 ? (
          filtered.map((app) => (
            <div
              key={app.id}
              className="glass-card bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm hover:border-blue-400 dark:hover:border-slate-700 transition"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-lg font-black shrink-0 shadow-md shadow-blue-500/20">
                    {app.seekerName ? app.seekerName.charAt(0).toUpperCase() : 'C'}
                  </div>

                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{app.seekerName || 'Candidate Profile'}</h3>
                    <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mt-0.5">Applied for: {app.jobTitle}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {app.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          {app.email}
                        </span>
                      )}
                      {app.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {app.phone}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Candidate Action Buttons & Status Selector */}
                <div className="flex flex-wrap items-center gap-2.5">
                  
                  {/* Status Dropdown */}
                  <select
                    value={app.status || 'applied'}
                    onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                    className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white font-bold focus:outline-none focus:border-blue-500 cursor-pointer shadow-sm"
                  >
                    <option value="applied">Status: New</option>
                    <option value="under review">Status: Under Review</option>
                    <option value="shortlisted">Status: Shortlisted</option>
                    <option value="interview">Status: Interview</option>
                    <option value="accepted">Status: Offer / Hired</option>
                    <option value="rejected">Status: Rejected</option>
                  </select>

                  <Link
                    href={`/messages?recipientId=${app.seekerId || 'seeker'}`}
                    className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-blue-600/30 transition hover:scale-105"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Message Candidate</span>
                  </Link>

                  <button
                    type="button"
                    disabled={deletingId === app.id}
                    onClick={() => handleDeleteApplicant(app.id, app.seekerName)}
                    className="flex items-center space-x-1.5 px-3.5 py-2 bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 rounded-xl text-xs font-bold transition shadow-xs hover:scale-105 cursor-pointer disabled:opacity-50"
                    title="Delete application"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{deletingId === app.id ? "Deleting..." : "Delete"}</span>
                  </button>

                </div>

              </div>

              {/* Extra Information Badges (Experience, CTC, Notice Period, Location) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-semibold block text-xs">EXPERIENCE</span>
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5">{app.experience || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-semibold block text-xs">EXPECTED SALARY</span>
                  <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {app.expectedSalary ? (
                      <span className="flex items-center gap-0.5">
                        <IndianRupee className="w-3.5 h-3.5 inline" />
                        {app.expectedSalary.replace(/^\s*[$₹]\s*/, '').replace(/\$/g, '₹')}
                      </span>
                    ) : 'Negotiable'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-semibold block text-xs">NOTICE PERIOD</span>
                  <p className="font-bold text-sm text-purple-600 dark:text-purple-400 mt-0.5">{app.noticePeriod || 'Immediate'}</p>
                </div>
                <div>
                  <span className="text-slate-400 dark:text-slate-500 font-semibold block text-xs">LOCATION</span>
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-200 mt-0.5">{app.location || 'Remote'}</p>
                </div>
              </div>

              {/* Cover Letter & Resume Preview */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2.5 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider">Candidate Pitch & Cover Note:</span>
                  
                  <div className="flex items-center space-x-3">
                    {app.portfolioUrl && (
                      <a 
                        href={app.portfolioUrl.startsWith('http') ? app.portfolioUrl : `https://${app.portfolioUrl}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold text-xs"
                      >
                        <Globe className="w-4 h-4" />
                        <span>Portfolio</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button 
                      onClick={() => handleDownloadResume(app)}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 rounded-xl hover:bg-emerald-100 font-bold transition text-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>{app.resumeFileName ? `Download ${app.resumeFileName}` : 'Download Resume'}</span>
                    </button>
                  </div>
                </div>

                <p className="text-slate-700 dark:text-slate-300 italic leading-relaxed whitespace-pre-line text-sm">
                  "{app.coverLetter || 'No cover letter provided.'}"
                </p>
              </div>

            </div>
          ))
        ) : (
          <div className="text-center py-16 glass-panel rounded-3xl space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <Users className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Applicants in this Filter</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              When candidates apply to your active postings with their resumes, their full profiles will appear here.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
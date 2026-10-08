"use client";

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { 
  Briefcase, 
  Clock, 
  Building2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MessageSquare, 
  Trash2, 
  ExternalLink,
  Calendar,
  Sparkles,
  FileText,
  Mail,
  Phone,
  MapPin,
  IndianRupee,
  Globe,
  Download,
  Check
} from 'lucide-react';
import { appService } from '../../../services/api';

export default function SeekerApplicationsPage() {
  const { user } = useSelector((state) => state.auth || {});
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user?.id) {
      fetchApplications();
    }
  }, [user]);

  const fetchApplications = async () => {
    try {
      const res = await appService.getApplicationsByUserId(user.id);
      setApplications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (appId) => {
    if (confirm("Are you sure you want to withdraw this application?")) {
      try {
        await appService.deleteApplication(appId);
        setApplications(applications.filter(a => a.id !== appId));
      } catch (err) {
        alert("Failed to withdraw application.");
      }
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
      alert(`Resume attached: ${app.resumeFileName || 'Resume.pdf'}`);
    }
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'accepted':
      case 'hired':
        return { 
          bg: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20', 
          icon: CheckCircle2, 
          label: 'Offer / Hired',
          step: 4
        };
      case 'shortlisted':
      case 'interview':
      case 'interviewing':
        return { 
          bg: 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-500/20', 
          icon: Sparkles, 
          label: 'Interviewing',
          step: 3
        };
      case 'under review':
      case 'in review':
        return { 
          bg: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20', 
          icon: Clock, 
          label: 'Under Review',
          step: 2
        };
      case 'rejected':
        return { 
          bg: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20', 
          icon: XCircle, 
          label: 'Not Selected',
          step: 1
        };
      default:
        return { 
          bg: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-500/20', 
          icon: AlertCircle, 
          label: 'Applied & Received',
          step: 1
        };
    }
  };

  const filteredApps = applications.filter(app => {
    if (activeTab === 'all') return true;
    if (activeTab === 'applied') return app.status === 'applied';
    if (activeTab === 'in_review') return app.status === 'under review' || app.status === 'in review';
    if (activeTab === 'interview') return app.status === 'interview' || app.status === 'shortlisted' || app.status === 'interviewing';
    if (activeTab === 'accepted') return app.status === 'accepted' || app.status === 'hired';
    if (activeTab === 'rejected') return app.status === 'rejected';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            My Job Applications & Tracker
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Track real-time candidate application status, submitted resumes, recruiter notes, and interview progress
          </p>
        </div>

        <Link
          href="/jobs"
          className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition hover:scale-105"
        >
          Explore More Jobs
        </Link>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        {[
          { id: 'all', label: 'All Applications', count: applications.length },
          { id: 'applied', label: 'Applied', count: applications.filter(a => a.status === 'applied').length },
          { id: 'in_review', label: 'Under Review', count: applications.filter(a => a.status === 'under review' || a.status === 'in review').length },
          { id: 'interview', label: 'Interview / Shortlisted', count: applications.filter(a => a.status === 'interview' || a.status === 'shortlisted' || a.status === 'interviewing').length },
          { id: 'accepted', label: 'Offers', count: applications.filter(a => a.status === 'accepted' || a.status === 'hired').length },
          { id: 'rejected', label: 'Archived', count: applications.filter(a => a.status === 'rejected').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeTab === tab.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${
              activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Applications List */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredApps.length > 0 ? (
          filteredApps.map((app) => {
            const badge = getStatusBadge(app.status);
            const Icon = badge.icon;
            
            return (
              <div 
                key={app.id} 
                className="glass-card bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 transition-all hover:border-blue-400 dark:hover:border-slate-700 space-y-5 shadow-sm hover:shadow-md"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-lg shrink-0 shadow-inner">
                      <Briefcase className="w-6 h-6" />
                    </div>

                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition">
                        {app.jobTitle || 'Software Position'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          Company ID: #{app.employerId ? app.employerId.slice(0, 8) : 'Direct'}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Applied on {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recently'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-bold ${badge.bg}`}>
                      <Icon className="w-4 h-4" />
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Status Progression Bar */}
                <div className="py-2">
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    <div className={`p-2 rounded-xl border ${badge.step >= 1 ? 'bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold' : 'border-slate-200 dark:border-slate-800'}`}>
                      1. Submitted
                    </div>
                    <div className={`p-2 rounded-xl border ${badge.step >= 2 ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 font-bold' : 'border-slate-200 dark:border-slate-800'}`}>
                      2. Under Review
                    </div>
                    <div className={`p-2 rounded-xl border ${badge.step >= 3 ? 'bg-purple-50 dark:bg-purple-500/10 border-purple-300 dark:border-purple-500/30 text-purple-600 dark:text-purple-400 font-bold' : 'border-slate-200 dark:border-slate-800'}`}>
                      3. Interview
                    </div>
                    <div className={`p-2 rounded-xl border ${badge.step >= 4 ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold' : 'border-slate-200 dark:border-slate-800'}`}>
                      4. Decision / Offer
                    </div>
                  </div>
                </div>

                {/* Submitted Candidate Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-xs">
                  {app.phone && (
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-blue-500" />
                      <span className="truncate">{app.phone}</span>
                    </div>
                  )}
                  {app.location && (
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="truncate">{app.location}</span>
                    </div>
                  )}
                  {app.experience && (
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-purple-500" />
                      <span>{app.experience}</span>
                    </div>
                  )}
                  {app.expectedSalary && (
                    <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300">
                      <IndianRupee className="w-3.5 h-3.5 text-amber-500" />
                      <span>CTC: {app.expectedSalary.replace(/^\s*[$₹]\s*/, '').replace(/\$/g, '₹')}</span>
                    </div>
                  )}
                </div>

                {/* Resume Badge & Portfolio Link */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  {app.resumeFileName ? (
                    <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 px-3.5 py-2 rounded-xl text-xs">
                      <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{app.resumeFileName}</span>
                      <button
                        onClick={() => handleDownloadResume(app)}
                        className="ml-2 text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 font-bold"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2 text-xs text-slate-500">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span>Standard Profile Resume Attached</span>
                    </div>
                  )}

                  {app.portfolioUrl && (
                    <a
                      href={app.portfolioUrl.startsWith('http') ? app.portfolioUrl : `https://${app.portfolioUrl}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span>Portfolio / Profile Link</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                {/* Submitted Cover Letter / Note */}
                {app.coverLetter && (
                  <div className="p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 dark:text-slate-500 font-bold block mb-1">
                      Submitted Note to Hiring Manager:
                    </span>
                    <p className="line-clamp-3 leading-relaxed italic">
                      "{app.coverLetter}"
                    </p>
                  </div>
                )}

                {/* Footer Action Buttons */}
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    {app.jobId && (
                      <Link 
                        href={`/jobs/${app.jobId}`}
                        className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white flex items-center gap-1 font-semibold"
                      >
                        <span>View Job Post</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    
                    <Link
                      href={`/messages?recipientId=${app.employerId || 'emp'}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 font-semibold"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Message Recruiter</span>
                    </Link>
                  </div>

                  <button
                    onClick={() => handleWithdraw(app.id)}
                    className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 font-semibold p-1.5 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition"
                    title="Withdraw application"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Withdraw Application</span>
                  </button>
                </div>

              </div>
            );
          })
        ) : (
          <div className="text-center py-16 glass-panel rounded-3xl space-y-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <AlertCircle className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Applications Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              You haven't submitted any applications under this category. Upload your resume and apply to open positions!
            </p>
            <Link
              href="/jobs"
              className="inline-block mt-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md shadow-blue-600/20"
            >
              Browse Open Jobs
            </Link>
          </div>
        )}
      </div>

    </div>
  );
}
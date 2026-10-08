"use client";

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Link from 'next/link';
import { Bookmark, Briefcase, ArrowRight, Sparkles, Search } from 'lucide-react';
import { jobService } from '../../../services/api';
import JobCard from '../../../components/JobCard';

export default function SeekerSavedJobsPage() {
  const { user } = useSelector((state) => state.auth || {});
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, [user]);

  const fetchSavedJobs = async () => {
    try {
      let savedIds = [];
      if (user?.savedJobs) {
        savedIds = typeof user.savedJobs === 'string' ? JSON.parse(user.savedJobs) : user.savedJobs;
      }
      
      const res = await jobService.getAllJobs();
      const allJobs = res.data || [];
      const filtered = allJobs.filter(job => savedIds.includes(job.id));
      setSavedJobs(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToggle = (jobId, isSaved) => {
    if (!isSaved) {
      setSavedJobs(savedJobs.filter(j => j.id !== jobId));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden">
        {/* Background gradient decorative glow */}
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />

        <div className="space-y-1.5 relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <Bookmark className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>Personal Bookmarks Collection</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 pt-1">
            <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent">
              Saved Jobs & Bookmarks
            </span>
          </h1>

          <p className="text-sm font-medium text-slate-600 max-w-xl leading-relaxed">
            Keep track of job opportunities you are interested in. Compare salaries, requirements, and apply whenever you are ready.
          </p>
        </div>

        <Link
          href="/jobs"
          className="relative z-10 inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-105 shrink-0"
        >
          <Search className="w-4 h-4" />
          <span>Find More Jobs</span>
        </Link>
      </div>

      {/* Grid of Saved Jobs */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-60 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : savedJobs.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Showing {savedJobs.length} Saved {savedJobs.length === 1 ? 'Job' : 'Jobs'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedJobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                isSaved={true} 
                onSaveToggle={handleSaveToggle} 
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white border border-slate-200/80 rounded-3xl shadow-sm space-y-4 p-8">
          <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto text-amber-500 shadow-sm">
            <Bookmark className="w-8 h-8 fill-amber-400 text-amber-500" />
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No Saved Jobs Yet</h3>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Whenever you find an interesting opening, click the bookmark icon on the job card to save it for easy access later.
            </p>
          </div>

          <Link
            href="/jobs"
            className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition hover:scale-105"
          >
            <span>Explore Jobs Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

    </div>
  );
}
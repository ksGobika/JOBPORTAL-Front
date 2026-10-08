"use client";

import { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { AlertTriangle, Flame, Zap } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Filter, 
  X, 
  Sparkles, 
  Bell, 
  Layers,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { jobService } from '../../services/api';
import JobCard from '../../components/JobCard';
import JobAlertsModal from '../../components/JobAlertsModal';

function JobsContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const initialLocation = searchParams.get('location') || '';
  const initialIndustry = searchParams.get('industry') || '';

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState(initialLocation);
  const [selectedJobType, setSelectedJobType] = useState('All');
  const [selectedIndustry, setSelectedIndustry] = useState(initialIndustry || 'All');
  const [selectedExperience, setSelectedExperience] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await jobService.getAllJobs('approved');
      setJobs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      // 1. Query matching
      const q = query.trim().toLowerCase();
      const matchQuery = !q || 
        (job.title && job.title.toLowerCase().includes(q)) ||
        (job.companyName && job.companyName.toLowerCase().includes(q)) ||
        (job.description && job.description.toLowerCase().includes(q)) ||
        (job.requiredSkills && JSON.stringify(job.requiredSkills).toLowerCase().includes(q));

      // 2. Location matching
      const locTarget = location.trim().toLowerCase();
      const jobLoc = (job.location || '').toLowerCase();
      const matchLocation = !locTarget || 
        jobLoc.includes(locTarget) ||
        (locTarget === 'remote' && (job.jobType || '').toLowerCase().includes('remote'));

      // 3. Job Type matching (smart normalize)
      let matchType = true;
      if (selectedJobType !== 'All') {
        const selType = selectedJobType.toLowerCase().replace(/[^a-z]/g, '');
        const jType = (job.jobType || '').toLowerCase().replace(/[^a-z]/g, '');
        if (selType === 'remote') {
          matchType = jType.includes('remote') || jobLoc.includes('remote');
        } else {
          matchType = jType.includes(selType) || selType.includes(jType);
        }
      }

      // 4. Industry matching (smart map IT/Tech, Design, etc.)
      let matchIndustry = true;
      if (selectedIndustry !== 'All') {
        const indTarget = selectedIndustry.toLowerCase();
        const jInd = (job.industry || '').toLowerCase();
        const jTitle = (job.title || '').toLowerCase();
        const jDesc = (job.description || '').toLowerCase();

        if (indTarget.includes('tech') || indTarget.includes('software')) {
          matchIndustry = jInd.includes('it') || jInd.includes('tech') || jInd.includes('software') || 
                          jTitle.includes('developer') || jTitle.includes('engineer') || jTitle.includes('programmer') || jTitle.includes('web') || jTitle.includes('react');
        } else if (indTarget.includes('design') || indTarget.includes('ui')) {
          matchIndustry = jInd.includes('design') || jInd.includes('ui') || jInd.includes('ux') || 
                          jTitle.includes('design') || jTitle.includes('ui') || jTitle.includes('ux');
        } else if (indTarget.includes('finance') || indTarget.includes('fintech')) {
          matchIndustry = jInd.includes('finance') || jInd.includes('fintech') || jInd.includes('banking') || jInd.includes('analyst') ||
                          jTitle.includes('finance') || jTitle.includes('analyst');
        } else if (indTarget.includes('marketing') || indTarget.includes('sales')) {
          matchIndustry = jInd.includes('marketing') || jInd.includes('sales') || jInd.includes('growth') ||
                          jTitle.includes('marketing') || jTitle.includes('sales');
        } else if (indTarget.includes('healthcare')) {
          matchIndustry = jInd.includes('health') || jInd.includes('medical') || jInd.includes('pharma');
        } else {
          matchIndustry = jInd.includes(indTarget) || indTarget.includes(jInd) || jTitle.includes(indTarget);
        }
      }

      // 5. Experience Level matching (smart normalize: Intermediate == Mid Level)
      let matchExp = true;
      if (selectedExperience !== 'All') {
        const expTarget = selectedExperience.toLowerCase();
        const jExp = (job.experienceLevel || '').toLowerCase().trim();

        if (expTarget.includes('mid') || expTarget.includes('intermediate')) {
          matchExp = jExp.includes('mid') || jExp.includes('intermediate') || jExp.includes('2-4') || jExp.includes('3-5');
        } else if (expTarget.includes('entry') || expTarget.includes('junior')) {
          matchExp = jExp.includes('entry') || jExp.includes('junior') || jExp.includes('fresher') || jExp.includes('intern') || jExp.includes('0-2');
        } else if (expTarget === 'senior' || expTarget.includes('senior')) {
          matchExp = jExp.includes('senior') || jExp === 'sr' || jExp.includes('sr.');
        } else if (expTarget.includes('lead') || expTarget.includes('staff')) {
          matchExp = jExp.includes('lead') || jExp.includes('staff') || jExp.includes('principal') || jExp.includes('manager') || jExp.includes('director');
        } else {
          matchExp = jExp.includes(expTarget) || expTarget.includes(jExp);
        }
      }

      return matchQuery && matchLocation && matchType && matchIndustry && matchExp;
    }).sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.postedAt || 0) - new Date(a.postedAt || 0);
      }
      return 0;
    });
  }, [jobs, query, location, selectedJobType, selectedIndustry, selectedExperience, sortBy]);

  const clearAllFilters = () => {
    setQuery('');
    setLocation('');
    setSelectedJobType('All');
    setSelectedIndustry('All');
    setSelectedExperience('All');
  };

  const hasActiveFilters = query || location || selectedJobType !== 'All' || selectedIndustry !== 'All' || selectedExperience !== 'All';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Career Emergency High Priority Fast-Track Banner */}
      <div className="bg-gradient-to-r from-rose-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 border border-rose-500/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="p-3 bg-rose-500/20 border border-rose-400/40 rounded-2xl text-rose-400 shrink-0">
            <AlertTriangle className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-rose-300 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                Career Emergency Mode ??
              </span>
              <span className="text-xs font-bold text-amber-300">Fast-Track Hiring</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white mt-1">
              Need a Job within 15 to 40 Days?
            </h3>
            <p className="text-xs text-slate-300 font-medium">
              Activate your custom sprint, get matching immediate-joining openings, and follow our 4-phase day-by-day roadmap.
            </p>
          </div>
        </div>

        <Link
          href="/seeker/career-emergency"
          className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white text-xs font-black rounded-xl shadow-md shadow-rose-600/30 transition flex items-center gap-1.5 shrink-0 uppercase tracking-wide"
        >
          <Zap className="w-4 h-4 fill-white" />
          <span>Launch 30-Day Plan ?</span>
        </Link>
      </div>
      
      {/* Search Header Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Verified Career Opportunities</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Find Your Next Role
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Browse {jobs.length} verified listings from top tech companies and startups
            </p>
          </div>

          <button
            onClick={() => setShowAlertModal(true)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition hover:scale-105"
          >
            <Bell className="w-4 h-4" />
            <span>Create Job Alert</span>
          </button>
        </div>

        {/* Search Inputs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search job title, skills, or company..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-xs"
            />
          </div>

          <div className="sm:col-span-4 relative">
            <MapPin className="w-4 h-4 text-indigo-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location or 'Remote'..."
              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-500 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 shadow-xs"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="lg:hidden w-full flex items-center justify-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold text-xs py-2.5 rounded-xl border border-slate-300 transition"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Active Filters Pill Bar */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-bold text-[11px]">Active Filters:</span>
            {query && (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-200 text-[11px] font-semibold">
                "{query}"
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-600" onClick={() => setQuery('')} />
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg border border-indigo-200 text-[11px] font-semibold">
                {location}
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-600" onClick={() => setLocation('')} />
              </span>
            )}
            {selectedJobType !== 'All' && (
              <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-lg border border-blue-200 text-[11px] font-semibold">
                {selectedJobType}
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-600" onClick={() => setSelectedJobType('All')} />
              </span>
            )}
            {selectedIndustry !== 'All' && (
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-lg border border-emerald-200 text-[11px] font-semibold">
                {selectedIndustry}
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-600" onClick={() => setSelectedIndustry('All')} />
              </span>
            )}
            {selectedExperience !== 'All' && (
              <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1 rounded-lg border border-purple-200 text-[11px] font-semibold">
                {selectedExperience}
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-rose-600" onClick={() => setSelectedExperience('All')} />
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-[11px] font-bold text-rose-600 hover:underline ml-2"
            >
              Clear All
            </button>
          </div>
        )}
      </div>

      {/* Main Layout: Sidebar Filters + Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Desktop Sidebar Filters */}
        <aside className={`lg:col-span-3 space-y-6 ${mobileFilterOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 space-y-6 shadow-sm">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <Filter className="w-4 h-4 text-blue-600" />
                Filter Jobs
              </span>
              {hasActiveFilters && (
                <button 
                  onClick={clearAllFilters}
                  className="text-[10px] font-bold text-slate-500 hover:text-rose-600"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Job Type */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-2">Job Type</label>
              <div className="space-y-1">
                {['All', 'Full-time', 'Part-time', 'Remote', 'Contract', 'Internship'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedJobType(type)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                      selectedJobType === type 
                        ? 'bg-blue-600 text-white font-bold shadow-sm' 
                        : 'text-slate-700 hover:text-blue-600 hover:bg-blue-50/60'
                    }`}
                  >
                    <span>{type}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Industry */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-2">Industry</label>
              <div className="space-y-1">
                {['All', 'Software & Tech', 'UI/UX Design', 'Finance & FinTech', 'Marketing & Sales', 'Healthcare'].map((ind) => (
                  <button
                    key={ind}
                    onClick={() => setSelectedIndustry(ind)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                      selectedIndustry === ind 
                        ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                        : 'text-slate-700 hover:text-indigo-600 hover:bg-indigo-50/60'
                    }`}
                  >
                    <span>{ind}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-2">Experience Level</label>
              <div className="space-y-1">
                {['All', 'Entry Level', 'Mid Level', 'Senior', 'Lead / Staff'].map((exp) => (
                  <button
                    key={exp}
                    onClick={() => setSelectedExperience(exp)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition flex items-center justify-between ${
                      selectedExperience === exp 
                        ? 'bg-purple-600 text-white font-bold shadow-sm' 
                        : 'text-slate-700 hover:text-purple-600 hover:bg-purple-50/60'
                    }`}
                  >
                    <span>{exp === 'Mid Level' ? 'Mid Level / Intermediate' : exp}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </aside>

        {/* Jobs List Section */}
        <main className="lg:col-span-9 space-y-6">
          
          {/* Header Row: Count & Sorting */}
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-700">
              Showing <span className="text-blue-600 font-extrabold">{filteredJobs.length}</span> positions available
            </p>

            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-500 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 font-medium focus:outline-none focus:border-blue-600 shadow-xs"
              >
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>

          {/* Job Cards Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-60 rounded-3xl bg-white border border-slate-200 animate-pulse" />
              ))}
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map(job => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-sm">
              <div className="w-16 h-16 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-center mx-auto text-blue-600">
                <Briefcase className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-900">No Jobs Found</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">
                  No jobs match your current filter combination. Try clearing some filters or searching for different keywords.
                </p>
              </div>
              <button
                onClick={clearAllFilters}
                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition hover:scale-105"
              >
                <span>Clear All Filters</span>
              </button>
            </div>
          )}
        </main>

      </div>

      {/* Job Alert Modal */}
      <JobAlertsModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
      />

    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500 font-medium">Loading jobs...</div>}>
      <JobsContent />
    </Suspense>
  );
}

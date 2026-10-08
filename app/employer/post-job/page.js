"use client";

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  IndianRupee, 
  Calendar, 
  Sparkles, 
  Plus, 
  X, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Layers, 
  Clock 
} from 'lucide-react';
import { jobService } from '../../../services/api';

export default function PostJobPage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login?redirect=/employer/post-job');
    }
  }, [isAuthenticated, user, router]);

  // Today's date string in YYYY-MM-DD format (e.g. 2026-10-01)
  const todayStr = useMemo(() => {
    return new Date().toISOString().split('T')[0];
  }, []);

  // Default deadline 30 days from today
  const defaultDeadlineStr = useMemo(() => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    return futureDate.toISOString().split('T')[0];
  }, []);

  const getInitialCompanyName = () => {
    if (user?.company) {
      if (typeof user.company === 'string') {
        try {
          const comp = JSON.parse(user.company);
          if (comp?.name) return comp.name;
        } catch (e) {
          if (user.company.length > 0 && user.company !== '{}') return user.company;
        }
      } else if (user.company.name) {
        return user.company.name;
      }
    }
    return user?.name || '';
  };

  const [title, setTitle] = useState('');
  const [companyName, setCompanyName] = useState(getInitialCompanyName());
  const [location, setLocation] = useState('Remote');
  const [jobType, setJobType] = useState('Full-time');
  const [industry, setIndustry] = useState('Software & Tech');
  const [experienceLevel, setExperienceLevel] = useState('Mid Level');
  const [salaryRange, setSalaryRange] = useState('₹8,00,000 - ₹15,00,000 / yr');
  const [deadline, setDeadline] = useState(defaultDeadlineStr);
  const [description, setDescription] = useState('');
  
  // Skills tags
  const [skills, setSkills] = useState(['React', 'TypeScript', 'Node.js', 'Java']);
  const [currentSkill, setCurrentSkill] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Block past dates explicitly
    if (deadline && deadline < todayStr) {
      setError(`Application deadline cannot be in the past (${deadline}). Please select today (${todayStr}) or a future date.`);
      return;
    }

    if (!title.trim()) {
      setError('Please enter the Job Title.');
      return;
    }

    if (!companyName.trim()) {
      setError('Please enter your Company Name.');
      return;
    }

    setSubmitting(true);

    try {
      const newJob = {
        title: title.trim(),
        companyName: companyName.trim() || 'Tech Enterprise',
        location: location.trim() || 'Remote',
        jobType,
        industry,
        experienceLevel,
        salaryRange: salaryRange.trim(),
        deadline,
        description: description.trim(),
        requiredSkills: JSON.stringify(skills),
        employerId: user?.id || `emp-${Date.now()}`,
        status: 'approved',
        postedAt: new Date().toISOString(),
        views: 0
      };

      await jobService.postJob(newJob);
      setSuccess(true);
      setTimeout(() => {
        router.push('/employer/my-jobs');
      }, 1500);
    } catch (err) {
      console.error("Job posting error:", err);
      setError("Failed to post job. Please ensure backend server is running on port 8080.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
            Job Management
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
          <Briefcase className="w-7 h-7 text-blue-600 dark:text-blue-400" />
          <span>Create New Job Opening</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
          Reach thousands of qualified job seekers with detailed role specifications and verified benefits
        </p>
      </div>

      {/* Main Form Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
            <X className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="py-12 text-center space-y-3 animate-in zoom-in-95">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto animate-bounce" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Job Opening Published Successfully!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your vacancy has been published to the Find Jobs board and candidates can apply right away.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 1. Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Building2 className="w-4 h-4" />
                <span>1. Role Details & Company</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Job Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Lead Full Stack Architect"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Company / Organization Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Dream Software Pvt Ltd"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Location / Workplace
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Chennai, India / Remote"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Job Type
                  </label>
                  <select
                    value={jobType}
                    onChange={(e) => setJobType(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Remote">Remote</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Industry Sector
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                  >
                    <option value="Software & Tech">Software & Tech</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Finance & FinTech">Finance & FinTech</option>
                    <option value="Marketing & Sales">Marketing & Sales</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="E-Commerce">E-Commerce</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Compensation & Criteria */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1.5">
                <IndianRupee className="w-4 h-4" />
                <span>2. Compensation & Requirements</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Experience Level
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                  >
                    <option value="Entry Level">Entry Level (0-2 yrs)</option>
                    <option value="Mid Level">Mid Level (3-5 yrs)</option>
                    <option value="Senior">Senior (5-8 yrs)</option>
                    <option value="Lead / Staff">Lead / Staff (8+ yrs)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Salary / Compensation
                  </label>
                  <input
                    type="text"
                    value={salaryRange}
                    onChange={(e) => setSalaryRange(e.target.value)}
                    placeholder="e.g. ₹10,00,000 - ₹18,00,000 / yr"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                </div>

                {/* Application Deadline with min={todayStr} so past dates are strictly blocked */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                    <span>Application Deadline <span className="text-rose-500">*</span></span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">(Min: Today)</span>
                  </label>
                  <input
                    type="date"
                    required
                    min={todayStr}
                    value={deadline}
                    onChange={(e) => {
                      setDeadline(e.target.value);
                      if (e.target.value < todayStr) {
                        setError(`Selected date cannot be in the past (${e.target.value}). Minimum allowed date is today (${todayStr}).`);
                      } else {
                        setError('');
                      }
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                  />
                </div>
              </div>

              {/* Skills Chips Builder */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Required Skills & Tech Stack
                </label>
                <div className="flex gap-2 mb-2.5">
                  <input
                    type="text"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    placeholder="Add skill (e.g. Next.js, MySQL, Spring Boot, Docker)..."
                    className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 text-xs font-bold shadow-xs"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="text-slate-400 hover:text-rose-500 transition"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Description Section */}
            <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                <span>3. Full Role Description</span>
              </h3>

              <div>
                <textarea
                  rows={6}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe core responsibilities, key qualifications, benefits, team perks, and interview stages..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl p-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none leading-relaxed shadow-sm"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end space-x-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-xs sm:text-sm px-8 py-3 rounded-2xl shadow-lg shadow-blue-600/30 transition hover:scale-105 flex items-center space-x-2"
              >
                <span>{submitting ? "Publishing Vacancy..." : "Publish Job Opening"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>
        )}

      </div>

    </div>
  );
}
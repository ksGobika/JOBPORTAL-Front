"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { 
  Search, 
  MapPin, 
  Briefcase, 
  TrendingUp, 
  Users, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Code2,
  Palette,
  Megaphone,
  LineChart,
  Cpu,
  Layers
} from 'lucide-react';
import { jobService } from '../services/api';
import JobCard from '../components/JobCard';

export default function Home() {
  const { user, isAuthenticated } = useSelector((state: any) => state.auth || {});
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    jobService.getAllJobs('approved')
      .then((res: any) => {
        setFeaturedJobs((res.data || []).slice(0, 6));
      })
      .catch((err) => {
        console.error("Jobs load error", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { name: 'Software & Tech', icon: Code2, count: '1,420+ Jobs', color: 'from-blue-600 to-cyan-500' },
    { name: 'UI/UX & Product Design', icon: Palette, count: '630+ Jobs', color: 'from-purple-600 to-pink-500' },
    { name: 'Marketing & Growth', icon: Megaphone, count: '480+ Jobs', color: 'from-amber-500 to-orange-500' },
    { name: 'Finance & Banking', icon: LineChart, count: '390+ Jobs', color: 'from-emerald-500 to-teal-500' },
    { name: 'AI & Data Science', icon: Cpu, count: '890+ Jobs', color: 'from-indigo-600 to-purple-600' },
    { name: 'Operations & Management', icon: Layers, count: '310+ Jobs', color: 'from-rose-500 to-red-600' },
  ];

  return (
    <div className="space-y-20 pb-20 overflow-hidden">
      
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Glow Background Blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-500/10 dark:bg-blue-600/20 blur-[120px] rounded-full -z-10 pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-purple-500/10 dark:bg-purple-600/15 blur-[100px] rounded-full -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          
          {/* Top Pill Badge */}
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-semibold shadow-sm animate-bounce">
            <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            <span>Over 10,000+ Verified Tech & Enterprise Jobs Live</span>
          </div>

          {/* Main Hero Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.1]">
            Find Your Dream Job,{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-400 dark:via-sky-300 dark:to-indigo-300 bg-clip-text text-transparent">
              Elevate Your Career
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Discover premier career opportunities at hyper-growth startups and Fortune 500 companies. Direct recruiter chat, verified salaries, and transparent tracking.
          </p>

          {/* Hero Search Bar */}
          <div className="max-w-3xl mx-auto glass-panel bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 p-2.5 rounded-2xl sm:rounded-full shadow-xl dark:shadow-2xl">
            <form 
              action="/jobs" 
              method="GET"
              className="flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="flex items-center space-x-3 px-4 py-2 w-full sm:w-1/2 text-left">
                <Search className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <input
                  type="text"
                  name="q"
                  placeholder="Job title, keywords, or company..."
                  className="bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none w-full"
                />
              </div>

              <div className="hidden sm:block h-8 w-[1px] bg-slate-200 dark:bg-slate-800" />

              <div className="flex items-center space-x-3 px-4 py-2 w-full sm:w-1/3 text-left">
                <MapPin className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <input
                  type="text"
                  name="location"
                  placeholder="Location or 'Remote'..."
                  className="bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none w-full"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm px-7 py-3 rounded-xl sm:rounded-full shadow-lg shadow-blue-600/30 transition hover:scale-105"
              >
                Search
              </button>
            </form>
          </div>

          {/* Quick Filter Tags */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-slate-600 dark:text-slate-400 pt-2">
            <span className="font-bold text-slate-500">Popular:</span>
            {['Remote React Developer', 'Full Stack Java', 'Product Manager', 'Data Engineer', 'UI Designer'].map((tag, i) => (
              <Link
                key={i}
                href={`/jobs?q=${encodeURIComponent(tag)}`}
                className="px-3.5 py-1 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white shadow-sm transition font-medium"
              >
                {tag}
              </Link>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <span className="text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400">12,500+</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Active Job Openings</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <span className="text-2xl sm:text-3xl font-black text-indigo-600 dark:text-indigo-400">850+</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Top Employers Hiring</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <span className="text-2xl sm:text-3xl font-black text-cyan-600 dark:text-cyan-400">96.4%</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Application Response</p>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">₹5 LPA</span>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-semibold">Average Tech Salary</p>
            </div>
          </div>

        </div>
      </section>

      {/* Featured Job Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Explore Disciplines</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">Popular Job Categories</h2>
          </div>
          <Link href="/jobs" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
            <span>Browse All Categories</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <Link 
                key={idx} 
                href={`/jobs?industry=${encodeURIComponent(cat.name)}`}
                className="glass-card bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl hover:border-blue-500 transition duration-200 group flex items-center space-x-4 shadow-sm hover:shadow-md"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} flex items-center justify-center text-white shrink-0 shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{cat.count}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">Verified Opportunities</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1 tracking-tight">Featured Job Openings</h2>
          </div>
          <Link 
            href="/jobs" 
            className="text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-800 dark:text-white px-4 py-2 rounded-xl transition flex items-center gap-1.5 shadow-sm"
          >
            <span>View All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : featuredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredJobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                onSaveToggle={() => {}} 
                onApplySuccess={() => {}} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <Briefcase className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No jobs listed yet. Be the first to post!</p>
          </div>
        )}
      </section>

      {/* Employer & Candidate CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel bg-gradient-to-r from-blue-50 via-indigo-50/50 to-purple-50 dark:from-blue-950/60 dark:via-slate-900 dark:to-purple-950/60 border border-blue-200 dark:border-blue-500/30 rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-lg dark:shadow-2xl">
          <div className="max-w-2xl space-y-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/10 px-3 py-1 rounded-md border border-blue-200 dark:border-blue-500/20">
              For Employers & Recruiters
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
              Hire Elite Tech Talent 3x Faster with AI Filtering
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Post your job openings to thousands of qualified developers, designers, and managers. Track candidate pipelines, chat in real-time, and manage reviews.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link 
                href="/employer/post-job"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-lg shadow-blue-600/30 transition hover:scale-105"
              >
                Post a Job Today
              </Link>
              <Link 
                href="/employer/dashboard"
                className="bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-sm px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700 transition shadow-sm"
              >
                Employer Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

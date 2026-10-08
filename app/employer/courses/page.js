"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  GraduationCap, 
  PlusCircle, 
  BookOpen, 
  Users, 
  Trash2, 
  Clock, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  Building, 
  UserCheck, 
  Calendar,
  Globe,
  Mail
} from 'lucide-react';
import { courseService, enrollmentService } from '../../../services/api';

export default function EmployerCoursesPage() {
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'enrollments'
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadEmployerCoursesAndEnrollments();
  }, [isAuthenticated, user?.id]);

  const loadEmployerCoursesAndEnrollments = async () => {
    setLoading(true);
    try {
      // 1. Fetch employer courses (only courses posted by this employer)
      const courseRes = await courseService.getAllCourses('', user?.id || '');
      const allCourses = courseRes.data || [];
      const empCourses = allCourses.filter(c => 
        c.employerId === user?.id || 
        (user?.name && c.companyName === user.name) ||
        (user?.company?.name && c.companyName === user.company.name)
      );
      setCourses(empCourses);

      // 2. Fetch real enrollments for this employer's courses
      let enrList = [];
      try {
        const enrollRes = await enrollmentService.getEnrollmentsByEmployer(user?.id || '');
        enrList = enrollRes.data || [];
      } catch (e) {
        console.log("Fetching enrollments error:", e.message);
      }

      // 3. Deduplicate enrollments by courseId + (seekerId || seekerEmail)
      const uniqueMap = new Map();
      enrList.forEach(e => {
        const key = `${e.courseId}_${e.seekerId || e.seekerEmail || e.seekerName}`;
        if (!uniqueMap.has(key)) {
          uniqueMap.set(key, e);
        }
      });

      setEnrollments(Array.from(uniqueMap.values()));
    } catch (err) {
      console.error("Failed to load employer courses", err);
      setCourses([]);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (courseId) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await courseService.deleteCourse(courseId);
      setCourses(courses.filter(c => c.id !== courseId));
      setEnrollments(enrollments.filter(e => e.courseId !== courseId));
    } catch (err) {
      console.error("Failed to delete course", err);
      setCourses(courses.filter(c => c.id !== courseId));
    }
  };

  const filteredCourses = courses.filter(c => 
    c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.platform?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredEnrollments = enrollments.filter(e =>
    e.seekerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.seekerEmail?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4" />
              <span>Employer Learning Portal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight">
              Course Management & Enrolled Candidates
            </h1>
            <p className="text-sm text-slate-300 font-medium max-w-2xl">
              Post external learning courses (Coursera, Udemy, YouTube, AWS, etc.) and monitor interested candidate enrollments.
            </p>
          </div>

          <Link
            href="/employer/post-course"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-600/30 transition flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Post New Course</span>
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 space-y-6">
        {/* Metric Cards (2 Clean Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{courses.length}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Posted Courses</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm flex items-center space-x-4">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl">
              <Users className="w-7 h-7" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-900">{enrollments.length}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Enrolled Candidates</p>
            </div>
          </div>
        </div>

        {/* Tabbed Content Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          {/* Tabs & Search */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl w-full md:w-auto">
              <button
                onClick={() => setActiveTab('courses')}
                className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
                  activeTab === 'courses' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Posted Courses ({courses.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('enrollments')}
                className={`flex-1 md:flex-none px-5 py-2.5 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
                  activeTab === 'enrollments' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Enrolled Candidates ({enrollments.length})</span>
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={activeTab === 'courses' ? "Search courses..." : "Search candidates..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* TAB 1: POSTED COURSES */}
          {activeTab === 'courses' && (
            <div>
              {filteredCourses.length === 0 ? (
                <div className="text-center py-12 space-y-4">
                  <BookOpen className="w-16 h-16 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-700">No Courses Posted Yet</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Post external courses from Coursera, Udemy, YouTube, or your company LMS for job seekers to enroll.
                  </p>
                  <Link
                    href="/employer/post-course"
                    className="inline-block px-6 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition shadow"
                  >
                    Post Your First Course →
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {filteredCourses.map((c) => (
                    <div key={c.id} className="py-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                            {c.platform || "External Course"}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {c.category}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {c.level || "Intermediate"}
                          </span>
                        </div>
                        <h3 className="text-base font-black text-slate-900">{c.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-1">{c.description}</p>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-semibold pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {c.duration || "Self-Paced"}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-600 font-bold">
                            <Users className="w-3.5 h-3.5" />
                            {c.enrolledCount || 0} Learners Enrolled
                          </span>
                          {c.courseUrl && (
                            <a
                              href={c.courseUrl.startsWith('http') ? c.courseUrl : `https://${c.courseUrl}`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1 font-bold"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>View Course URL</span>
                            </a>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
                        <Link
                          href={`/courses/${c.id}`}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </Link>
                        <button
                          onClick={() => handleDeleteCourse(c.id)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition"
                          title="Delete course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ENROLLED CANDIDATES ONLY */}
          {activeTab === 'enrollments' && (
            <div className="overflow-x-auto">
              {filteredEnrollments.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Users className="w-14 h-14 text-slate-300 mx-auto" />
                  <p className="text-sm font-bold text-slate-600">No candidate enrollments found.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-black uppercase text-slate-400 tracking-wider">
                      <th className="pb-3 px-3">Job Seeker Candidate</th>
                      <th className="pb-3 px-3">Course Enrolled</th>
                      <th className="pb-3 px-3">Enrolled Date</th>
                      <th className="pb-3 px-3 text-right">Enrollment Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                    {filteredEnrollments.map((enr, idx) => (
                      <tr key={enr.id || idx} className="hover:bg-slate-50/80 transition">
                        <td className="py-4 px-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                              {enr.seekerName ? enr.seekerName.charAt(0).toUpperCase() : "S"}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{enr.seekerName || "Candidate"}</p>
                              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{enr.seekerEmail || "candidate@email.com"}</span>
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-3 max-w-xs">
                          <p className="font-bold text-slate-900 line-clamp-1">{enr.courseTitle}</p>
                          <span className="text-[10px] text-slate-400">{enr.companyName || "Your Company"}</span>
                        </td>
                        <td className="py-4 px-3 text-slate-500 font-medium">
                          {enr.enrolledAt || "Recent"}
                        </td>
                        <td className="py-4 px-3 text-right">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Enrolled</span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

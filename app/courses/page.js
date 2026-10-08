"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  GraduationCap, 
  Search, 
  BookOpen, 
  Clock, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  Building, 
  Layers, 
  ArrowRight,
  TrendingUp,
  UserCheck,
  ExternalLink,
  Globe,
  Check,
  Bookmark,
  Filter,
  Mail,
  X
} from 'lucide-react';
import { courseService, enrollmentService } from '../../services/api';

const CATEGORIES = [
  "All",
  "Software Engineering",
  "Cloud & DevOps",
  "Data Science & AI",
  "Product & Design",
  "Cybersecurity"
];

export default function CoursesPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const [mounted, setMounted] = useState(false);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);

  // Toast Notification State
  const [toastNotification, setToastNotification] = useState(null);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'enrolled'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  useEffect(() => {
    setMounted(true);
    loadCoursesAndEnrollments();
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        setToastNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  const loadCoursesAndEnrollments = async () => {
    setLoading(true);
    try {
      const res = await courseService.getAllCourses();
      let realCourses = [];
      if (res.data && Array.isArray(res.data)) {
        realCourses = res.data;
      }
      setCourses(realCourses);

      if (isAuthenticated && user?.id && user.role === 'seeker') {
        const enrollRes = await enrollmentService.getEnrollmentsBySeeker(user.id);
        if (enrollRes.data && Array.isArray(enrollRes.data)) {
          setEnrollments(enrollRes.data);
        }
      }
    } catch (err) {
      console.log("Failed to load courses:", err.message);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollAndOpen = async (course) => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    // Employers & Admins are course providers, NOT enrolled students
    if (user?.role === 'employer' || user?.role === 'admin') {
      if (course?.courseUrl) {
        let targetUrl = course.courseUrl.trim();
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
          targetUrl = 'https://' + targetUrl;
        }
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
      return;
    }

    setEnrollingId(course.id);
    const existing = enrollments.find(e => e.courseId === course.id);

    if (!existing) {
      const enrollData = {
        id: `enr-${Date.now()}`,
        courseId: course.id,
        courseTitle: course.title,
        seekerId: user.id,
        seekerName: user.name || "Student",
        seekerEmail: user.email || "",
        companyName: course.companyName || "",
        employerId: course.employerId || "",
        progress: 100,
        status: "enrolled",
        enrolledAt: new Date().toISOString().split('T')[0]
      };

      try {
        const res = await enrollmentService.enroll(enrollData);
        setEnrollments(prev => [...prev, res.data || enrollData]);
        // Increment course enrolled count
        const updatedCourse = {
          ...course,
          enrolledCount: (course.enrolledCount || 0) + 1
        };
        courseService.updateCourse(course.id, updatedCourse).catch(() => {});
        setCourses(prev => prev.map(c => c.id === course.id ? updatedCourse : c));
      } catch (err) {
        setEnrollments(prev => [...prev, enrollData]);
      }
    }

    setEnrollingId(null);

    const userEmail = user?.email || "your registered email";
    const notificationMsg = `Course website link sent to your mail ID (${userEmail})`;

    // 1. Save to custom notifications for Top Bell
    if (user?.id) {
      try {
        const customNotifKey = `custom_notifs_${user.id}`;
        let existingNotifs = [];
        const stored = localStorage.getItem(customNotifKey);
        if (stored) existingNotifs = JSON.parse(stored);

        const newNotifItem = {
          id: `course-link-${Date.now()}`,
          text: `Course website link for '${course.title}' sent to your mail ID (${userEmail})`,
          time: 'Just now',
          type: 'course'
        };

        const updatedNotifs = [newNotifItem, ...existingNotifs.filter(n => n.id !== newNotifItem.id)].slice(0, 10);
        localStorage.setItem(customNotifKey, JSON.stringify(updatedNotifs));
      } catch (e) {}
    }

    // 2. Trigger on-screen floating toast notification
    setToastNotification({
      title: "Notification Sent 📧",
      message: notificationMsg,
      courseTitle: course.title
    });

    // 3. Open external course URL in new tab if available
    if (course.courseUrl) {
      let targetUrl = course.courseUrl.trim();
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleToggleComplete = async (courseId) => {
    const enr = enrollments.find(e => e.courseId === courseId);
    if (!enr) return;

    const newStatus = enr.status === 'completed' ? 'enrolled' : 'completed';
    const updated = {
      ...enr,
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null
    };

    try {
      if (enr.id) {
        await enrollmentService.updateProgress(enr.id, updated);
      }
      setEnrollments(prev => prev.map(e => e.courseId === courseId ? updated : e));
    } catch (err) {
      setEnrollments(prev => prev.map(e => e.courseId === courseId ? updated : e));
    }
  };

  const getEnrollment = (courseId) => {
    return enrollments.find(e => e.courseId === courseId);
  };

  const filteredCourses = courses.filter((c) => {
    const isEnrolled = !!getEnrollment(c.id);
    if (activeTab === 'enrolled' && !isEnrolled) return false;

    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesLevel = selectedLevel === 'All' || c.level?.toLowerCase().includes(selectedLevel.toLowerCase());
    const matchesSearch = 
      c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.platform?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesLevel && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 relative">
      {/* Floating Animated Toast Notification */}
      {toastNotification && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-emerald-500/50 flex items-start space-x-3.5 animate-in slide-in-from-top-4 duration-300">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl shrink-0 mt-0.5 border border-emerald-500/30">
            <Mail className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase text-emerald-400 tracking-wide">
                {toastNotification.title}
              </h4>
              <button 
                onClick={() => setToastNotification(null)}
                className="text-slate-400 hover:text-white p-0.5 rounded transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-200 font-semibold mt-1 leading-snug">
              {toastNotification.message}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
              Course: {toastNotification.courseTitle}
            </p>
          </div>
        </div>
      )}

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 text-white py-14 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-blue-300" />
              <span>Skill Enhancement & Certification</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Explore & Enroll in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Top Online Courses</span>
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Curated courses from industry leaders (Coursera, Udemy, YouTube, AWS, Google, freeCodeCamp). Click enroll to receive the course link directly to your mail ID and open the course website.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>1-Click Fast Enrollment</span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Course Link Sent to Email</span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Track Enrolled Progress</span>
              </div>
            </div>
          </div>

          {/* Quick Counter Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl w-full md:w-80 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center space-x-4 border-b border-white/10 pb-4">
              <div className="p-3 bg-blue-500/30 rounded-2xl">
                <GraduationCap className="w-7 h-7 text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-black">{courses.length}</p>
                <p className="text-xs text-slate-300 font-semibold">Available Courses</p>
              </div>
            </div>
            {mounted && isAuthenticated && user?.role === 'seeker' && (
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-emerald-500/30 rounded-2xl">
                  <Bookmark className="w-7 h-7 text-emerald-300" />
                </div>
                <div>
                  <p className="text-2xl font-black">{enrollments.length}</p>
                  <p className="text-xs text-slate-300 font-semibold">My Enrolled Courses</p>
                </div>
              </div>
            )}
            {mounted && isAuthenticated && user?.role === 'employer' && (
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-500/30 rounded-2xl">
                  <Layers className="w-7 h-7 text-purple-300" />
                </div>
                <div>
                  <p className="text-2xl font-black">{courses.filter(c => c.employerId === user.id).length}</p>
                  <p className="text-xs text-slate-300 font-semibold">Posted by Your Company</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Navigation Tabs & Search Controls */}
        <div className="bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            {/* Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-2xl self-start gap-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                  activeTab === 'all'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>All Courses ({courses.length})</span>
              </button>

              {mounted && isAuthenticated && user?.role === 'seeker' && (
                <button
                  onClick={() => setActiveTab('enrolled')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 ${
                    activeTab === 'enrolled'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>My Enrolled ({enrollments.length})</span>
                </button>
              )}

              {mounted && isAuthenticated && user?.role === 'employer' && (
                <Link
                  href="/employer/post-course"
                  className="px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>+ Post Course</span>
                </Link>
              )}
            </div>

            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search courses by title, topic, platform, or skills..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Categories Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs font-bold text-slate-500 mr-2 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Domain:
            </span>
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
            <p className="text-xs font-bold text-slate-500">Loading courses...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-sm space-y-4 max-w-md mx-auto">
            <GraduationCap className="w-16 h-16 text-slate-300 mx-auto" />
            <h3 className="text-lg font-black text-slate-800">
              {activeTab === 'enrolled' ? "No Enrolled Courses Yet" : "No Courses Found"}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {activeTab === 'enrolled' 
                ? "Switch to 'All Courses' and click 'Enroll' to start learning!" 
                : "Try adjusting your search query or category filters."}
            </p>
            {activeTab === 'enrolled' && (
              <button
                onClick={() => setActiveTab('all')}
                className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl shadow"
              >
                Browse All Courses
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((c) => {
              const enr = getEnrollment(c.id);
              const isEnrolled = !!enr;
              const isCompleted = enr?.status === 'completed';

              return (
                <div
                  key={c.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Header */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase text-blue-700 bg-blue-50 border border-blue-200/70 px-2.5 py-1 rounded-lg">
                        {c.platform || "External Course"}
                      </span>
                      <span className="text-xs font-bold text-slate-400">
                        {c.level || "Intermediate"}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition leading-snug line-clamp-2">
                        {c.title}
                      </h3>
                      <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.instructorName || c.companyName || "Tech Provider"}</span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                      {c.description}
                    </p>

                    {/* Metadata / Duration */}
                    <div className="flex items-center justify-between text-xs text-slate-500 font-semibold pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {c.duration || "4 Weeks"}
                      </span>
                      <span className="flex items-center gap-1 text-blue-600 font-bold">
                        <UserCheck className="w-3.5 h-3.5" />
                        {c.enrolledCount || 0} Enrolled
                      </span>
                    </div>

                    {/* Topics covered pill list */}
                    {c.syllabus && typeof c.syllabus === 'string' && !c.syllabus.startsWith('[') && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {c.syllabus.split(',').slice(0, 3).map((topic, i) => (
                          <span key={i} className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            {topic.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                    {mounted && (user?.role === 'employer' || user?.role === 'admin') ? (
                      <div className="w-full flex items-center gap-2">
                        <Link
                          href={`/courses/${c.id}`}
                          className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </Link>
                        <button
                          onClick={() => {
                            if (c.courseUrl) {
                              let targetUrl = c.courseUrl.trim();
                              if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                                targetUrl = 'https://' + targetUrl;
                              }
                              window.open(targetUrl, '_blank', 'noopener,noreferrer');
                            }
                          }}
                          className="p-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl transition border border-blue-200"
                          title="Open External Website"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    ) : isEnrolled ? (
                      <>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleComplete(c.id)}
                            className={`p-1.5 rounded-lg border transition ${
                              isCompleted 
                                ? 'bg-emerald-100 border-emerald-300 text-emerald-700' 
                                : 'bg-white border-slate-200 text-slate-400 hover:text-emerald-600'
                            }`}
                            title={isCompleted ? "Completed" : "Mark as completed"}
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <span className="text-[11px] font-bold text-emerald-700">
                            {isCompleted ? "Completed ✓" : "Enrolled"}
                          </span>
                        </div>

                        <button
                          onClick={() => handleEnrollAndOpen(c)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition flex items-center gap-1.5 shadow-sm"
                        >
                          <span>Open Course</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEnrollAndOpen(c)}
                        disabled={enrollingId === c.id}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>{enrollingId === c.id ? "Enrolling..." : "Enroll & Go to Website ↗"}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

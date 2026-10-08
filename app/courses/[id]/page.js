"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  GraduationCap, 
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  Building, 
  Clock, 
  User, 
  Sparkles, 
  BookOpen, 
  ExternalLink, 
  Globe, 
  Share2, 
  ShieldCheck, 
  Bookmark,
  Mail,
  X
} from 'lucide-react';
import { courseService, enrollmentService } from '../../../services/api';

export default function CourseDetailsPage({ params }) {
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.id;
  const router = useRouter();

  const { user, isAuthenticated } = useSelector((state) => state.auth || {});

  const [mounted, setMounted] = useState(false);
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [toastNotification, setToastNotification] = useState(null);

  useEffect(() => {
    setMounted(true);
    loadCourseDetails();
  }, [courseId, isAuthenticated, user?.id]);

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => {
        setToastNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  const loadCourseDetails = async () => {
    setLoading(true);
    let foundCourse = null;

    try {
      const res = await courseService.getCourseById(courseId);
      if (res.data && res.data.title) {
        foundCourse = res.data;
      }
    } catch (err) {
      console.log("Fetching course failed:", err.message);
    }

    setCourse(foundCourse);

    if (isAuthenticated && user?.id && user?.role === 'seeker') {
      try {
        const enrollRes = await enrollmentService.getEnrollmentStatus(courseId, user.id);
        const enrList = enrollRes.data || [];
        if (enrList.length > 0) {
          setEnrollment(enrList[0]);
        }
      } catch (err) {
        const localEnr = localStorage.getItem(`enr_${courseId}_${user.id}`);
        if (localEnr) {
          try {
            setEnrollment(JSON.parse(localEnr));
          } catch (e) {}
        }
      }
    }
    setLoading(false);
  };

  const handleEnrollAndLaunch = async () => {
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

    setEnrolling(true);
    let currentEnr = enrollment;

    if (!currentEnr) {
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
        currentEnr = res.data || enrollData;
        setEnrollment(currentEnr);
        localStorage.setItem(`enr_${course.id}_${user.id}`, JSON.stringify(currentEnr));

        // Increment count
        const updatedCourse = {
          ...course,
          enrolledCount: (course.enrolledCount || 0) + 1
        };
        courseService.updateCourse(course.id, updatedCourse).catch(() => {});
        setCourse(updatedCourse);
      } catch (err) {
        currentEnr = enrollData;
        setEnrollment(enrollData);
        localStorage.setItem(`enr_${course.id}_${user.id}`, JSON.stringify(enrollData));
      }
    }

    setEnrolling(false);

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

    // 3. Launch external website URL if exists
    if (course.courseUrl) {
      let targetUrl = course.courseUrl.trim();
      if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = 'https://' + targetUrl;
      }
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleToggleComplete = async () => {
    if (!enrollment) return;

    const newStatus = enrollment.status === 'completed' ? 'enrolled' : 'completed';
    const updated = {
      ...enrollment,
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString().split('T')[0] : null
    };

    try {
      if (enrollment.id) {
        await enrollmentService.updateProgress(enrollment.id, updated);
      }
      setEnrollment(updated);
      localStorage.setItem(`enr_${course.id}_${user.id}`, JSON.stringify(updated));
    } catch (err) {
      setEnrollment(updated);
      localStorage.setItem(`enr_${course.id}_${user.id}`, JSON.stringify(updated));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <GraduationCap className="w-16 h-16 text-slate-300" />
        <h2 className="text-2xl font-black text-slate-800">Course Not Found</h2>
        <Link href="/courses" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow">
          Back to All Courses
        </Link>
      </div>
    );
  }

  const isEnrolled = !!enrollment;
  const isCompleted = enrollment?.status === 'completed';

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

      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sticky top-16 z-30 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link 
              href="/courses" 
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
              title="Back to all courses"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <span className="text-xs font-black uppercase text-blue-600 tracking-wider">
                {course.platform || "Course Details"}
              </span>
              <h1 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                {course.title}
              </h1>
            </div>
          </div>

          {mounted && (user?.role === 'employer' || user?.role === 'admin') ? (
            <div className="flex items-center gap-2">
              {course.employerId === user?.id && (
                <Link
                  href="/employer/courses"
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Manage My Courses
                </Link>
              )}
              <button
                onClick={handleEnrollAndLaunch}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition shadow-md shadow-blue-500/20 flex items-center gap-2"
              >
                <span>Open Course Website</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleEnrollAndLaunch}
              disabled={enrolling}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              <span>{isEnrolled ? "Open Course Website" : "Enroll & Start Course"}</span>
              <ExternalLink className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Main Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-black uppercase">
                  {course.platform || "External Course"}
                </span>
                <span className="text-xs font-bold text-slate-500">• {course.category}</span>
                <span className="text-xs font-bold text-slate-500">• {course.level}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
                {course.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 font-semibold flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" />
                <span>Instructor / Host: <strong>{course.instructorName || course.companyName || "Tech Provider"}</strong></span>
              </p>
            </div>

            {/* Quick Status Box */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-right space-y-1">
              <p className="text-xs font-bold text-slate-500">Duration</p>
              <p className="text-sm font-black text-slate-900">{course.duration || "4 Weeks"}</p>
              <p className="text-[11px] text-blue-600 font-bold">{course.enrolledCount || 0} Learners Enrolled</p>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
              About This Course
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {course.description}
            </p>
          </div>

          {/* Topics / Syllabus */}
          {course.syllabus && (
            <div className="space-y-3 pt-4 border-t border-slate-100">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Key Skills & Topics
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium">
                {course.syllabus}
              </p>
            </div>
          )}

          {/* Role-Specific Action Section: Seeker vs Employer */}
          {mounted && (user?.role === 'employer' || user?.role === 'admin') ? (
            <div className="pt-6 border-t border-slate-100 bg-slate-900 text-white p-6 sm:p-8 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-400" />
                  <h4 className="text-sm font-black text-white">
                    Course Provider View (Employer)
                  </h4>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Courses are hosted for Job Seekers to learn and upskill. Candidates can enroll and complete this course.
                </p>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                {course.employerId === user?.id && (
                  <Link
                    href="/employer/courses"
                    className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition border border-white/20"
                  >
                    My Courses
                  </Link>
                )}

                <button
                  onClick={handleEnrollAndLaunch}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition shadow-md shadow-blue-500/20 flex items-center gap-2"
                >
                  <span>Open Course Website</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-6 border-t border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                  <h4 className="text-sm font-black text-blue-950">
                    {isEnrolled ? "You are Enrolled in this Course" : "Ready to Start Learning?"}
                  </h4>
                </div>
                <p className="text-xs text-blue-800/80 mt-1">
                  {isEnrolled 
                    ? "Access the learning material on the host platform anytime." 
                    : "Clicking Enroll will register your enrollment and send the course website link to your email."}
                </p>
              </div>

              <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
                {isEnrolled && (
                  <button
                    onClick={handleToggleComplete}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      isCompleted 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCompleted ? "Completed ✓" : "Mark as Completed"}</span>
                  </button>
                )}

                <button
                  onClick={handleEnrollAndLaunch}
                  disabled={enrolling}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition shadow-md shadow-blue-500/20 flex items-center gap-2"
                >
                  <span>{isEnrolled ? `Open on ${course.platform || 'Website'}` : "Enroll & Launch ↗"}</span>
                  <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from 'next/link';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { useEffect, useState, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  Briefcase, 
  Bell, 
  MessageSquare, 
  Bookmark, 
  FileText, 
  User as UserIcon, 
  LogOut, 
  PlusCircle, 
  BarChart3, 
  Shield, 
  CheckCircle, 
  Menu, 
  X,
  CreditCard,
  Building2,
  ChevronDown,
  Trash2,
  CheckCheck,
  GraduationCap,
  Award,
  Zap,
  AlertTriangle
} from 'lucide-react';
import AnnouncementBanner from './AnnouncementBanner';
import { appService } from '../services/api';

export default function Navbar() {
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getReadNotificationIds = () => {
    if (typeof window === 'undefined' || !user?.id) return [];
    try {
      const saved = localStorage.getItem(`read_notifs_${user.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  const getDismissedNotificationIds = () => {
    if (typeof window === 'undefined' || !user?.id) return [];
    try {
      const saved = localStorage.getItem(`dismissed_notifs_${user.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  };

  // Fetch real notifications and sync with user's actual applications & persistent read state
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      const readIds = getReadNotificationIds();
      const dismissedIds = getDismissedNotificationIds();

      const applyStatusToNotifs = (rawList) => {
        return rawList
          .filter(n => !dismissedIds.includes(n.id))
          .map(n => ({
            ...n,
            read: readIds.includes(n.id) ? true : false
          }));
      };

      if (user.role === 'seeker') {
        appService.getApplicationsByUserId(user.id)
          .then((res) => {
            const apps = res.data || [];
            const realNotifs = [];

            if (apps.length > 0) {
              apps.forEach((app, idx) => {
                const statusText = app.status === 'applied' 
                  ? 'is received and waiting for recruiter review.'
                  : `status updated to: ${app.status.toUpperCase()}`;

                realNotifs.push({
                  id: `app-${app.id || idx}`,
                  text: `Your application for '${app.jobTitle}' ${statusText}`,
                  time: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recent',
                  type: 'app'
                });
              });
            }

            // Include custom notifications (e.g. course links sent to email)
            let customList = [];
            try {
              const stored = localStorage.getItem(`custom_notifs_${user.id}`);
              if (stored) customList = JSON.parse(stored);
            } catch (e) {}

            const combinedNotifs = [...customList, ...realNotifs];
            if (combinedNotifs.length === 0) {
              combinedNotifs.push({
                id: 'welcome',
                text: `Welcome to JobPortal, ${user.name}! Start exploring jobs or courses.`,
                time: 'Just now',
                type: 'system'
              });
            }
            setNotifications(applyStatusToNotifs(combinedNotifs));
          })
          .catch(() => {
            let customList = [];
            try {
              const stored = localStorage.getItem(`custom_notifs_${user.id}`);
              if (stored) customList = JSON.parse(stored);
            } catch (e) {}
            const combinedNotifs = [...customList, { id: 'welcome', text: `Welcome to JobPortal, ${user.name}!`, time: 'Just now', type: 'system' }];
            setNotifications(applyStatusToNotifs(combinedNotifs));
          });
      } else if (user.role === 'employer') {
        appService.getApplicationsByEmployer(user.id)
          .then((res) => {
            const apps = res.data || [];
            const empNotifs = [];
            if (apps.length > 0) {
              apps.slice(0, 5).forEach((app, idx) => {
                empNotifs.push({
                  id: `emp-app-${app.id || idx}`,
                  text: `New applicant '${app.seekerName}' applied for '${app.jobTitle}'`,
                  time: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Recent',
                  type: 'app'
                });
              });
            } else {
              empNotifs.push({
                id: 'emp-welcome',
                text: `Welcome, ${user.name}! Post a job opening to start receiving candidates.`,
                time: 'Just now',
                type: 'job'
              });
            }
            setNotifications(applyStatusToNotifs(empNotifs));
          })
          .catch(() => {
            setNotifications(applyStatusToNotifs([
              { id: 'emp-welcome', text: `Welcome to Employer Hub, ${user.name}!`, time: 'Just now', type: 'job' }
            ]));
          });
      }
    } else {
      setNotifications([]);
    }
  }, [isAuthenticated, user?.id, user?.role]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    if (user?.id) {
      const allIds = updated.map(n => n.id);
      const existing = getReadNotificationIds();
      const combined = Array.from(new Set([...existing, ...allIds]));
      localStorage.setItem(`read_notifs_${user.id}`, JSON.stringify(combined));
    }
  };

  const markSingleAsRead = (id) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    if (user?.id) {
      const existing = getReadNotificationIds();
      if (!existing.includes(id)) {
        localStorage.setItem(`read_notifs_${user.id}`, JSON.stringify([...existing, id]));
      }
    }
  };

  const clearAllNotifications = () => {
    const allIds = notifications.map(n => n.id);
    setNotifications([]);
    if (user?.id) {
      const existing = getDismissedNotificationIds();
      const combined = Array.from(new Set([...existing, ...allIds]));
      localStorage.setItem(`dismissed_notifs_${user.id}`, JSON.stringify(combined));
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    setUserDropdownOpen(false);
    setMobileMenuOpen(false);
    router.push('/');
  };

  if (!mounted) {
    return <nav className="bg-white border-b border-slate-200 h-16 w-full"></nav>;
  }

  const role = user?.role || 'seeker';

  return (
    <header className="sticky top-0 z-50">
      <AnnouncementBanner />
      
      <nav className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-sm text-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 bg-clip-text text-transparent">
                  JobPortal
                </span>
                <span className="text-[10px] tracking-widest text-slate-500 uppercase font-bold -mt-1">
                  Careers Hub
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center space-x-2 text-sm font-bold">
              {/* Find Jobs Link: Only visible to Job Seekers and Guests */}
              {(!isAuthenticated || role === 'seeker') && (
                <Link 
                  href="/jobs" 
                  className={`px-4 py-2 rounded-xl transition ${pathname === '/jobs' ? 'text-blue-700 bg-blue-50 border border-blue-200/70 font-bold shadow-xs' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100/80'}`}
                >
                  Find Jobs
                </Link>
              )}

              {/* Courses Link: Visible to Seekers and Guests */}
              {(!isAuthenticated || role === 'seeker') && (
                <Link 
                  href="/courses" 
                  className={`px-4 py-2 rounded-xl transition ${pathname.startsWith('/courses') ? 'text-blue-700 bg-blue-50 border border-blue-200/70 font-bold shadow-xs' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100/80'}`}
                >
                  Courses
                </Link>
              )}

              {/* Seeker Links */}
              {isAuthenticated && role === 'seeker' && (
                <>
                  <Link 
                    href="/seeker/applications" 
                    className={`px-4 py-2 rounded-xl transition ${pathname.startsWith('/seeker/applications') ? 'text-blue-700 bg-blue-50 border border-blue-200/70 font-bold shadow-xs' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100/80'}`}
                  >
                    My Applications
                  </Link>
                  <Link 
                    href="/seeker/saved-jobs" 
                    className={`px-4 py-2 rounded-xl transition ${pathname.startsWith('/seeker/saved-jobs') ? 'text-blue-700 bg-blue-50 border border-blue-200/70 font-bold shadow-xs' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100/80'}`}
                  >
                    Saved Jobs
                  </Link>
                  <Link 
                    href="/seeker/career-emergency" 
                    className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 ${pathname.startsWith('/seeker/career-emergency') ? 'text-rose-700 bg-rose-50 border border-rose-200 font-bold shadow-xs' : 'text-rose-600 hover:text-rose-700 hover:bg-rose-50/80 font-bold'}`}
                  >
                    <Zap className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                    <span>Career Sprint</span>
                  </Link>
                </>
              )}

              {/* Employer Links */}
              {isAuthenticated && role === 'employer' && (
                <>
                  <Link 
                    href="/employer/dashboard" 
                    className={`px-4 py-2 rounded-xl transition ${pathname === '/employer/dashboard' ? 'text-blue-700 bg-blue-50 border border-blue-200/70 font-bold shadow-xs' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100/80'}`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/employer/my-jobs" 
                    className={`px-4 py-2 rounded-xl transition ${pathname === '/employer/my-jobs' ? 'text-blue-700 bg-blue-50 border border-blue-200/70 font-bold shadow-xs' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100/80'}`}
                  >
                    Manage Jobs
                  </Link>
                  <Link 
                    href="/employer/courses" 
                    className={`px-4 py-2 rounded-xl transition ${pathname.startsWith('/employer/courses') ? 'text-blue-700 bg-blue-50 border border-blue-200/70 font-bold shadow-xs' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100/80'}`}
                  >
                    My Courses
                  </Link>
                  <Link 
                    href="/employer/applicants" 
                    className={`px-4 py-2 rounded-xl transition ${pathname === '/employer/applicants' ? 'text-blue-700 bg-blue-50 border border-blue-200/70 font-bold shadow-xs' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100/80'}`}
                  >
                    Applicants
                  </Link>
                  <Link 
                    href="/employer/metrics" 
                    className={`px-4 py-2 rounded-xl transition ${pathname === '/employer/metrics' ? 'text-blue-700 bg-blue-50 border border-blue-200/70 font-bold shadow-xs' : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100/80'}`}
                  >
                    Analytics
                  </Link>
                </>
              )}

              {/* Admin Links */}
              {isAuthenticated && role === 'admin' && (
                <>
                  <Link 
                    href="/admin/dashboard" 
                    className={`px-4 py-2 rounded-xl transition ${pathname === '/admin/dashboard' ? 'text-purple-700 bg-purple-50 border border-purple-200/70 font-bold shadow-xs' : 'text-slate-700 hover:text-purple-600 hover:bg-slate-100/80'}`}
                  >
                    Admin Analytics
                  </Link>
                  <Link 
                    href="/admin/jobs" 
                    className={`px-4 py-2 rounded-xl transition ${pathname === '/admin/jobs' ? 'text-purple-700 bg-purple-50 border border-purple-200/70 font-bold shadow-xs' : 'text-slate-700 hover:text-purple-600 hover:bg-slate-100/80'}`}
                  >
                    Job Approvals
                  </Link>
                  <Link 
                    href="/admin/users" 
                    className={`px-4 py-2 rounded-xl transition ${pathname === '/admin/users' ? 'text-purple-700 bg-purple-50 border border-purple-200/70 font-bold shadow-xs' : 'text-slate-700 hover:text-purple-600 hover:bg-slate-100/80'}`}
                  >
                    Users
                  </Link>
                  <Link 
                    href="/admin/announcements" 
                    className={`px-4 py-2 rounded-xl transition ${pathname === '/admin/announcements' ? 'text-purple-700 bg-purple-50 border border-purple-200/70 font-bold shadow-xs' : 'text-slate-700 hover:text-purple-600 hover:bg-slate-100/80'}`}
                  >
                    Announcements
                  </Link>
                  <Link 
                    href="/admin/content" 
                    className={`px-4 py-2 rounded-xl transition ${pathname === '/admin/content' ? 'text-purple-700 bg-purple-50 border border-purple-200/70 font-bold shadow-xs' : 'text-slate-700 hover:text-purple-600 hover:bg-slate-100/80'}`}
                  >
                    Content / FAQ
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Action Icons & Profile */}
          <div className="flex items-center space-x-3">

            {/* Post Job CTA for Employer or Unauthenticated */}
            {(!isAuthenticated || role === 'employer') && (
              <Link 
                href="/employer/post-job"
                className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold px-4.5 py-2.5 rounded-xl shadow-md shadow-blue-500/20 transition-all hover:scale-105"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post a Job</span>
              </Link>
            )}

            {/* Authenticated user actions */}
            {isAuthenticated ? (
              <>
                {/* Messages Icon (Only for Seeker and Employer, hidden for Admin) */}
                {role !== 'admin' && (
                  <Link 
                    href="/messages"
                    className="p-2.5 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition relative border border-slate-200 bg-slate-50/80 shadow-xs"
                    title="Messages"
                  >
                    <MessageSquare className="w-5 h-5 text-slate-700 hover:text-blue-600" />
                  </Link>
                )}

                {/* Notification Bell with Popover */}
                <div className="relative" ref={notifRef}>
                  <button 
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition relative border border-slate-200 bg-slate-50/80 shadow-xs"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5 text-slate-700 hover:text-blue-600" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
                    )}
                  </button>

                  {/* Notification Dropdown Popover */}
                  {notificationsOpen && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <div className="flex items-center space-x-2">
                          <Bell className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-bold text-slate-900">Notifications</span>
                          {unreadCount > 0 ? (
                            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-bold">
                              {unreadCount} new
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 font-medium">All caught up</span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {unreadCount > 0 && (
                            <button 
                              onClick={markAllAsRead} 
                              className="text-xs text-blue-600 hover:text-blue-800 font-bold transition flex items-center gap-1"
                              title="Mark all as read"
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>Mark all as read</span>
                            </button>
                          )}
                          {notifications.length > 0 && (
                            <button 
                              onClick={clearAllNotifications} 
                              className="text-xs text-slate-400 hover:text-rose-600 transition"
                              title="Clear notifications"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div 
                              key={n.id} 
                              onClick={() => markSingleAsRead(n.id)}
                              className={`p-3.5 text-xs transition flex items-start space-x-3 cursor-pointer ${n.read ? 'bg-white text-slate-500 hover:bg-slate-50' : 'bg-blue-50/60 text-slate-900 font-semibold hover:bg-blue-50'}`}
                            >
                              <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${n.type === 'app' ? 'bg-emerald-100 text-emerald-700' : n.type === 'job' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>
                                <CheckCircle className="w-3.5 h-3.5" />
                              </div>
                              <div className="flex-1">
                                <p className="leading-snug">{n.text}</p>
                                <div className="flex items-center justify-between mt-1">
                                  <span className="text-[10px] text-slate-400">{n.time}</span>
                                  {!n.read && (
                                    <span className="text-[9px] font-bold text-blue-600 uppercase">New</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-xs text-slate-500 space-y-1">
                            <p className="font-semibold text-slate-700">No notifications</p>
                            <p className="text-[11px] text-slate-400">You're all caught up!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Avatar & Dropdown Button */}
                <div className="relative" ref={userRef}>
                  <button 
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-2 pl-2 pr-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition shadow-xs group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-sm">
                      {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[110px]">{user?.name}</span>
                      <span className="text-[9px] uppercase font-extrabold text-blue-600 tracking-wider">
                        {user?.role}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 transition" />
                  </button>

                  {/* User Dropdown Menu */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/50">
                        <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        <span className="mt-1.5 inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 border border-blue-200">
                          {user?.role} Account
                        </span>
                      </div>

                      <div className="py-1">
                        {role === 'seeker' && (
                          <>
                            <Link 
                              href="/seeker/profile" 
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition font-medium"
                            >
                              <UserIcon className="w-4 h-4 text-blue-600" />
                              <span>My Profile</span>
                            </Link>
                            <Link 
                              href="/seeker/applications" 
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition font-medium"
                            >
                              <FileText className="w-4 h-4 text-emerald-600" />
                              <span>Application Tracker</span>
                            </Link>
                            <Link 
                              href="/seeker/saved-jobs" 
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:text-amber-700 hover:bg-amber-50 transition font-medium"
                            >
                              <Bookmark className="w-4 h-4 text-amber-500 fill-amber-500" />
                              <span>Saved Bookmarks</span>
                            </Link>
                          </>
                        )}

                        {role === 'employer' && (
                          <>
                            <Link 
                              href="/employer/company-profile" 
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:text-blue-700 hover:bg-blue-50 transition font-medium"
                            >
                              <Building2 className="w-4 h-4 text-blue-600" />
                              <span>Company Profile</span>
                            </Link>
                            <Link 
                              href="/employer/dashboard" 
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition font-medium"
                            >
                              <BarChart3 className="w-4 h-4 text-emerald-600" />
                              <span>Employer Dashboard</span>
                            </Link>
                            <Link 
                              href="/employer/courses" 
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:text-indigo-700 hover:bg-indigo-50 transition font-medium"
                            >
                              <GraduationCap className="w-4 h-4 text-indigo-600" />
                              <span>Course Management</span>
                            </Link>
                          </>
                        )}

                        {role === 'admin' && (
                          <Link 
                            href="/admin/dashboard" 
                            onClick={() => setUserDropdownOpen(false)}
                            className="flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:text-purple-700 hover:bg-purple-50 transition font-medium"
                          >
                            <Shield className="w-4 h-4 text-purple-600" />
                            <span>Admin Console</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100">
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition font-bold"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  href="/login" 
                  className="text-xs font-bold text-slate-700 hover:text-blue-600 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl shadow-md shadow-blue-600/20 transition hover:scale-105"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition border border-slate-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2 shadow-lg animate-in slide-in-from-top duration-200">
            {/* Mobile Find Jobs: ONLY for Seeker or Non-logged in */}
            {(!isAuthenticated || role === 'seeker') && (
              <Link 
                href="/jobs" 
                onClick={() => setMobileMenuOpen(false)} 
                className="block px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50"
              >
                Find Jobs
              </Link>
            )}

            {/* Mobile Courses link for Seekers and Guests */}
            {(!isAuthenticated || role === 'seeker') && (
              <Link 
                href="/courses" 
                onClick={() => setMobileMenuOpen(false)} 
                className="block px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50"
              >
                Courses & Certifications
              </Link>
            )}

            {isAuthenticated && role === 'seeker' && (
              <>
                <Link 
                  href="/seeker/profile" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                >
                  My Profile
                </Link>
                <Link 
                  href="/seeker/applications" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                >
                  My Applications
                </Link>
                <Link 
                  href="/seeker/saved-jobs" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                >
                  Saved Jobs
                </Link>
                <Link 
                  href="/messages" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                >
                  Messages
                </Link>
              </>
            )}

            {isAuthenticated && role === 'employer' && (
              <>
                <Link 
                  href="/employer/dashboard" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/employer/post-job" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                >
                  Post a Job
                </Link>
                <Link 
                  href="/employer/courses" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                >
                  Manage Courses
                </Link>
                <Link 
                  href="/employer/post-course" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                >
                  Post New Course
                </Link>
                <Link 
                  href="/employer/my-jobs" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                >
                  Manage Jobs
                </Link>
                <Link 
                  href="/employer/applicants" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                >
                  Applicants
                </Link>
                <Link 
                  href="/employer/metrics" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block px-3.5 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-blue-50"
                >
                  Analytics & Funnels
                </Link>
              </>
            )}

            {isAuthenticated && role === 'admin' && (
              <>
                <Link 
                  href="/admin/dashboard" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block px-3.5 py-2 rounded-lg text-sm font-semibold text-purple-700 hover:bg-purple-50"
                >
                  Admin Analytics
                </Link>
                <Link 
                  href="/admin/jobs" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block px-3.5 py-2 rounded-lg text-sm font-semibold text-purple-700 hover:bg-purple-50"
                >
                  Job Approvals
                </Link>
                <Link 
                  href="/admin/users" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block px-3.5 py-2 rounded-lg text-sm font-semibold text-purple-700 hover:bg-purple-50"
                >
                  User Management
                </Link>
                <Link 
                  href="/admin/announcements" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block px-3.5 py-2 rounded-lg text-sm font-semibold text-purple-700 hover:bg-purple-50"
                >
                  Broadcast Announcements
                </Link>
              </>
            )}

            {isAuthenticated ? (
              <button 
                onClick={handleLogout}
                className="w-full text-left px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-sm font-bold transition"
              >
                Sign Out
              </button>
            ) : (
              <div className="pt-2 flex flex-col space-y-2">
                <Link 
                  href="/login" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block text-center py-2 text-sm font-semibold text-slate-700 bg-slate-100 rounded-lg"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  onClick={() => setMobileMenuOpen(false)} 
                  className="block text-center py-2 text-sm font-bold text-white bg-blue-600 rounded-lg"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}


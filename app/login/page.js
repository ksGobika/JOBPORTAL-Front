"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../store/slices/authSlice';
import { authService } from '../../services/api';
import Link from 'next/link';
import { Briefcase, Lock, Mail, ArrowRight, UserCheck, ShieldAlert, Sparkles, Building2, User, Eye, EyeOff } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLocalhost, setIsLocalhost] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      setIsLocalhost(hostname === 'localhost' || hostname === '127.0.0.1');
    }
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!password || password.length < 6 || password.length > 20) {
      setError('Password must be between 6 and 20 characters.');
      return;
    }

    setLoading(true);

    try {
      const res = await authService.login(email.trim().toLowerCase());
      const users = res.data;
      
      const user = Array.isArray(users) ? users[0] : users;

      if (user && user.password === password) {
        dispatch(setCredentials({ user, token: 'mock-jwt-token' }));
        
        if (redirect && (user.role === 'seeker' || (!redirect.startsWith('/admin') && !redirect.startsWith('/employer')))) {
          router.push(redirect);
        } else if (user.role === 'admin') router.push('/admin/dashboard');
        else if (user.role === 'employer') router.push('/employer/dashboard');
        else router.push('/jobs');
      } else {
        setError('Invalid email or password. Please verify your credentials.');
      }
    } catch (err) {
      setError('Cannot connect to backend server. Make sure Spring Boot is running on port 8080!');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/20">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to access your JobPortal dashboard and applications
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-xl space-y-5">
          
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <span className="text-[10px] text-slate-400">6-20 chars</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  maxLength={20}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-blue-600/25 transition hover:scale-[1.01] flex items-center justify-center space-x-2"
            >
              <span>{loading ? "Signing in..." : "Sign In to Account"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick 1-Click Demo Accounts Switcher - ONLY visible on localhost, completely hidden on deployment */}
          {isLocalhost && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block text-center">
                ⚡ 1-Click Demo Credentials (Localhost Only):
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('alice@example.com', 'pass123')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-center transition group shadow-sm"
                >
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1 group-hover:scale-110" />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 block">Job Seeker</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('bob@techcorp.com', 'pass123')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-center transition group shadow-sm"
                >
                  <Building2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 mx-auto mb-1 group-hover:scale-110" />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 block">Employer</span>
                </button>

                <button
                  type="button"
                  onClick={() => fillDemoAccount('admin@jobportal.com', 'admin123')}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-purple-50 dark:bg-slate-800 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-center transition group shadow-sm"
                >
                  <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 mx-auto mb-1 group-hover:scale-110" />
                  <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 block">Admin</span>
                </button>
              </div>
            </div>
          )}

          <div className="text-center text-xs text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
              Register now
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center text-slate-400 text-xs font-semibold">Loading login...</div>}>
      <LoginForm />
    </Suspense>
  );
}
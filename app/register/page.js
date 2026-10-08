"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '../../services/api';
import Link from 'next/link';
import { 
  Briefcase, 
  Lock, 
  Mail, 
  User, 
  Building2, 
  ArrowRight, 
  ShieldCheck,
  Globe,
  MapPin,
  Users,
  Layers,
  Eye,
  EyeOff,
  AlertCircle,
  Phone
} from 'lucide-react';

export default function RegisterPage() {
  const [role, setRole] = useState('employer'); // 'employer' or 'seeker'
  const router = useRouter();

  // Employer specific fields
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('Information Technology');
  const [companyLocation, setCompanyLocation] = useState('');
  const [companySize, setCompanySize] = useState('11-50 employees');
  const [companyDetails, setCompanyDetails] = useState('');

  // Seeker specific fields (Preferred Role / Domain removed as requested)
  const [seekerName, setSeekerName] = useState('');
  const [seekerEmail, setSeekerEmail] = useState('');
  const [seekerPhone, setSeekerPhone] = useState('');
  const [seekerLocation, setSeekerLocation] = useState('');

  // Shared credentials
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6 || password.length > 20) {
      setError('Password must be between 6 and 20 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match! Please check again.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    setLoading(true);

    try {
      let newUser;

      if (role === 'employer') {
        if (!companyName.trim()) {
          setError('Please enter your Company Name.');
          setLoading(false);
          return;
        }
        if (!companyEmail.trim() || !emailRegex.test(companyEmail.trim())) {
          setError('Please enter a valid Company / Official Work Email (e.g. hr@company.com).');
          setLoading(false);
          return;
        }
        if (companyPhone && companyPhone.trim().length !== 10) {
          setError('Contact Phone Number must be exactly 10 digits.');
          setLoading(false);
          return;
        }

        const companyPayload = {
          name: companyName.trim(),
          contactPerson: contactPerson.trim() || companyName.trim(),
          email: companyEmail.trim().toLowerCase(),
          phone: companyPhone.trim(),
          website: companyWebsite.trim() || `https://${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
          industry: companyIndustry,
          location: companyLocation.trim() || 'Chennai, India',
          size: companySize,
          description: companyDetails.trim() || `${companyName.trim()} is an innovative tech organization.`
        };

        newUser = {
          name: companyName.trim(),
          email: companyEmail.trim().toLowerCase(),
          phone: companyPhone.trim(),
          password: password.trim(),
          role: 'employer',
          company: JSON.stringify(companyPayload),
          profile: null,
          savedJobs: JSON.stringify([])
        };
      } else {
        if (!seekerName.trim()) {
          setError('Please enter your Full Name.');
          setLoading(false);
          return;
        }
        if (!seekerEmail.trim() || !emailRegex.test(seekerEmail.trim())) {
          setError('Please enter a valid Email Address (e.g. user@domain.com).');
          setLoading(false);
          return;
        }
        if (seekerPhone && seekerPhone.trim().length !== 10) {
          setError('Mobile Phone Number must be exactly 10 digits.');
          setLoading(false);
          return;
        }

        const profilePayload = {
          headline: 'Software Engineer',
          location: seekerLocation.trim() || '',
          domain: 'Software Engineering',
          phone: seekerPhone.trim(),
          bio: '',
          skills: ['JavaScript', 'React', 'Java', 'Spring Boot', 'MySQL'],
          education: [],
          experience: [],
          resumeFileName: '',
          resumeData: '',
          resumeSize: ''
        };

        newUser = {
          name: seekerName.trim(),
          email: seekerEmail.trim().toLowerCase(),
          phone: seekerPhone.trim(),
          password: password.trim(),
          role: 'seeker',
          company: null,
          profile: JSON.stringify(profilePayload),
          savedJobs: JSON.stringify([])
        };
      }

      await authService.register(newUser);
      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (err) {
      console.error("Registration error:", err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || (err.response?.status === 409 ? 'An account with this email already exists.' : 'Registration failed. Please verify your details and try again.');
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[88vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/20 mb-3">
            <Briefcase className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Create Your Account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {role === 'employer' 
              ? 'Register your company to post vacancies and discover top talent'
              : 'Join thousands of professionals finding their dream career'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          
          {/* Role Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { setRole('employer'); setError(''); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                role === 'employer' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>Employer / Recruiter</span>
            </button>

            <button
              type="button"
              onClick={() => { setRole('seeker'); setError(''); }}
              className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                role === 'seeker' 
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/20' 
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Job Seeker</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                Account Created Successfully!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Details saved in MySQL database. Redirecting to Login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              
              {/* ================= EMPLOYER REGISTRATION FORM ================= */}
              {role === 'employer' ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    {/* 1. Company Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Company Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="e.g. InnovateTech Solutions Pvt Ltd"
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                        />
                      </div>
                    </div>

                    {/* 2. Official Work Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Work Email <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={companyEmail}
                          onChange={(e) => setCompanyEmail(e.target.value)}
                          placeholder="hr@company.com"
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                        />
                      </div>
                    </div>

                    {/* 3. Company Phone Number */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Contact Phone
                        </label>
                        {companyPhone && (
                          <span className={`text-[10px] font-semibold ${companyPhone.length === 10 ? 'text-emerald-600' : 'text-amber-500'}`}>
                            {companyPhone.length}/10 digits
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          maxLength={10}
                          value={companyPhone}
                          onChange={(e) => setCompanyPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="10-digit phone (e.g. 9876543210)"
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                        />
                      </div>
                    </div>

                    {/* 4. Contact Person / HR Lead */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Contact Person / HR Lead
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={contactPerson}
                          onChange={(e) => setContactPerson(e.target.value)}
                          placeholder="e.g. Priya Sharma"
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                        />
                      </div>
                    </div>

                    {/* 5. Company Website */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Company Website URL
                      </label>
                      <div className="relative">
                        <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="url"
                          value={companyWebsite}
                          onChange={(e) => setCompanyWebsite(e.target.value)}
                          placeholder="https://company.com"
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                        />
                      </div>
                    </div>

                    {/* 6. Company Industry / Domain */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Industry / Domain
                      </label>
                      <div className="relative">
                        <Layers className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <select
                          value={companyIndustry}
                          onChange={(e) => setCompanyIndustry(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                        >
                          <option value="Information Technology">Information Technology & Software</option>
                          <option value="Fintech & Banking">Fintech & Banking</option>
                          <option value="Healthcare & Pharma">Healthcare & Biotech</option>
                          <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                          <option value="EdTech & Education">EdTech & Education</option>
                          <option value="AI & Robotics">Artificial Intelligence & Robotics</option>
                          <option value="Consulting & Services">Consulting & HR Services</option>
                          <option value="Other">Other Industry</option>
                        </select>
                      </div>
                    </div>

                    {/* 7. Company Headquarters / Location */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Headquarters / City <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={companyLocation}
                          onChange={(e) => setCompanyLocation(e.target.value)}
                          placeholder="e.g. Chennai, Tamil Nadu"
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                        />
                      </div>
                    </div>

                    {/* 8. Company Size */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Company Size (Employees)
                      </label>
                      <div className="relative">
                        <Users className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <select
                          value={companySize}
                          onChange={(e) => setCompanySize(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                        >
                          <option value="1-10 employees">1 - 10 employees (Startup)</option>
                          <option value="11-50 employees">11 - 50 employees (Early Growth)</option>
                          <option value="51-200 employees">51 - 200 employees (Mid-Size)</option>
                          <option value="201-500 employees">201 - 500 employees</option>
                          <option value="500+ employees">500+ employees (Enterprise / MNC)</option>
                        </select>
                      </div>
                    </div>

                    {/* 9. Brief Company Description */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        About Company / Brief Details
                      </label>
                      <textarea
                        rows={2}
                        value={companyDetails}
                        onChange={(e) => setCompanyDetails(e.target.value)}
                        placeholder="Brief overview of your company, mission, or perks..."
                        className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none shadow-sm"
                      />
                    </div>

                  </div>
                </>
              ) : (
                /* ================= JOB SEEKER REGISTRATION FORM ================= */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    
                    {/* 1. Full Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={seekerName}
                          onChange={(e) => setSeekerName(e.target.value)}
                          placeholder="e.g. Gobika"
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                        />
                      </div>
                    </div>

                    {/* 2. Email Address */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={seekerEmail}
                          onChange={(e) => setSeekerEmail(e.target.value)}
                          placeholder="e.g. gobika@example.com"
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                        />
                      </div>
                    </div>

                    {/* 3. Mobile Phone Number (10 digits only) */}
                    <div className="sm:col-span-2">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                          Mobile Phone Number
                        </label>
                        {seekerPhone && (
                          <span className={`text-[10px] font-semibold ${seekerPhone.length === 10 ? 'text-emerald-600' : 'text-amber-500'}`}>
                            {seekerPhone.length}/10 digits
                          </span>
                        )}
                      </div>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          maxLength={10}
                          value={seekerPhone}
                          onChange={(e) => setSeekerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="10-digit mobile (e.g. 9876543210)"
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                        />
                      </div>
                    </div>

                    {/* 4. Current City / Location */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Current City / Location
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={seekerLocation}
                          onChange={(e) => setSeekerLocation(e.target.value)}
                          placeholder="e.g. Chennai, Tamil Nadu"
                          className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                        />
                      </div>
                    </div>

                  </div>
                </>
              )}

              {/* ================= PASSWORD & CONFIRM PASSWORD ================= */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {password ? `${password.length}/20 chars` : '6-20 chars'}
                    </span>
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

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    {confirmPassword && (
                      <span className={`text-[10px] font-semibold ${password === confirmPassword ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {password === confirmPassword ? 'Matches' : 'No match'}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      maxLength={20}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs py-3 rounded-xl shadow-lg shadow-blue-600/25 transition hover:scale-[1.01] flex items-center justify-center space-x-2"
              >
                <span>
                  {loading 
                    ? "Creating Account in Database..." 
                    : role === 'employer' 
                      ? "Register Company Account" 
                      : "Create Job Seeker Account"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-800">
            Already registered?{' '}
            <Link href="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">
              Sign In to Your Account
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}
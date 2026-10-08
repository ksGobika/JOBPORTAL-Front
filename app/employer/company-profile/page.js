"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { 
  Building2, 
  Globe, 
  MapPin, 
  Users, 
  Save, 
  CheckCircle, 
  Sparkles,
  ShieldCheck,
  Briefcase
} from 'lucide-react';
import { authService } from '../../../services/api';
import { setCredentials } from '../../../store/slices/authSlice';

export default function EmployerCompanyProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const dispatch = useDispatch();

  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('https://company.example.com');
  const [industry, setIndustry] = useState('Information Technology & Software');
  const [companySize, setCompanySize] = useState('11 - 50 Employees');
  const [headquarters, setHeadquarters] = useState('Chennai, Tamil Nadu');
  const [tagline, setTagline] = useState('Empowering businesses with cutting-edge tech solutions and talent.');
  const [about, setAbout] = useState('We are an innovative tech company building next-generation applications and enterprise platforms with high-performing engineering teams.');
  
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login?redirect=/employer/company-profile');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (user?.company) {
      try {
        const comp = typeof user.company === 'string' ? JSON.parse(user.company) : user.company;
        if (comp.name) setCompanyName(comp.name);
        if (comp.website) setWebsite(comp.website);
        if (comp.industry) setIndustry(comp.industry);
        if (comp.size) setCompanySize(comp.size);
        if (comp.headquarters || comp.location) setHeadquarters(comp.headquarters || comp.location);
        if (comp.tagline) setTagline(comp.tagline);
        if (comp.about || comp.description) setAbout(comp.about || comp.description);
      } catch (e) {}
    } else if (user?.name) {
      setCompanyName(user.name);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const companyData = {
        name: companyName,
        website,
        industry,
        size: companySize,
        headquarters,
        location: headquarters,
        tagline,
        about,
        description: about
      };

      await authService.updateProfile(user.id, {
        company: JSON.stringify(companyData)
      });

      dispatch(setCredentials({ 
        user: { ...user, company: JSON.stringify(companyData) }, 
        token: 'mock-jwt' 
      }));

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      alert("Failed to save company profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
            <Building2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Company Branding & Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Showcase your organization culture, mission, and benefits to attract top candidate applications
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/30 transition flex items-center space-x-2 shrink-0"
        >
          {savedSuccess ? <CheckCircle className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
          <span>{saving ? "Saving..." : savedSuccess ? "Profile Saved!" : "Save Changes"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Company Preview Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-sm">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white text-3xl font-black mx-auto shadow-md shadow-indigo-500/20">
              {companyName ? companyName.charAt(0).toUpperCase() : 'C'}
            </div>

            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">{companyName || 'Tech Enterprise'}</h3>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-0.5">{industry}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mt-1 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{headquarters}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Team Size:</span>
                <span className="font-bold">{companySize}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Website:</span>
                <a href={website} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 font-bold hover:underline truncate max-w-[150px]">
                  {website ? website.replace('https://', '') : 'company.com'}
                </a>
              </div>
            </div>

            <div className="pt-2 flex justify-center">
              <span className="text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Verified Recruiter Account
              </span>
            </div>
          </div>
        </div>

        {/* Right Col: Edit Form */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            Organization Details
          </h3>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Industry Sector</label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Headquarters</label>
                <input
                  type="text"
                  value={headquarters}
                  onChange={(e) => setHeadquarters(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Size</label>
                <select
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                >
                  <option value="1 - 10 Employees">1 - 10 Employees</option>
                  <option value="11 - 50 Employees">11 - 50 Employees</option>
                  <option value="50 - 250 Employees">50 - 250 Employees</option>
                  <option value="250 - 1000 Employees">250 - 1000 Employees</option>
                  <option value="1000+ Employees">1000+ Employees</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Tagline / Pitch</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">About Organization & Culture</label>
              <textarea
                rows={4}
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl p-3.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none leading-relaxed shadow-sm"
              />
            </div>
          </form>
        </div>

      </div>

    </div>
  );
}

"use client";

import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  User, 
  Mail, 
  Briefcase, 
  GraduationCap, 
  Plus, 
  Trash2, 
  Save, 
  CheckCircle, 
  FileText, 
  Upload, 
  Sparkles,
  MapPin,
  Building2,
  Calendar,
  Phone,
  Download,
  Eye,
  AlertCircle,
  FolderOpen,
  Layers
} from 'lucide-react';
import { authService } from '../../../services/api';
import { setCredentials } from '../../../store/slices/authSlice';

export default function SeekerProfilePage() {
  const { user } = useSelector((state) => state.auth || {});
  const dispatch = useDispatch();

  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [location, setLocation] = useState('');
  const [domain, setDomain] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [skills, setSkills] = useState(['React', 'JavaScript', 'Java', 'Spring Boot', 'Tailwind CSS', 'MySQL']);
  const [newSkill, setNewSkill] = useState('');
  
  // Resume state
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeData, setResumeData] = useState('');
  const [resumeSize, setResumeSize] = useState('');
  const [resumeUploadedAt, setResumeUploadedAt] = useState('');
  const [resumeError, setResumeError] = useState('');
  const fileInputRef = useRef(null);

  // Education List
  const [education, setEducation] = useState([
    { id: 1, degree: 'B.E / B.Tech in Computer Science', institution: 'Anna University', year: '2019 - 2023' },
  ]);
  const [newDegree, setNewDegree] = useState('');
  const [newSchool, setNewSchool] = useState('');
  const [newYear, setNewYear] = useState('');

  // Experience List
  const [experience, setExperience] = useState([
    { id: 1, role: 'Software Developer', company: 'Tech Solutions', duration: '2023 - Present', desc: 'Developing full stack web applications and REST APIs.' }
  ]);
  const [newRole, setNewRole] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      try {
        const prof = typeof user.profile === 'string' ? JSON.parse(user.profile) : (user.profile || {});
        if (prof.headline !== undefined) setHeadline(prof.headline);
        else setHeadline('Software Engineer');

        if (prof.location !== undefined) setLocation(prof.location);
        if (prof.domain !== undefined) setDomain(prof.domain);
        if (prof.phone !== undefined) setPhone(prof.phone);
        if (prof.bio !== undefined) setBio(prof.bio);
        if (prof.skills && Array.isArray(prof.skills) && prof.skills.length > 0) setSkills(prof.skills);
        if (prof.education && Array.isArray(prof.education)) setEducation(prof.education);
        if (prof.experience && Array.isArray(prof.experience)) setExperience(prof.experience);

        if (prof.resumeFileName) setResumeFileName(prof.resumeFileName);
        if (prof.resumeData) setResumeData(prof.resumeData);
        if (prof.resumeSize) setResumeSize(prof.resumeSize);
        if (prof.resumeUploadedAt) setResumeUploadedAt(prof.resumeUploadedAt);
      } catch (e) {
        console.error("Error parsing user profile:", e);
      }
    }
  }, [user]);

  // Handle manual Resume Upload
  const handleResumeFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    // Validate type
    const validExtensions = ['.pdf', '.doc', '.docx'];
    const hasValidExt = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
    if (!hasValidExt) {
      setResumeError('Please select a valid PDF or Word document (.pdf, .doc, .docx)');
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setResumeError('File size exceeds 10MB limit.');
      return;
    }

    setResumeError('');
    const formattedSize = file.size > 1024 * 1024 
      ? (file.size / (1024 * 1024)).toFixed(2) + ' MB'
      : (file.size / 1024).toFixed(0) + ' KB';

    const uploadDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    setResumeFileName(file.name);
    setResumeSize(formattedSize);
    setResumeUploadedAt(uploadDate);

    // Read Base64 Data URL for download/preview
    const reader = new FileReader();
    reader.onload = () => {
      setResumeData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveResume = () => {
    setResumeFileName('');
    setResumeData('');
    setResumeSize('');
    setResumeUploadedAt('');
    setResumeError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDownloadResume = () => {
    if (!resumeData && !resumeFileName) return;
    const downloadLink = document.createElement('a');
    downloadLink.href = resumeData || '#';
    downloadLink.download = resumeFileName || 'Resume.pdf';
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddEducation = (e) => {
    e.preventDefault();
    if (newDegree && newSchool) {
      setEducation([...education, { id: Date.now(), degree: newDegree, institution: newSchool, year: newYear || '2024' }]);
      setNewDegree('');
      setNewSchool('');
      setNewYear('');
    }
  };

  const handleAddExperience = (e) => {
    e.preventDefault();
    if (newRole && newCompany) {
      setExperience([...experience, { id: Date.now(), role: newRole, company: newCompany, duration: newDuration || '2023 - Present', desc: newDesc }]);
      setNewRole('');
      setNewCompany('');
      setNewDuration('');
      setNewDesc('');
    }
  };

  const handleSaveProfile = async (e) => {
    if (e) e.preventDefault();
    
    if (phone && phone.trim().length !== 10) {
      alert("Phone number must be exactly 10 digits.");
      return;
    }

    setSaving(true);
    try {
      const profileData = {
        headline: headline.trim(),
        location: location.trim(),
        domain: domain.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        skills,
        education,
        experience,
        resumeFileName,
        resumeData,
        resumeSize,
        resumeUploadedAt: resumeUploadedAt || (resumeFileName ? new Date().toLocaleDateString() : '')
      };

      if (user?.id) {
        await authService.updateProfile(user.id, {
          name: name.trim(),
          profile: JSON.stringify(profileData)
        });
      }

      dispatch(setCredentials({ 
        user: { 
          ...user, 
          name: name.trim(), 
          profile: JSON.stringify(profileData) 
        }, 
        token: 'mock-jwt' 
      }));

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error("Save profile error:", err);
      alert("Failed to save profile. Please ensure backend is running!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900/80 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Job Seeker Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your credentials, professional domain, location, resume, skills, and work history
          </p>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-md shadow-blue-600/30 transition hover:scale-105 flex items-center space-x-2"
        >
          {savedSuccess ? <CheckCircle className="w-4 h-4 text-emerald-200" /> : <Save className="w-4 h-4" />}
          <span>{saving ? "Saving Changes..." : savedSuccess ? "Profile Saved in Database!" : "Save Changes"}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Col: Personal Details, Resume & Skills */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Profile Card */}
          <div className="glass-panel bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-sm">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl font-black mx-auto shadow-lg shadow-blue-500/25">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>

            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">{name || 'Job Seeker'}</h3>
              <p className="text-xs text-blue-600 dark:text-blue-400 font-bold mt-0.5">
                {headline || 'Professional Headline'}
              </p>
              
              {domain && (
                <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 rounded-xl text-[11px] font-bold">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>{domain}</span>
                </div>
              )}

              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1 mt-2.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{location || 'Location not specified'}</span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-center">
              <span className="text-[10px] font-bold uppercase bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-3.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                <span>Ready to Work</span>
              </span>
            </div>
          </div>

          {/* Attached Resume / CV Management Card */}
          <div className="glass-card bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Attached Resume / CV</span>
              </h3>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleResumeFileChange}
              className="hidden"
            />

            {resumeError && (
              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-2 text-[11px] text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{resumeError}</span>
              </div>
            )}

            {resumeFileName ? (
              <div className="space-y-3">
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 rounded-2xl space-y-2 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start space-x-2.5 min-w-0">
                      <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {resumeFileName}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                          {resumeSize ? `${resumeSize} • ` : ''}{resumeUploadedAt ? `Uploaded ${resumeUploadedAt}` : 'Ready'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20 px-2 py-0.5 rounded-md font-bold shrink-0">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/30">
                    {resumeData && (
                      <button
                        type="button"
                        onClick={handleDownloadResume}
                        className="flex-1 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span>Download</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold py-1.5 px-2 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 transition shadow-sm"
                    >
                      <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Replace</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveResume}
                      className="p-1.5 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-500 rounded-xl border border-slate-200 dark:border-slate-700 transition"
                      title="Remove resume"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-blue-50/20 rounded-2xl p-5 text-center cursor-pointer transition space-y-2"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Click to browse & upload Resume / CV
                  </p>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Supports PDF, DOCX, DOC (Max 10 MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Skills Management Card */}
          <div className="glass-card bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Skills & Proficiencies</span>
            </h3>

            <form onSubmit={handleAddSkill} className="flex gap-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add skill (e.g. Next.js, MySQL)..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white p-2.5 rounded-xl text-xs font-bold transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            <div className="flex flex-wrap gap-1.5 pt-2">
              {skills.map((skill, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60 text-xs font-semibold shadow-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="text-slate-400 hover:text-rose-500 font-bold ml-0.5 text-xs"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* Right Col: Personal Info Form + Work History + Education */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Personal Info Form */}
          <div className="glass-card bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>General Information</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Gobika"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Professional Headline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Full Stack Developer / Software Engineer"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  <span>Current Location / City</span>
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Chennai, Tamil Nadu, India"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Preferred Domain / Industry</span>
                </label>
                <input
                  type="text"
                  list="domain-options"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="e.g. Web Development / Full Stack / AI"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                />
                <datalist id="domain-options">
                  <option value="Web Development" />
                  <option value="Full Stack Development" />
                  <option value="Frontend Development" />
                  <option value="Backend Development" />
                  <option value="Artificial Intelligence & ML" />
                  <option value="Data Science & Analytics" />
                  <option value="Cloud Computing & DevOps" />
                  <option value="Cyber Security" />
                  <option value="Mobile App Development" />
                  <option value="UI/UX Design" />
                  <option value="Quality Assurance & Testing" />
                </datalist>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contact Phone Number</span>
                  </label>
                  {phone && (
                    <span className={`text-[10px] font-semibold ${phone.length === 10 ? 'text-emerald-600' : 'text-amber-500'}`}>
                      {phone.length}/10 digits
                    </span>
                  )}
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10-digit mobile (e.g. 9876543210)"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bio / Summary
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Write a brief summary of your professional expertise, goals, and passions..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 resize-none shadow-sm"
              />
            </div>
          </div>

          {/* Work Experience */}
          <div className="glass-card bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Work Experience Timeline</span>
            </h3>

            <div className="space-y-3">
              {experience.map((exp) => (
                <div key={exp.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-start justify-between gap-4 shadow-sm">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{exp.role}</h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold">{exp.company} • {exp.duration}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{exp.desc}</p>
                  </div>
                  <button
                    onClick={() => setExperience(experience.filter(e => e.id !== exp.id))}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition"
                    title="Remove experience"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Experience Form */}
            <form onSubmit={handleAddExperience} className="p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-inner">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">+ Add Position</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Job Title"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                />
                <input
                  type="text"
                  placeholder="Duration (e.g. 2021-2023)"
                  value={newDuration}
                  onChange={(e) => setNewDuration(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
              <textarea
                placeholder="Key accomplishments and duties..."
                rows={2}
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none shadow-sm"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-blue-500/20"
              >
                Add Experience Entry
              </button>
            </form>
          </div>

          {/* Education */}
          <div className="glass-card bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Educational Background</span>
            </h3>

            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl flex items-start justify-between gap-4 shadow-sm">
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{edu.degree}</h4>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">{edu.institution} • {edu.year}</p>
                  </div>
                  <button
                    onClick={() => setEducation(education.filter(e => e.id !== edu.id))}
                    className="text-slate-400 hover:text-rose-500 p-1 rounded-lg transition"
                    title="Remove education"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Education Form */}
            <form onSubmit={handleAddEducation} className="p-5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3 shadow-inner">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">+ Add Degree / Certificate</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Degree / Major"
                  value={newDegree}
                  onChange={(e) => setNewDegree(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                />
                <input
                  type="text"
                  placeholder="College / University"
                  value={newSchool}
                  onChange={(e) => setNewSchool(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                />
                <input
                  type="text"
                  placeholder="Years (e.g. 2019 - 2023)"
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition shadow-md shadow-purple-500/20"
              >
                Add Education Entry
              </button>
            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
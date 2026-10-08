"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  GraduationCap, 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Link as LinkIcon, 
  Globe, 
  Building, 
  Clock, 
  Award, 
  CheckCircle2, 
  Wand2,
  ExternalLink,
  BookOpen,
  Layers
} from 'lucide-react';
import Link from 'next/link';
import { courseService } from '../../../services/api';

const CATEGORIES = [
  "Software Engineering",
  "Cloud & DevOps",
  "Data Science & AI",
  "Product & Design",
  "Cybersecurity",
  "Business & Leadership"
];

const PLATFORMS = [
  "Coursera",
  "Udemy",
  "YouTube",
  "edX",
  "freeCodeCamp",
  "LinkedIn Learning",
  "Google Cloud Skills",
  "AWS Skill Builder",
  "Official Documentation / LMS",
  "Other External Website"
];

const SAMPLE_COURSES = [
  {
    title: "AWS Cloud Practitioner & Solutions Architect Fundamentals",
    platform: "AWS Skill Builder",
    courseUrl: "https://aws.amazon.com/training/digital/",
    category: "Cloud & DevOps",
    level: "Beginner",
    duration: "6 Weeks (25 Hours)",
    instructorName: "AWS Training & Certification",
    description: "Official AWS comprehensive fundamentals covering cloud compute (EC2), storage (S3), identity management (IAM), virtual private cloud (VPC), and architecture best practices.",
    syllabus: "Cloud Concepts, Security & Compliance, Core AWS Services, Cloud Architecture Principles, Billing & Pricing"
  },
  {
    title: "Full-Stack Web Development & Microservices Bootcamp",
    platform: "freeCodeCamp",
    courseUrl: "https://www.freecodecamp.org/learn",
    category: "Software Engineering",
    level: "Intermediate",
    duration: "8 Weeks (40 Hours)",
    instructorName: "Quincy Larson & Community",
    description: "Master modern full-stack web engineering including responsive frontend design, backend API development, relational databases, security authentication, and production container deployment.",
    syllabus: "Frontend Fundamentals, Backend APIs with Node/Java, SQL & NoSQL Databases, System Security, Cloud Deployment"
  },
  {
    title: "Google Machine Learning & Deep Learning Specialization",
    platform: "Coursera",
    courseUrl: "https://www.coursera.org/learn/machine-learning",
    category: "Data Science & AI",
    level: "Intermediate",
    duration: "4 Weeks (20 Hours)",
    instructorName: "Andrew Ng, DeepLearning.AI",
    description: "Foundational AI masterclass taught by industry leaders covering supervised learning, neural networks, decision trees, gradient descent, and real-world ML deployment.",
    syllabus: "Supervised Learning, Neural Networks & Deep Learning, Model Evaluation, Unsupervised Learning & Recommenders"
  }
];

export default function PostCoursePage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated]);

  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState(PLATFORMS[0]);
  const [courseUrl, setCourseUrl] = useState('');
  const [instructorName, setInstructorName] = useState(user?.name || '');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [level, setLevel] = useState('Intermediate');
  const [duration, setDuration] = useState('4 Weeks (20 Hours)');
  const [description, setDescription] = useState('');
  const [syllabus, setSyllabus] = useState('');
  const [saving, setSaving] = useState(false);

  const handlePreFillSample = (sample) => {
    setTitle(sample.title);
    setPlatform(sample.platform);
    setCourseUrl(sample.courseUrl);
    setCategory(sample.category);
    setLevel(sample.level);
    setDuration(sample.duration);
    setInstructorName(sample.instructorName);
    setDescription(sample.description);
    setSyllabus(sample.syllabus);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !courseUrl.trim() || !description.trim()) {
      alert("Please fill in Course Title, External Course URL, and Description.");
      return;
    }

    // Ensure valid URL
    let formattedUrl = courseUrl.trim();
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      formattedUrl = 'https://' + formattedUrl;
    }

    setSaving(true);
    try {
      const coursePayload = {
        title: title.trim(),
        platform: platform || "External Website",
        courseUrl: formattedUrl,
        instructorName: instructorName || user?.name || "Verified Instructor",
        companyName: user?.company?.name || user?.name || "Partner Organization",
        employerId: user?.id || "emp-1",
        category,
        level,
        duration,
        description: description.trim(),
        syllabus: syllabus.trim(),
        enrolledCount: 0,
        status: "published"
      };

      await courseService.createCourse(coursePayload);
      alert("Course posted successfully! Job seekers can now enroll and access the course link directly.");
      router.push('/employer/courses');
    } catch (err) {
      console.error("Failed to save course", err);
      alert("Error saving course. Please check backend connection.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-8 py-4 sticky top-16 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/employer/courses"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-900">Post a Course for Job Seekers</h1>
              <p className="text-xs text-slate-500 font-medium">Add external courses (Coursera, Udemy, YouTube, LMS, etc.) for candidates to enroll</p>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition shadow-md shadow-blue-500/20 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing...' : 'Publish Course'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-6">
        {/* Quick Sample Selector */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-3xl p-5 shadow-xs space-y-3">
          <div className="flex items-center space-x-2">
            <Wand2 className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-black text-blue-900 uppercase tracking-wide">
              Quick Autofill Sample Templates
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SAMPLE_COURSES.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePreFillSample(sample)}
                className="text-left p-3 rounded-2xl bg-white hover:bg-blue-600 hover:text-white border border-blue-100 hover:border-blue-600 shadow-xs transition group"
              >
                <span className="text-[10px] font-black uppercase text-blue-600 group-hover:text-blue-200 block">
                  {sample.platform}
                </span>
                <p className="text-xs font-bold text-slate-800 group-hover:text-white line-clamp-1 mt-0.5">
                  {sample.title}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
            <GraduationCap className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-black text-slate-900">Course Information & External Website Link</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Course Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Complete Python & AI Engineering Masterclass"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            {/* Platform / Host */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Platform / Hosting Website *</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              >
                {PLATFORMS.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            {/* External Course URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span>External Course Website Link (URL) *</span>
              </label>
              <input
                type="url"
                required
                placeholder="https://www.coursera.org/learn/... or https://youtube.com/..."
                value={courseUrl}
                onChange={(e) => setCourseUrl(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
              />
              <p className="text-[11px] text-slate-400">Job seekers will be redirected to this link when they click "Start Learning".</p>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Category / Domain *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              >
                {CATEGORIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Difficulty Level *</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            {/* Instructor / Organization */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Instructor / Organization Name</label>
              <input
                type="text"
                placeholder="e.g. Dr. Andrew Ng or AWS Training Team"
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Duration */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Estimated Duration</label>
              <input
                type="text"
                placeholder="e.g. 4 Weeks (20 Hours)"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Course Description & Learning Outcomes *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe what the job seeker will learn from this course and how it prepares them for jobs..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>

            {/* Topics Covered / Syllabus Summary */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Key Topics Covered (Comma-separated)</label>
              <input
                type="text"
                placeholder="e.g. React.js, Next.js, Redux Toolkit, REST APIs, Microservices, Tailwind CSS"
                value={syllabus}
                onChange={(e) => setSyllabus(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white"
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-4">
            <Link
              href="/employer/courses"
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-7 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-black rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Publishing...' : 'Publish Course'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

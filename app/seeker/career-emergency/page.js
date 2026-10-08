"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { 
  AlertTriangle, 
  Flame, 
  Clock, 
  Target, 
  CheckCircle2, 
  Circle, 
  ArrowRight, 
  Briefcase, 
  Calendar, 
  FileText, 
  Send, 
  UserCheck, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Zap, 
  Building2, 
  MapPin, 
  DollarSign, 
  Sliders, 
  RotateCcw,
  Compass,
  Check,
  Award,
  Plus,
  Trash2,
  Edit3,
  Save,
  Wand2
} from 'lucide-react';
import { jobService } from '../../../services/api';

const PRESET_DURATIONS = [
  { days: 15, label: "15 Days", badge: "Critical Sprint 🔥" },
  { days: 30, label: "30 Days", badge: "Standard Urgent 🚨" },
  { days: 45, label: "45 Days", badge: "Fast-Track ⚡" },
  { days: 60, label: "60 Days", badge: "Strategic Goal 🎯" }
];

const ROLE_TEMPLATES = {
  "Full Stack Developer": {
    p1: [
      "Set profile status to '⚡ Immediate Joiner (<30 Days)' & publish GitHub portfolio",
      "Deploy live full-stack demo project (React/Next.js frontend + REST API backend)",
      "Apply to at least 5 immediate-hiring Full Stack positions from the Curated list",
      "Reach out directly to 3 Tech Leads or Engineering Managers on LinkedIn"
    ],
    p2: [
      "Complete live API screening assessment & REST contract test with 85%+ score",
      "Practice CRUD endpoints, SQL schema joins, and state management challenges",
      "Follow up with all recruiters from Phase 1 applications",
      "Schedule initial talent discovery & technical screening calls"
    ],
    p3: [
      "Prepare 4 STAR stories (Architecture decision, High-traffic bug fix, Tech leadership)",
      "Ace live full-stack machine coding round & system design whiteboard",
      "Send post-interview technical notes and architecture summary within 6 hours",
      "Complete final HR / Director round with confidence"
    ],
    p4: [
      "Evaluate offer letter CTC breakdown (Fixed, Variable, Health, PF, Joining bonus)",
      "Negotiate start date and confirm immediate joining readiness",
      "Submit educational credentials, ID proofs, and signed acceptance",
      "Begin Day-1 environment onboarding and celebrate your new offer! 🎉"
    ]
  },
  "Frontend Developer": {
    p1: [
      "Polish portfolio website showcasing responsive UI, React 19/Next.js, & Tailwind CSS",
      "Deploy 2 polished web applications with live Vercel/Netlify demo links & source code",
      "Apply to 5+ high-priority Frontend / React Developer openings",
      "Optimize LinkedIn headline: 'Frontend Engineer | React, Next.js, TypeScript | Immediate Joiner'"
    ],
    p2: [
      "Solve 10 classic JavaScript/TypeScript coding drills (Closures, Promises, Event Loop)",
      "Build live UI challenge under 45 mins (Pagination, Search filter, Debounce, Theme toggle)",
      "Follow up on submitted frontend applications with hiring managers",
      "Schedule technical discovery calls with engineering recruiters"
    ],
    p3: [
      "Prepare for Frontend System Design (State lifting, SSR vs CSR, Image optimization, Web Vitals)",
      "Pass live coding interview: Component composition, custom hooks, and API integration",
      "Showcase CSS layout mastery (Flexbox, Grid, Responsive breakpoints) in pair-programming",
      "Complete cultural fit and leadership discussion round"
    ],
    p4: [
      "Review offer compensation package and remote setup allowances",
      "Confirm joining date and complete background verification paperwork",
      "Sign offer letter and notify referees for quick background clearance",
      "Get ready for Day-1 sprint and celebrate your frontend developer role! 🎉"
    ]
  },
  "Backend Developer": {
    p1: [
      "Publish GitHub repository demonstrating robust REST APIs (Spring Boot / Node.js / Python)",
      "Implement JWT authentication, PostgreSQL/MySQL database connection & Dockerfile",
      "Apply to 5+ urgent Backend / Java / Python / Node engineering listings",
      "Connect with 3 engineering directors and backend hiring teams"
    ],
    p2: [
      "Master core backend concepts (ACID properties, Indexing, Caching with Redis, Concurrency)",
      "Complete backend coding assessment & algorithmic data structures round",
      "Follow up on all job applications submitted with personalized notes",
      "Coordinate technical screening and take-home API evaluation"
    ],
    p3: [
      "Ace System Design interview (Scalability, Load balancing, Message queues, Microservices)",
      "Demonstrate live database query optimization & clean OOP / SOLID architecture",
      "Answer behavioral questions regarding high-severity production outage mitigation",
      "Complete final round with VP of Engineering or CTO"
    ],
    p4: [
      "Compare backend engineering offer packages and annual increments",
      "Lock in joining timeline and submit background check verification documents",
      "Sign offer letter and confirm onboarding date",
      "Welcome to your new Backend Engineering role! 🎉"
    ]
  },
  "Data Analyst": {
    p1: [
      "Build and publish a portfolio with Tableau, Power BI dashboards & SQL scripts",
      "Upload data analysis project on GitHub analyzing real business metrics & KPIs",
      "Apply to at least 5 immediate Data Analyst / Business Intelligence openings",
      "Update profile with key skills: Advanced SQL, Excel/VBA, Power BI, Python"
    ],
    p2: [
      "Solve advanced SQL practice questions (Window functions, CTEs, Joins, Aggregations)",
      "Complete business analytics case study & data cleansing challenge using Pandas/Excel",
      "Follow up on all submitted applications with data recruiters",
      "Schedule initial screening calls and analytics assessment discussions"
    ],
    p3: [
      "Present interactive dashboard walkthrough and explain business decision impact",
      "Answer statistical inference, A/B testing, and KPI tracking questions with confidence",
      "Demonstrate data visualization best practices and stakeholder communication",
      "Complete final interview round with Analytics Director or Business Lead"
    ],
    p4: [
      "Review compensation package, performance incentives, and tooling allowances",
      "Confirm joining date and submit certificates and identification documents",
      "Sign offer agreement and prepare for company data warehouse onboarding",
      "Congratulations on securing your Data Analyst offer! 🎉"
    ]
  },
  "Data Scientist / AI Engineer": {
    p1: [
      "Showcase end-to-end Machine Learning / Deep Learning model on GitHub & HuggingFace",
      "Write a concise technical case study on data preprocessing, feature engineering & model metrics",
      "Apply to 5+ urgent Data Scientist / Machine Learning Engineer roles",
      "Network with AI researchers and ML hiring managers on LinkedIn"
    ],
    p2: [
      "Practice Python data manipulation (NumPy, Pandas, Scikit-Learn, PyTorch)",
      "Review ML algorithms (Random Forest, Gradient Boosting, Transformer architectures, ROC-AUC)",
      "Complete live take-home machine learning model notebook challenge",
      "Follow up on applications and schedule technical interview rounds"
    ],
    p3: [
      "Ace ML System Design round (Model serving, Latency, Drift detection, Vector embeddings)",
      "Defend model selection, hyperparameter tuning, and overfitting mitigation strategy",
      "Complete behavioral round on cross-functional collaboration with product teams",
      "Complete final interview with Chief Data Officer / Head of AI"
    ],
    p4: [
      "Review offer package, equity/stock options, and research budget allowances",
      "Confirm early joining date and submit verification documents",
      "Sign official offer letter and celebrate landing your AI / Data Science career! 🎉",
      "Begin pre-joining reading on the company's proprietary data pipelines"
    ]
  },
  "DevOps / Cloud Engineer": {
    p1: [
      "Publish Dockerized multi-service project with automated GitHub Actions CI/CD pipeline",
      "Showcase Terraform IaC scripts and AWS/GCP architecture diagram on GitHub",
      "Apply to 5+ immediate Cloud / DevOps / SRE openings",
      "Highlight certifications (AWS Solutions Architect, CKA, Terraform) on profile"
    ],
    p2: [
      "Review Linux shell scripting, networking (DNS, Subnets, VPC, Load Balancers) and SSL/TLS",
      "Complete Kubernetes cluster manifest and Docker troubleshooting assessment",
      "Follow up on submitted applications with hiring managers and tech leads",
      "Schedule initial DevOps technical screening call"
    ],
    p3: [
      "Ace live infrastructure debugging round (Container crash loops, memory leak triage)",
      "Explain automated deployment strategies (Blue-Green, Canary, Rolling updates)",
      "Answer Site Reliability (SLO/SLA, Observability with Prometheus/Grafana) scenarios",
      "Complete cultural and engineering team leadership interview"
    ],
    p4: [
      "Evaluate total compensation (Base salary, On-call allowances, Shift bonuses)",
      "Confirm joining readiness and submit required compliance verification",
      "Sign offer letter and step into your new Cloud / DevOps Engineer role! 🎉",
      "Prepare for infrastructure access and cloud credentials setup"
    ]
  },
  "QA / Automation Tester": {
    p1: [
      "Publish automated test suite repository (Selenium / Cypress / Playwright / Postman API)",
      "Showcase end-to-end test framework with CI/CD execution reports",
      "Apply to 5+ urgent QA Automation / SDET / Manual Testing positions",
      "Update profile with testing tools, BDD/Cucumber, and API validation expertise"
    ],
    p2: [
      "Write comprehensive test plans, edge-case matrices, and bug reports for sample apps",
      "Complete live automation scripting assessment in Java / Python / JavaScript",
      "Follow up with QA managers and talent acquisition partners",
      "Schedule technical evaluation and test strategy round"
    ],
    p3: [
      "Demonstrate API automation with Postman & RestAssured in live coding round",
      "Explain performance testing (JMeter) and security test fundamentals",
      "Answer behavioral questions regarding release blockers and dev-QA collaboration",
      "Complete final interview with QA Lead / Engineering Manager"
    ],
    p4: [
      "Review offer compensation details and joining timeline",
      "Submit background verification documents and sign the appointment letter",
      "Celebrate landing your QA Automation / SDET position! 🎉",
      "Prepare for project test-suite onboarding on Day 1"
    ]
  },
  "UI/UX Designer": {
    p1: [
      "Publish Figma portfolio case studies highlighting user research, wireframes & high-fi UI",
      "Share interactive prototype links demonstrating responsive design & design systems",
      "Apply to 5+ immediate UI/UX Designer / Product Designer openings",
      "Engage with Design Leads and Creative Directors on LinkedIn/Dribbble"
    ],
    p2: [
      "Complete rapid design challenge (Redesign checkout flow, Mobile app navigation)",
      "Document user personas, journey maps, and accessibility (WCAG) considerations",
      "Follow up on job applications with personalized design portfolio links",
      "Schedule portfolio review and design screening calls"
    ],
    p3: [
      "Present design case study walkthrough with clear problem statement and user metrics",
      "Demonstrate component library variants, auto-layout, and micro-interactions in Figma",
      "Discuss product-design trade-offs and developer handoff best practices",
      "Complete final interview with Head of Design / Product VP"
    ],
    p4: [
      "Review compensation package, creative software licenses, and equipment benefits",
      "Confirm fast joining date and submit onboarding paperwork",
      "Sign offer letter and celebrate your new UI/UX Designer role! 🎉",
      "Prepare your design workspace for day-one sprint"
    ]
  },
  "Mobile App Developer": {
    p1: [
      "Publish Google Play / App Store / TestFlight links or GitHub repo with Flutter/React Native/iOS apps",
      "Set status to '⚡ Immediate Joiner' and highlight cross-platform mobile & native SDK proficiencies",
      "Apply to 5+ urgent Mobile / Flutter / Android / iOS Developer openings daily",
      "Connect with 3+ Mobile Engineering Managers and Tech Leads on LinkedIn"
    ],
    p2: [
      "Complete mobile architecture assessment (State management, Offline caching, Clean Architecture)",
      "Build live mini-app challenge (API pagination, device permissions, smooth animations) under 60 mins",
      "Follow up proactively on all submitted mobile developer applications",
      "Schedule technical discovery and mobile screening rounds"
    ],
    p3: [
      "Master Mobile System Design (Push notifications, Deep linking, Memory leaks, Battery consumption)",
      "Ace live mobile problem-solving & clean code architecture evaluation",
      "Send post-interview technical notes and mobile architecture diagrams within 6 hours",
      "Complete cultural fit and engineering leadership discussions"
    ],
    p4: [
      "Evaluate mobile engineering compensation, equipment setup & app launch allowances",
      "Confirm joining date and complete background verification documentation",
      "Sign offer letter and celebrate landing your Mobile Developer position! 🎉",
      "Set up local mobile development emulator and team repositories for Day 1"
    ]
  },
  "Product Manager": {
    p1: [
      "Publish Product Portfolio / Case Studies detailing 0-to-1 PRDs, wireframes, and business KPI impact",
      "Optimize LinkedIn profile with product impact metrics (User retention, GMV growth, NPS score)",
      "Apply to 5+ active Product Manager / APM / Technical PM openings daily",
      "Network with Product Directors and Group PMs at target companies"
    ],
    p2: [
      "Solve classic PM case questions (Product Design, Root Cause Analysis, Metric Decomposition, Go-To-Market)",
      "Draft a 2-page sample PRD for a new feature in the target company's app",
      "Follow up on submitted product management applications with personalized notes",
      "Schedule initial recruiter screening and product sense discussions"
    ],
    p3: [
      "Ace Product Sense & Product Execution interview rounds with structured frameworks",
      "Demonstrate data-driven decision making, A/B testing strategy, and prioritization matrices (RICE)",
      "Answer behavioral questions regarding engineering-business trade-offs and stakeholder conflict",
      "Complete final interview with VP of Product / CPO"
    ],
    p4: [
      "Negotiate Product Manager compensation, performance bonuses, and ESOPs / stock options",
      "Confirm start date and submit reference checks and verification documents",
      "Sign offer letter and step into your new Product Management career! 🎉",
      "Conduct pre-onboarding competitor research and product teardowns"
    ]
  },
  "Cybersecurity Analyst": {
    p1: [
      "Showcase security lab write-ups (TryHackMe, HackTheBox, Bug Bounty reports) on portfolio/GitHub",
      "Highlight certifications (CEH, CompTIA Security+, CISSP, OSCP) and SIEM tool expertise",
      "Apply to 5+ urgent Cybersecurity Analyst / SOC Analyst / InfoSec openings daily",
      "Engage with InfoSec Managers and Security Operations leads on LinkedIn"
    ],
    p2: [
      "Practice incident triage, log analysis (Splunk, ELK, Wireshark) & threat detection scenarios",
      "Complete vulnerability assessment and risk mitigation technical assessment",
      "Follow up on submitted security analyst applications",
      "Schedule technical evaluation and SOC scenario screening calls"
    ],
    p3: [
      "Ace live security breach analysis, malware analysis, and MITRE ATT&CK framework mapping round",
      "Explain network security architecture (Firewalls, Zero Trust, IAM, Encryption protocols)",
      "Answer behavioral questions regarding handling high-severity security incidents under pressure",
      "Complete final interview with Chief Information Security Officer (CISO) or SOC Lead"
    ],
    p4: [
      "Review security analyst compensation, on-call incentives, and clearance packages",
      "Confirm joining readiness and submit required compliance verification documentation",
      "Sign appointment letter and step into your Cybersecurity role! 🎉",
      "Review company security posture and tools before Day-1 onboarding"
    ]
  }
};

const POPULAR_ROLE_NAMES = Object.keys(ROLE_TEMPLATES);

// Dynamic intelligent roadmap generator for any arbitrary custom role typed by the user
const generateCustomRoleRoadmap = (roleName) => {
  const role = roleName && roleName.trim() ? roleName.trim() : "Target Role";
  return {
    p1: [
      `Build and optimize your ${role} portfolio, resume & relevant live project repositories`,
      `Set profile status to '⚡ Immediate Joiner (<30 Days)' and highlight core ${role} proficiencies`,
      `Apply to 5+ active ${role} vacancies and immediate-hiring openings daily with tailored notes`,
      `Reach out directly to 3+ ${role} hiring managers, recruiters & team leads on LinkedIn`
    ],
    p2: [
      `Complete core ${role} technical assessments, screening drills & practical case studies`,
      `Practice domain-specific fundamentals, key toolings, frameworks & common interview challenges for ${role}`,
      `Follow up proactively on all submitted ${role} job applications with hiring teams`,
      `Schedule and attend initial talent screening calls and technical evaluation discussions`
    ],
    p3: [
      `Ace live ${role} technical interview, live domain problem-solving & scenario discussions`,
      `Prepare 4 STAR-format stories highlighting past projects, crisis resolution & ${role} leadership`,
      `Send comprehensive post-interview technical notes and architecture summary within 6 hours`,
      `Complete final managerial and cultural alignment rounds with confidence`
    ],
    p4: [
      `Evaluate ${role} offer letter CTC breakdown (Fixed, Variable, Allowances & Joining perks)`,
      `Negotiate start date and confirm immediate joining readiness`,
      `Submit educational credentials, ID proofs, background check forms & signed acceptance`,
      `Begin pre-joining tooling orientation and celebrate landing your new ${role} offer! 🎉`
    ]
  };
};

export default function CareerEmergencyPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});

  const [mounted, setMounted] = useState(false);
  const [totalDays, setTotalDays] = useState(30);
  const [customDaysInput, setCustomDaysInput] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [targetLocation, setTargetLocation] = useState('Remote / Any');
  const [experienceLevel, setExperienceLevel] = useState('Fresher to 2 Years');
  const [expectedSalary, setExpectedSalary] = useState('₹4 - 8 LPA');
  
  // Custom user-editable tasks per phase
  const [customPhases, setCustomPhases] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});
  const [availableJobs, setAvailableJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  // New task input state per phase
  const [newTaskInput, setNewTaskInput] = useState({ phase1: '', phase2: '', phase3: '', phase4: '' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editingText, setEditingText] = useState('');

  useEffect(() => {
    setMounted(true);
    // Load saved sprint from localStorage
    if (typeof window !== 'undefined' && user?.id) {
      const savedSprint = localStorage.getItem(`emergency_sprint_${user.id}`);
      if (savedSprint) {
        try {
          const parsed = JSON.parse(savedSprint);
          setTotalDays(parsed.totalDays || 30);
          if (parsed.targetRole) {
            setTargetRole(parsed.targetRole);
            if (!POPULAR_ROLE_NAMES.includes(parsed.targetRole)) {
              setIsCustomRole(true);
              setCustomRoleInput(parsed.targetRole);
            }
          }
          setTargetLocation(parsed.targetLocation || 'Remote / Any');
          setExperienceLevel(parsed.experienceLevel || 'Fresher to 2 Years');
          setExpectedSalary(parsed.expectedSalary || '₹4 - 8 LPA');
          setCompletedTasks(parsed.completedTasks || {});
          if (parsed.customPhases) {
            setCustomPhases(parsed.customPhases);
          }
        } catch (e) {}
      }
    }
    loadMatchingJobs();
  }, [isAuthenticated, user?.id]);

  // When role changes, if user hasn't created heavily custom phases or requests template
  const getTemplateForRole = (roleName) => {
    const template = ROLE_TEMPLATES[roleName] || generateCustomRoleRoadmap(roleName);
    return {
      phase1: template.p1.map((t, i) => ({ id: `p1_${Date.now()}_${i}`, label: t })),
      phase2: template.p2.map((t, i) => ({ id: `p2_${Date.now()}_${i}`, label: t })),
      phase3: template.p3.map((t, i) => ({ id: `p3_${Date.now()}_${i}`, label: t })),
      phase4: template.p4.map((t, i) => ({ id: `p4_${Date.now()}_${i}`, label: t }))
    };
  };

  // Initialize or update phases when role changes
  const activePhasesData = customPhases || getTemplateForRole(targetRole);

  const loadMatchingJobs = async () => {
    setLoadingJobs(true);
    try {
      const res = await jobService.getAllJobs();
      const allJobs = res.data || [];
      const activeJobs = allJobs.filter(j => j.status === 'open' || j.status === 'published' || !j.status);
      setAvailableJobs(activeJobs);
    } catch (err) {
      setAvailableJobs([]);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleRoleChange = (newRole) => {
    if (!newRole || !newRole.trim()) return;
    const cleanRole = newRole.trim();
    setTargetRole(cleanRole);
    if (POPULAR_ROLE_NAMES.includes(cleanRole)) {
      setIsCustomRole(false);
      setCustomRoleInput('');
    } else {
      setIsCustomRole(true);
      setCustomRoleInput(cleanRole);
    }
    const newTemplate = getTemplateForRole(cleanRole);
    setCustomPhases(newTemplate);
    setCompletedTasks({});
    saveToStorage(totalDays, cleanRole, targetLocation, experienceLevel, expectedSalary, {}, newTemplate);
  };

  const handleApplyCustomRole = (e) => {
    if (e) e.preventDefault();
    const cleanRole = customRoleInput.trim();
    if (!cleanRole) return;
    handleRoleChange(cleanRole);
  };

  const saveToStorage = (days, role, loc, exp, sal, tasks, phasesObj) => {
    if (!user?.id) return;
    const sprintData = {
      totalDays: days,
      targetRole: role,
      targetLocation: loc,
      experienceLevel: exp,
      expectedSalary: sal,
      completedTasks: tasks,
      customPhases: phasesObj,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(`emergency_sprint_${user.id}`, JSON.stringify(sprintData));
  };

  const handleToggleTask = (taskId) => {
    const updated = {
      ...completedTasks,
      [taskId]: !completedTasks[taskId]
    };
    setCompletedTasks(updated);
    saveToStorage(totalDays, targetRole, targetLocation, experienceLevel, expectedSalary, updated, activePhasesData);
  };

  const handleAddTask = (phaseKey) => {
    const text = newTaskInput[phaseKey]?.trim();
    if (!text) return;

    const newTask = {
      id: `task_${phaseKey}_${Date.now()}`,
      label: text
    };

    const updatedPhases = {
      ...activePhasesData,
      [phaseKey]: [...(activePhasesData[phaseKey] || []), newTask]
    };

    setCustomPhases(updatedPhases);
    setNewTaskInput(prev => ({ ...prev, [phaseKey]: '' }));
    saveToStorage(totalDays, targetRole, targetLocation, experienceLevel, expectedSalary, completedTasks, updatedPhases);
  };

  const handleDeleteTask = (phaseKey, taskId) => {
    const updatedPhases = {
      ...activePhasesData,
      [phaseKey]: activePhasesData[phaseKey].filter(t => t.id !== taskId)
    };
    setCustomPhases(updatedPhases);
    const updatedCompleted = { ...completedTasks };
    delete updatedCompleted[taskId];
    setCompletedTasks(updatedCompleted);
    saveToStorage(totalDays, targetRole, targetLocation, experienceLevel, expectedSalary, updatedCompleted, updatedPhases);
  };

  const handleStartEdit = (task) => {
    setEditingTaskId(task.id);
    setEditingText(task.label);
  };

  const handleSaveEdit = (phaseKey, taskId) => {
    if (!editingText.trim()) return;
    const updatedPhases = {
      ...activePhasesData,
      [phaseKey]: activePhasesData[phaseKey].map(t => t.id === taskId ? { ...t, label: editingText.trim() } : t)
    };
    setCustomPhases(updatedPhases);
    setEditingTaskId(null);
    setEditingText('');
    saveToStorage(totalDays, targetRole, targetLocation, experienceLevel, expectedSalary, completedTasks, updatedPhases);
  };

  const handleResetToRoleTemplate = () => {
    if (confirm(`Reset all tasks to the recommended plan for '${targetRole}'?`)) {
      const template = getTemplateForRole(targetRole);
      setCustomPhases(template);
      setCompletedTasks({});
      saveToStorage(totalDays, targetRole, targetLocation, experienceLevel, expectedSalary, {}, template);
    }
  };

  const handleSetCustomDays = (e) => {
    e.preventDefault();
    const val = parseInt(customDaysInput, 10);
    if (val && val >= 5 && val <= 180) {
      setTotalDays(val);
      setCustomDaysInput('');
      saveToStorage(val, targetRole, targetLocation, experienceLevel, expectedSalary, completedTasks, activePhasesData);
    } else {
      alert("Please enter a valid timeframe between 5 and 180 days.");
    }
  };

  // Calculate dynamic phases day ranges based on totalDays
  const p1End = Math.max(2, Math.round(totalDays * 0.17));
  const p2End = Math.max(p1End + 2, Math.round(totalDays * 0.35));
  const p3End = Math.max(p2End + 3, Math.round(totalDays * 0.70));
  const p4End = totalDays;

  const phaseConfigs = [
    {
      key: "phase1",
      name: `Phase 1: Application Blitz & Portfolio`,
      dayRange: `Day 1 – ${p1End}`,
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      description: `Optimize your ${targetRole} portfolio, activate immediate availability, and apply to 5+ urgent jobs daily.`
    },
    {
      key: "phase2",
      name: `Phase 2: Skill Assessments & Screening`,
      dayRange: `Day ${p1End + 1} – ${p2End}`,
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
      description: `Complete ${targetRole} technical drills, screening tests, and recruiter follow-ups.`
    },
    {
      key: "phase3",
      name: `Phase 3: Technical & Leadership Interviews`,
      dayRange: `Day ${p2End + 1} – ${p3End}`,
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      description: `Excel in live ${targetRole} problem solving, system design discussions, and behavioral STAR rounds.`
    },
    {
      key: "phase4",
      name: `Phase 4: Offer Negotiation & Fast Onboarding`,
      dayRange: `Day ${p3End + 1} – ${p4End}`,
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      description: `Evaluate offer letters, negotiate compensation package, submit documentation, and confirm start date.`
    }
  ];

  // Calculate completed tasks percentage
  const allTasks = Object.values(activePhasesData).flat();
  const completedCount = allTasks.filter(t => completedTasks[t.id]).length;
  const progressPercent = allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 0;

  // Filter matching immediate jobs intelligently with keyword splitting & fallback
  const matchingJobs = availableJobs.filter(j => {
    if (!targetRole) return true;
    const roleLower = targetRole.toLowerCase().trim();
    const words = roleLower.split(/[\s/,-]+/).filter(w => w.length > 2);
    const title = (j.title || '').toLowerCase();
    const desc = (j.description || '').toLowerCase();
    const ind = (j.industry || '').toLowerCase();
    const req = (j.requirements || '').toLowerCase();

    // Direct match
    if (title.includes(roleLower) || ind.includes(roleLower) || req.includes(roleLower) || desc.includes(roleLower)) return true;

    // Keyword match
    if (words.some(w => title.includes(w) || ind.includes(w) || req.includes(w))) return true;

    return false;
  }).slice(0, 4);

  const displayJobs = matchingJobs.length > 0 ? matchingJobs : availableJobs.slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Banner Hero */}
      <div className="bg-gradient-to-br from-rose-950 via-slate-900 to-indigo-950 text-white py-14 px-4 sm:px-6 lg:px-8 shadow-inner relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-500/20 border border-rose-400/40 text-rose-300 text-xs font-black uppercase tracking-wider animate-pulse">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Career Emergency Mode 🚨</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Get Hired as <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-orange-300 to-amber-300">{targetRole}</span> in {totalDays} Days
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed">
              Select your target role below to instantly load a customized action plan, or add/edit your own custom milestone tasks and timeline.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-200 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Role-Tailored Roadmaps</span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-200 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Fully User-Customizable Tasks</span>
              </div>
              <div className="flex items-center space-x-2 text-xs sm:text-sm text-slate-200 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Immediate Joining Priority</span>
              </div>
            </div>
          </div>

          {/* Sprint Control Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-3xl w-full lg:w-96 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-xs font-black uppercase text-rose-300 flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>Sprint Duration</span>
              </span>
              <span className="text-xs font-mono font-bold text-white bg-rose-500/30 px-2.5 py-1 rounded-lg border border-rose-400/40">
                {totalDays} Days Goal
              </span>
            </div>

            {/* Quick Duration Buttons */}
            <div className="grid grid-cols-2 gap-2">
              {PRESET_DURATIONS.map(p => (
                <button
                  key={p.days}
                  onClick={() => {
                    setTotalDays(p.days);
                    saveToStorage(p.days, targetRole, targetLocation, experienceLevel, expectedSalary, completedTasks, activePhasesData);
                  }}
                  className={`p-2.5 rounded-xl text-xs font-bold transition text-left border ${
                    totalDays === p.days
                      ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 text-slate-200 border-white/10'
                  }`}
                >
                  <p className="text-sm font-black">{p.label}</p>
                  <p className="text-[10px] text-slate-300 mt-0.5">{p.badge}</p>
                </button>
              ))}
            </div>

            {/* Custom Days Input */}
            <form onSubmit={handleSetCustomDays} className="flex gap-2">
              <input
                type="number"
                min="5"
                max="180"
                placeholder="Custom days (e.g. 40)"
                value={customDaysInput}
                onChange={(e) => setCustomDaysInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900/80 border border-white/20 rounded-xl text-xs text-white placeholder-slate-400 font-semibold focus:outline-none focus:border-rose-400"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition shrink-0"
              >
                Set
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Roadmap & Action Tracker */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* TARGET POSITION & PREFERENCES SELECTOR (Dynamic Roadmap Generator) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Wand2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                Target Role & Preferences (Roadmap Auto-Adapts)
              </h3>
            </div>
            <button
              onClick={handleResetToRoleTemplate}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Recommended Tasks for '{targetRole}'</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Target Role Dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase text-slate-500 flex items-center justify-between">
                <span>Target Role / Position *</span>
                {isCustomRole && (
                  <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-full">Custom</span>
                )}
              </label>
              <select
                value={isCustomRole ? "Other" : targetRole}
                onChange={(e) => {
                  if (e.target.value === "Other") {
                    setIsCustomRole(true);
                    if (!customRoleInput) setCustomRoleInput(targetRole);
                  } else {
                    setIsCustomRole(false);
                    handleRoleChange(e.target.value);
                  }
                }}
                className="w-full text-xs font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {POPULAR_ROLE_NAMES.map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
                <option value="Other">✨ Custom Role (Type Your Own)</option>
              </select>
            </div>

            {/* Target Location */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase text-slate-500">Workplace / Location</label>
              <input
                type="text"
                value={targetLocation}
                onChange={(e) => {
                  setTargetLocation(e.target.value);
                  saveToStorage(totalDays, targetRole, e.target.value, experienceLevel, expectedSalary, completedTasks, activePhasesData);
                }}
                className="w-full text-xs font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200"
                placeholder="e.g. Remote / Chennai / Hybrid"
              />
            </div>

            {/* Experience Level */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase text-slate-500">Experience Level</label>
              <select
                value={experienceLevel}
                onChange={(e) => {
                  setExperienceLevel(e.target.value);
                  saveToStorage(totalDays, targetRole, targetLocation, e.target.value, expectedSalary, completedTasks, activePhasesData);
                }}
                className="w-full text-xs font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200"
              >
                <option value="Fresher (0 - 1 Year)">Fresher (0 - 1 Year)</option>
                <option value="Junior (1 - 3 Years)">Junior (1 - 3 Years)</option>
                <option value="Mid-Senior (3 - 6 Years)">Mid-Senior (3 - 6 Years)</option>
                <option value="Lead / Principal (6+ Years)">Lead / Principal (6+ Years)</option>
              </select>
            </div>

            {/* Expected Salary */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-black uppercase text-slate-500">Target Salary Package</label>
              <input
                type="text"
                value={expectedSalary}
                onChange={(e) => {
                  setExpectedSalary(e.target.value);
                  saveToStorage(totalDays, targetRole, targetLocation, experienceLevel, e.target.value, completedTasks, activePhasesData);
                }}
                className="w-full text-xs font-bold text-slate-900 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200"
                placeholder="e.g. ₹5 - 10 LPA"
              />
            </div>
          </div>

          {/* DEDICATED CUSTOM ROLE BUILDER BANNER (Active when Custom Role is selected) */}
          {isCustomRole && (
            <div className="p-4 sm:p-5 bg-gradient-to-r from-rose-50 via-amber-50 to-indigo-50 border border-rose-200/90 rounded-2xl space-y-3.5 mt-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                    Custom Job Role & Roadmap Builder
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomRole(false);
                    handleRoleChange("Full Stack Developer");
                  }}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 underline"
                >
                  ← Back to standard roles
                </button>
              </div>

              <form onSubmit={handleApplyCustomRole} className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={customRoleInput}
                    onChange={(e) => setCustomRoleInput(e.target.value)}
                    placeholder="Type any role (e.g. Flutter Developer, Product Manager, Cybersecurity Analyst, Java Dev)..."
                    className="w-full px-3.5 py-2.5 text-xs font-bold text-slate-900 bg-white border border-rose-300 rounded-xl placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500 shadow-xs"
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black rounded-xl transition shadow-sm flex items-center justify-center gap-1.5 shrink-0"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Generate Custom Plan</span>
                </button>
              </form>

              {/* Quick Suggestion Chips */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-black uppercase text-slate-500 mr-1">Popular Suggestions:</span>
                {[
                  "Flutter Developer",
                  "Product Manager",
                  "Cybersecurity Analyst",
                  "Java Backend Developer",
                  "Digital Marketing Specialist",
                  "Cloud Architect",
                  "Graphic Designer",
                  "Data Engineer"
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => {
                      setCustomRoleInput(suggestion);
                      handleRoleChange(suggestion);
                    }}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition ${
                      targetRole.toLowerCase() === suggestion.toLowerCase()
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white hover:bg-rose-100/70 text-slate-700 border-slate-200'
                    }`}
                  >
                    + {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Progress Summary Card */}
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 p-5 rounded-3xl border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-500 text-white flex flex-col items-center justify-center font-black shadow-md shrink-0">
              <span className="text-base leading-none">{progressPercent}%</span>
              <span className="text-[8px] uppercase tracking-wider font-bold mt-0.5">Done</span>
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">Sprint Execution Status</h3>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {completedCount} of {allTasks.length} tasks completed for <strong>{targetRole}</strong> ({totalDays}-Day Goal)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-500">Status Badge:</span>
            <span className="px-3 py-1 bg-rose-600 text-white text-xs font-black rounded-full shadow-xs flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Immediate Joiner (&lt;{totalDays} Days)</span>
            </span>
          </div>
        </div>

        {/* 4-PHASE ROADMAP & INTERACTIVE USER-EDITABLE TASKS */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-rose-600" />
                <span>{targetRole} — {totalDays}-Day Action Roadmap</span>
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Check off tasks as you finish them, edit any task text, or add your own custom milestone tasks.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {phaseConfigs.map((phase) => {
              const tasks = activePhasesData[phase.key] || [];
              const phaseTasksDone = tasks.filter(t => completedTasks[t.id]).length;
              const isPhaseComplete = tasks.length > 0 && phaseTasksDone === tasks.length;

              return (
                <div
                  key={phase.key}
                  className={`bg-white rounded-3xl border transition flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md ${
                    isPhaseComplete ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200/90'
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-5 space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${phase.badgeColor}`}>
                        {phase.dayRange}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        {phaseTasksDone}/{tasks.length} Done
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-snug">
                        {phase.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium leading-relaxed mt-1">
                        {phase.description}
                      </p>
                    </div>

                    {/* Task List (Interactive + Editable) */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      {tasks.map((task) => {
                        const isDone = !!completedTasks[task.id];
                        const isEditing = editingTaskId === task.id;

                        if (isEditing) {
                          return (
                            <div key={task.id} className="p-2.5 bg-blue-50 border border-blue-300 rounded-xl space-y-2">
                              <textarea
                                value={editingText}
                                onChange={(e) => setEditingText(e.target.value)}
                                className="w-full text-xs font-semibold p-2 bg-white border border-blue-200 rounded-lg focus:outline-none"
                                rows={2}
                              />
                              <div className="flex items-center justify-end space-x-2">
                                <button
                                  onClick={() => setEditingTaskId(null)}
                                  className="text-[10px] font-bold text-slate-500 hover:text-slate-800 px-2 py-1"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleSaveEdit(phase.key, task.id)}
                                  className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-md shadow-xs flex items-center gap-1"
                                >
                                  <Save className="w-3 h-3" />
                                  <span>Save</span>
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={task.id}
                            className={`group p-2.5 rounded-xl border text-xs font-medium transition flex items-start space-x-2 relative ${
                              isDone
                                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950 font-semibold'
                                : 'bg-slate-50 hover:bg-slate-100/90 border-slate-200/80 text-slate-700'
                            }`}
                          >
                            <button 
                              onClick={() => handleToggleTask(task.id)}
                              className="mt-0.5 text-slate-400 shrink-0 cursor-pointer"
                              title={isDone ? "Mark incomplete" : "Mark complete"}
                            >
                              {isDone ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                              ) : (
                                <Circle className="w-4 h-4 text-slate-300 hover:text-slate-500" />
                              )}
                            </button>

                            <span 
                              onClick={() => handleToggleTask(task.id)}
                              className={`flex-1 leading-snug cursor-pointer ${isDone ? 'line-through opacity-80' : ''}`}
                            >
                              {task.label}
                            </span>

                            {/* Action Icons (Edit / Delete) */}
                            <div className="opacity-0 group-hover:opacity-100 transition flex items-center space-x-1 shrink-0 ml-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEdit(task);
                                }}
                                className="p-1 hover:text-blue-600 text-slate-400 rounded transition"
                                title="Edit task"
                              >
                                <Edit3 className="w-3 h-3" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteTask(phase.key, task.id);
                                }}
                                className="p-1 hover:text-rose-600 text-slate-400 rounded transition"
                                title="Delete task"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add Custom Task Input */}
                    <div className="pt-2">
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="+ Add custom milestone..."
                          value={newTaskInput[phase.key] || ''}
                          onChange={(e) => setNewTaskInput(prev => ({ ...prev, [phase.key]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTask(phase.key);
                            }
                          }}
                          className="w-full text-xs font-semibold px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => handleAddTask(phase.key)}
                          className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shrink-0 transition"
                          title="Add task"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Status */}
                  <div className={`p-3 text-center text-xs font-bold border-t ${
                    isPhaseComplete ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-500 border-slate-100'
                  }`}>
                    {isPhaseComplete ? "✓ Phase Complete" : "In Progress"}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Curated Immediate Joining Jobs Matching Target Role */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <Flame className="w-5 h-5 text-orange-500" />
                <h3 className="text-lg font-black text-slate-900">
                  Immediate-Joining Openings for '{targetRole}'
                </h3>
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Priority openings matching your target role with fast recruitment cycles.
              </p>
            </div>

            <Link
              href={`/jobs?q=${encodeURIComponent(targetRole)}`}
              className="px-5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-black rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>Search All {targetRole} Jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loadingJobs ? (
            <div className="py-8 text-center text-xs font-bold text-slate-400">Loading fast-track jobs...</div>
          ) : displayJobs.length === 0 ? (
            <div className="py-8 text-center text-xs font-bold text-slate-400">
              No active immediate jobs currently found. <Link href="/jobs" className="text-blue-600 underline font-semibold">Browse all available openings →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {matchingJobs.length === 0 && availableJobs.length > 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-semibold flex items-center justify-between">
                  <span>💡 No direct title match for '{targetRole}'. Showing top high-priority urgent openings:</span>
                  <Link href="/jobs" className="underline font-bold text-amber-900">Explore All Jobs</Link>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition flex flex-col justify-between gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <Zap className="w-3 h-3 fill-rose-600 text-rose-600" />
                          <span>Immediate Joining</span>
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {job.jobType || "Full-Time"}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-sm font-black text-slate-900 hover:text-blue-600 transition">
                          {job.title}
                        </h4>
                        <p className="text-xs text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{job.company || job.companyName || "Top Tech Firm"}</span>
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium pt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location || "Remote"}
                        </span>
                        <span className="flex items-center gap-1 text-emerald-600 font-bold">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                          {job.salary || "Competitive"}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/jobs/${job.id}`}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition text-center shadow-xs"
                    >
                      View & Apply Fast →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

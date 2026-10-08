import "./globals.css";
import { Providers } from "../store/providers";
import Navbar from "../components/Navbar";
import Link from 'next/link';
import { Briefcase } from 'lucide-react';

export const metadata = {
  title: "JobPortal - Modern Tech Careers & Hiring Platform",
  description: "Discover top developer, design, and management opportunities or hire elite tech talent.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
        <Providers>
          <Navbar />
          
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-200 bg-white text-xs text-slate-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                
                <div className="space-y-3 md:col-span-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <span className="text-base font-black">JobPortal</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Connecting top software engineers, designers, and tech leaders with hyper-growth global companies.
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider">For Job Seekers</h4>
                  <ul className="space-y-1.5 text-[11px]">
                    <li><Link href="/jobs" className="hover:text-blue-500 transition">Browse All Jobs</Link></li>
                    <li><Link href="/jobs?jobType=Remote" className="hover:text-blue-500 transition">Remote Positions</Link></li>
                    <li><Link href="/seeker/profile" className="hover:text-blue-500 transition">Build Career Profile</Link></li>
                    <li><Link href="/seeker/applications" className="hover:text-blue-500 transition">Application Tracker</Link></li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider">For Employers</h4>
                  <ul className="space-y-1.5 text-[11px]">
                    <li><Link href="/employer/post-job" className="hover:text-blue-500 transition">Post a Job Opening</Link></li>
                    <li><Link href="/employer/my-jobs" className="hover:text-blue-500 transition">Manage Job Openings</Link></li>
                    <li><Link href="/employer/dashboard" className="hover:text-blue-500 transition">Recruiter Dashboard</Link></li>
                    <li><Link href="/employer/company-profile" className="hover:text-blue-500 transition">Company Branding</Link></li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider">Platform & Admin</h4>
                  <ul className="space-y-1.5 text-[11px]">
                    <li><Link href="/admin/dashboard" className="hover:text-blue-500 transition">Admin Overview</Link></li>
                    <li><Link href="/admin/jobs" className="hover:text-blue-500 transition">Job Approvals</Link></li>
                    <li><Link href="/admin/content" className="hover:text-blue-500 transition">Help Center & FAQ</Link></li>
                    <li><Link href="/login" className="hover:text-blue-500 transition">Sign In Portal</Link></li>
                  </ul>
                </div>

              </div>

              <div className="mt-8 pt-6 border-t border-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
                <p>© 2026 JobPortal Capstone. Built with Next.js, Spring Boot & MySQL.</p>
                <div className="flex items-center space-x-4">
                  <span className="hover:text-blue-500 cursor-pointer">Privacy Policy</span>
                  <span>•</span>
                  <span className="hover:text-blue-500 cursor-pointer">Terms of Service</span>
                  <span>•</span>
                  <span className="hover:text-blue-500 cursor-pointer">Security</span>
                </div>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}

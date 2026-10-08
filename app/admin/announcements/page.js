"use client";

import { useEffect, useState } from 'react';
import { 
  Bell, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Send,
  Calendar,
  Sparkles,
  Megaphone
} from 'lucide-react';
import { announcementService } from '../../../services/api';

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      setLoading(true);
      const res = await announcementService.getAnnouncements();
      setAnnouncements(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setCreating(true);

    try {
      const newAnn = {
        message: message.trim(),
        date: new Date().toISOString(),
        active: true
      };

      await announcementService.postAnnouncement(newAnn);
      setMessage('');
      loadAnnouncements();
    } catch (err) {
      alert("Failed to publish announcement.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider mb-1">
          <Megaphone className="w-4 h-4" />
          <span>Platform Broadcasts</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Broadcast Announcements & Alerts
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Publish site-wide announcements visible to all active job seekers, employers, and guests in real-time
        </p>
      </div>

      {/* Create Announcement Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          <span>Publish New Platform Announcement</span>
        </h3>

        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. 🚀 Welcome to JobPortal - Explore over 10,000+ verified enterprise tech opportunities!"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={creating}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-purple-600/25 transition hover:scale-105 flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{creating ? "Publishing..." : "Broadcast to Top Header"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">Active Announcements History</h3>

        <div className="space-y-3">
          {loading ? (
            <p className="text-xs text-slate-500">Loading announcements...</p>
          ) : announcements.length > 0 ? (
            announcements.map((ann, idx) => (
              <div 
                key={ann.id || idx}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-sm"
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
                      {ann.message}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Published on {ann.date ? new Date(ann.date).toLocaleDateString() : 'Active'}
                    </span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 shrink-0">
                  Live Banner
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
              No platform announcements published yet.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
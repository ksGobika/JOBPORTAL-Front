"use client";

import { useEffect, useState } from 'react';
import { announcementService } from '../services/api';
import { Bell, X, Sparkles } from 'lucide-react';

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    announcementService.getAnnouncements()
      .then((res: any) => {
        const active = (res.data || []).filter((a: any) => a.active);
        setAnnouncements(active);
      })
      .catch(() => {
        setAnnouncements([{ id: 'default', message: '🚀 Welcome to JobPortal - Browse thousands of tech & business opportunities!', active: true }]);
      });
  }, []);

  if (!visible || announcements.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-700 text-white text-xs md:text-sm font-medium py-2 px-4 shadow-md transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="flex items-center justify-center p-1 bg-white/20 rounded-full shrink-0 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          </span>
          <span className="truncate">{announcements[0]?.message}</span>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded transition shrink-0"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
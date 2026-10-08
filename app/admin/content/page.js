"use client";

import { useEffect, useState } from 'react';
import { 
  HelpCircle, 
  Plus, 
  Trash2, 
  BookOpen, 
  ShieldCheck,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { faqService } from '../../../services/api';

export default function AdminContentPage() {
  const [faqs, setFaqs] = useState([
    { id: '1', question: 'How do job seekers apply for jobs?', answer: 'Job seekers can create a profile, upload their resume, and click Apply Now on any job listing.' },
    { id: '2', question: 'How do employers post new positions?', answer: 'Employers can navigate to Post a Job from the top navigation and fill out the role specifications.' },
    { id: '3', question: 'Are job postings reviewed before being published?', answer: 'Yes, our administrative moderation team verifies listings to ensure quality and prevent spam.' }
  ]);
  const [loading, setLoading] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  const handleAddFaq = (e) => {
    e.preventDefault();
    if (!newQuestion || !newAnswer) return;
    setFaqs([...faqs, { id: String(Date.now()), question: newQuestion, answer: newAnswer }]);
    setNewQuestion('');
    setNewAnswer('');
  };

  const handleDeleteFaq = (id) => {
    setFaqs(faqs.filter(f => f.id !== id));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          <span>Knowledge & Help Center</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Content & FAQ Management
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage public help center FAQs, candidate guidelines, and platform terms
        </p>
      </div>

      {/* Add FAQ Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Add Frequently Asked Question (FAQ)</span>
        </h3>

        <form onSubmit={handleAddFaq} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Question Title</label>
            <input
              type="text"
              required
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="e.g. What is the standard response time for job applications?"
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Detailed Answer</label>
            <textarea
              rows={3}
              required
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Provide a clear, helpful answer for candidates and employers..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-lg shadow-emerald-600/25 transition flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Publish FAQ</span>
            </button>
          </div>
        </form>
      </div>

      {/* FAQs List */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">Live Knowledge Base FAQs</h3>

        <div className="space-y-3">
          {faqs.map((faq) => (
            <div 
              key={faq.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-start justify-between gap-4 shadow-sm"
            >
              <div className="space-y-1.5 min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{faq.question}</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pl-6">
                  {faq.answer}
                </p>
              </div>

              <button
                onClick={() => handleDeleteFaq(faq.id)}
                className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition shrink-0"
                title="Remove FAQ"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
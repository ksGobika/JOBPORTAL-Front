"use client";

import { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, CheckCircle, Plus } from 'lucide-react';
import { reviewService } from '../services/api';
import { useSelector } from 'react-redux';

export default function ReviewSection({ employerId, companyName }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [employerId]);

  const fetchReviews = async () => {
    try {
      const res = await reviewService.getReviews(employerId);
      setReviews(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert("Please login to write a review!");
      return;
    }
    setSubmitting(true);
    try {
      await reviewService.postReview({
        employerId: employerId,
        seekerId: user.id,
        seekerName: user.name || 'Anonymous Seeker',
        rating: rating,
        comment: comment,
        createdAt: new Date().toISOString()
      });
      setComment('');
      setShowModal(false);
      fetchReviews();
    } catch (err) {
      alert("Failed to submit review.");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : '5.0';

  return (
    <div className="glass-card bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
      
      {/* Header & Rating Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
        <div>
          <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            Company Reviews & Ratings
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real feedback from employees and job applicants at <span className="font-semibold text-slate-700 dark:text-slate-200">{companyName || 'this company'}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{avgRating}</span>
            <div className="flex flex-col">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${i < Math.round(Number(avgRating)) ? 'fill-amber-500' : 'text-slate-300 dark:text-slate-600'}`} 
                  />
                ))}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{reviews.length} reviews</span>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center space-x-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md shadow-blue-600/20 transition hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Write Review</span>
          </button>
        </div>
      </div>

      {/* Reviews List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="text-xs text-slate-500 py-4">Loading reviews...</p>
        ) : reviews.length > 0 ? (
          reviews.map((r, i) => (
            <div key={r.id || i} className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                    {r.seekerName ? r.seekerName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white block">{r.seekerName || 'Verified Candidate'}</span>
                    <span className="text-[10px] text-slate-400">{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'Recent'}</span>
                  </div>
                </div>

                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, idx) => (
                    <Star 
                      key={idx} 
                      className={`w-3.5 h-3.5 ${idx < (r.rating || 5) ? 'fill-amber-500' : 'text-slate-200 dark:text-slate-700'}`} 
                    />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed pl-10">
                {r.comment}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-500 text-xs bg-slate-50/50 dark:bg-slate-800/20 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            No reviews yet for this employer. Be the first to share your experience!
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="glass-panel bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
              Write a Review
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Share your honest feedback about <strong className="text-slate-700 dark:text-slate-300">{companyName || 'this company'}</strong>
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 text-amber-500 hover:scale-125 transition"
                    >
                      <Star className={`w-6 h-6 ${star <= rating ? 'fill-amber-500' : 'text-slate-300 dark:text-slate-700'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Your Review / Experience
                </label>
                <textarea
                  rows={4}
                  required
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details about the interview process, work culture, or leadership..."
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 shadow-sm resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition"
                >
                  {submitting ? "Submitting..." : "Post Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
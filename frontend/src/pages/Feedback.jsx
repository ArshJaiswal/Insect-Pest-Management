import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';
import BackButton from '../components/BackButton.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { API_BASE_URL } from '../lib/api';

const Feedback = () => {
  const { user } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    subject: '',
    message: '',
    rating: 5,
    category: 'general',
    isAnonymous: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const categories = [
    { value: 'general', label: 'General Feedback', icon: '💬' },
    { value: 'bug-report', label: 'Bug Report', icon: '🐛' },
    { value: 'feature-request', label: 'Feature Request', icon: '✨' },
    { value: 'crop-info', label: 'Crop Information', icon: '🌾' },
    { value: 'pest-info', label: 'Pest Information', icon: '🦗' },
    { value: 'ui-ux', label: 'User Interface', icon: '🎨' },
    { value: 'other', label: 'Other', icon: '📝' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      console.log('📝 Submitting feedback:', formData);

      const response = await axios.post(`${API_BASE_URL}/api/feedback`, formData);

      console.log('✅ Feedback submitted successfully:', response.data);

      setSubmitStatus({
        type: 'success',
        message: response.data.message || 'Thank you for your feedback!'
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
        rating: 5,
        category: 'general',
        isAnonymous: false
      });

    } catch (error) {
      console.error('❌ Feedback submission error:', error);
      
      setSubmitStatus({
        type: 'error',
        message: error.response?.data?.message || 'Failed to submit feedback. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = (rating, onRatingChange) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            className={`text-3xl transition-all duration-200 hover:scale-110 ${
              star <= rating 
                ? 'text-yellow-400 hover:text-yellow-500' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            ⭐
          </button>
        ))}
        <span className="ml-3 text-sm font-medium text-gray-600">
          {rating === 1 && '😞 Poor'}
          {rating === 2 && '😐 Fair'}
          {rating === 3 && '🙂 Good'}
          {rating === 4 && '😊 Very Good'}
          {rating === 5 && '🤩 Excellent'}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <BackButton />
        
        {/* Header */}
        <div className="text-center mb-10 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-3">
            <span>💬</span>
            <span>Your Voice & Experience</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
            Feedback & Community Input
          </h1>
          <p className="text-sm text-slate-500">
            Share field observations, suggestions, or reports to help improve AgroGuard.
          </p>
        </div>

        {/* Status Messages */}
        {submitStatus && (
          <div className={`mb-8 p-4 rounded-2xl border text-sm flex items-center gap-3 ${
            submitStatus.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}>
            <span className="text-xl">
              {submitStatus.type === 'success' ? '✅' : '❌'}
            </span>
            <p className="font-semibold">{submitStatus.message}</p>
          </div>
        )}

        {/* Admin Guidance Banner */}
        {user?.role === 'admin' && (
          <div className="mb-8 p-5 rounded-2xl bg-amber-50/90 border border-amber-200/90 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👑</span>
              <div>
                <p className="text-sm font-bold text-amber-900">Signed in as Administrator</p>
                <p className="text-xs text-amber-700 mt-0.5">
                  This page is for farmers to submit feedback. To review, respond to, and manage incoming submissions, use the Admin Panel inbox.
                </p>
              </div>
            </div>
            <Link
              to="/admin?tab=feedback"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-xs whitespace-nowrap"
            >
              <span>Open Feedback Inbox</span>
              <span>➔</span>
            </Link>
          </div>
        )}

        {/* Feedback Form Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100">
            <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center text-xl font-bold">
              📝
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Submit Observation or Feedback</h2>
              <p className="text-xs text-slate-500">
                All feedback directly shapes pest advisory improvements
              </p>
            </div>
          </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Anonymous Toggle */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                <input
                  type="checkbox"
                  id="isAnonymous"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2"
                />
                <label htmlFor="isAnonymous" className="text-sm font-medium text-gray-700">
                  Submit feedback anonymously
                </label>
                <span className="text-xs text-gray-500">
                  (Your personal information will not be stored)
                </span>
              </div>

              {/* Personal Information */}
              {!formData.isAnonymous && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white"
                      required={!formData.isAnonymous}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white"
                      required={!formData.isAnonymous}
                    />
                  </div>
                </div>
              )}

              {/* Category Selection */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Feedback Category</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((category) => (
                    <button
                      key={category.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                      className={`p-3 rounded-xl border-2 transition-all duration-300 text-sm font-medium ${
                        formData.category === category.value
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-green-300 hover:bg-green-50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-xs">{category.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-700">Overall Rating *</label>
                <div className="p-4 bg-gray-50 rounded-xl">
                  {renderStars(formData.rating, (rating) => 
                    setFormData(prev => ({ ...prev, rating }))
                  )}
                </div>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Subject *</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="Brief summary of your feedback"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white"
                  required
                />
              </div>

              {/* Message */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Please share your detailed feedback, suggestions, or report any issues you've encountered..."
                  rows="6"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[150px] resize-y transition-all duration-300 bg-white"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative overflow-hidden w-full px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      Submitting Feedback...
                    </>
                  ) : (
                    <>
                      <span className="text-lg">📤</span>
                      Submit Feedback
                    </>
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </form>
        </div>

        {/* Additional Information */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-blue-600 text-xl">🚀</span>
              </div>
              <h3 className="font-bold text-gray-800">Feature Requests</h3>
            </div>
            <p className="text-sm text-gray-600">
              Suggest new features or improvements to make AgroGuard even better for farmers and agricultural professionals.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-red-600 text-xl">🐛</span>
              </div>
              <h3 className="font-bold text-gray-800">Bug Reports</h3>
            </div>
            <p className="text-sm text-gray-600">
              Found a bug or technical issue? Let us know so we can fix it quickly and improve your experience.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200/50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-green-600 text-xl">💡</span>
              </div>
              <h3 className="font-bold text-gray-800">General Feedback</h3>
            </div>
            <p className="text-sm text-gray-600">
              Share your overall experience, thoughts, or any other feedback about using AgroGuard.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Feedback;
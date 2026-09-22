import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ className = "" }) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 bg-white/80 hover:bg-white border border-slate-200/80 hover:border-slate-300 shadow-sm transition-all duration-200 mb-6 group cursor-pointer ${className}`}
    >
      <svg 
        className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:-translate-x-0.5 transition-all" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      <span>Back</span>
    </button>
  );
};

export default BackButton;
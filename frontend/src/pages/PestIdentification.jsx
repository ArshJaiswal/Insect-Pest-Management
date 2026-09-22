import React, { useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';
import BackButton from '../components/BackButton.jsx';
import PestManagementAdvisory from '../components/PestManagementAdvisory.jsx';

const PestIdentification = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file (JPEG or PNG)');
        return;
      }
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setError('');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select or drop an image first');
      return;
    }

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const res = await axios.post('http://localhost:5000/api/upload/identify', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Pest identification failed. Please try a clearer photo.');
      setLoading(false);
    }
  };

  const resetSelection = () => {
    setPreview(null);
    setSelectedFile(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <BackButton />

        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold mb-3">
            <span>🔍</span>
            <span>Computer Vision Diagnostic Tool</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
            AI Pest Identification
          </h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Upload or capture an image of an affected leaf, stem, or insect. Our computer vision engine identifies the pest and provides immediate control recommendations.
          </p>
        </div>

        {/* Upload Zone Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 mb-8">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            id="pest-file-input"
            className="hidden"
          />

          {!preview ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all duration-200 ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/50 scale-[1.01]'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-xs">
                📷
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Drop your crop image here, or browse
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Supports JPG, PNG photos up to 5MB. For best results, capture in bright natural light with the subject in focus.
              </p>

              <label
                htmlFor="pest-file-input"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all duration-200 cursor-pointer"
              >
                <span>📁</span>
                <span>Select Image from Device</span>
              </label>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Preview Box */}
              <div className="relative max-w-md mx-auto rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-900">
                <img
                  src={preview}
                  alt="Crop preview"
                  className="w-full max-h-80 object-contain mx-auto"
                />
                <button
                  onClick={resetSelection}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-slate-900 text-white flex items-center justify-center text-xs backdrop-blur-xs transition shadow-sm"
                  title="Remove image"
                >
                  ✕
                </button>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                <label
                  htmlFor="pest-file-input"
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 text-xs font-semibold cursor-pointer transition shadow-xs"
                >
                  Choose Different Photo
                </label>
                <button
                  onClick={handleUpload}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 disabled:opacity-60 transition cursor-pointer"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Analyzing Crop Visuals...</span>
                    </>
                  ) : (
                    <>
                      <span>🔍</span>
                      <span>Run AI Identification</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl mb-8 text-xs sm:text-sm flex items-start gap-3 shadow-xs">
            <span className="text-lg">⚠️</span>
            <div>
              <p className="font-semibold">{error}</p>
            </div>
          </div>
        )}

        {/* Diagnostic Results Display */}
        {result && (
          <div className="space-y-6">
            {/* If error in result object */}
            {result.error ? (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 sm:p-8 text-amber-900">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">⚠️</span>
                  <h3 className="text-lg font-bold">{result.error}</h3>
                </div>
                <p className="text-xs sm:text-sm text-amber-800 leading-relaxed mb-4">{result.note}</p>
                {result.detectedLabels && result.detectedLabels.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-amber-200/80">
                    <p className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">Detected image tags:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {result.detectedLabels.map((lbl, i) => (
                        <span key={i} className="text-xs px-2.5 py-1 rounded-md bg-white border border-amber-200 text-amber-800">
                          {lbl}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (() => {
              const activePest = result.primaryMatch?.pest || result.pest || result.primaryMatch || {};
              const pestName = activePest.name || result.primaryMatch?.name || result.pestName || 'Identified Pest';
              const scientificName = activePest.scientificName || result.primaryMatch?.scientificName || '';
              const confidence = Math.round(result.primaryMatch?.confidence || result.confidence || 85);
              const description = activePest.description || result.primaryMatch?.description || result.note || '';

              return (
                /* Success Result Card */
                <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-2">
                        <span>✅</span>
                        <span>Diagnosis Complete</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                        {pestName}
                      </h2>
                      {scientificName && (
                        <p className="text-sm font-serif italic text-emerald-700 mt-0.5">
                          {scientificName}
                        </p>
                      )}
                    </div>

                    {/* Confidence Score Pill */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-center min-w-[140px]">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Confidence</span>
                      <span className="text-2xl font-black text-emerald-600">
                        {confidence}%
                      </span>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, confidence))}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {description && (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6 text-sm text-slate-700 leading-relaxed">
                      {description}
                    </div>
                  )}

                  {/* Advisory Component */}
                  <div className="mt-6">
                    <PestManagementAdvisory
                      pest={activePest}
                      confidence={confidence}
                    />
                  </div>
                </div>
              );
            })()}
          </div>
        )}

      </main>
    </div>
  );
};

export default PestIdentification;

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';
import BackButton from '../components/BackButton.jsx';

const CropDetail = () => {
  const { id } = useParams();
  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCrop();
  }, [id]);

  const fetchCrop = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/crops/${id}`);
      setCrop(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching crop:', err);
      setLoading(false);
    }
  };

  const getCropIcon = (category) => {
    switch (category?.toLowerCase()) {
      case 'cereal': return '🌾';
      case 'vegetable': return '🥬';
      case 'fruit': return '🍎';
      case 'fiber': return '🧵';
      case 'cash crop': return '🌿';
      case 'legume': return '🫘';
      default: return '🌱';
    }
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'cereal': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'vegetable': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'fruit': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'fiber': return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'cash crop': return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'legume': return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-3">🌾</div>
          <p className="text-sm font-medium text-slate-500">Loading crop details...</p>
        </div>
      </div>
    </div>
  );

  if (!crop) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex justify-center items-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-sm">
          <span className="text-4xl">🚫</span>
          <h2 className="text-lg font-bold text-slate-800 mt-2">Crop Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">The crop profile you requested does not exist.</p>
          <Link to="/crops" className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl">
            Return to Crops
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <BackButton />

        {/* Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mb-10">
          <div className="flex flex-col lg:flex-row">
            <div className="lg:w-96 relative bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center p-8 border-b lg:border-b-0 lg:border-r border-slate-100 min-h-[260px] overflow-hidden">
              {crop.image ? (
                <img
                  src={crop.image.startsWith('http') ? crop.image : `http://localhost:5000${crop.image}`}
                  alt={crop.name}
                  onError={(e) => { 
                    e.target.style.display = 'none'; 
                    const fallback = e.target.parentElement.querySelector('.fallback-icon');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
              ) : null}
              {/* Fallback Graphic (Only shown if no image or image fails to load) */}
              <div className={`fallback-icon text-center flex-col items-center ${crop.image ? 'hidden' : 'flex'}`}>
                <span className="text-7xl drop-shadow-sm mb-2">{getCropIcon(crop.category)}</span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{crop.category}</span>
              </div>
            </div>

            {/* Information */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(crop.category)}`}>
                    {crop.category}
                  </span>
                  {crop.commonPests && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                      {crop.commonPests.length} Known Pests
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
                  {crop.name}
                </h1>

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Agronomic Summary</h3>
                  <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                    {crop.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  to="/identify"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  <span>📷 Scan This Crop</span>
                </Link>
                <Link
                  to="/pest-library"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
                >
                  <span>📚 Pest Library</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Common Pests Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Vulnerable Insect Pests</h2>
              <p className="text-xs sm:text-sm text-slate-500">Pests with known host affinity to {crop.name}</p>
            </div>
          </div>

          {crop.commonPests && crop.commonPests.length > 0 ? (
            <div className="grid gap-6">
              {crop.commonPests.map((pest) => (
                <div
                  key={pest._id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-7 hover:border-slate-300 transition-all duration-200"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🐛</span>
                        <h3 className="text-xl font-bold text-slate-900">{pest.name}</h3>
                      </div>
                      {pest.scientificName && (
                        <p className="text-xs font-serif italic text-emerald-700 mt-0.5 ml-8">
                          {pest.scientificName}
                        </p>
                      )}
                    </div>
                    <Link
                      to={`/pest-details/${pest._id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold transition w-fit"
                    >
                      <span>Full Pest Profile</span>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {pest.description}
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Symptoms */}
                    {pest.symptoms && pest.symptoms.length > 0 && (
                      <div className="bg-amber-50/50 rounded-xl p-4 border border-amber-100">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 mb-2 flex items-center gap-1.5">
                          <span>⚠️</span> Symptoms to Look For
                        </h4>
                        <ul className="space-y-1.5">
                          {pest.symptoms.map((symptom, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                              <span className="text-amber-500 font-bold">•</span>
                              <span>{symptom}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Management */}
                    {pest.management && (
                      <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
                          <span>🛡️</span> Management & Control
                        </h4>
                        <p className="text-xs text-slate-700 leading-relaxed">
                          {pest.management}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <span className="text-4xl">🛡️</span>
              <h3 className="text-base font-bold text-slate-800 mt-2">No High-Risk Pests Registered</h3>
              <p className="text-xs text-slate-500 mt-1">There are currently no recorded major pest infestations linked to this crop in the database.</p>
            </div>
          )}
        </div>

      </main>
    </div>
  );
};

export default CropDetail;

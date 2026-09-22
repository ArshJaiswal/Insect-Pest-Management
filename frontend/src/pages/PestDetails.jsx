import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';
import BackButton from '../components/BackButton.jsx';
import PestManagementAdvisory from '../components/PestManagementAdvisory.jsx';

const PestDetails = () => {
  const { id } = useParams();
  const [pest, setPest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPest();
  }, [id]);

  const fetchPest = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/pests/${id}`);
      setPest(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching pest:', err);
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin text-5xl mb-3">🐛</div>
          <p className="text-sm font-medium text-slate-500">Loading pest profile...</p>
        </div>
      </div>
    </div>
  );

  if (!pest) return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex justify-center items-center">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-sm">
          <span className="text-4xl">🚫</span>
          <h2 className="text-lg font-bold text-slate-800 mt-2">Pest Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 mb-4">The pest profile you requested does not exist.</p>
          <Link to="/pest-library" className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl">
            Return to Library
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
            {/* Visual Header / Thumbnail */}
            <div className="lg:w-96 relative bg-gradient-to-br from-amber-100 to-orange-50 flex items-center justify-center p-8 border-b lg:border-b-0 lg:border-r border-slate-100 min-h-[260px] overflow-hidden">
              {pest.images && pest.images.length > 0 && pest.images[0] ? (
                <img
                  src={pest.images[0].startsWith('http') ? pest.images[0] : `http://localhost:5000${pest.images[0]}`}
                  alt={pest.name}
                  onError={(e) => { 
                    e.target.style.display = 'none'; 
                    const fallback = e.target.parentElement.querySelector('.fallback-icon');
                    if (fallback) fallback.style.display = 'flex';
                  }}
                  className="absolute inset-0 w-full h-full object-cover z-0"
                />
              ) : null}
              {/* Fallback Graphic (Only shown if no image or image fails to load) */}
              <div className={`fallback-icon text-center flex-col items-center ${(pest.images && pest.images.length > 0 && pest.images[0]) ? 'hidden' : 'flex'}`}>
                <span className="text-7xl drop-shadow-sm mb-2">🐛</span>
                <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Insect Pest Profile</span>
              </div>
            </div>

            {/* Information */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    Agricultural Pest
                  </span>
                  {pest.affectedCrops && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {pest.affectedCrops.length} Host Crops
                    </span>
                  )}
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-1">
                  {pest.name}
                </h1>

                {pest.scientificName && (
                  <p className="text-sm font-serif italic text-emerald-700 mb-4">
                    Scientific: {pest.scientificName}
                  </p>
                )}

                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mb-6">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Description</h3>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {pest.description}
                  </p>
                </div>

                {/* Affected Crops */}
                {pest.affectedCrops && pest.affectedCrops.length > 0 && (
                  <div className="mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Commonly Affected Host Crops</h4>
                    <div className="flex flex-wrap gap-2">
                      {pest.affectedCrops.map((crop) => (
                        <Link
                          key={crop._id}
                          to={`/crops/${crop._id}`}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition flex items-center gap-1.5"
                        >
                          <span>🌱</span>
                          <span>{crop.name}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <Link
                  to="/identify"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition"
                >
                  <span>🔍 Verify with AI Identification</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Symptoms and Management */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {/* Symptoms */}
          {pest.symptoms && pest.symptoms.length > 0 && (
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">⚠️</span>
                <h3 className="text-lg font-bold text-slate-900">Crop Damage Symptoms</h3>
              </div>
              <ul className="space-y-3">
                {pest.symptoms.map((symptom, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 bg-amber-50/40 p-3 rounded-xl border border-amber-100/80">
                    <span className="text-amber-600 font-bold mt-0.5">•</span>
                    <span className="leading-relaxed">{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Management Tips */}
          {pest.management && (
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">💡</span>
                <h3 className="text-lg font-bold text-slate-900">Management & Control Guidelines</h3>
              </div>
              <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 mb-4">
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {pest.management}
                </p>
              </div>
              <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                📌 <strong>Recommendation:</strong> Always prioritize cultural and biological practices (such as resistant crop strains and natural predatory insects) before applying synthetic chemical pesticides.
              </div>
            </div>
          )}
        </div>

        {/* Advisory Component */}
        <div className="mb-10">
          <PestManagementAdvisory pest={pest} confidence={100} />
        </div>

      </main>
    </div>
  );
};

export default PestDetails;
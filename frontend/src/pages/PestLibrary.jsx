import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';
import BackButton from '../components/BackButton.jsx';

const PestLibrary = () => {
  const [pests, setPests] = useState([]);
  const [filteredPests, setFilteredPests] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterPests();
  }, [pests, searchTerm, selectedCrop]);

  const fetchData = async () => {
    try {
      const [pestsRes, cropsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/pests'),
        axios.get('http://localhost:5000/api/crops')
      ]);
      setPests(pestsRes.data);
      setCrops(cropsRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching data:', err);
      setLoading(false);
    }
  };

  const filterPests = () => {
    let filtered = [...pests];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(pest =>
        pest.name?.toLowerCase().includes(term) ||
        pest.scientificName?.toLowerCase().includes(term) ||
        pest.description?.toLowerCase().includes(term)
      );
    }

    if (selectedCrop !== 'all') {
      filtered = filtered.filter(pest =>
        pest.affectedCrops?.some(crop => (crop._id || crop) === selectedCrop)
      );
    }

    setFilteredPests(filtered);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <BackButton />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold mb-3">
              <span>🐛</span>
              <span>Entomology Database</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Insect Pest Library</h1>
            <p className="text-slate-500 text-sm mt-1 max-w-xl">
              Identification guide, scientific names, typical foliage damage, and intervention measures.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-2.5 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search pests or scientific name..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-xs"
              />
              <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-xs sm:text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 shadow-xs"
            >
              <option value="all">All Affected Crops</option>
              {crops.map((crop) => (
                <option key={crop._id} value={crop._id}>
                  {crop.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 animate-pulse">
                <div className="h-40 bg-slate-100 rounded-xl mb-4"></div>
                <div className="h-5 bg-slate-100 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-1/3 mb-4"></div>
                <div className="h-10 bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredPests.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto my-8">
            <span className="text-4xl">🔍</span>
            <h3 className="text-lg font-bold text-slate-800 mt-3">No pests match your search</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">Try searching with a different keyword or removing the crop filter.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCrop('all'); }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Pest Cards Grid */}
        {!loading && filteredPests.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPests.map((pest) => (
              <Link
                to={`/pest-details/${pest._id}`}
                key={pest._id}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Visual Header */}
                  <div className="relative h-44 bg-gradient-to-br from-amber-100/60 to-orange-50 flex items-center justify-center overflow-hidden border-b border-slate-100">
                    {pest.images && pest.images.length > 0 && pest.images[0] ? (
                      <img
                        src={pest.images[0].startsWith('http') ? pest.images[0] : `http://localhost:5000${pest.images[0]}`}
                        alt={pest.name}
                        onError={(e) => { 
                          e.target.style.display = 'none'; 
                          const fallback = e.target.parentElement.querySelector('.fallback-icon');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 z-0"
                      />
                    ) : null}
                    {/* Fallback Graphic (Only shown if no image or image fails to load) */}
                    <div className={`fallback-icon flex-col items-center justify-center text-slate-400 group-hover:scale-110 transition-transform duration-200 ${(pest.images && pest.images.length > 0 && pest.images[0]) ? 'hidden' : 'flex'}`}>
                      <span className="text-5xl drop-shadow-sm">🐛</span>
                      <span className="text-[11px] font-medium text-slate-500 mt-1">{pest.name}</span>
                    </div>
                    <div className="absolute top-3 right-3 z-10">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-amber-800 border border-amber-200 shadow-xs">
                        Insect Pest
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                      {pest.name}
                    </h3>
                    {pest.scientificName && (
                      <p className="text-xs font-serif italic text-emerald-700 mb-3">
                        {pest.scientificName}
                      </p>
                    )}
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3 mb-4">
                      {pest.description}
                    </p>

                    {/* Symptoms Preview Chips */}
                    {pest.symptoms && pest.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mb-2">
                        {pest.symptoms.slice(0, 2).map((symptom, idx) => (
                          <span key={idx} className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md truncate max-w-[200px]">
                            • {symptom}
                          </span>
                        ))}
                        {pest.symptoms.length > 2 && (
                          <span className="text-[10px] font-medium bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded-md">
                            +{pest.symptoms.length - 2} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-5 py-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-800 group-hover:text-amber-900">
                  <span>View Mitigation Guide</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}

      </main>
    </div>
  );
};

export default PestLibrary;
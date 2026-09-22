import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';
import BackButton from '../components/BackButton.jsx';

const CropList = () => {
  const [crops, setCrops] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCrops();
  }, []);

  const fetchCrops = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/crops');
      setCrops(res.data);
      const uniqueCategories = [...new Set(res.data.map(crop => crop.category).filter(Boolean))];
      setCategories(uniqueCategories);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching crops:', err);
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
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

  const filteredCrops = crops.filter(crop => {
    const matchesCategory = selectedCategory === 'all' || crop.category === selectedCategory;
    const matchesSearch = crop.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          crop.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <BackButton />

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold mb-3">
              <span>🌾</span>
              <span>Crop Directory</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Agricultural Crops</h1>
            <p className="text-slate-500 text-sm mt-1 max-w-xl">
              Browse crops, cultivation requirements, common pests, and defense techniques.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-80 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search crops..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm text-slate-800 placeholder-slate-400"
            />
            <svg className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            All Crops ({crops.length})
          </button>
          {categories.map((cat) => {
            const count = crops.filter(c => c.category === cat).length;
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  active
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <span>{getCategoryIcon(cat)}</span>
                <span>{cat}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${active ? 'bg-emerald-700/80 text-white' : 'bg-slate-100 text-slate-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse">
                <div className="h-44 bg-slate-100 rounded-xl mb-4"></div>
                <div className="h-5 bg-slate-100 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-slate-100 rounded w-1/3 mb-4"></div>
                <div className="h-12 bg-slate-100 rounded"></div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCrops.length === 0 && (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200/80 max-w-md mx-auto my-8">
            <span className="text-4xl">🌾</span>
            <h3 className="text-lg font-bold text-slate-800 mt-3">No crops found</h3>
            <p className="text-sm text-slate-500 mt-1 mb-4">Try clearing your search query or selecting a different category filter.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* Crops Grid */}
        {!loading && filteredCrops.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCrops.map((crop) => (
              <Link
                to={`/crops/${crop._id}`}
                key={crop._id}
                className="group bg-white rounded-2xl border border-slate-200/90 hover:border-slate-300 hover:shadow-lg transition-all duration-200 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Card Visual / Thumbnail */}
                  <div className="relative h-44 bg-gradient-to-br from-emerald-100/60 to-teal-50 flex items-center justify-center overflow-hidden border-b border-slate-100">
                    {crop.image ? (
                      <img
                        src={crop.image.startsWith('http') ? crop.image : `http://localhost:5000${crop.image}`}
                        alt={crop.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const fallback = e.target.parentElement.querySelector('.fallback-icon');
                          if (fallback) fallback.style.display = 'flex';
                        }}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 z-0"
                      />
                    ) : null}
                    {/* Fallback Graphic (Only shown if no image or image fails to load) */}
                    <div className={`fallback-icon flex-col items-center justify-center text-slate-400 group-hover:scale-110 transition-transform duration-200 ${crop.image ? 'hidden' : 'flex'}`}>
                      <span className="text-5xl drop-shadow-sm">{getCategoryIcon(crop.category)}</span>
                      <span className="text-[11px] font-medium text-slate-500 mt-1">{crop.name}</span>
                    </div>
                    {/* Category Tag overlay */}
                    <div className="absolute top-3 left-3 z-10">
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-xs ${getCategoryColor(crop.category)}`}>
                        {crop.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {crop.name}
                      </h3>
                      {crop.commonPests && crop.commonPests.length > 0 && (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          {crop.commonPests.length} pests
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                      {crop.description}
                    </p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-5 py-3.5 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                  <span>View Details & Protection</span>
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

export default CropList;

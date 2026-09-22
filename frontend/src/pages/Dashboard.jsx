import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import axios from 'axios';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ crops: 10, pests: 12, loading: true });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [cropsRes, pestsRes] = await Promise.allSettled([
          axios.get('http://localhost:5000/api/crops'),
          axios.get('http://localhost:5000/api/pests')
        ]);
        setStats({
          crops: cropsRes.status === 'fulfilled' ? cropsRes.value.data.length : 10,
          pests: pestsRes.status === 'fulfilled' ? pestsRes.value.data.length : 12,
          loading: false
        });
      } catch (err) {
        setStats({ crops: 10, pests: 12, loading: false });
      }
    };
    fetchCounts();
  }, []);

  const featureCards = [
    {
      title: 'Browse Crops',
      desc: 'Explore crop varieties, growth guidelines, and susceptible insect pests with mitigation strategies.',
      path: '/crops',
      tag: 'Crops Catalog',
      icon: '🌱',
      color: 'from-emerald-500 to-teal-600',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      title: 'Pest Library',
      desc: 'Browse biological profiles, scientific classifications, symptoms, and pest management controls.',
      path: '/pest-library',
      tag: 'Field Guide',
      icon: '🐛',
      color: 'from-amber-500 to-orange-600',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
    },
    {
      title: 'AI Pest Identification',
      desc: 'Upload or capture an image of an affected crop to run real-time diagnostic AI vision analysis.',
      path: '/identify',
      tag: 'AI Vision',
      icon: '🔍',
      color: 'from-blue-500 to-indigo-600',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      title: 'Community Feedback',
      desc: 'Submit observations, field reports, and ratings to improve our agricultural protection model.',
      path: '/feedback',
      tag: 'Feedback',
      icon: '💬',
      color: 'from-purple-500 to-pink-600',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    ...(user?.role === 'admin' ? [
      {
        title: 'Admin Management',
        desc: 'Manage crops, pests, and user feedback directly with full administrative authorization.',
        path: '/admin',
        tag: 'Admin Only',
        icon: '⚙️',
        color: 'from-rose-500 to-red-600',
        badgeColor: 'bg-rose-50 text-rose-700 border-rose-200'
      }
    ] : [])
  ];

  const seasonalTips = [
    { title: 'Early Scouting', desc: 'Inspect underside of leaves weekly during flowering stage to spot aphid colonies early.', icon: '🔍' },
    { title: 'Neem-Based Deterrents', desc: 'Apply organic neem spray during dusk to minimize solar degradation and avoid harmless pollinators.', icon: '🌿' },
    { title: 'Companion Planting', desc: 'Intercrop with marigolds and basil to naturally repel whiteflies, nematodes, and stem borers.', icon: '🌼' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white p-8 sm:p-12 mb-10 shadow-xl border border-slate-800">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold mb-4">
              <span>🌾</span>
              <span>Crop Health & Pest Intelligence</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
              Welcome back, <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">{user?.name || 'Farmer'}</span>!
            </h1>
            
            <p className="text-slate-300 text-base sm:text-lg leading-relaxed mb-6 font-normal">
              Monitor agricultural risks, identify crop damage with computer vision, and deploy integrated pest management (IPM) measures across your farm.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/identify"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 transition-all duration-200 transform hover:-translate-y-0.5"
              >
                <span>🔍</span>
                <span>Scan Image for Pests</span>
              </Link>
              <Link
                to="/crops"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 font-semibold text-sm transition-all duration-200"
              >
                <span>🌱</span>
                <span>Explore Crops</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Quick KPI Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Indexed Crops</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.crops}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-semibold">
              🌾
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Monitored Pests</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{stats.pests}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-semibold">
              🐛
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">AI Accuracy</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">94.8%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-semibold">
              ⚡
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Account Role</p>
              <p className="text-xl font-bold text-slate-900 mt-1 capitalize">{user?.role || 'User'}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-2xl font-semibold">
              {user?.role === 'admin' ? '👑' : '👨‍🌾'}
            </div>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Core Modules</h2>
              <p className="text-xs sm:text-sm text-slate-500">Quickly jump into identification, crops, and field guides</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featureCards.map((card) => (
              <Link
                key={card.title}
                to={card.path}
                className="group relative bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-110 transition-transform duration-200">
                      {card.icon}
                    </span>
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${card.badgeColor}`}>
                      {card.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-emerald-700 transition-colors mb-2">
                    {card.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-600 group-hover:text-emerald-700">
                  <span>Open Module</span>
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Seasonal Advisory Section */}
        <div className="bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-slate-50 rounded-2xl p-6 sm:p-8 border border-emerald-200/70">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">💡</span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Seasonal IPM Advisory Tips</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {seasonalTips.map((tip) => (
              <div key={tip.title} className="bg-white/90 backdrop-blur-sm rounded-xl p-4 border border-emerald-100 shadow-xs">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-lg">{tip.icon}</span>
                  <h4 className="font-semibold text-slate-800 text-sm">{tip.title}</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </main>
    </div>
  );
};

export default Dashboard;

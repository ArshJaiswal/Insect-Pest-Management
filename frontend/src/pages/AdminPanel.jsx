import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';
import BackButton from '../components/BackButton.jsx';
import { API_BASE_URL } from '../lib/api';

const AdminPanel = () => {
  const location = useLocation();
  const searchTab = new URLSearchParams(location.search).get('tab');
  const [activeTab, setActiveTab] = useState(
    ['crops', 'pests', 'feedback'].includes(searchTab) ? searchTab : 'crops'
  );
  const [crops, setCrops] = useState([]);
  const [pests, setPests] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [feedbackStats, setFeedbackStats] = useState({});
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Sync tab with URL search parameter if it changes
  useEffect(() => {
    const tab = new URLSearchParams(location.search).get('tab');
    if (tab && ['crops', 'pests', 'feedback'].includes(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Debug log to track activeTab changes
  console.log('AdminPanel - Current activeTab:', activeTab);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔍 AdminPanel - Fetching data for:', activeTab, 'Token exists:', !!token);
      
      if (!token) {
        console.error('❌ No authentication token found');
        alert('Please log in to access the admin panel');
        return;
      }
      
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      if (activeTab === 'crops') {
        console.log('🌾 Fetching crops data...');
        const res = await axios.get(`${API_BASE_URL}/api/crops`, config);
        console.log('✅ Crops data received:', res.data?.length || 0, 'items');
        setCrops(res.data || []);
      } else if (activeTab === 'pests') {
        console.log('🐛 Fetching pests data...');
        const res = await axios.get(`${API_BASE_URL}/api/pests`, config);
        console.log('✅ Pests data received:', res.data?.length || 0, 'items');
        setPests(res.data || []);
      } else if (activeTab === 'feedback') {
        console.log('💬 Fetching feedback data...');
        const res = await axios.get(`${API_BASE_URL}/api/feedback`, config);
        console.log('✅ Feedback data received:', res.data?.feedback?.length || 0, 'items');
        setFeedback(res.data?.feedback || []);
        setFeedbackStats(res.data?.statistics || {});
      }
    } catch (err) {
      console.error('❌ Error fetching data:', err);
      if (err.response?.status === 401) {
        alert('Authentication failed. Please log in again.');
      } else if (err.response?.status === 403) {
        alert('Access denied. Admin privileges required.');
      } else {
        console.error('Network or server error:', err.message);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      const endpoint = activeTab === 'crops' ? '/api/crops' : '/api/pests';
      
      // If there's an image file, upload it first
      let imageUrl = '';
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('image', imageFile);
        
        const uploadRes = await axios.post(`${API_BASE_URL}/api/upload`, imageFormData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        });
        imageUrl = uploadRes.data.imageUrl;
      }
      
      // Prepare data based on active tab
      let dataToSubmit;
      if (activeTab === 'crops') {
        dataToSubmit = { 
          ...formData, 
          image: imageUrl || formData.image || ''
        };
      } else {
        // For pests, use images array
        const existingImages = formData.images || [];
        const newImages = imageUrl ? [imageUrl] : (formData.images?.[0] ? [formData.images[0]] : []);
        dataToSubmit = { 
          ...formData, 
          images: newImages.length > 0 ? newImages : existingImages
        };
      }
      
      await axios.post(`${API_BASE_URL}${endpoint}`, dataToSubmit, config);
      
      setFormData({});
      setImageFile(null);
      setImagePreview(null);
      fetchData();
      alert('Added successfully!');
    } catch (err) {
      console.error('Error:', err);
      alert('Error adding item: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure?')) return;
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      let endpoint;
      if (activeTab === 'crops') {
        endpoint = '/api/crops';
      } else if (activeTab === 'pests') {
        endpoint = '/api/pests';
      } else if (activeTab === 'feedback') {
        endpoint = '/api/feedback';
      }
      
      await axios.delete(`${API_BASE_URL}${endpoint}/${id}`, config);
      fetchData();
    } catch (err) {
      console.error('Error:', err);
      alert('Error deleting item: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleFeedbackStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };
      
      await axios.put(`${API_BASE_URL}/api/feedback/${id}`, {
        status
      }, config);
      
      fetchData(); // Refresh the feedback list
    } catch (err) {
      console.error('Error updating feedback:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-emerald-100/40 via-teal-50/20 to-transparent pointer-events-none" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 -right-32 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />

      <Navbar />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="mb-8">
          <BackButton />
        </div>
        
        {/* Enhanced Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2.5 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-xs border border-emerald-100 mb-4">
            <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-md flex items-center justify-center text-xs text-white">
              🛡️
            </div>
            <span className="text-xs font-bold text-emerald-800 tracking-wide uppercase">Administrative Control Center</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-3">
            Admin Management Panel
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal">
            Manage your crop encyclopedia, pest intelligence records, and farmer community feedback.
          </p>

          {/* Current Tab Indicator & Actions */}
          <div className="mt-5 flex items-center justify-center gap-3 flex-wrap">
            <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-slate-200/90 shadow-xs text-xs font-medium text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-500">Current Tab:</span>
              <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200/60 text-xs">
                {activeTab === 'crops' ? 'Crops' : activeTab === 'pests' ? 'Pests' : 'User Feedback'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                console.log('🔄 Refreshing admin data for:', activeTab);
                fetchData();
              }}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 active:scale-95 text-slate-700 hover:text-emerald-700 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-200/90 shadow-xs hover:shadow transition-all cursor-pointer"
              title="Refresh data from server"
            >
              <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
        
        {/* Enhanced Tab Navigation */}
        <div className="flex justify-center gap-4 mb-10 flex-wrap">
          <button 
            type="button"
            className={`group relative px-7 py-3.5 rounded-2xl font-bold text-base transition-all duration-200 cursor-pointer shadow-sm ${
              activeTab === 'crops' 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 ring-2 ring-emerald-500/30' 
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
            }`}
            onClick={() => {
              console.log('🌾 Manage Crops clicked');
              setActiveTab('crops');
            }}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-xl">🌾</span>
              <span>Manage Crops</span>
            </span>
          </button>
          <button 
            type="button"
            className={`group relative px-7 py-3.5 rounded-2xl font-bold text-base transition-all duration-200 cursor-pointer shadow-sm ${
              activeTab === 'pests' 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 ring-2 ring-emerald-500/30' 
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
            }`}
            onClick={() => {
              console.log('🐛 Manage Pests clicked');
              setActiveTab('pests');
            }}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-xl">🐛</span>
              <span>Manage Pests</span>
            </span>
          </button>
          <button 
            type="button"
            className={`group relative px-7 py-3.5 rounded-2xl font-bold text-base transition-all duration-200 cursor-pointer shadow-sm ${
              activeTab === 'feedback' 
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/25 ring-2 ring-emerald-500/30' 
                : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 hover:border-emerald-300 hover:text-emerald-700'
            }`}
            onClick={() => {
              console.log('💬 User Feedback clicked');
              setActiveTab('feedback');
            }}
          >
            <span className="flex items-center gap-2.5">
              <span className="text-xl">💬</span>
              <span>User Feedback</span>
            </span>
          </button>
        </div>

        <div className="space-y-8">
          {/* Enhanced Add Form - Only for Crops and Pests */}
          {(activeTab === 'crops' || activeTab === 'pests') && (
          <div className="relative">
            <div className="relative bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                  activeTab === 'crops' 
                    ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                    : 'bg-gradient-to-br from-red-500 to-orange-600'
                }`}>
                  <span className="text-white text-2xl">{activeTab === 'crops' ? '🌱' : '🦗'}</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800">
                    Add New {activeTab === 'crops' ? 'Crop' : 'Pest'}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {activeTab === 'crops' 
                      ? 'Expand your crop database with new agricultural varieties' 
                      : 'Add new pest species to enhance identification capabilities'
                    }
                  </p>
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Name</label>
                    <input
                      type="text"
                      placeholder="Enter name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 bg-white backdrop-blur-sm"
                      required
                    />
                  </div>
                  
                  {activeTab === 'crops' && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Category</label>
                      <input
                        type="text"
                        placeholder="Enter category"
                        value={formData.category || ''}
                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-300 bg-white backdrop-blur-sm"
                        required
                      />
                    </div>
                  )}
                  
                  {activeTab === 'pests' && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">Scientific Name</label>
                      <input
                        type="text"
                        placeholder="Enter scientific name"
                        value={formData.scientificName || ''}
                        onChange={(e) => setFormData({...formData, scientificName: e.target.value})}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 bg-white backdrop-blur-sm"
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Description</label>
                  <textarea
                    placeholder="Enter detailed description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] resize-y transition-all duration-300 bg-white backdrop-blur-sm"
                  />
                </div>
                
                {/* Image Upload Section - For Both Crops and Pests */}
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <svg className={`w-5 h-5 ${activeTab === 'crops' ? 'text-green-600' : 'text-red-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {activeTab === 'crops' ? 'Crop Image' : 'Pest Image'}
                  </label>
                  
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Image Upload Area */}
                    <div className="flex-1">
                      <div className="relative group">
                        <input
                          type="file"
                          id="imageUpload"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                        <label
                          htmlFor="imageUpload"
                          className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
                            activeTab === 'crops'
                              ? 'border-green-300 bg-green-50/50 hover:bg-green-100/50 group-hover:border-green-500'
                              : 'border-red-300 bg-red-50/50 hover:bg-red-100/50 group-hover:border-red-500'
                          }`}
                        >
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className={`w-12 h-12 mb-3 transition-colors ${
                              activeTab === 'crops'
                                ? 'text-green-500 group-hover:text-green-600'
                                : 'text-red-500 group-hover:text-red-600'
                            }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="mb-2 text-sm text-gray-600 font-semibold">
                              <span className={activeTab === 'crops' ? 'text-green-600' : 'text-red-600'}>Click to upload</span> or drag and drop
                            </p>
                            <p className="text-xs text-gray-500">PNG, JPG, JPEG (MAX. 5MB)</p>
                          </div>
                        </label>
                      </div>
                      
                      {/* Alternative: Image URL Input */}
                      <div className="mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 h-px bg-gray-300"></div>
                          <span className="text-xs text-gray-500 font-medium">OR</span>
                          <div className="flex-1 h-px bg-gray-300"></div>
                        </div>
                        <input
                          type="url"
                          placeholder="Enter image URL"
                          value={activeTab === 'crops' ? (formData.image || '') : (formData.images?.[0] || '')}
                          onChange={(e) => {
                            if (activeTab === 'crops') {
                              setFormData({...formData, image: e.target.value});
                            } else {
                              setFormData({...formData, images: [e.target.value]});
                            }
                          }}
                          className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-300 bg-white backdrop-blur-sm text-sm ${
                            activeTab === 'crops' ? 'focus:ring-green-500' : 'focus:ring-red-500'
                          }`}
                        />
                      </div>
                    </div>
                    
                    {/* Image Preview */}
                    <div className="flex-1">
                      <div className="relative h-full min-h-[200px] border-2 border-gray-200 rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
                        {(imagePreview || (activeTab === 'crops' ? formData.image : formData.images?.[0])) ? (
                          <div className="relative h-full group">
                            <img
                              src={imagePreview || (activeTab === 'crops' ? formData.image : formData.images?.[0])}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                              <button
                                type="button"
                                onClick={() => {
                                  setImageFile(null);
                                  setImagePreview(null);
                                  if (activeTab === 'crops') {
                                    setFormData({...formData, image: ''});
                                  } else {
                                    setFormData({...formData, images: []});
                                  }
                                }}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors duration-300 flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <svg className="w-16 h-16 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p className="text-sm font-medium">Image Preview</p>
                            <p className="text-xs">Upload or enter URL to see preview</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className={`group relative overflow-hidden px-8 py-4 rounded-xl font-bold text-white transition-all duration-300 transform hover:scale-105 shadow-lg ${
                    activeTab === 'crops'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-500/25'
                      : 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 shadow-red-500/25'
                  }`}
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add {activeTab === 'crops' ? 'Crop' : 'Pest'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                </button>
              </form>
            </div>
          </div>
          )}

          {/* Feedback Statistics - Only for Feedback Tab */}
          {activeTab === 'feedback' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 text-xl">📊</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Feedback</p>
                  <p className="text-2xl font-bold text-gray-800">{feedbackStats.totalFeedback || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 text-xl">⭐</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold text-gray-800">{feedbackStats.averageRating?.toFixed(1) || '0.0'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 text-xl">✅</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Resolved</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {feedbackStats.statusCounts?.filter(s => s === 'resolved').length || 0}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-white/95 backdrop-blur-md p-6 rounded-xl shadow-lg border border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-orange-600 text-xl">⏳</span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-800">
                    {feedbackStats.statusCounts?.filter(s => s === 'pending').length || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Enhanced Data Table */}
          <div className="relative">
            <div className="relative bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-8 border-b border-gray-200/50">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                    activeTab === 'crops' 
                      ? 'bg-gradient-to-br from-green-500 to-emerald-600' 
                      : activeTab === 'pests'
                      ? 'bg-gradient-to-br from-red-500 to-orange-600'
                      : 'bg-gradient-to-br from-blue-500 to-purple-600'
                  }`}>
                    <span className="text-white text-2xl">
                      {activeTab === 'crops' ? '📊' : activeTab === 'pests' ? '📋' : '💬'}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-gray-800">
                      {activeTab === 'crops' && `Existing Crops`}
                      {activeTab === 'pests' && `Existing Pests`}
                      {activeTab === 'feedback' && `User Feedback`}
                    </h2>
                    <p className="text-gray-600 mt-1">
                      {activeTab === 'crops' && `${crops.length} items in database`}
                      {activeTab === 'pests' && `${pests.length} items in database`}
                      {activeTab === 'feedback' && `${feedback.length} feedback submissions`}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      {activeTab === 'feedback' ? (
                        <>
                          <th className="px-8 py-4 text-left text-gray-700 font-bold text-lg">User</th>
                          <th className="px-8 py-4 text-left text-gray-700 font-bold text-lg">Subject</th>
                          <th className="px-8 py-4 text-left text-gray-700 font-bold text-lg">Rating</th>
                          <th className="px-8 py-4 text-left text-gray-700 font-bold text-lg">Category</th>
                          <th className="px-8 py-4 text-left text-gray-700 font-bold text-lg">Status</th>
                          <th className="px-8 py-4 text-left text-gray-700 font-bold text-lg">Actions</th>
                        </>
                      ) : (
                        <>
                          <th className="px-8 py-4 text-left text-gray-700 font-bold text-lg">Image</th>
                          <th className="px-8 py-4 text-left text-gray-700 font-bold text-lg">Name</th>
                          <th className="px-8 py-4 text-left text-gray-700 font-bold text-lg">
                            {activeTab === 'crops' ? 'Category' : 'Scientific Name'}
                          </th>
                          <th className="px-8 py-4 text-left text-gray-700 font-bold text-lg">Actions</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {activeTab === 'feedback' ? (
                      feedback.map((item) => (
                        <tr key={item._id} className="border-b border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-blue-600 text-lg">👤</span>
                              </div>
                              <div>
                                <span className="font-semibold text-gray-800">{item.name}</span>
                                <p className="text-xs text-gray-500">{item.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div>
                              <p className="font-medium text-gray-800">{item.subject}</p>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.message}</p>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <span key={i} className={`text-lg ${i < item.rating ? 'text-yellow-400' : 'text-gray-300'}`}>
                                  ⭐
                                </span>
                              ))}
                              <span className="ml-2 text-sm text-gray-600">({item.rating}/5)</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                              {item.category.replace('-', ' ')}
                            </span>
                          </td>
                          <td className="px-8 py-6">
                            <select
                              value={item.status}
                              onChange={(e) => handleFeedbackStatusUpdate(item._id, e.target.value)}
                              className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${
                                item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                item.status === 'reviewed' ? 'bg-blue-100 text-blue-800' :
                                item.status === 'resolved' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <option value="pending">Pending</option>
                              <option value="reviewed">Reviewed</option>
                              <option value="resolved">Resolved</option>
                              <option value="closed">Closed</option>
                            </select>
                          </td>
                          <td className="px-8 py-6">
                            <button 
                              onClick={() => handleDelete(item._id)} 
                              className="px-3 py-1 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      (activeTab === 'crops' ? crops : pests).map((item) => (
                        <tr key={item._id} className={`border-b border-gray-100 hover:bg-gradient-to-r ${
                          activeTab === 'crops' 
                            ? 'hover:from-green-50 hover:to-emerald-50' 
                            : 'hover:from-red-50 hover:to-orange-50'
                        } transition-all duration-300`}>
                          <td className="px-8 py-6">
                            <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-gray-200 bg-gray-100">
                              {(activeTab === 'crops' ? item.image : item.images?.[0]) ? (
                                <img
                                  src={
                                    activeTab === 'crops' 
                                      ? (item.image.startsWith('http') ? item.image : `${API_BASE_URL}${item.image}`)
                                      : (item.images[0].startsWith('http') ? item.images[0] : `${API_BASE_URL}${item.images[0]}`)
                                  }
                                  alt={item.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div className={`w-full h-full flex items-center justify-center text-2xl ${
                                (activeTab === 'crops' ? item.image : item.images?.[0]) ? 'hidden' : 'flex'
                              }`}>
                                {activeTab === 'crops' ? '🌾' : '🐛'}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                                activeTab === 'crops' 
                                  ? 'bg-green-100 text-green-600' 
                                  : 'bg-red-100 text-red-600'
                              }`}>
                                {activeTab === 'crops' ? '🌾' : '🐛'}
                              </div>
                              <span className="font-semibold text-gray-800">{item.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 text-gray-600 font-medium">
                            {activeTab === 'crops' ? item.category : item.scientificName}
                          </td>
                          <td className="px-8 py-6">
                            <button 
                              onClick={() => handleDelete(item._id)} 
                              className="group bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
                            >
                              <span className="flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                
                {/* Empty State */}
                {((activeTab === 'crops' && crops.length === 0) || 
                  (activeTab === 'pests' && pests.length === 0) || 
                  (activeTab === 'feedback' && feedback.length === 0)) && (
                  <div className="text-center py-16">
                    <div className="text-6xl mb-4 opacity-50">
                      {activeTab === 'crops' ? '🌾' : activeTab === 'pests' ? '🐛' : '💬'}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">
                      No {activeTab === 'feedback' ? 'feedback' : activeTab} found
                    </h3>
                    <p className="text-gray-500">
                      {activeTab === 'crops' && 'Add your first crop using the form above'}
                      {activeTab === 'pests' && 'Add your first pest using the form above'}
                      {activeTab === 'feedback' && 'No user feedback has been submitted yet'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;

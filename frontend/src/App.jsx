import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Dashboard from './pages/Dashboard.jsx';
import CropList from './pages/CropList.jsx';
import CropDetail from './pages/CropDetail.jsx';
import PestIdentification from './pages/PestIdentification.jsx';
import PestLibrary from './pages/PestLibrary.jsx';
import PestDetails from './pages/PestDetails.jsx';
import AdminPanel from './pages/AdminPanel.jsx';
import Profile from './pages/Profile.jsx';
import Feedback from './pages/Feedback.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import Chatbot from './components/Chatbot.jsx';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/crops" element={<PrivateRoute><CropList /></PrivateRoute>} />
          <Route path="/crops/:id" element={<PrivateRoute><CropDetail /></PrivateRoute>} />
          <Route path="/pest-library" element={<PrivateRoute><PestLibrary /></PrivateRoute>} />
          <Route path="/pest-details/:id" element={<PrivateRoute><PestDetails /></PrivateRoute>} />
          <Route path="/identify" element={<PrivateRoute><PestIdentification /></PrivateRoute>} />
          <Route path="/feedback" element={<PrivateRoute><Feedback /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        
        {/* Global Chatbot - Available on all pages */}
        <Chatbot />
      </Router>
    </AuthProvider>
  );
}

export default App;

import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Crops', path: '/crops', icon: '🌾' },
    { name: 'Pest Library', path: '/pest-library', icon: '🐛' },
    { name: 'AI Identify', path: '/identify', icon: '🔍' },
    ...(isAdmin 
      ? [{ name: 'User Feedback', path: '/admin?tab=feedback', icon: '💬' }] 
      : [{ name: 'Feedback', path: '/feedback', icon: '💬' }]
    ),
    ...(isAdmin ? [{ name: 'Admin Panel', path: '/admin', icon: '⚙️' }] : []),
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  const isActive = (path) => {
    if (path.includes('?tab=')) {
      const [base, query] = path.split('?');
      return location.pathname === base && location.search.includes(query);
    }
    if (path === '/admin') {
      return location.pathname === '/admin' && !location.search.includes('tab=feedback');
    }
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <Link to="/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform duration-200">
              <span className="text-xl">🌿</span>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 bg-clip-text text-transparent tracking-tight">
                AgroGuard
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide -mt-0.5">
                Smart Crop Protection
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <ul className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                      active
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs font-semibold'
                        : 'text-slate-600 hover:text-emerald-800 hover:bg-slate-100/70'
                    }`}
                  >
                    <span>{link.icon}</span>
                    <span>{link.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Right Section: User Pill & Logout */}
          <div className="hidden lg:flex items-center space-x-3">
            {user && (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200 text-xs text-slate-600">
                <div className="w-7 h-7 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center font-bold text-emerald-800">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="flex flex-col text-left">
                  <span className="font-semibold text-slate-800 truncate max-w-[120px]">{user.name}</span>
                  <span className="text-[10px] text-emerald-700 capitalize font-mono">
                    {user.role === 'admin' ? '👑 Admin' : '🌾 Farmer'}
                  </span>
                </div>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all duration-200 cursor-pointer"
            >
              Sign out
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
              aria-label="Toggle Menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-slate-200 space-y-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition ${
                    active
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="mr-2">{link.icon}</span>
                  {link.name}
                </Link>
              );
            })}
            <div className="pt-2 border-t border-slate-200 flex justify-between items-center px-3">
              <span className="text-xs text-slate-600">Signed in as <strong className="text-slate-800">{user?.name}</strong></span>
              <button
                onClick={handleLogout}
                className="px-3 py-1 text-xs rounded bg-rose-50 text-rose-600 border border-rose-200 font-medium cursor-pointer"
              >
                Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

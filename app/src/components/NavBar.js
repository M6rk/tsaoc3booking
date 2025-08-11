import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/auth';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { currentUser, userRole, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <nav className="bg-opacity-80 text-white shadow-lg relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo - Always on the left */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold text-white hover:text-red-200 transition-colors">
              TSA Booking System
            </Link>
          </div>

          {/* Desktop Menu - Right aligned */}
          <div className="hidden md:flex">
            <div className="flex items-center space-x-8">
              <Link to="/" className="text-white hover:text-red-200 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                Home
              </Link>
              {currentUser ? (
                <>
                  <Link to="/rooms" className="text-white hover:text-red-200 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Room Bookings
                  </Link>
                  <Link to="/vehicles" className="text-white hover:text-red-200 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                    Fleet Bookings
                  </Link>
                  {isAdmin && (
                    <>
                      <Link to="/admindash" className="text-white hover:text-red-200 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                        Admin Dashboard
                      </Link>
                      <Link to="/test-db" className="text-white hover:text-red-200 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                        Test DB
                      </Link>
                    </>
                  )}
                  <span className="text-sm text-red-100 px-3">
                    {currentUser.email} ({userRole})
                  </span>
                  <button
                    onClick={handleLogout}
                    className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex-shrink-0">
            <button
              onClick={toggleMenu}
              className="text-white hover:text-red-200 p-2 rounded-md"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-red-900 border-t border-red-700">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link 
              to="/" 
              className="text-white hover:text-red-200 hover:bg-red-700 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            {currentUser && (
              <>
                <Link 
                  to="/rooms" 
                  className="text-white hover:text-red-200 hover:bg-red-700 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Room Bookings
                </Link>
                <Link 
                  to="/vehicles" 
                  className="text-white hover:text-red-200 hover:bg-red-700 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Fleet Bookings
                </Link>
                {isAdmin && (
                  <>
                    <Link 
                      to="/admindash" 
                      className="text-white hover:text-red-200 hover:bg-red-700 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                    <Link 
                      to="/test-db" 
                      className="text-white hover:text-red-200 hover:bg-red-700 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Test DB
                    </Link>
                  </>
                )}
              </>
            )}
            
            {/* Mobile User Section */}
            <div className="border-t border-red-700 pt-4 mt-4">
              {currentUser ? (
                <div className="px-3 py-2">
                  <p className="text-sm text-red-100 mb-3">
                    {currentUser.email} ({userRole})
                  </p>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-red-600 hover:bg-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors text-left"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <Link 
                  to="/login" 
                  className="text-white hover:text-red-200 hover:bg-red-700 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';

const InvalidRoute = () => {
  return (
    <div className="h-screen bg-[#EE2D3D] relative overflow-hidden">
      {/* Navigation */}
     <NavBar />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center -mt-16">
        {/* 404 Section */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold text-white mb-4">
            404
          </h1>
          <h2 className="text-3xl md:text-4xl font-bold text-red-300 mb-4">
            Page Not Found
          </h2>
          <p className="text-lg text-red-100 mb-8 max-w-md">
            Sorry, the page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link to="/" className="group">
            <div className="bg-gray-900/40 backdrop-blur-lg rounded-xl px-6 py-3 border-2 hover:bg-gray-800/50 transition-all duration-300 transform hover:scale-105" style={{borderColor: '#CC0000'}}>
              <div className="inline-flex items-center text-white transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go Home
              </div>
            </div>
          </Link>

          <Link to="/rooms" className="group">
            <div className="bg-gray-900/40 backdrop-blur-lg rounded-xl px-6 py-3 border-2 hover:bg-gray-800/50 transition-all duration-300 transform hover:scale-105" style={{borderColor: '#CC0000'}}>
              <div className="inline-flex items-center text-white transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Book Rooms
              </div>
            </div>
          </Link>

          <Link to="/vehicles" className="group">
            <div className="bg-gray-900/40 backdrop-blur-lg rounded-xl px-6 py-3 border-2 hover:bg-gray-800/50 transition-all duration-300 transform hover:scale-105" style={{borderColor: '#CC0000'}}>
              <div className="inline-flex items-center text-white transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Book Vehicles
              </div>
            </div>
          </Link>
        </div>

        {/* Help Text */}
        <div className="text-center">
          <p className="text-red-200 text-sm">
            Need help? Contact Kurtis or try one of the options above.
          </p>
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden fixed bottom-4 right-4 z-20">
        <button className="text-white p-2 rounded-full shadow-lg transition-colors" style={{backgroundColor: '#CC0000'}}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default InvalidRoute;
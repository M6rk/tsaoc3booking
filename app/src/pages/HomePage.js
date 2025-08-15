import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#EE2D3D] relative">
      <NavBar />
      <div className="relative z-0 flex flex-col items-center justify-start px-4 text-center pt-8 pb-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-6xl font-bold text-white mb-2 mt-4">OC3 Bookings</h1>
          <p className="text-base md:text-lg text-red-100">Room & Fleet Bookings</p>
        </div>
        
        {/* Mobile-optimized cards with equal heights */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-4xl mb-6 px-2 sm:items-stretch">
          <Link to="/rooms" className="group flex-1">
            <div className="bg-gray-900/40 backdrop-blur-lg rounded-xl p-4 md:p-6 border-2 hover:bg-gray-800/50 transition-all duration-300 transform hover:scale-105 h-full flex flex-col" style={{borderColor: '#CC0000'}}>
              <div className="flex justify-center mb-3">
                <svg className="w-8 h-8 md:w-12 md:h-12 text-white group-hover:text-red-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">Room Reservations</h3>
              <p className="text-red-100 text-xs md:text-sm mb-3 md:mb-4 leading-relaxed flex-grow">Reserve meeting spaces and other facilities for Okanagan Central Community Church & Ministries.</p>
              <div className="inline-flex items-center text-red-300 group-hover:text-white transition-colors text-xs md:text-sm mt-auto">
                Reserve Room
                <svg className="w-3 h-3 md:w-4 md:h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>
          
          <Link to="/vehicles" className="group flex-1">
            <div className="bg-gray-900/40 backdrop-blur-lg rounded-xl p-4 md:p-6 border-2 hover:bg-gray-800/50 transition-all duration-300 transform hover:scale-105 h-full flex flex-col" style={{borderColor: '#CC0000'}}>
              <div className="flex justify-center mb-3">
                <svg className="w-8 h-8 md:w-12 md:h-12 text-white group-hover:text-red-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17h10v-4H5l2-5h8v5" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h10" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">Fleet Management</h3>
              <p className="text-red-100 text-xs md:text-sm mb-3 md:mb-4 leading-relaxed flex-grow">OC3SA fleet vehicles.</p>
              <div className="inline-flex items-center text-red-300 group-hover:text-white transition-colors text-xs md:text-sm mt-auto">
              Book Vehicle
                <svg className="w-3 h-3 md:w-4 md:h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
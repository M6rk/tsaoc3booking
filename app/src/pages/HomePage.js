import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-[#EE2D3D] relative pt-0 md:pt-6">
      <NavBar />
      <div className="relative z-0 flex flex-col items-center justify-start px-4 text-center pt-8 pb-8">
        <div className="mb-16">
          <h1 className="text-3xl md:text-6xl font-bold text-white mb-2 mt-4">OC3 Bookings</h1>
          <p className="text-base md:text-lg text-red-100">Room & Fleet Bookings</p>
        </div>

        {/* Mobile-optimized cards with equal heights */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-4xl mb-6 px-2 sm:items-stretch">
          <Link to="/rooms" className="group flex-1">
            <div className="bg-gray-900/40 backdrop-blur-lg rounded-xl p-4 md:p-6 border-2 hover:bg-gray-800/50 transition-all duration-300 transform h-full flex flex-col" style={{ borderColor: '#CC0000' }}>
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
            <div className="bg-gray-900/40 backdrop-blur-lg rounded-xl p-4 md:p-6 border-2 hover:bg-gray-800/50 transition-all duration-300 transform h-full flex flex-col" style={{ borderColor: '#CC0000' }}>
              <div className="flex justify-center mb-3">
                <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 md:w-12 md:h-12 text-white group-hover:text-red-300 transition-colors">
                  <path d="M3 8L5.72187 10.2682C5.90158 10.418 6.12811 10.5 6.36205 10.5H17.6379C17.8719 10.5 18.0984 10.418 18.2781 10.2682L21 8M6.5 14H6.51M17.5 14H17.51M8.16065 4.5H15.8394C16.5571 4.5 17.2198 4.88457 17.5758 5.50772L20.473 10.5777C20.8183 11.1821 21 11.8661 21 12.5623V18.5C21 19.0523 20.5523 19.5 20 19.5H19C18.4477 19.5 18 19.0523 18 18.5V17.5H6V18.5C6 19.0523 5.55228 19.5 5 19.5H4C3.44772 19.5 3 19.0523 3 18.5V12.5623C3 11.8661 3.18166 11.1821 3.52703 10.5777L6.42416 5.50772C6.78024 4.88457 7.44293 4.5 8.16065 4.5ZM7 14C7 14.2761 6.77614 14.5 6.5 14.5C6.22386 14.5 6 14.2761 6 14C6 13.7239 6.22386 13.5 6.5 13.5C6.77614 13.5 7 13.7239 7 14ZM18 14C18 14.2761 17.7761 14.5 17.5 14.5C17.2239 14.5 17 14.2761 17 14C17 13.7239 17.2239 13.5 17.5 13.5C17.7761 13.5 18 13.7239 18 14Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mb-2">Fleet Bookings</h3>
              <p className="text-red-100 text-xs md:text-sm mb-3 md:mb-4 leading-relaxed flex-grow">Okanagan Central Community Church & Ministries fleet bookings.</p>
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
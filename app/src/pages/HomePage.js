import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';

const HomePage = () => {
  return (
    <div className="h-screen bg-[#EE2D3D] relative overflow-hidden">
      <NavBar />
      
      <div className="relative z-0 flex flex-col items-center justify-center h-full px-4 text-center">
        <div className="mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-2">OC3 Bookings</h1>
          <p className="text-lg text-red-100">Room & Fleet Bookings</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 max-w-4xl w-full mb-6">
          <Link to="/rooms" className="group flex-1">
            <div className="bg-gray-900/40 backdrop-blur-lg rounded-xl p-6 border-2 hover:bg-gray-800/50 transition-all duration-300 transform hover:scale-105" style={{borderColor: '#CC0000'}}>
              <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-white group-hover:text-red-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Room Reservations</h3>
              <p className="text-red-100 text-sm mb-4">Reserve conference rooms, meeting spaces, and training facilities for internal use.</p>
              <div className="inline-flex items-center text-red-300 group-hover:text-white transition-colors text-sm">
                Reserve Room
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>

          <Link to="/vehicles" className="group flex-1">
            <div className="bg-gray-900/40 backdrop-blur-lg rounded-xl p-6 border-2 hover:bg-gray-800/50 transition-all duration-300 transform hover:scale-105" style={{borderColor: '#CC0000'}}>
              <div className="flex justify-center mb-4">
                <svg className="w-12 h-12 text-white group-hover:text-red-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17h10v-4H5l2-5h8v5" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h10" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Fleet Management</h3>
              <p className="text-red-100 text-sm mb-4">Check out TSA fleet vehicles for official business travel and operations.</p>
              <div className="inline-flex items-center text-red-300 group-hover:text-white transition-colors text-sm">
                Check Out Vehicle
                <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        <div className="max-w-4xl w-full">
          <h2 className="text-3xl font-bold text-white mb-6">How to Use</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mx-auto mb-3" style={{backgroundColor: '#FF4444'}}>1</div>
              <h3 className="text-xl font-semibold text-white mb-2">Select Resource</h3>
              <p className="text-red-100 text-base">Choose room or vehicle reservation from above.</p>
            </div>
            <div className="text-center">
              <div className="text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mx-auto mb-3" style={{backgroundColor: '#FF4444'}}>2</div>
              <h3 className="text-xl font-semibold text-white mb-2">Check Schedule</h3>
              <p className="text-red-100 text-base">View calendar and select available time slot.</p>
            </div>
            <div className="text-center">
              <div className="text-white rounded-full w-12 h-12 flex items-center justify-center text-lg font-bold mx-auto mb-3" style={{backgroundColor: '#FF4444'}}>3</div>
              <h3 className="text-xl font-semibold text-white mb-2">Submit Request</h3>
              <p className="text-red-100 text-base">Enter purpose and submit reservation request.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
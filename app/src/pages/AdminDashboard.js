import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../firebase/auth';
import NavBar from '../components/NavBar';

const AdminDashboard = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingBookings, setPendingBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // FIREBASE READ: Load all bookings from both collections
  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const allBookingsData = [];

      // Load room bookings
      const roomQuery = query(collection(db, 'roomBookings'), orderBy('createdAt', 'desc'));
      const roomSnapshot = await getDocs(roomQuery);
      roomSnapshot.forEach((doc) => {
        const data = doc.data();
        allBookingsData.push({
          id: doc.id,
          type: 'room',
          resource: data.room,
          user: data.userName || data.userId || 'Unknown User', // UPDATED: Use userName first
          email: data.userEmail || currentUser?.email || 'unknown@email.com',
          date: data.date,
          time: `${data.startTime}-${data.endTime}`,
          description: data.desc,
          submittedAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          status: data.status || 'pending'
        });
      });

      // Load vehicle bookings
      const vehicleQuery = query(collection(db, 'vehicleBookings'), orderBy('createdAt', 'desc'));
      const vehicleSnapshot = await getDocs(vehicleQuery);
      vehicleSnapshot.forEach((doc) => {
        const data = doc.data();
        allBookingsData.push({
          id: doc.id,
          type: 'vehicle',
          resource: data.vehicle,
          user: data.userName || data.workEmail?.split('@')[0] || 'Unknown User', // UPDATED: Use userName first
          email: data.workEmail || 'unknown@email.com',
          date: data.date,
          time: data.startTime && data.endTime ? `${data.startTime}-${data.endTime}` : 'Time TBD',
          description: data.purpose || 'No description provided',
          submittedAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          status: data.status || 'pending'
        });
      });

      // Sort all bookings by submission date (newest first)
      allBookingsData.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

      setAllBookings(allBookingsData);
      setPendingBookings(allBookingsData.filter(booking => booking.status === 'pending'));

    } catch (error) {
      console.error('Error loading bookings:', error);
      alert('Error loading bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser?.email]);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  // FIREBASE WRITE: Approve booking by updating status
  const handleApprove = async (bookingId, bookingType) => {
    setLoading(true);
    try {
      const collection_name = bookingType === 'room' ? 'roomBookings' : 'vehicleBookings';
      const bookingDoc = doc(db, collection_name, bookingId);

      await updateDoc(bookingDoc, {
        status: 'approved',
        approvedBy: currentUser?.email || 'Admin',
        approvedAt: new Date()
      });

      // Reload bookings to reflect changes
      await loadBookings();
      alert('Booking approved successfully!');
    } catch (error) {
      console.error('Error approving booking:', error);
      alert('Error approving booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // FIREBASE WRITE: Deny booking by updating status and adding reason
  const handleDeny = async (bookingId, bookingType, reason) => {
    if (!reason || reason.trim() === '') {
      alert('Please provide a reason for denial');
      return;
    }

    setLoading(true);
    try {
      const collection_name = bookingType === 'room' ? 'roomBookings' : 'vehicleBookings';
      const bookingDoc = doc(db, collection_name, bookingId);

      await updateDoc(bookingDoc, {
        status: 'denied',
        deniedBy: currentUser?.email || 'Admin',
        deniedAt: new Date(),
        denialReason: reason
      });

      // Reload bookings to reflect changes
      await loadBookings();
      alert('Booking denied successfully!');
    } catch (error) {
      console.error('Error denying booking:', error);
      alert('Error denying booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'denied':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const renderBookingCard = (booking, showActions = false) => (
    <div key={booking.id} className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 text-gray-600">
            {booking.type === 'room' ? (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            ) : (
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17h10v-4H5l2-5h8v5" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h10" />
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{booking.resource}</h3>
            <p className="text-sm text-gray-600">Requested by: {booking.user}</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(booking.status)}`}>
          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="text-gray-700">{formatDate(booking.date)} at {booking.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-gray-700">{booking.email}</span>
        </div>
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-gray-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-gray-700">{booking.description}</span>
        </div>
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-gray-500 text-sm">Submitted: {formatTime(booking.submittedAt)}</span>
        </div>
      </div>

      {booking.status === 'denied' && booking.denialReason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-800 text-sm">
            <strong>Denial Reason:</strong> {booking.denialReason}
          </p>
        </div>
      )}

      {showActions && booking.status === 'pending' && (
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleApprove(booking.id, booking.type)}
            disabled={loading}
            className="flex-1 py-2 px-4 rounded-lg text-white font-medium transition-colors disabled:opacity-50 hover:bg-green-600"
            style={{ backgroundColor: '#10B981' }}
          >
            Approve
          </button>
          <button
            onClick={() => {
              const reason = prompt('Please provide a reason for denial:');
              if (reason) handleDeny(booking.id, booking.type, reason);
            }}
            disabled={loading}
            className="flex-1 py-2 px-4 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#CC0000' }}
          >
            Deny
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, #7f1d1d, #CC0000, #7f1d1d)' }}>
      <NavBar />

      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 pt-8 pb-8">
        <div className="bg-white rounded-2xl p-6 border-2 w-full max-w-7xl shadow-2xl" style={{ borderColor: '#CC0000' }}>
          {/* Tab Navigation - 2 tabs now */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 rounded-t-lg font-medium transition-colors ${activeTab === 'pending'
                ? 'text-white border-b-2'
                : 'text-gray-600 hover:text-gray-800'
                }`}
              style={{
                backgroundColor: activeTab === 'pending' ? '#CC0000' : 'transparent',
                borderBottomColor: activeTab === 'pending' ? '#CC0000' : 'transparent'
              }}
            >
              Pending Requests ({pendingBookings.length})
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-t-lg font-medium transition-colors ${activeTab === 'all'
                ? 'text-white border-b-2'
                : 'text-gray-600 hover:text-gray-800'
                }`}
              style={{
                backgroundColor: activeTab === 'all' ? '#CC0000' : 'transparent',
                borderBottomColor: activeTab === 'all' ? '#CC0000' : 'transparent'
              }}
            >
              All Bookings ({allBookings.length})
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'pending' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Pending Requests</h2>
                <div className="text-sm text-gray-600">
                  {pendingBookings.length} request{pendingBookings.length !== 1 ? 's' : ''} awaiting approval
                </div>
              </div>

              {pendingBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 text-green-500">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">All Caught Up!</h3>
                  <p className="text-gray-500">No pending requests at this time.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingBookings.map(booking => renderBookingCard(booking, true))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'all' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">All Bookings</h2>
                <div className="text-sm text-gray-600">
                  {allBookings.length} total booking{allBookings.length !== 1 ? 's' : ''}
                </div>
              </div>

              <div className="space-y-6">
                {allBookings.map(booking => renderBookingCard(booking, false))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
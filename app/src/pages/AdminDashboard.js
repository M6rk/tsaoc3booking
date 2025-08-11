import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingBookings, setPendingBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Management tab state
  const [sharedCredentials, setSharedCredentials] = useState({
    username: 'admin@tsa.gov',
    password: 'admin123456'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    password: ''
  });
  const [managementLoading, setManagementLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // TODO: Replace with Firebase queries
    const samplePendingBookings = [
      {
        id: 1,
        type: 'room',
        resource: 'Conference Room A',
        user: 'John Doe',
        email: 'john.doe@tsa.gov',
        date: '2025-08-15',
        time: '09:00-10:30',
        description: 'Weekly team meeting to discuss project updates',
        submittedAt: '2025-08-11T08:30:00Z',
        status: 'pending'
      },
      {
        id: 2,
        type: 'vehicle',
        resource: 'Ford Explorer #234',
        user: 'Jane Smith',
        email: 'jane.smith@tsa.gov',
        date: '2025-08-16',
        time: '08:00-17:00',
        description: 'Airport inspection visit - YVR Terminal 2',
        submittedAt: '2025-08-11T09:15:00Z',
        status: 'pending'
      },
      {
        id: 3,
        type: 'room',
        resource: 'Training Room',
        user: 'Mike Johnson',
        email: 'mike.johnson@tsa.gov',
        date: '2025-08-17',
        time: '13:00-16:00',
        description: 'New employee orientation and safety training session',
        submittedAt: '2025-08-11T10:00:00Z',
        status: 'pending'
      }
    ];

    const sampleAllBookings = [
      ...samplePendingBookings,
      {
        id: 4,
        type: 'room',
        resource: 'Board Room',
        user: 'Sarah Wilson',
        email: 'sarah.wilson@tsa.gov',
        date: '2025-08-12',
        time: '14:00-15:30',
        description: 'Monthly board meeting',
        submittedAt: '2025-08-10T16:00:00Z',
        status: 'approved',
        approvedBy: 'Admin User',
        approvedAt: '2025-08-10T16:30:00Z'
      },
      {
        id: 5,
        type: 'vehicle',
        resource: 'Honda Civic #156',
        user: 'Tom Brown',
        email: 'tom.brown@tsa.gov',
        date: '2025-08-13',
        time: '10:00-15:00',
        description: 'Site inspection downtown office',
        submittedAt: '2025-08-09T14:00:00Z',
        status: 'denied',
        deniedBy: 'Admin User',
        deniedAt: '2025-08-09T15:00:00Z',
        reason: 'Vehicle unavailable - maintenance scheduled'
      }
    ];

    // TODO: Fetch from Firebase
    setPendingBookings(samplePendingBookings);
    setAllBookings(sampleAllBookings);
    
    // TODO: Fetch shared credentials from Firebase
    // const credentialsRef = doc(db, 'settings', 'sharedCredentials');
    // const credentialsSnap = await getDoc(credentialsRef);
    // if (credentialsSnap.exists()) {
    //   setSharedCredentials(credentialsSnap.data());
    // }
  }, []); // Empty dependency array is fine for initial data load

  const validateForm = (form) => {
    const newErrors = {};
    
    if (!form.username || form.username.trim() === '') {
      newErrors.username = 'Username is required';
    } else if (!form.username.includes('@')) {
      newErrors.username = 'Username must be a valid email address';
    }
    
    if (!form.password || form.password.trim() === '') {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 10) {
      newErrors.password = 'Password must be at least 10 characters long';
    }
    
    return newErrors;
  };

  const handleEditStart = () => {
    setEditForm({
      username: sharedCredentials.username,
      password: sharedCredentials.password
    });
    setIsEditing(true);
    setErrors({});
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditForm({ username: '', password: '' });
    setErrors({});
    setShowPassword(false);
  };

  const handleEditSave = async () => {
    const validationErrors = validateForm(editForm);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    setManagementLoading(true);
    
    try {
      // TODO: Update credentials in Firebase
      // const credentialsRef = doc(db, 'settings', 'sharedCredentials');
      // await updateDoc(credentialsRef, {
      //   username: editForm.username,
      //   password: editForm.password,
      //   updatedAt: new Date(),
      //   updatedBy: currentUser.email
      // });
      
      setSharedCredentials({
        username: editForm.username,
        password: editForm.password
      });
      
      setIsEditing(false);
      setShowPassword(false);
      alert('Shared credentials updated successfully!');
    } catch (error) {
      console.error('Error updating credentials:', error);
      alert('Error updating credentials. Please try again.');
    } finally {
      setManagementLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    setLoading(true);
    try {
      // TODO: Update booking status in Firebase
      // await updateDoc(doc(db, 'bookings', bookingId), {
      //   status: 'approved',
      //   approvedBy: currentUser.email,
      //   approvedAt: new Date()
      // });
      
      setPendingBookings(prev => prev.filter(booking => booking.id !== bookingId));
      alert('Booking approved successfully!');
    } catch (error) {
      console.error('Error approving booking:', error);
      alert('Error approving booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeny = async (bookingId, reason) => {
    if (!reason || reason.trim() === '') {
      alert('Please provide a reason for denial');
      return;
    }
    
    setLoading(true);
    try {
      // TODO: Update booking status in Firebase
      // await updateDoc(doc(db, 'bookings', bookingId), {
      //   status: 'denied',
      //   deniedBy: currentUser.email,
      //   deniedAt: new Date(),
      //   reason: reason
      // });
      
      setPendingBookings(prev => prev.filter(booking => booking.id !== bookingId));
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

      {booking.status === 'denied' && booking.reason && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-800 text-sm">
            <strong>Denial Reason:</strong> {booking.reason}
          </p>
        </div>
      )}

      {showActions && booking.status === 'pending' && (
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleApprove(booking.id)}
            disabled={loading}
            className="flex-1 py-2 px-4 rounded-lg text-white font-medium transition-colors disabled:opacity-50 hover:bg-green-600"
            style={{backgroundColor: '#10B981'}}
          >
            Approve
          </button>
          <button
            onClick={() => {
              const reason = prompt('Please provide a reason for denial:');
              if (reason) handleDeny(booking.id, reason);
            }}
            disabled={loading}
            className="flex-1 py-2 px-4 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
            style={{backgroundColor: '#CC0000'}}
          >
            Deny
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 relative overflow-hidden" style={{background: 'linear-gradient(to bottom right, #7f1d1d, #CC0000, #7f1d1d)'}}>
      <NavBar />

      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 pt-8 pb-8">
        <div className="bg-white rounded-2xl p-6 border-2 w-full max-w-7xl shadow-2xl" style={{borderColor: '#CC0000'}}>
          
          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-6 py-3 rounded-t-lg font-medium transition-colors ${
                activeTab === 'pending'
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
              className={`px-6 py-3 rounded-t-lg font-medium transition-colors ${
                activeTab === 'all'
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
            <button
              onClick={() => setActiveTab('management')}
              className={`px-6 py-3 rounded-t-lg font-medium transition-colors ${
                activeTab === 'management'
                  ? 'text-white border-b-2'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              style={{
                backgroundColor: activeTab === 'management' ? '#CC0000' : 'transparent',
                borderBottomColor: activeTab === 'management' ? '#CC0000' : 'transparent'
              }}
            >
              Management
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

          {activeTab === 'management' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Account Management</h2>
                <div className="text-sm text-gray-600">
                  Shared admin credentials
                </div>
              </div>
              
              <div className="max-w-md mx-auto">
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Shared Admin Account</h3>
                  
                  {!isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Username</label>
                        <div className="p-3 bg-white rounded-lg border border-gray-300 text-gray-800">
                          {sharedCredentials.username}
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Password</label>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 p-3 bg-white rounded-lg border border-gray-300 text-gray-800 font-mono">
                            {showPassword ? sharedCredentials.password : '•'.repeat(sharedCredentials.password.length)}
                          </div>
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-3 text-gray-500 hover:text-gray-700 transition-colors"
                          >
                            {showPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleEditStart}
                        className="w-full py-3 px-4 rounded-lg text-white font-medium transition-colors"
                        style={{backgroundColor: '#CC0000'}}
                      >
                        Edit Credentials
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Username</label>
                        <input
                          type="email"
                          value={editForm.username}
                          onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                          className={`w-full p-3 rounded-lg border-2 focus:outline-none transition-colors ${
                            errors.username ? 'border-red-500' : 'border-gray-300 focus:border-red-500'
                          }`}
                          placeholder="admin@tsa.gov"
                        />
                        {errors.username && <p className="text-red-600 text-sm mt-1">{errors.username}</p>}
                      </div>
                      
                      <div>
                        <label className="block text-gray-700 font-semibold mb-2">Password</label>
                        <div className="flex items-center gap-2">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            value={editForm.password}
                            onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                            className={`flex-1 p-3 rounded-lg border-2 focus:outline-none transition-colors font-mono ${
                              errors.password ? 'border-red-500' : 'border-gray-300 focus:border-red-500'
                            }`}
                            placeholder="Minimum 10 characters"
                          />
                          <button
                            onClick={() => setShowPassword(!showPassword)}
                            className="p-3 text-gray-500 hover:text-gray-700 transition-colors"
                            type="button"
                          >
                            {showPassword ? (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                              </svg>
                            ) : (
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {errors.password && <p className="text-red-600 text-sm mt-1">{errors.password}</p>}
                      </div>
                      
                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={handleEditCancel}
                          className="flex-1 py-3 px-4 rounded-lg bg-gray-500 text-white font-medium hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleEditSave}
                          disabled={managementLoading}
                          className="flex-1 py-3 px-4 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
                          style={{backgroundColor: '#CC0000'}}
                        >
                          {managementLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-blue-800 text-sm">
                      <p className="font-medium mb-1">Security Notice</p>
                      <p>This is the shared admin account used for system access. Changes will affect all admin users. Password must be at least 10 characters long.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
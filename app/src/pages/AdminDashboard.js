import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, getDocs, deleteDoc, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../firebase/auth';
import NavBar from '../components/NavBar';

const AdminDashboard = () => {
  const { currentUser, createUserAccount } = useAuth(); // ✅ Move this to top level
  const [activeTab, setActiveTab] = useState('pending');
  const [pendingBookings, setPendingBookings] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // User management state
  const [users, setUsers] = useState([]);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    fleet: false
  });
  const [userFormErrors, setUserFormErrors] = useState({});
  const [userLoading, setUserLoading] = useState(false);

  // Admin credentials from .env (read-only)
  const adminCredentials = {
    username: process.env.REACT_APP_ADMIN_USERNAME || 'admin@salvationarmy.ca',
    password: '••••••••••' // Never show actual password
  };

  // ⚠️ FIREBASE READ: Load all bookings from both collections
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
          user: data.userId || 'Unknown User', // You might want to fetch user names
          email: currentUser?.email || 'unknown@email.com', // Placeholder
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
          user: data.workEmail?.split('@')[0] || 'Unknown User',
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
  }, [currentUser?.email]); // ✅ Added dependency

  // ⚠️ FIREBASE READ: Load all users (should be small collection)
  const loadUsers = useCallback(async () => {
    setUserLoading(true);
    try {
      const q = query(collection(db, 'users'));
      const querySnapshot = await getDocs(q);
      const userList = [];
      querySnapshot.forEach((doc) => {
        userList.push({
          id: doc.id,
          ...doc.data()
        });
      });
      setUsers(userList);
    } catch (error) {
      console.error('Error loading users:', error);
      alert('Error loading users. Please try again.');
    } finally {
      setUserLoading(false);
    }
  }, []); // ✅ No dependencies needed

    useEffect(() => {
    // Load actual booking data from Firebase
    loadBookings();
    loadUsers();
  }, [loadBookings, loadUsers]); 

  const validateUserForm = (form) => {
    const errors = {};

    if (!form.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!form.email.trim()) {
      errors.email = 'Email is required';
    } else if (!form.email.endsWith('@salvationarmy.ca')) {
      errors.email = 'Email must end with @salvationarmy.ca';
    } else if (!form.email.includes('@')) {
      errors.email = 'Please enter a valid email address';
    }

    // ✅ FIXED: Always require password (admin controls all passwords)
    if (!form.password.trim()) {
      errors.password = 'Password is required';
    } else if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    return errors;
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();
    const errors = validateUserForm(userForm);

    if (Object.keys(errors).length > 0) {
      setUserFormErrors(errors);
      return;
    }

    setUserLoading(true);

    try {
      if (editingUser) {
        // ⚠️ FIREBASE WRITE: Update existing user in Firestore
        const userDoc = doc(db, 'users', editingUser.id);
        const updateData = {
          name: userForm.name,
          email: userForm.email,
          fleet: userForm.fleet,
          updatedAt: new Date()
        };

        // ✅ ADMIN CAN UPDATE PASSWORD: Include password if provided
        if (userForm.password.trim()) {
          updateData.password = userForm.password;
        }

        await updateDoc(userDoc, updateData);
        alert('User updated successfully!');
      } else {
        // ✅ FIXED: Use createUserAccount from the hook called at top level
        await createUserAccount(
          userForm.email,
          userForm.password,
          userForm.name,
          userForm.fleet
        );

        alert('User created successfully! They can now login with their credentials.');
      }

      // Reload users and reset form
      await loadUsers();
      setUserFormOpen(false);
      setEditingUser(null);
      setUserForm({ name: '', email: '', password: '', fleet: false });
      setUserFormErrors({});
    } catch (error) {
      console.error('Error saving user:', error);

      // Handle specific Firebase Auth errors
      if (error.code === 'auth/email-already-in-use') {
        alert('An account with this email already exists.');
      } else if (error.code === 'auth/weak-password') {
        alert('Password should be at least 6 characters.');
      } else if (error.code === 'auth/invalid-email') {
        alert('Invalid email address.');
      } else {
        alert('Error saving user. Please try again.');
      }
    } finally {
      setUserLoading(false);
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setUserForm({
      name: user.name,
      email: user.email,
      password: '', // Don't pre-fill password
      fleet: user.fleet || false
    });
    setUserFormErrors({});
    setUserFormOpen(true);
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }

    setUserLoading(true);
    try {
      // ⚠️ FIREBASE WRITE: Delete user
      await deleteDoc(doc(db, 'users', userId));
      alert('User deleted successfully!');
      await loadUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user. Please try again.');
    } finally {
      setUserLoading(false);
    }
  };

  const resetUserForm = () => {
    setUserFormOpen(false);
    setEditingUser(null);
    setUserForm({ name: '', email: '', password: '', fleet: false });
    setUserFormErrors({});
  };

  // ⚠️ FIREBASE WRITE: Approve booking by updating status
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

  // ⚠️ FIREBASE WRITE: Deny booking by updating status and adding reason
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

          {/* Tab Navigation */}
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
            <button
              onClick={() => setActiveTab('management')}
              className={`px-6 py-3 rounded-t-lg font-medium transition-colors ${activeTab === 'management'
                  ? 'text-white border-b-2'
                  : 'text-gray-600 hover:text-gray-800'
                }`}
              style={{
                backgroundColor: activeTab === 'management' ? '#CC0000' : 'transparent',
                borderBottomColor: activeTab === 'management' ? '#CC0000' : 'transparent'
              }}
            >
              User Management ({users.length})
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
                <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
                <button
                  onClick={() => setUserFormOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-colors"
                  style={{ backgroundColor: '#CC0000' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add User
                </button>
              </div>

              {/* Admin Account Info (Read-Only) */}
              <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Admin Account (System)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Username</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-300 text-gray-800">
                      {adminCredentials.username}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Password</label>
                    <div className="p-3 bg-white rounded-lg border border-gray-300 text-gray-800 font-mono">
                      {adminCredentials.password}
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <strong>Note:</strong> Admin credentials are managed through environment variables and cannot be changed from this interface.
                  </p>
                </div>
              </div>

              {/* User List */}
              <div className="space-y-4">
                {userLoading ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500">Loading users...</div>
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Users Yet</h3>
                    <p className="text-gray-500">Click "Add User" to create the first user account.</p>
                  </div>
                ) : (
                  users.map(user => (
                    <div key={user.id} className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800 mb-1">{user.name}</h3>
                          <p className="text-gray-600 mb-2">{user.email}</p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <span className="text-sm text-gray-600">Room Bookings</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM21 17a2 2 0 11-4 0 2 2 0 014 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17h10v-4H5l2-5h8v5" />
                              </svg>
                              <span className={`text-sm font-medium ${user.fleet ? 'text-green-600' : 'text-red-600'}`}>
                                Fleet: {user.fleet ? 'Enabled' : 'Disabled'}
                              </span>
                            </div>
                          </div>
                          {user.createdAt && (
                            <p className="text-xs text-gray-500 mt-2">
                              Created: {new Date(user.createdAt.toDate()).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* User Form Modal */}
      {userFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingUser ? 'Edit User' : 'Add New User'}
              </h3>
              <button onClick={resetUserForm} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUserFormSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">Full Name</label>
                <input
                  type="text"
                  value={userForm.name}
                  onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full p-3 rounded-lg border-2 focus:outline-none transition-colors ${userFormErrors.name ? 'border-red-500' : 'border-gray-300 focus:border-red-500'
                    }`}
                  placeholder="John Doe"
                />
                {userFormErrors.name && <p className="text-red-600 text-sm mt-1">{userFormErrors.name}</p>}
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Email</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className={`w-full p-3 rounded-lg border-2 focus:outline-none transition-colors ${userFormErrors.email ? 'border-red-500' : 'border-gray-300 focus:border-red-500'
                    }`}
                  placeholder="john.doe@salvationarmy.ca"
                />
                {userFormErrors.email && <p className="text-red-600 text-sm mt-1">{userFormErrors.email}</p>}
              </div>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  {editingUser ? 'New Password (Admin Reset)' : 'Password'}
                </label>
                <input
                  type="password"
                  value={userForm.password}
                  onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                  className={`w-full p-3 rounded-lg border-2 focus:outline-none transition-colors ${userFormErrors.password ? 'border-red-500' : 'border-gray-300 focus:border-red-500'
                    }`}
                  placeholder={editingUser ? 'Enter new password for user' : 'Minimum 8 characters'}
                />
                {userFormErrors.password && <p className="text-red-600 text-sm mt-1">{userFormErrors.password}</p>}
              </div>

              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={userForm.fleet}
                    onChange={(e) => setUserForm(prev => ({ ...prev, fleet: e.target.checked }))}
                    className="w-5 h-5 text-red-600 rounded border-gray-300 focus:ring-red-500"
                  />
                  <span className="text-gray-700 font-semibold">Allow Fleet Bookings</span>
                </label>
                <p className="text-gray-500 text-sm mt-1 ml-8">
                  User can access and book fleet vehicles if enabled
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetUserForm}
                  className="flex-1 py-3 px-4 rounded-lg bg-gray-500 text-white font-medium hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userLoading}
                  className="flex-1 py-3 px-4 rounded-lg text-white font-medium transition-colors disabled:opacity-50"
                  style={{ backgroundColor: '#CC0000' }}
                >
                  {userLoading ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
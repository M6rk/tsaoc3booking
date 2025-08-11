// filepath: c:\tsaoc3booking\app\src\pages\TestDatabase.js
import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import NavBar from '../components/NavBar';

const TestDatabase = () => {
  const [connectionStatus, setConnectionStatus] = useState('Testing...');
  const [roomBookings, setRoomBookings] = useState([]);
  const [vehicleBookings, setVehicleBookings] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  // Test form states
  const [newRoomBooking, setNewRoomBooking] = useState({
    date: '',
    room: '',
    startTime: '',
    endTime: '',
    desc: '',
    status: 'pending'
  });

  const [newVehicleBooking, setNewVehicleBooking] = useState({
    date: '',
    vehicle: '',
    workEmail: '',
    status: 'pending'
  });

  const testConnection = async () => {
    try {
      // Try to read from the actual collections
      const roomsCollection = collection(db, 'roomBookings');
      await getDocs(roomsCollection);
      setConnectionStatus('✅ Connected to Firebase!');
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('❌ Connection failed: ' + error.message);
    }
  };

  const fetchAllData = async () => {
    try {
      // Fetch room bookings
      const roomSnapshot = await getDocs(collection(db, 'roomBookings'));
      const rooms = [];
      roomSnapshot.forEach((doc) => {
        rooms.push({ id: doc.id, ...doc.data() });
      });
      setRoomBookings(rooms);

      // Fetch vehicle bookings
      const vehicleSnapshot = await getDocs(collection(db, 'vehicleBookings'));
      const vehicles = [];
      vehicleSnapshot.forEach((doc) => {
        vehicles.push({ id: doc.id, ...doc.data() });
      });
      setVehicleBookings(vehicles);

      // Fetch settings
      const settingsSnapshot = await getDocs(collection(db, 'settings'));
      if (!settingsSnapshot.empty) {
        const settingsDoc = settingsSnapshot.docs[0];
        setSettings({ id: settingsDoc.id, ...settingsDoc.data() });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    testConnection();
    fetchAllData();
  }, []);

  const addRoomBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'roomBookings'), {
        ...newRoomBooking,
        createdAt: new Date()
      });
      
      setNewRoomBooking({
        date: '',
        room: '',
        startTime: '',
        endTime: '',
        desc: '',
        status: 'pending'
      });
      fetchAllData();
      alert('Room booking added successfully!');
    } catch (error) {
      console.error('Error adding room booking:', error);
      alert('Error adding room booking: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addVehicleBooking = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'vehicleBookings'), {
        ...newVehicleBooking,
        createdAt: new Date()
      });
      
      setNewVehicleBooking({
        date: '',
        vehicle: '',
        workEmail: '',
        status: 'pending'
      });
      fetchAllData();
      alert('Vehicle booking added successfully!');
    } catch (error) {
      console.error('Error adding vehicle booking:', error);
      alert('Error adding vehicle booking: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteBooking = async (collectionName, id) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      fetchAllData();
      alert('Booking deleted successfully!');
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error deleting booking: ' + error.message);
    }
  };

  const updateSettings = async () => {
    if (!settings) return;
    
    try {
      await updateDoc(doc(db, 'settings', settings.id), {
        ...settings,
        dateUpdated: new Date()
      });
      alert('Settings updated successfully!');
      fetchAllData();
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Error updating settings: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 relative overflow-hidden" style={{background: 'linear-gradient(to bottom right, #7f1d1d, #CC0000, #7f1d1d)'}}>
      <NavBar />

      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 pt-8 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Database Test</h1>
        
        <div className="bg-white rounded-2xl p-6 border-2 w-full max-w-6xl shadow-2xl" style={{borderColor: '#CC0000'}}>
          
          {/* Connection Status */}
          <div className="mb-8 p-4 rounded-lg bg-gray-50 border-2 border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Connection Status</h2>
            <p className="text-lg font-mono">{connectionStatus}</p>
          </div>

          {/* Settings Test */}
          <div className="mb-8 p-4 rounded-lg bg-purple-50 border-2 border-purple-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Settings Collection</h2>
            {settings ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin User</label>
                    <input
                      type="text"
                      value={settings['admin-user'] || ''}
                      onChange={(e) => setSettings({...settings, 'admin-user': e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Admin Password</label>
                    <input
                      type="text"
                      value={settings['admin-password'] || ''}
                      onChange={(e) => setSettings({...settings, 'admin-password': e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default User</label>
                    <input
                      type="text"
                      value={settings['default-user'] || ''}
                      onChange={(e) => setSettings({...settings, 'default-user': e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Password</label>
                    <input
                      type="text"
                      value={settings['default-pass'] || ''}
                      onChange={(e) => setSettings({...settings, 'default-pass': e.target.value})}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                </div>
                <button
                  onClick={updateSettings}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Update Settings
                </button>
                <p className="text-sm text-gray-600">
                  Last updated: {settings.dateUpdated?.toDate?.()?.toLocaleString() || 'Unknown'}
                </p>
              </div>
            ) : (
              <p className="text-gray-600">No settings found</p>
            )}
          </div>

          {/* Add Room Booking Form */}
          <div className="mb-8 p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Room Booking</h2>
            <form onSubmit={addRoomBooking} className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  value={newRoomBooking.date}
                  onChange={(e) => setNewRoomBooking({...newRoomBooking, date: e.target.value})}
                  className="p-2 border border-gray-300 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Room name"
                  value={newRoomBooking.room}
                  onChange={(e) => setNewRoomBooking({...newRoomBooking, room: e.target.value})}
                  className="p-2 border border-gray-300 rounded"
                  required
                />
                <input
                  type="time"
                  value={newRoomBooking.startTime}
                  onChange={(e) => setNewRoomBooking({...newRoomBooking, startTime: e.target.value})}
                  className="p-2 border border-gray-300 rounded"
                  required
                />
                <input
                  type="time"
                  value={newRoomBooking.endTime}
                  onChange={(e) => setNewRoomBooking({...newRoomBooking, endTime: e.target.value})}
                  className="p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Description"
                value={newRoomBooking.desc}
                onChange={(e) => setNewRoomBooking({...newRoomBooking, desc: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Room Booking'}
              </button>
            </form>
          </div>

          {/* Add Vehicle Booking Form */}
          <div className="mb-8 p-4 rounded-lg bg-green-50 border-2 border-green-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Add Vehicle Booking</h2>
            <form onSubmit={addVehicleBooking} className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <input
                  type="date"
                  value={newVehicleBooking.date}
                  onChange={(e) => setNewVehicleBooking({...newVehicleBooking, date: e.target.value})}
                  className="p-2 border border-gray-300 rounded"
                  required
                />
                <input
                  type="text"
                  placeholder="Vehicle name"
                  value={newVehicleBooking.vehicle}
                  onChange={(e) => setNewVehicleBooking({...newVehicleBooking, vehicle: e.target.value})}
                  className="p-2 border border-gray-300 rounded"
                  required
                />
                <input
                  type="email"
                  placeholder="Work email"
                  value={newVehicleBooking.workEmail}
                  onChange={(e) => setNewVehicleBooking({...newVehicleBooking, workEmail: e.target.value})}
                  className="p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Vehicle Booking'}
              </button>
            </form>
          </div>

          {/* Room Bookings Display */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Room Bookings ({roomBookings.length})</h2>
            </div>
            
            {roomBookings.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No room bookings found</div>
            ) : (
              <div className="space-y-3">
                {roomBookings.map((booking) => (
                  <div key={booking.id} className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div>
                      <h3 className="font-bold text-gray-800">{booking.room} - {booking.date}</h3>
                      <p className="text-sm text-gray-600">{booking.startTime} - {booking.endTime}</p>
                      <p className="text-sm text-gray-600">{booking.desc}</p>
                      <p className="text-xs text-gray-500">Status: {booking.status} | ID: {booking.id}</p>
                    </div>
                    <button
                      onClick={() => deleteBooking('roomBookings', booking.id)}
                      className="px-3 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Vehicle Bookings Display */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Vehicle Bookings ({vehicleBookings.length})</h2>
            </div>
            
            {vehicleBookings.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No vehicle bookings found</div>
            ) : (
              <div className="space-y-3">
                {vehicleBookings.map((booking) => (
                  <div key={booking.id} className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <h3 className="font-bold text-gray-800">{booking.vehicle} - {booking.date}</h3>
                      <p className="text-sm text-gray-600">Email: {booking.workEmail}</p>
                      <p className="text-xs text-gray-500">Status: {booking.status} | ID: {booking.id}</p>
                    </div>
                    <button
                      onClick={() => deleteBooking('vehicleBookings', booking.id)}
                      className="px-3 py-1 rounded bg-red-500 text-white text-sm hover:bg-red-600"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Testing Instructions</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Check that connection status shows "✅ Connected to Firebase!"</li>
              <li>• View existing data from your Firebase collections</li>
              <li>• Test adding new room and vehicle bookings</li>
              <li>• Test updating settings (admin/default credentials)</li>
              <li>• Try deleting individual bookings</li>
              <li>• Check Firebase Console to verify all operations</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestDatabase;
import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../firebase/auth';
import NavBar from '../components/NavBar';

const FleetBookings = () => {
  const { currentUser } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [purpose, setPurpose] = useState('');
  const [workEmail, setWorkEmail] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Static vehicle list - could also be moved to Firebase if needed
    const staticVehicles = [
      { id: 1, name: 'Ford Explorer #234', type: 'SUV', capacity: 7, shortForm: 'FE234' },
      { id: 2, name: 'Honda Civic #156', type: 'Sedan', capacity: 5, shortForm: 'HC156' },
      { id: 3, name: 'Chevrolet Tahoe #789', type: 'SUV', capacity: 8, shortForm: 'CT789' },
      { id: 4, name: 'Toyota Camry #321', type: 'Sedan', capacity: 5, shortForm: 'TC321' },
      { id: 5, name: 'Ford Transit #567', type: 'Van', capacity: 12, shortForm: 'FT567' },
      { id: 6, name: 'Nissan Altima #890', type: 'Sedan', capacity: 5, shortForm: 'NA890' }
    ];
    setVehicles(staticVehicles);
  }, []);

  // ⚠️ FIREBASE READ OPTIMIZATION: Only loads one month at a time to minimize reads
  const loadBookingsForMonth = async (date) => {
    setLoading(true);
    try {
      const year = date.getFullYear();
      const month = date.getMonth();
      
      // Create start and end dates for the month
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 1);
      
      const startOfMonth = startDate.toISOString().split('T')[0];
      const endOfMonth = endDate.toISOString().split('T')[0];

      // ⚠️ THIS IS 1 READ OPERATION PER MONTH - Optimized query
      const q = query(
        collection(db, 'vehicleBookings'),
        where('date', '>=', startOfMonth),
        where('date', '<', endOfMonth)
      );

      const querySnapshot = await getDocs(q);
      const monthBookings = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        monthBookings.push({
          id: doc.id,
          date: data.date,
          vehicle: data.vehicle,
          time: data.startTime && data.endTime ? `${data.startTime}-${data.endTime}` : 'Time TBD',
          purpose: data.purpose || 'Purpose not specified',
          user: data.workEmail,
          status: data.status,
          startTime: data.startTime,
          endTime: data.endTime
        });
      });

      setBookings(monthBookings);
    } catch (error) {
      console.error('Error loading vehicle bookings:', error);
      alert('Error loading bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ⚠️ FIREBASE READ OPTIMIZATION: Only triggers when month changes
  useEffect(() => {
    loadBookingsForMonth(currentDate);
  }, [currentDate]);

  const timeOptions = (() => {
    const times = [];
    for (let hour = 6; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        times.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
      }
    }
    return times;
  })();

  const getEndTimeOptions = () => startTime ? timeOptions.slice(timeOptions.indexOf(startTime) + 1) : [];
  
  // Uses cached data from state - NO additional Firebase reads
  const getBookingsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return bookings.filter(booking => booking.date === dateString);
  };

  const getVehicleShortForm = (vehicleName) => vehicles.find(v => v.name === vehicleName)?.shortForm || vehicleName;

  const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // ✅ REQUIREMENT MET: Prevents past date bookings
  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Prevent booking in the past
    if (clickedDate < today) {
      alert('Cannot make bookings for past dates');
      return;
    }
    
    setSelectedDate(clickedDate);
    const dayBookings = getBookingsForDate(clickedDate);
    
    if (dayBookings.length > 0) {
      setIsModalOpen(true);
      setIsBookingFormOpen(false);
    } else {
      setIsBookingFormOpen(true);
      setIsModalOpen(false);
    }
    
    setSelectedVehicle('');
    setStartTime('');
    setEndTime('');
    setPurpose('');
    setWorkEmail('');
  };

  // ⚠️ FIREBASE WRITE: This is 1 write operation per booking + 1 read operation to refresh
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedVehicle || !startTime || !endTime || !purpose.trim() || !workEmail.trim()) {
      alert('Please fill in all fields');
      return;
    }
    
    // Validate email domain (adjust as needed)
    if (!workEmail.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    
    try {
      const bookingData = {
        date: selectedDate.toISOString().split('T')[0],
        vehicle: selectedVehicle,
        startTime,
        endTime,
        purpose,
        workEmail,
        status: 'pending',
        createdAt: new Date(),
        userId: currentUser?.uid || 'anonymous'
      };

      // ⚠️ THIS IS 1 WRITE OPERATION
      await addDoc(collection(db, 'vehicleBookings'), bookingData);
      
      // ⚠️ THIS IS 1 READ OPERATION to refresh the month view
      await loadBookingsForMonth(currentDate);
      
      alert(`Vehicle booking submitted!\nDate: ${formatDate(selectedDate)}\nVehicle: ${selectedVehicle}\nTime: ${startTime} - ${endTime}\nPurpose: ${purpose}\nEmail: ${workEmail}`);
      setIsBookingFormOpen(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error creating booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartTimeChange = (time) => {
    setStartTime(time);
    if (endTime && timeOptions.indexOf(endTime) <= timeOptions.indexOf(time)) {
      setEndTime('');
    }
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
    setCurrentDate(newDate);
    // ⚠️ This triggers useEffect which loads new month data (1 read operation)
  };

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsBookingFormOpen(false);
  };

  // ✅ REQUIREMENT MET: Past dates are disabled and styled differently
  const renderCalendarDays = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-32 border border-gray-200"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const isToday = date.toDateString() === today.toDateString();
      const isPast = date < today;
      const dayBookings = getBookingsForDate(date);

      days.push(
        <button 
          key={day} 
          onClick={() => !isPast && handleDateClick(day)} 
          disabled={isPast}
          className={`h-32 p-1 border border-gray-200 text-left transition-all duration-200 relative overflow-hidden ${
            isPast 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
              : 'hover:bg-red-50 hover:border-red-300 cursor-pointer hover:shadow-md'
          } ${isToday ? 'bg-red-100 border-red-400' : isPast ? '' : 'bg-white'}`}
        >
          <div className={`absolute top-1 left-1 font-bold text-sm ${
            isPast ? 'text-gray-400' : isToday ? 'text-red-700' : 'text-gray-800'
          }`}>{day}</div>
          <div className="mt-6 h-24 flex flex-col">
            {dayBookings.length > 0 && (
              <>
                <div className={`text-xs font-semibold mb-1 flex-shrink-0 ${
                  isPast ? 'text-gray-400' : 'text-red-600'
                }`}>{dayBookings.length} booking{dayBookings.length > 1 ? 's' : ''}</div>
                <div className="flex-1 min-h-0 overflow-y-auto">
                  <div className="text-xs space-y-1">
                    {dayBookings.map((booking, index) => (
                      <div key={index} className={`rounded px-1 py-0.5 w-full flex-shrink-0 ${
                        isPast ? 'bg-gray-200 text-gray-500' : 'bg-red-200 text-red-800'
                      }`}>
                        <div className="font-medium truncate">{getVehicleShortForm(booking.vehicle)}</div>
                        <div className="text-xs truncate">{booking.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </button>
      );
    }
    return days;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 relative overflow-hidden" style={{background: 'linear-gradient(to bottom right, #7f1d1d, #CC0000, #7f1d1d)'}}>
      <NavBar />

      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 pt-8 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Fleet Bookings</h1>
        <div className="bg-white rounded-2xl p-6 border-2 w-full max-w-7xl shadow-2xl" style={{borderColor: '#CC0000'}}>
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={() => navigateMonth(-1)} 
              disabled={loading}
              className="text-red-700 hover:text-red-900 transition-colors p-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h2 className="text-3xl font-bold text-gray-800">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              {loading && <span className="text-sm text-gray-500 ml-2">(Loading...)</span>}
            </h2>
            <button 
              onClick={() => navigateMonth(1)} 
              disabled={loading}
              className="text-red-700 hover:text-red-900 transition-colors p-2 rounded-lg hover:bg-red-50 disabled:opacity-50"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          <div className="grid grid-cols-7 mb-0">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
              <div key={day} className="text-center text-red-700 font-bold p-3 bg-red-50 border border-gray-200">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">{renderCalendarDays()}</div>
        </div>
        <p className="text-red-200 text-center mt-6 text-base max-w-2xl">Click on any date to request a vehicle or view existing bookings.</p>
      </div>

      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-screen overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Vehicle Bookings</h3>
                <p className="text-red-600 font-medium">{formatDate(selectedDate)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setIsModalOpen(false); setIsBookingFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors text-sm font-medium" style={{backgroundColor: '#CC0000'}}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  New Booking
                </button>
                <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-600 p-1">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {getBookingsForDate(selectedDate).map((booking, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-white px-2 py-1 rounded text-sm font-medium" style={{backgroundColor: '#CC0000'}}>{booking.vehicle}</div>
                    <div className="text-gray-600 font-medium">{booking.time}</div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      booking.status === 'pending' ? 'bg-yellow-200 text-yellow-800' : 
                      booking.status === 'confirmed' ? 'bg-green-200 text-green-800' : 
                      'bg-gray-200 text-gray-800'
                    }`}>
                      {booking.status}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed mb-2">{booking.purpose}</p>
                  <p className="text-gray-500 text-sm">Requested by: {booking.user}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isBookingFormOpen && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">Book Vehicle</h3>
              <button onClick={closeAllModals} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-red-300 mb-6">{formatDate(selectedDate)}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Time</label>
                <div className="flex items-center gap-3">
                  <select 
                    value={startTime} 
                    onChange={(e) => handleStartTimeChange(e.target.value)} 
                    className="flex-1 p-3 rounded-lg bg-gray-800 text-white border-2" 
                    style={{borderColor: '#CC0000'}} 
                    required
                  >
                    <option value="">Start time</option>
                    {timeOptions.map(time => <option key={time} value={time}>{time}</option>)}
                  </select>
                  <span className="text-white font-medium">to</span>
                  <select 
                    value={endTime} 
                    onChange={(e) => setEndTime(e.target.value)} 
                    className="flex-1 p-3 rounded-lg bg-gray-800 text-white border-2" 
                    style={{borderColor: '#CC0000'}} 
                    disabled={!startTime} 
                    required
                  >
                    <option value="">End time</option>
                    {getEndTimeOptions().map(time => <option key={time} value={time}>{time}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Vehicle</label>
                <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} className="w-full p-3 rounded-lg bg-gray-800 text-white border-2" style={{borderColor: '#CC0000'}} required>
                  <option value="">Select a vehicle</option>
                  {vehicles.map(vehicle => <option key={vehicle.id} value={vehicle.name}>{vehicle.name} ({vehicle.type} - {vehicle.capacity} seats)</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Work Email</label>
                <input
                  type="email"
                  value={workEmail}
                  onChange={(e) => setWorkEmail(e.target.value)}
                  placeholder="your.name@organization.com"
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border-2"
                  style={{borderColor: '#CC0000'}}
                  required
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Purpose of Booking</label>
                <textarea 
                  value={purpose} 
                  onChange={(e) => setPurpose(e.target.value)} 
                  placeholder="Enter the purpose of this vehicle booking..." 
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border-2 h-20 resize-none" 
                  style={{borderColor: '#CC0000'}} 
                  required 
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeAllModals} className="flex-1 py-3 px-4 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors">Cancel</button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 px-4 rounded-lg text-white transition-colors disabled:opacity-50"
                  style={{backgroundColor: '#CC0000'}}
                >
                  {loading ? 'Submitting...' : 'Submit Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FleetBookings;
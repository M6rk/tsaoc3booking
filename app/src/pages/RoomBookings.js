import React, { useState, useEffect, useCallback } from 'react';
import NavBar from '../components/NavBar';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../firebase/auth';

const convertTo12Hour = (time24) => {
  const [hour, minute] = time24.split(':');
  const hourNum = parseInt(hour);
  const ampm = hourNum >= 12 ? 'PM' : 'AM';
  const hour12 = hourNum === 0 ? 12 : hourNum > 12 ? hourNum - 12 : hourNum;
  return `${hour12}:${minute} ${ampm}`;
};

const RoomBookings = () => {
  const { currentUser } = useAuth();
  const [userName, setUserName] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookingFormOpen, setIsBookingFormOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');
  const [bookings, setBookings] = useState([]); // Firebase data
  const [loading, setLoading] = useState(false); // loading state

  const rooms = [
    { id: 1, name: 'Sanctuary', shortForm: 'SANC' },
    { id: 2, name: 'Youth Room', shortForm: 'YR' },
    { id: 3, name: "Children's Ministry Room", shortForm: 'CMR' },
    { id: 4, name: 'Prayer Room', shortForm: 'PR' },
    { id: 5, name: 'Main Kitchen', shortForm: 'KIT' },
    { id: 6, name: 'Café', shortForm: 'CAFÉ' },
    { id: 7, name: 'Gym', shortForm: 'GYM' },
    { id: 8, name: 'Fireside Room', shortForm: 'FSR' }
  ];

  const loadBookingsForMonth = useCallback(async (date) => {
    setLoading(true);
    const year = date.getFullYear();
    const month = date.getMonth();
    const startOfMonth = new Date(year, month, 1);
    const startDateString = startOfMonth.toISOString().split('T')[0];
    const startOfNextMonth = new Date(year, month + 1, 1);
    const endDateString = startOfNextMonth.toISOString().split('T')[0];

    console.log('Loading bookings from', startDateString, 'to', endDateString);

    const q = query(
      collection(db, 'roomBookings'),
      where('date', '>=', startDateString),
      where('date', '<', endDateString)
    );

    const querySnapshot = await getDocs(q);
    const monthBookings = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      monthBookings.push({
        id: doc.id,
        date: data.date,
        room: data.room,
        startTime: data.startTime,
        endTime: data.endTime,
        time: `${convertTo12Hour(data.startTime)}-${convertTo12Hour(data.endTime)}`,
        description: data.desc,
        status: data.status || 'pending',
        user: data.userName || 'Unknown User',
        denialReason: data.denialReason
      });
    });

    console.log('Loaded bookings:', monthBookings);
    setBookings(monthBookings);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    if (!currentUser) {
      alert('Please log in to view bookings');
      return;
    }
    loadBookingsForMonth(currentDate);
  }, [currentDate, currentUser, loadBookingsForMonth]);

  const getBookingsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0];
    return bookings.filter(booking => booking.date === dateString);
  };

  // Convert time string (HH:MM) to minutes since midnight
  const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Check if two time ranges overlap
  const timesOverlap = (start1, end1, start2, end2) => {
    const start1Min = timeToMinutes(start1);
    const end1Min = timeToMinutes(end1);
    const start2Min = timeToMinutes(start2);
    const end2Min = timeToMinutes(end2);

    // Two ranges overlap if: start1 < end2 AND end1 > start2
    return start1Min < end2Min && end1Min > start2Min;
  };

  // Check for booking conflicts
  const checkForConflicts = (bookings, selectedResource, startTime, endTime, selectedDate) => {
    const dateString = selectedDate.toISOString().split('T')[0];

    // Only bookings for the same date AND same room
    const relevantBookings = bookings.filter(
      booking =>
        booking.date === dateString &&
        booking.room === selectedResource
    );

    // Check each booking for time overlap
    const conflicts = relevantBookings.filter(booking => {
      if (booking.status === 'denied') return false;
      return timesOverlap(startTime, endTime, booking.startTime, booking.endTime);
    });

    return conflicts;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRoom || !startTime || !endTime || !description.trim() || !userName.trim()) {
      alert('Please fill in all fields');
      return;
    }

    // Check for time conflicts
    const conflicts = checkForConflicts(bookings, selectedRoom, startTime, endTime, selectedDate);

    if (conflicts.length > 0) {
      const conflictDetails = conflicts.map(conflict =>
        `${conflict.room} (${convertTo12Hour(conflict.startTime)}-${convertTo12Hour(conflict.endTime)}) - ${conflict.status}`
      ).join('\n');

      alert(`Time conflict detected!\n\nThe following booking(s) overlap with your requested time:\n\n${conflictDetails}\n\nPlease choose a different time slot.`);
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        date: selectedDate.toISOString().split('T')[0],
        room: selectedRoom,
        startTime,
        endTime,
        desc: description,
        userName: userName.trim(),
        status: 'pending',
        createdAt: new Date(),
        userId: currentUser?.uid || 'anonymous',
        userEmail: currentUser?.email || 'unknown'
      };

      await addDoc(collection(db, 'roomBookings'), bookingData);
      await loadBookingsForMonth(currentDate);

      alert(`Booking submitted for approval!\nName: ${userName}\nDate: ${formatDate(selectedDate)}\nRoom: ${selectedRoom}\nTime: ${convertTo12Hour(startTime)} - ${convertTo12Hour(endTime)}`);
      setIsBookingFormOpen(false);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating booking:', error);
      if (error.code === 'permission-denied') {
        alert('Permission denied. Please make sure you are logged in.');
      } else {
        alert('Error creating booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Update month navigation to reload data
  const navigateMonth = async (direction) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
    setCurrentDate(newDate);
  };

  const timeOptions = (() => {
    const times = [];
    for (let hour = 7; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const time12 = convertTo12Hour(time24);
        times.push({ value: time24, label: time12 });
      }
    }
    return times;
  })();


  const getEndTimeOptions = () => {
    if (!startTime) return [];
    const startIndex = timeOptions.findIndex(option => option.value === startTime);
    return timeOptions.slice(startIndex + 1);
  };

  const getRoomShortForm = (roomName) => rooms.find(r => r.name === roomName)?.shortForm || roomName;

  const formatDate = (date) => date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    setSelectedRoom('');
    setStartTime('');
    setEndTime('');
    setDescription('');
    setUserName('');
  };

  const handleStartTimeChange = (time) => {
    setStartTime(time);
    if (endTime && timeOptions.findIndex(option => option.value === endTime) <= timeOptions.findIndex(option => option.value === time)) {
      setEndTime('');
    }
  };

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsBookingFormOpen(false);
  };

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
          className={`h-32 p-1 border border-gray-200 text-left transition-all duration-200 relative overflow-hidden ${isPast
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'hover:bg-red-50 hover:border-red-300 cursor-pointer hover:shadow-md'
            } ${isToday ? 'bg-red-100 border-red-400' : isPast ? '' : 'bg-white'}`}
        >
          <div className={`absolute top-1 left-1 font-bold text-sm ${isPast ? 'text-gray-400' : isToday ? 'text-red-700' : 'text-gray-800'
            }`}>{day}</div>
          <div className="mt-6 h-24 flex flex-col">
            {dayBookings.length > 0 && (
              <>
                <div className={`text-xs font-semibold mb-1 flex-shrink-0 ${isPast ? 'text-gray-400' : 'text-red-600'
                  }`}>{dayBookings.length} booking{dayBookings.length > 1 ? 's' : ''}</div>
                <div className="flex-1 min-h-0 overflow-y-auto">
                  <div className="text-xs space-y-1">
                    {dayBookings.map((booking, index) => (
                      <div key={index} className={`rounded px-1 py-0.5 w-full flex-shrink-0 ${isPast ? 'bg-gray-200 text-gray-500' : 'bg-red-200 text-red-800'
                        }`}>
                        <div className="font-medium truncate">{getRoomShortForm(booking.room)}</div>
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
    <div className="min-h-screen bg-[#EE2D3D] relative pt-0 md:pt-6">
      <NavBar />

      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 pt-8 pb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">Room Reservations</h1>
        <div className="bg-white rounded-2xl p-6 w-full max-w-7xl">
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
              <div key={day} className="text-center text-[#EE2D3D] font-bold p-3 bg-red-50 border border-gray-200">{day}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">{renderCalendarDays()}</div>
        </div>
        <p className="text-red-200 text-center mt-6 text-base max-w-2xl">Click on any date to make a room reservation or view existing bookings.</p>
      </div>

      {isModalOpen && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-screen overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">Room Bookings</h3>
                <p className="text-red-600 font-medium">{formatDate(selectedDate)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => { setIsModalOpen(false); setIsBookingFormOpen(true); }} className="flex items-center gap-2 px-4 py-2 rounded-lg text-white transition-colors text-sm font-medium" style={{ backgroundColor: '#CC0000' }}>
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
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="text-white px-2 py-1 rounded text-sm font-medium" style={{ backgroundColor: '#CC0000' }}>
                        {booking.room}
                      </div>
                      <div className="text-gray-600 font-medium">{booking.time}</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                      booking.status === 'approved' ? 'bg-green-100 text-green-800 border-green-300' :
                        booking.status === 'denied' ? 'bg-red-100 text-red-800 border-red-300' :
                          'bg-gray-100 text-gray-800 border-gray-300'
                      }`}>
                      {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Pending'}
                    </div>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{booking.description}</p>
                  {booking.user && (
                    <p className="text-gray-500 text-sm mt-2">Requested by: {booking.user}</p>
                  )}
                  {booking.status === 'denied' && booking.denialReason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2 mt-2">
                      <p className="text-red-800 text-sm">
                        <strong>Denial Reason:</strong> {booking.denialReason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isBookingFormOpen && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeAllModals}>
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full max-h-screen overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-white">Book Room</h3>
              <button onClick={closeAllModals} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <p className="text-red-300 mb-6">{formatDate(selectedDate)}</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-white font-semibold mb-2">Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full p-3 rounded-lg bg-gray-800 text-white border-2"
                  style={{ borderColor: '#CC0000' }}
                  required
                />
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Start Time</label>
                <select value={startTime} onChange={(e) => handleStartTimeChange(e.target.value)} className="w-full p-3 rounded-lg bg-gray-800 text-white border-2" style={{ borderColor: '#CC0000' }} required>
                  <option value="">Select start time</option>
                  {timeOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">End Time</label>
                <select value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full p-3 rounded-lg bg-gray-800 text-white border-2" style={{ borderColor: '#CC0000' }} disabled={!startTime} required>
                  <option value="">Select end time</option>
                  {getEndTimeOptions().map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Room</label>
                <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)} className="w-full p-3 rounded-lg bg-gray-800 text-white border-2" style={{ borderColor: '#CC0000' }} required>
                  <option value="">Select a room</option>
                  {rooms.map(room => <option key={room.id} value={room.name}>{room.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-white font-semibold mb-2">Description/Purpose</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter the purpose of this meeting..." className="w-full p-3 rounded-lg bg-gray-800 text-white border-2 h-24 resize-none" style={{ borderColor: '#CC0000' }} required />
              </div>
              <div className="flex gap-4 pt-4">
                <button type="button" onClick={closeAllModals} className="flex-1 py-3 px-4 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-3 px-4 rounded-lg text-white transition-colors" style={{ backgroundColor: '#CC0000' }}>Submit Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomBookings;
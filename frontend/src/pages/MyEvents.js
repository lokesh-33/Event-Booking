import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';
import './MyEvents.css';

const MyEvents = () => {
  const [myCreatedEvents, setMyCreatedEvents] = useState([]);
  const [myAttendingEvents, setMyAttendingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(user?.role === 'creator' ? 'created' : 'attending');

  useEffect(() => {
    fetchMyEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchMyEvents = async () => {
    try {
      const response = await api.get('/api/events');
      const allEvents = response.data.events;

      // Filter events created by user
      const created = allEvents.filter(event => event.creator._id === user.id);

      // Filter events user is attending
      const attending = allEvents.filter(event =>
        event.attendees.some(attendee => attendee._id === user.id) &&
        event.creator._id !== user.id
      );

      setMyCreatedEvents(created);
      setMyAttendingEvents(attending);
    } catch (error) {
      toast.error('Failed to fetch events');
      console.error('Fetch events error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRSVP = async (eventId) => {
    try {
      await api.delete(`/api/events/${eventId}/rsvp`);
      toast.success('Registration cancelled');
      // Refresh events
      fetchMyEvents();
    } catch (error) {
      toast.error('Failed to cancel registration');
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  const displayEvents = activeTab === 'created' ? myCreatedEvents : myAttendingEvents;

  return (
    <div className="my-events-container container">
      <div className="my-events-header">
        <h1 className="my-events-title">My Events</h1>
        <p className="my-events-subtitle">Manage your created events and registrations</p>
      </div>

      <div className="tabs">
        {user.role === 'creator' && (
          <button
            className={`tab ${activeTab === 'created' ? 'active' : ''}`}
            onClick={() => setActiveTab('created')}
          >
            Created Events
            <span className="tab-badge">{myCreatedEvents.length}</span>
          </button>
        )}
        <button
          className={`tab ${activeTab === 'attending' ? 'active' : ''}`}
          onClick={() => setActiveTab('attending')}
        >
          Attending Events
          <span className="tab-badge">{myAttendingEvents.length}</span>
        </button>
      </div>

      <div className="tab-content">
        {displayEvents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              {activeTab === 'created' ? '✨' : '🎫'}
            </div>
            <h3>
              {activeTab === 'created'
                ? "You haven't created any events yet"
                : user?.role === 'creator' 
                  ? "You're not attending any events"
                  : "You haven't registered for any events yet"}
            </h3>
            <p>
              {activeTab === 'created'
                ? 'Create your first event and start inviting people!'
                : 'Browse events and register for the ones you like!'}
            </p>
          </div>
        ) : (
          <div className="events-grid">
            {displayEvents.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onCancelRSVP={handleCancelRSVP}
                currentUserId={user.id}
                showActions={activeTab === 'attending'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEvents;

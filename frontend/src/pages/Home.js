import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, today
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/api/events');
      setEvents(response.data.events);
    } catch (error) {
      toast.error('Failed to fetch events');
      console.error('Fetch events error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async (eventId) => {
    // Redirect to event details page for OTP verification
    toast.info('Please verify your email to complete registration');
    window.location.href = `/events/${eventId}`;
  };

  const handleCancelRSVP = async (eventId) => {
    try {
      const response = await api.delete(`/api/events/${eventId}/rsvp`);
      toast.success('Registration cancelled');
      
      // Update the event in the list
      setEvents(events.map(event => 
        event._id === eventId ? response.data.event : event
      ));
    } catch (error) {
      toast.error('Failed to cancel registration');
    }
  };

  const filterEvents = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return events.filter(event => {
      // Skip null or undefined events
      if (!event || !event.date) return false;
      
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          event.title?.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower) ||
          event.location?.toLowerCase().includes(searchLower);
        
        if (!matchesSearch) return false;
      }
      
      // Category filter
      if (category !== 'all' && event.category !== category) {
        return false;
      }
      
      const eventDate = new Date(event.date);
      
      // Date filter
      if (filter === 'today') {
        const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
        return eventDay.getTime() === today.getTime();
      }
      
      if (filter === 'upcoming') {
        return eventDate >= now;
      }
      
      return true; // all
    });
  };

  const filteredEvents = filterEvents();

  if (loading) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="home-container container">
      <div className="home-header">
        <div>
          <h1 className="home-title">Discover Events</h1>
          <p className="home-subtitle">
            {user?.role === 'creator' 
              ? 'Create and manage your events or join others' 
              : 'Find and join amazing events near you'}
          </p>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search events by title, description, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <div className="filters-row">
          <div className="filter-group">
            <label className="filter-label">Category:</label>
            <select
              className="filter-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="conference">Conference</option>
              <option value="workshop">Workshop</option>
              <option value="meetup">Meetup</option>
              <option value="webinar">Webinar</option>
              <option value="social">Social</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="filter-label">Date:</label>
            <div className="home-filters">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Events
              </button>
              <button
                className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </button>
              <button
                className={`filter-btn ${filter === 'today' ? 'active' : ''}`}
                onClick={() => setFilter('today')}
              >
                Today
              </button>
            </div>
          </div>
        </div>

        {/* Results count */}
        {(searchTerm || category !== 'all' || filter !== 'all') && (
          <div className="results-info">
            Found {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
            {searchTerm && ` matching "${searchTerm}"`}
          </div>
        )}
      </div>

      {filteredEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <h3>No events found</h3>
          <p>Be the first to create an event!</p>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onRSVP={handleRSVP}
              onCancelRSVP={handleCancelRSVP}
              currentUserId={user?.id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;

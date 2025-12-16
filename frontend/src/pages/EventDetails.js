import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import OTPModal from '../components/OTPModal';
import './EventDetails.css';

const EventDetails = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpData, setOtpData] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/api/events/${id}`);
      setEvent(response.data.event);
    } catch (error) {
      toast.error('Failed to fetch event');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleRSVP = async () => {
    if (!user) {
      toast.info('Please login to RSVP');
      navigate('/login');
      return;
    }

    try {
      toast.info('Sending verification code to your email...');
      const response = await api.post(`/api/events/${id}/rsvp`);
      
      if (response.data.requiresVerification) {
        setOtpData({
          otpId: response.data.otpId,
          expiresIn: response.data.expiresIn
        });
        setShowOTPModal(true);
        toast.success(response.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send verification code');
    }
  };

  const handleVerifyOTP = async (otp) => {
    try {
      const response = await api.post(`/api/events/${id}/rsvp/verify`, { otp });
      setEvent(response.data.event);
      setShowOTPModal(false);
      toast.success(response.data.message);
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Verification failed');
    }
  };

  const handleCancelRSVP = async () => {
    try {
      const response = await api.delete(`/api/events/${id}/rsvp`);
      setEvent(response.data.event);
      toast.success('Registration cancelled');
    } catch (error) {
      toast.error('Failed to cancel registration');
    }
  };

  if (loading) {
    return <div className="spinner"></div>;
  }

  if (!event) {
    return null;
  }

  const isCreator = user && event.creator._id === user.id;
  const isAttending = user && event.attendees.some(a => a._id === user.id);
  const isFull = event.attendees.length >= event.capacity;
  const availableSpots = event.capacity - event.attendees.length;

  return (
    <div className="event-details-container container">
      <div className="event-details-card">
        <div className="event-hero">
          <img src={event.imageUrl} alt={event.title} className="event-hero-image" />
          <div className="event-hero-overlay">
            <h1 className="event-details-title">{event.title}</h1>
            <div className="event-status-badges">
              {isFull && <span className="badge badge-danger">Event Full</span>}
              {!isFull && availableSpots <= 5 && availableSpots > 0 && (
                <span className="badge badge-warning">{availableSpots} spots left</span>
              )}
              {isAttending && <span className="badge badge-success">You're attending</span>}
            </div>
          </div>
        </div>

        <div className="event-details-content">
          <div className="event-details-main">
            <section className="details-section">
              <h2 className="section-title">About This Event</h2>
              <p className="event-description">{event.description}</p>
            </section>

            <section className="details-section">
              <h2 className="section-title">Event Details</h2>
              <div className="event-info-grid">
                <div className="info-item">
                  <span className="info-icon">📅</span>
                  <div>
                    <div className="info-label">Date</div>
                    <div className="info-value">
                      {format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}
                    </div>
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-icon">🕐</span>
                  <div>
                    <div className="info-label">Time</div>
                    <div className="info-value">{event.time}</div>
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-icon">📍</span>
                  <div>
                    <div className="info-label">Location</div>
                    <div className="info-value">{event.location}</div>
                  </div>
                </div>

                <div className="info-item">
                  <span className="info-icon">👥</span>
                  <div>
                    <div className="info-label">Capacity</div>
                    <div className="info-value">
                      {event.attendees.length} / {event.capacity} attendees
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="details-section">
              <h2 className="section-title">Organizer</h2>
              <div className="organizer-info">
                <div className="organizer-avatar">
                  {event.creator.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="organizer-name">
                    {event.creator.name}
                    <span style={{ 
                      marginLeft: '0.5rem', 
                      fontSize: '0.75rem',
                      padding: '0.125rem 0.5rem',
                      backgroundColor: 'var(--primary-color)',
                      color: 'white',
                      borderRadius: '9999px',
                      fontWeight: '600'
                    }}>
                      Creator
                    </span>
                  </div>
                  <div className="organizer-email">{event.creator.email}</div>
                </div>
              </div>
            </section>

            {isCreator && event.attendees.length > 0 && (
              <section className="details-section">
                <h2 className="section-title">
                  Attendees ({event.attendees.length})
                </h2>
                <div className="attendees-list">
                  {event.attendees.map((attendee) => (
                    <div key={attendee._id} className="attendee-item">
                      <div className="attendee-avatar">
                        {attendee.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="attendee-info">
                        <div className="attendee-name">{attendee.name}</div>
                        <div className="attendee-email">{attendee.email}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="event-details-sidebar">
            <div className="sidebar-card">
              <div className="capacity-info">
                <div className="capacity-bar">
                  <div
                    className="capacity-fill"
                    style={{
                      width: `${(event.attendees.length / event.capacity) * 100}%`,
                    }}
                  />
                </div>
                <div className="capacity-text">
                  <strong>{availableSpots}</strong> spots available
                </div>
              </div>

              {user && (
                <div className="action-buttons">
                  {isCreator ? (
                    <>
                      <Link
                        to={`/edit-event/${event._id}`}
                        className="btn btn-primary btn-block"
                      >
                        Edit Event
                      </Link>
                      <Link to="/" className="btn btn-outline btn-block">
                        Back to Events
                      </Link>
                    </>
                  ) : (
                    <>
                      {isAttending ? (
                        <button
                          onClick={handleCancelRSVP}
                          className="btn btn-danger btn-block"
                        >
                          Cancel Registration
                        </button>
                      ) : (
                        <button
                          onClick={handleRSVP}
                          className="btn btn-primary btn-block"
                          disabled={isFull}
                        >
                          {isFull ? 'Event Full' : 'Register Now'}
                        </button>
                      )}
                      <Link to="/" className="btn btn-outline btn-block">
                        Back to Events
                      </Link>
                    </>
                  )}
                </div>
              )}

              {!user && (
                <div className="action-buttons">
                  <Link to="/login" className="btn btn-primary btn-block">
                    Login to Register
                  </Link>
                  <Link to="/" className="btn btn-outline btn-block">
                    Back to Events
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <OTPModal
        isOpen={showOTPModal}
        onClose={() => setShowOTPModal(false)}
        onVerify={handleVerifyOTP}
        eventTitle={event?.title || ''}
        expiresIn={otpData?.expiresIn || 600}
      />
    </div>
  );
};

export default EventDetails;

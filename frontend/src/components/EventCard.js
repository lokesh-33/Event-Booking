import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import './EventCard.css';

const EventCard = ({ event, onRSVP, onCancelRSVP, currentUserId, showActions = true }) => {
  const isCreator = currentUserId && event.creator?._id === currentUserId;
  const isAttending = currentUserId && event.attendees?.some(a => a._id === currentUserId);
  const isFull = event.attendees?.length >= event.capacity;
  const availableSpots = event.capacity - (event.attendees?.length || 0);

  const handleRSVP = (e) => {
    e.preventDefault();
    if (isAttending) {
      onCancelRSVP(event._id);
    } else {
      onRSVP(event._id);
    }
  };

  return (
    <div className="event-card">
      <div className="event-card-image">
        <img src={event.imageUrl} alt={event.title} />
        {isFull && (
          <span className="badge badge-danger event-badge">Full</span>
        )}
        {!isFull && availableSpots <= 5 && availableSpots > 0 && (
          <span className="badge badge-warning event-badge">
            {availableSpots} spots left
          </span>
        )}
      </div>

      <div className="event-card-content">
        <div className="event-card-header">
          <h3 className="event-card-title">{event.title}</h3>
          {event.category && (
            <span className={`category-badge category-${event.category}`}>
              {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
            </span>
          )}
        </div>
        
        <div className="event-card-info">
          <div className="event-info-item">
            <span className="info-icon">📅</span>
            <span>{format(new Date(event.date), 'MMM dd, yyyy')}</span>
          </div>
          <div className="event-info-item">
            <span className="info-icon">🕐</span>
            <span>{event.time}</span>
          </div>
          <div className="event-info-item">
            <span className="info-icon">📍</span>
            <span>{event.location}</span>
          </div>
          <div className="event-info-item">
            <span className="info-icon">👥</span>
            <span>
              {event.attendees?.length || 0} / {event.capacity}
            </span>
          </div>
        </div>

        <p className="event-card-description">
          {event.description.length > 120
            ? `${event.description.substring(0, 120)}...`
            : event.description}
        </p>

        <div className="event-card-footer">
          <Link to={`/events/${event._id}`} className="btn btn-sm btn-outline">
            View Details
          </Link>

          {showActions && currentUserId && (
            <>
              {isCreator && currentUserId ? (
                <Link to={`/edit-event/${event._id}`} className="btn btn-sm btn-primary">
                  Manage Event
                </Link>
              ) : (
                <button
                  onClick={handleRSVP}
                  className={`btn btn-sm ${
                    isAttending ? 'btn-danger' : 'btn-primary'
                  }`}
                  disabled={!isAttending && isFull}
                >
                  {isAttending ? 'Cancel RSVP' : isFull ? 'Full' : 'RSVP'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;

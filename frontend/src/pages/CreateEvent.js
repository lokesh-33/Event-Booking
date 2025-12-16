import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import './EventForm.css';

const CreateEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Check if user is a creator
  if (user?.role !== 'creator') {
    return (
      <div className="event-form-container container">
        <div className="event-form-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1.5rem' }}>🚫</div>
          <h2 className="event-form-title">Access Denied</h2>
          <p className="event-form-subtitle" style={{ marginBottom: '2rem' }}>
            Only Event Creators can create events. Your account is registered as an Event Attender.
          </p>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Event Attenders can browse and RSVP to events created by others.
          </p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAIGenerate = async () => {
    if (!formData.title || !formData.location || !formData.date) {
      toast.warning('Please fill in Title, Location, and Date first');
      return;
    }

    setAiLoading(true);
    try {
      const response = await api.post('/api/ai/generate-description', {
        title: formData.title,
        location: formData.location,
        date: formData.date,
        time: formData.time,
        capacity: formData.capacity
      });

      if (response.data.success) {
        setFormData({ ...formData, description: response.data.description });
        toast.success('✨ AI generated description!');
      } else {
        toast.info('AI service not available. Please write manually.');
      }
    } catch (error) {
      toast.info('AI service not available. Please write manually.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleAIEnhance = async () => {
    if (!formData.description) {
      toast.warning('Please write a description first');
      return;
    }

    setAiLoading(true);
    try {
      const response = await api.post('/api/ai/enhance-description', {
        description: formData.description,
        title: formData.title,
        location: formData.location,
        date: formData.date
      });

      if (response.data.success) {
        setFormData({ ...formData, description: response.data.description });
        toast.success('✨ AI enhanced description!');
      } else {
        toast.info('AI service not available');
      }
    } catch (error) {
      toast.info('AI service not available');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('time', formData.time);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('capacity', formData.capacity);
      
      if (image) {
        formDataToSend.append('image', image);
      }

      await api.post('/api/events', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Event created successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create event');
      console.error('Create event error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="event-form-container container">
      <div className="event-form-card">
        <h2 className="event-form-title">Create New Event</h2>
        <p className="event-form-subtitle">Fill in the details to create your event</p>

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label className="form-label">Event Title *</label>
            <input
              type="text"
              name="title"
              className="form-control"
              value={formData.title}
              onChange={handleChange}
              required
              maxLength="100"
              placeholder="e.g., Summer Music Festival"
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Description *
              <span style={{ float: 'right', fontSize: '0.875rem' }}>
                <button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={aiLoading || !formData.title}
                  className="btn-link"
                  style={{ marginRight: '1rem' }}
                >
                  {aiLoading ? '⏳ Generating...' : '✨ AI Generate'}
                </button>
                {formData.description && (
                  <button
                    type="button"
                    onClick={handleAIEnhance}
                    disabled={aiLoading}
                    className="btn-link"
                  >
                    {aiLoading ? '⏳ Enhancing...' : '🚀 AI Enhance'}
                  </button>
                )}
              </span>
            </label>
            <textarea
              name="description"
              className="form-control"
              value={formData.description}
              onChange={handleChange}
              required
              maxLength="1000"
              placeholder="Describe your event... or use AI to generate"
              rows="5"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date *</label>
              <input
                type="date"
                name="date"
                className="form-control"
                value={formData.date}
                onChange={handleChange}
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Time *</label>
              <input
                type="time"
                name="time"
                className="form-control"
                value={formData.time}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location *</label>
            <input
              type="text"
              name="location"
              className="form-control"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="e.g., Central Park, New York"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Capacity *</label>
            <input
              type="number"
              name="capacity"
              className="form-control"
              value={formData.capacity}
              onChange={handleChange}
              required
              min="1"
              max="10000"
              placeholder="Maximum number of attendees"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Event Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-control"
            />
            <small className="form-text">Max size: 5MB. Supported formats: JPG, PNG, GIF, WebP</small>
          </div>

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEvent;

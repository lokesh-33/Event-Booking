import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import './EventForm.css';

const EditEvent = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    location: '',
    capacity: '',
    category: 'other',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchEvent = async () => {
    try {
      const response = await api.get(`/api/events/${id}`);
      const event = response.data.event;
      
      // Check if user is the creator
      const user = JSON.parse(localStorage.getItem('user'));
      if (event.creator._id !== user.id) {
        toast.error('You are not authorized to edit this event');
        navigate('/');
        return;
      }

      setFormData({
        title: event.title,
        description: event.description,
        date: new Date(event.date).toISOString().split('T')[0],
        time: event.time,
        location: event.location,
        capacity: event.capacity,
        category: event.category || 'other',
      });
      setCurrentImage(event.imageUrl);
    } catch (error) {
      toast.error('Failed to fetch event');
      navigate('/');
    } finally {
      setFetching(false);
    }
  };

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
      formDataToSend.append('category', formData.category);
      
      if (image) {
        formDataToSend.append('image', image);
      }

      await api.put(`/api/events/${id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Event updated successfully!');
      navigate(`/events/${id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update event');
      console.error('Update event error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await api.delete(`/api/events/${id}`);
        toast.success('Event deleted successfully');
        navigate('/');
      } catch (error) {
        toast.error('Failed to delete event');
      }
    }
  };

  if (fetching) {
    return <div className="spinner"></div>;
  }

  return (
    <div className="event-form-container container">
      <div className="event-form-card">
        <h2 className="event-form-title">Edit Event</h2>
        <p className="event-form-subtitle">Update your event details</p>

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
            />
          </div>

          <div className="form-row">
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
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                name="category"
                className="form-control"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="conference">Conference</option>
                <option value="workshop">Workshop</option>
                <option value="meetup">Meetup</option>
                <option value="webinar">Webinar</option>
                <option value="social">Social</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Update Event Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="form-control"
            />
            <small className="form-text">Max size: 5MB. Leave empty to keep current image.</small>
          </div>

          {imagePreview ? (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
            </div>
          ) : currentImage && (
            <div className="image-preview">
              <img src={currentImage} alt="Current" />
            </div>
          )}

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-danger"
              onClick={handleDelete}
              disabled={loading}
            >
              Delete Event
            </button>
            <div style={{ display: 'flex', gap: '1rem', flex: 1 }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => navigate(`/events/${id}`)}
                disabled={loading}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={loading}
                style={{ flex: 1 }}
              >
                {loading ? 'Updating...' : 'Update Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEvent;

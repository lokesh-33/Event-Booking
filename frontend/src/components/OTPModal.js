import React, { useState, useEffect } from 'react';
import './OTPModal.css';

const OTPModal = ({ isOpen, onClose, onVerify, eventTitle, expiresIn }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(expiresIn || 600);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [isOpen, timeLeft]);

  useEffect(() => {
    if (isOpen) {
      setOtp(['', '', '', '', '', '']);
      setError('');
      setTimeLeft(expiresIn || 600);
    }
  }, [isOpen, expiresIn]);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedData = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedData.forEach((char, i) => {
        if (index + i < 6 && /^\d$/.test(char)) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      
      // Focus last filled input
      const lastFilledIndex = Math.min(index + pastedData.length - 1, 5);
      document.getElementById(`otp-${lastFilledIndex}`)?.focus();
      return;
    }

    if (/^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError('');

      // Auto-focus next input
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    
    if (otpValue.length !== 6) {
      setError('Please enter complete 6-digit code');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onVerify(otpValue);
    } catch (err) {
      setError(err.message || 'Invalid verification code');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div className="otp-modal-overlay" onClick={onClose}>
      <div className="otp-modal-content" onClick={e => e.stopPropagation()}>
        <button className="otp-modal-close" onClick={onClose}>
          ✕
        </button>

        <div className="otp-modal-header">
          <div className="otp-icon">📧</div>
          <h2>Verify Your Email</h2>
          <p>We've sent a verification code to your email</p>
        </div>

        <div className="otp-event-info">
          <strong>Event:</strong> {eventTitle}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="otp-inputs">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={e => handleChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                className="otp-input"
                autoFocus={index === 0}
                disabled={isSubmitting}
              />
            ))}
          </div>

          {error && <div className="otp-error">{error}</div>}

          <div className="otp-timer">
            {timeLeft > 0 ? (
              <span>Code expires in: <strong>{formatTime(timeLeft)}</strong></span>
            ) : (
              <span className="otp-expired">Code expired. Please request a new one.</span>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={isSubmitting || timeLeft === 0}
          >
            {isSubmitting ? 'Verifying...' : 'Verify & Register'}
          </button>

          <button
            type="button"
            className="btn btn-outline btn-block"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </form>

        <div className="otp-help">
          <p>Didn't receive the code? Check your spam folder or try again.</p>
        </div>
      </div>
    </div>
  );
};

export default OTPModal;

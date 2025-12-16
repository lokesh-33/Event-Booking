const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

// Initialize SendGrid if API key is present
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const shouldPreviewEmails = () => {
  // Only preview (log to console) outside production, or if explicitly forced.
  if (process.env.EMAIL_PREVIEW === 'true') return true;
  if (process.env.NODE_ENV !== 'production') return true;
  // In production, preview only if no real provider is configured.
  return !process.env.SENDGRID_API_KEY && !process.env.EMAIL_HOST;
};

const getFromAddress = () => {
  return (
    process.env.SENDGRID_FROM ||
    process.env.EMAIL_FROM ||
    'noreply@eventplatform.com'
  );
};

// Send email via SendGrid HTTP API (avoids SMTP port blocking on hosting platforms)
const sendWithSendGrid = async (mailOptions) => {
  const msg = {
    to: mailOptions.to,
    from: mailOptions.from,
    subject: mailOptions.subject,
    text: mailOptions.text,
    html: mailOptions.html
  };

  try {
    const response = await sgMail.send(msg);
    console.log('✅ Email sent via SendGrid HTTP API:', {
      statusCode: response[0].statusCode,
      to: mailOptions.to,
      subject: mailOptions.subject
    });
    return { success: true, messageId: response[0].headers['x-message-id'] };
  } catch (error) {
    console.error('❌ SendGrid HTTP API error:', error.response?.body || error.message);
    throw error;
  }
};

// Create transporter (fallback for non-SendGrid providers)
const createTransporter = () => {
  if (process.env.NODE_ENV === 'production' && process.env.EMAIL_HOST) {
    // Other production email service (Gmail, etc.) - uses SMTP
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else {
    // Development: Log to console
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'test@example.com',
        pass: process.env.EMAIL_PASSWORD || 'testpassword'
      }
    });
  }
};

// Send OTP Email
const sendOTPEmail = async (to, name, otp, eventTitle) => {
  try {
    const fromAddress = getFromAddress();

    const mailOptions = {
      from: `Event Platform <${fromAddress}>`,
      to: to,
      subject: `Verify Your Registration - ${eventTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Event Platform</h1>
              <p>Verify Your Event Registration</p>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>You're almost there! To complete your registration for <strong>${eventTitle}</strong>, please verify your email address.</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your verification code is:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">This code expires in 10 minutes</p>
              </div>

              <p><strong>Important:</strong> Enter this code on the verification page to confirm your registration.</p>
              
              <p>If you didn't request this registration, please ignore this email.</p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="margin: 0; color: #666; font-size: 14px;">Need help? Contact us at support@eventplatform.com</p>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Event Platform. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${name}!
        
        You're registering for: ${eventTitle}
        
        Your verification code is: ${otp}
        
        This code expires in 10 minutes.
        
        If you didn't request this, please ignore this email.
        
        © 2025 Event Platform
      `
    };

    // Preview mode (logs to console instead of sending)
    if (shouldPreviewEmails()) {
      console.log('\n========== EMAIL PREVIEW ==========');
      console.log(`To: ${to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`From: ${fromAddress}`);
      console.log(`OTP Code: ${otp}`);
      console.log('===================================\n');
      return { success: true, messageId: 'dev-mode', preview: true };
    }

    // Use SendGrid HTTP API if available (preferred for cloud platforms like Render)
    if (process.env.SENDGRID_API_KEY) {
      return await sendWithSendGrid(mailOptions);
    }

    // Fallback to SMTP for other providers
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('OTP Email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw error;
  }
};

// Send Booking Confirmation Email
const sendBookingConfirmationEmail = async (to, name, eventDetails) => {
  try {
    const fromAddress = getFromAddress();

    const mailOptions = {
      from: `Event Platform <${fromAddress}>`,
      to: to,
      subject: `Registration Confirmed - ${eventDetails.title}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .event-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .info-row { display: flex; margin: 10px 0; padding: 10px 0; border-bottom: 1px solid #eee; }
            .info-label { font-weight: bold; min-width: 100px; color: #666; }
            .info-value { color: #333; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
            .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Registration Confirmed!</h1>
            </div>
            <div class="content">
              <div class="success-icon">🎉</div>
              <h2>You're all set, ${name}!</h2>
              <p>Your registration for <strong>${eventDetails.title}</strong> has been confirmed.</p>
              
              <div class="event-card">
                <h3 style="margin-top: 0; color: #667eea;">Event Details</h3>
                <div class="info-row">
                  <span class="info-label">📅 Date:</span>
                  <span class="info-value">${eventDetails.date}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">🕐 Time:</span>
                  <span class="info-value">${eventDetails.time}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">📍 Location:</span>
                  <span class="info-value">${eventDetails.location}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">👤 Organizer:</span>
                  <span class="info-value">${eventDetails.organizerName}</span>
                </div>
                <div class="info-row" style="border-bottom: none;">
                  <span class="info-label">✉️ Contact:</span>
                  <span class="info-value">${eventDetails.organizerEmail}</span>
                </div>
              </div>

              <p><strong>What's next?</strong></p>
              <ul>
                <li>Mark your calendar for ${eventDetails.date} at ${eventDetails.time}</li>
                <li>Save the location: ${eventDetails.location}</li>
                <li>Contact the organizer if you have questions</li>
              </ul>

              <p style="margin-top: 30px; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
                <strong>Note:</strong> If you need to cancel, you can do so from your account dashboard.
              </p>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                <p style="margin: 0; color: #666; font-size: 14px;">Questions? Contact the organizer at ${eventDetails.organizerEmail}</p>
              </div>
            </div>
            <div class="footer">
              <p>© 2025 Event Platform. All rights reserved.</p>
              <p>You received this email because you registered for an event on our platform.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Registration Confirmed!
        
        Hello ${name}!
        
        Your registration for ${eventDetails.title} has been confirmed.
        
        Event Details:
        Date: ${eventDetails.date}
        Time: ${eventDetails.time}
        Location: ${eventDetails.location}
        Organizer: ${eventDetails.organizerName} (${eventDetails.organizerEmail})
        
        See you at the event!
        
        © 2025 Event Platform
      `
    };

    // Preview mode (logs to console instead of sending)
    if (shouldPreviewEmails()) {
      console.log('\n========== CONFIRMATION EMAIL PREVIEW ==========');
      console.log(`To: ${to}`);
      console.log(`Subject: ${mailOptions.subject}`);
      console.log(`From: ${fromAddress}`);
      console.log(`Event: ${eventDetails.title}`);
      console.log('================================================\n');
      return { success: true, messageId: 'dev-mode', preview: true };
    }

    // Use SendGrid HTTP API if available (preferred for cloud platforms like Render)
    if (process.env.SENDGRID_API_KEY) {
      return await sendWithSendGrid(mailOptions);
    }

    // Fallback to SMTP for other providers
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('Confirmation email sent:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
};

module.exports = {
  sendOTPEmail,
  sendBookingConfirmationEmail
};

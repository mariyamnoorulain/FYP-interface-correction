const nodemailer = require('nodemailer');

// Create email transporter (using Gmail SMTP as default, can be configured)
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send email notification
const sendEmail = async (to, subject, html, text = '') => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.warn('Email credentials not configured. Email not sent to:', to);
      return { success: false, message: 'Email service not configured' };
    }

    const transporter = createTransporter();
    
    const mailOptions = {
      from: `"LearnHub" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send error:', error);
    return { success: false, error: error.message };
  }
};

// Booking confirmation email
const sendBookingConfirmation = async (studentEmail, studentName, tutorName, bookingDate, bookingTime) => {
  const subject = 'Booking Confirmed - LearnHub';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #14b8a6;">Booking Confirmed!</h2>
      <p>Hi ${studentName},</p>
      <p>Your lesson with <strong>${tutorName}</strong> has been confirmed.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${new Date(bookingDate).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${bookingTime}</p>
      </div>
      <p>We'll send you a reminder 24 hours and 1 hour before your lesson.</p>
      <p>Best regards,<br>The LearnHub Team</p>
    </div>
  `;
  return await sendEmail(studentEmail, subject, html);
};

// Booking reminder email
const sendBookingReminder = async (studentEmail, studentName, tutorName, bookingDate, bookingTime, hoursBefore = 24) => {
  const subject = `Reminder: Lesson in ${hoursBefore} hours - LearnHub`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #14b8a6;">Lesson Reminder</h2>
      <p>Hi ${studentName},</p>
      <p>Just a reminder that you have a lesson with <strong>${tutorName}</strong> in ${hoursBefore} hours.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Date:</strong> ${new Date(bookingDate).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${bookingTime}</p>
      </div>
      <p>See you soon!</p>
      <p>Best regards,<br>The LearnHub Team</p>
    </div>
  `;
  return await sendEmail(studentEmail, subject, html);
};

// Lesson starting soon email
const sendLessonStartingEmail = async (studentEmail, studentName, tutorName, meetingLink) => {
  const subject = 'Your Lesson is Starting Soon - LearnHub';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #14b8a6;">Join Your Lesson Now</h2>
      <p>Hi ${studentName},</p>
      <p>Your lesson with <strong>${tutorName}</strong> is starting soon!</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${meetingLink}" style="background-color: #14b8a6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Join Lesson
        </a>
      </div>
      <p>If you have any issues, please contact support.</p>
      <p>Best regards,<br>The LearnHub Team</p>
    </div>
  `;
  return await sendEmail(studentEmail, subject, html);
};

// Payment confirmation email
const sendPaymentConfirmation = async (studentEmail, studentName, amount, bookingDate) => {
  const subject = 'Payment Confirmed - LearnHub';
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #14b8a6;">Payment Confirmed</h2>
      <p>Hi ${studentName},</p>
      <p>Your payment of <strong>$${amount.toFixed(2)}</strong> has been confirmed.</p>
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Booking Date:</strong> ${new Date(bookingDate).toLocaleDateString()}</p>
        <p><strong>Amount:</strong> $${amount.toFixed(2)}</p>
      </div>
      <p>Thank you for using LearnHub!</p>
      <p>Best regards,<br>The LearnHub Team</p>
    </div>
  `;
  return await sendEmail(studentEmail, subject, html);
};

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendBookingReminder,
  sendLessonStartingEmail,
  sendPaymentConfirmation
};


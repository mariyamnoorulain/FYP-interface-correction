console.log('=== SERVER STARTING ===');
console.log('Step 1: Loading modules...');

const express = require('express');
console.log('✅ Express loaded');

const mongoose = require('mongoose');
console.log('✅ Mongoose loaded');

const cors = require('cors');
console.log('✅ CORS loaded');

const dotenv = require('dotenv');
console.log('✅ Dotenv loaded');

console.log('Step 2: Configuring dotenv...');
dotenv.config();
console.log('✅ Dotenv configured');

console.log('Step 3: Creating Express app...');
const app = express();
console.log('✅ Express app created');

console.log('Step 4: Setting up middleware...');
app.use(cors());
app.use(express.json());
console.log('✅ Middleware configured');

console.log('Step 5: Checking environment variables...');
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('PORT:', process.env.PORT || 5000);
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
console.log('DAILY_API_KEY exists:', !!process.env.DAILY_API_KEY);
console.log('EMAIL_USER exists:', !!process.env.EMAIL_USER);

console.log('Step 6: Setting up routes...');
const authRoutes = require('./routes/auth');
const tutorRoutes = require('./routes/tutors');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const messageRoutes = require('./routes/messages');
const lectureRoutes = require('./routes/lectures');
const materialRoutes = require('./routes/materials');
const paymentRoutes = require('./routes/payments');
const classroomRoutes = require('./routes/classrooms');
const subscriptionRoutes = require('./routes/subscriptions');
const notificationRoutes = require('./routes/notifications');
const emotionRoutes = require('./routes/emotions');
const studentRoutes = require('./routes/students');
const enrollmentRoutes = require('./routes/enrollments');

app.use('/api/auth', authRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/tutors', tutorRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/classrooms', classroomRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/emotions', emotionRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Server is running!' });
});
console.log('✅ Routes configured');

console.log('Step 7: Connecting to MongoDB...');
if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
      console.log('✅ MongoDB connected successfully!');
    })
    .catch(err => {
      console.error('❌ MongoDB connection failed:', err.message);
    });
} else {
  console.error('❌ MONGODB_URI is missing in .env file!');
}

console.log('Step 8: Starting server...');
const PORT = process.env.PORT || 5000;

try {
  app.listen(PORT, () => {
    console.log('\n' + '='.repeat(60));
    console.log('✅ SERVER IS RUNNING!');
    console.log(`🚀 Open browser: http://localhost:${PORT}`);
    console.log('='.repeat(60) + '\n');
    console.log('Server is ready. Press Ctrl+C to stop.\n');
  });
} catch (error) {
  console.error('❌ Failed to start server:', error.message);
  console.error('Full error:', error);
}

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  process.exit(0);
});

console.log('=== SERVER SCRIPT COMPLETED ===');
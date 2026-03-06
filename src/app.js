const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import database connection
const connectDB = require('./config/database');

// Import models (to ensure they are registered)
// Import all models
require('./models/User');
require('./models/Property');
require('./models/Booking');
require('./models/Inquiry');
require('./models/Review');
require('./models/Favorite');
require('./models/Report');
require('./models/Notification');
require('./models/Blog');
require('./models/Contact');
require('./models/Subscriber');
// Import middleware
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { httpLogger } = require('./middleware/logger');
const sanitizer = require('./middleware/sanitizer');
const rateLimiters = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const inquiryRoutes = require('./routes/inquiryRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const reportRoutes = require('./routes/reportRoutes');
const adminRoutes = require('./routes/adminRoutes');
const publicRoutes = require('./routes/publicRoutes');
const blogRoutes = require('./routes/blogRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');
const contactRoutes = require('./routes/contactRoutes');
const testRoutes = require('./routes/testRoutes');

// Import jobs
const emailJobs = require('./jobs/emailJobs');
const cleanupJobs = require('./jobs/cleanupJobs');
const notificationJobs = require('./jobs/notificationJobs');

// Import services
const emailService = require('./services/emailService');
const cacheService = require('./services/cacheService');

// Initialize express app
const app = express();

// ============================================
// Database Connection (Automatically creates collections)
// ============================================
connectDB();

// ============================================
// Service Initialization
// ============================================
(async () => {
  try {
    await emailService.initialize();
    await cacheService.initialize();
    
    if (process.env.NODE_ENV === 'production') {
      emailJobs.initialize();
      cleanupJobs.initialize();
      notificationJobs.initialize();
    }
    
    console.log('✅ All services initialized');
  } catch (error) {
    console.error('❌ Service initialization failed:', error.message);
  }
})();

// ============================================
// Global Middleware
// ============================================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3000'],
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(httpLogger);
app.use(sanitizer);

// Rate limiting
app.use('/api', rateLimiters.general);
app.use('/api/auth', rateLimiters.auth);
app.use('/api/properties', rateLimiters.search);
app.use('/api/uploads', rateLimiters.upload);

// ============================================
// API Routes
// ============================================
app.get('/health', (req, res) => {
  const collections = mongoose.connection.db.listCollections().toArray();
  
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    collections: collections.map(c => c.name)
  });
});

app.get('/version', (req, res) => {
  res.json({
    success: true,
    version: process.env.npm_package_version || '1.0.0',
    name: 'Kirada Guryaha API'
  });
});

// Mount all routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/newsletter', subscriberRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/test', testRoutes);

// ============================================
// Error Handling
// ============================================
app.use(notFound);
app.use(errorHandler);

// ============================================
// Graceful Shutdown
// ============================================
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

async function gracefulShutdown() {
  console.log('\n🛑 Shutting down server...');
  
  try {
    emailJobs.stopAll?.();
    cleanupJobs.stopAll?.();
    notificationJobs.stopAll?.();
  } catch (error) {
    console.error('Error stopping jobs:', error.message);
  }
  
  try {
    await cacheService.close?.();
  } catch (error) {
    console.error('Error closing cache:', error.message);
  }
  
  try {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('Error closing database:', error.message);
  }
  
  process.exit(0);
}

module.exports = app;
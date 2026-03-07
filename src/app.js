// src/app.js - FULL VERSION
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const mongoose = require('mongoose');

// Import middleware
const { protect, optionalAuth } = require('./middleware/auth');
const { authorize } = require('./middleware/roleCheck');
const { httpLogger, requestLogger } = require('./middleware/logger');
const sanitizer = require('./middleware/sanitizer');
const rateLimiters = require('./middleware/rateLimiter');
const { errorHandler, notFound } = require('./middleware/errorHandler');
const { uploadSingle, uploadMultiple } = require('./middleware/upload');
const validate = require('./middleware/validation');

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

// Import controllers (for direct route mounting)
const publicController = require('./controllers/publicController');

// Import constants
const { APP_NAME, HTTP_STATUS, API_PREFIX } = require('./constants/index');

// Initialize express app
const app = express();

// ============================================
// Global Middleware
// ============================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  dnsPrefetchControl: { allow: true }
}));

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// MongoDB sanitization (prevent NoSQL injection)
app.use(mongoSanitize());

// Custom sanitizer (XSS prevention)
app.use(sanitizer);

// Logging
app.use(httpLogger);
app.use(requestLogger);

// ============================================
// Rate Limiting
// ============================================

// Apply rate limiting to all routes
app.use('/api', rateLimiters.general);

// Stricter rate limiting for specific routes
app.use('/api/auth', rateLimiters.auth);
app.use('/api/uploads', rateLimiters.upload);
app.use('/api/properties', rateLimiters.search);
app.use('/api/admin', rateLimiters.admin);

// ============================================
// Health Check & Info Routes
// ============================================

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const collections = mongoose.connection.db ? 
      await mongoose.connection.db.listCollections().toArray() : [];
    const collectionNames = collections.map(c => c.name);
    
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      collections: collectionNames,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      collections: [],
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Version endpoint
app.get('/version', (req, res) => {
  res.json({
    success: true,
    version: process.env.npm_package_version || '1.0.0',
    name: APP_NAME || 'Kirada Guryaha API',
    description: 'Rental Property Platform API - Mogadishu District'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: `${APP_NAME || 'Kirada Guryaha'} API`,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    documentation: '/api-docs (coming soon)',
    endpoints: {
      health: '/health',
      version: '/version',
      public: '/api/public',
      auth: '/api/auth',
      properties: '/api/properties',
      bookings: '/api/bookings',
      inquiries: '/api/inquiries',
      reviews: '/api/reviews',
      users: '/api/users',
      blogs: '/api/blogs',
      contact: '/api/contact',
      subscribers: '/api/subscribers',
      notifications: '/api/notifications',
      reports: '/api/reports',
      admin: '/api/admin',
      test: '/api/test',
      setup: '/api/setup-db',
      collections: '/api/collections'
    }
  });
});

// ============================================
// Public Routes (Direct Mount)
// ============================================

app.get('/api/public/districts', publicController.getDistricts);
app.get('/api/public/districts/:id', publicController.getDistrictDetails);
app.get('/api/public/property-types', publicController.getPropertyTypes);
app.get('/api/public/amenities', publicController.getAmenities);
app.get('/api/public/faqs', publicController.getFaqs);
app.get('/api/public/market-overview', publicController.getMarketOverview);
app.get('/api/public/stats', publicController.getPlatformStats);
app.get('/api/public/contact', publicController.getContactInfo);
app.get('/api/public/about', publicController.getAboutInfo);
app.get('/api/public/version', publicController.getVersion);
app.get('/api/public/health', publicController.healthCheck);
app.get('/api/public/search', publicController.globalSearch);

// ============================================
// Mount All Route Modules
// ============================================

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/inquiries', inquiryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/newsletter', subscriberRoutes); // Alias for subscribers
app.use('/api/contact', contactRoutes);
app.use('/api/test', testRoutes);

// ============================================
// Database Setup Routes (Optional)
// ============================================

app.get('/api/setup-db', async (req, res) => {
  try {
    const { setupDatabase } = require('./config/database');
    const results = await setupDatabase();
    res.json({
      success: true,
      message: 'Database setup completed',
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/collections', async (req, res) => {
  try {
    if (!mongoose.connection.db) {
      return res.status(500).json({
        success: false,
        error: 'Database not connected'
      });
    }
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const stats = {};
    
    for (const colName of collectionNames) {
      const count = await db.collection(colName).countDocuments();
      stats[colName] = {
        documentCount: count
      };
    }
    
    res.json({
      success: true,
      totalCollections: collectionNames.length,
      collections: collectionNames,
      stats: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// ============================================
// Error Handling Middleware
// ============================================

// 404 handler for undefined routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;

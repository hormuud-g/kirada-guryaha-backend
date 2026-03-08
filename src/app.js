// src/app.js - FULL VERSION WITH SWAGGER
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

// Import controllers (for direct route mounting)
const publicController = require('./controllers/publicController');

// Import constants
const { APP_NAME, HTTP_STATUS } = require('./constants/index');

// ============================================
// Swagger Documentation
// ============================================
const { swaggerUi, swaggerUiOptions, specs } = require('./config/swagger');

// Initialize express app
const app = express();

// ============================================
// Global Middleware
// ============================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration - Allow all for Postman testing
app.use(cors({
  origin: '*',
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

// MongoDB sanitization
app.use(mongoSanitize());
app.use(sanitizer);

// Logging
app.use(httpLogger);
app.use(requestLogger);

// ============================================
// Rate Limiting (Commented for Postman testing)
// ============================================
// app.use('/api', rateLimiters.general);
// app.use('/api/auth', rateLimiters.auth);
// app.use('/api/uploads', rateLimiters.upload);
// app.use('/api/admin', rateLimiters.admin);

// ============================================
// SWAGGER DOCUMENTATION ROUTES
// ============================================

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerUiOptions));

// Swagger JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(specs);
});

// Swagger YAML
app.get('/api-docs.yaml', (req, res) => {
  const yaml = require('js-yaml');
  res.setHeader('Content-Type', 'text/yaml');
  res.send(yaml.dump(specs));
});

// Redirect to Swagger UI
app.get('/docs', (req, res) => {
  res.redirect('/api-docs');
});

// ============================================
// HEALTH CHECK ENDPOINTS
// ============================================

// Health check
app.get('/health', async (req, res) => {
  try {
    const collections = mongoose.connection.db ? 
      await mongoose.connection.db.listCollections().toArray() : [];
    
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      collections: collections.map(c => c.name),
      swagger: '/api-docs',
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.json({
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      swagger: '/api-docs',
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Version
app.get('/version', (req, res) => {
  res.json({
    success: true,
    version: process.env.npm_package_version || '1.0.0',
    name: APP_NAME || 'Kirada Guryaha API',
    swagger: '/api-docs'
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: `${APP_NAME || 'Kirada Guryaha'} API`,
    version: process.env.npm_package_version || '1.0.0',
    documentation: {
      swagger: '/api-docs',
      endpoints: '/api/public/endpoints',
      postman: 'http://localhost:5000/api/public/endpoints'
    }
  });
});

// ============================================
// POSTMAN HELPERS - List all endpoints
// ============================================

app.get('/api/public/endpoints', (req, res) => {
  const baseUrl = `${req.protocol}://${req.get('host')}`;
  
  const endpoints = {
    server: {
      health: { url: '/health', method: 'GET', description: 'Server health check' },
      version: { url: '/version', method: 'GET', description: 'API version' },
      swagger: { url: '/api-docs', method: 'GET', description: 'Swagger UI Documentation' },
      swaggerJson: { url: '/api-docs.json', method: 'GET', description: 'Swagger JSON spec' },
      docs: { url: '/docs', method: 'GET', description: 'Redirect to Swagger UI' }
    },
    public: {
      districts: { url: '/api/public/districts', method: 'GET', description: 'Get all Mogadishu districts' },
      districtById: { url: '/api/public/districts/:id', method: 'GET', description: 'Get district by ID' },
      propertyTypes: { url: '/api/public/property-types', method: 'GET', description: 'Get all property types' },
      amenities: { url: '/api/public/amenities', method: 'GET', description: 'Get all amenities' },
      faqs: { url: '/api/public/faqs', method: 'GET', description: 'Get FAQs' },
      stats: { url: '/api/public/stats', method: 'GET', description: 'Get platform statistics' },
      contact: { url: '/api/public/contact', method: 'GET', description: 'Get contact information' },
      about: { url: '/api/public/about', method: 'GET', description: 'Get about information' },
      search: { url: '/api/public/search?q=query', method: 'GET', description: 'Global search' }
    },
    auth: {
      register: { url: '/api/auth/register', method: 'POST', description: 'Register new user' },
      login: { url: '/api/auth/login', method: 'POST', description: 'Login user' },
      me: { url: '/api/auth/me', method: 'GET', description: 'Get current user', auth: 'Bearer Token' },
      profile: { url: '/api/auth/profile', method: 'PUT', description: 'Update profile', auth: 'Bearer Token' },
      changePassword: { url: '/api/auth/change-password', method: 'POST', description: 'Change password', auth: 'Bearer Token' },
      logout: { url: '/api/auth/logout', method: 'POST', description: 'Logout', auth: 'Bearer Token' }
    },
    properties: {
      getAll: { url: '/api/properties', method: 'GET', description: 'Get all properties' },
      getOne: { url: '/api/properties/:id', method: 'GET', description: 'Get property by ID' },
      create: { url: '/api/properties', method: 'POST', description: 'Create property', auth: 'Bearer Token (Landlord)' },
      update: { url: '/api/properties/:id', method: 'PUT', description: 'Update property', auth: 'Bearer Token' },
      delete: { url: '/api/properties/:id', method: 'DELETE', description: 'Delete property', auth: 'Bearer Token' },
      search: { url: '/api/properties/search?q=query', method: 'GET', description: 'Search properties' },
      nearby: { url: '/api/properties/nearby?lat=2.0333&lng=45.3333&radius=5000', method: 'GET', description: 'Get nearby properties' },
      priceComparison: { url: '/api/properties/price-comparison', method: 'GET', description: 'Price comparison' },
      favorite: { url: '/api/properties/:id/favorite', method: 'POST', description: 'Toggle favorite', auth: 'Bearer Token' }
    },
    bookings: {
      create: { url: '/api/bookings', method: 'POST', description: 'Create booking', auth: 'Bearer Token' },
      getAll: { url: '/api/bookings', method: 'GET', description: 'Get user bookings', auth: 'Bearer Token' },
      getOne: { url: '/api/bookings/:id', method: 'GET', description: 'Get booking by ID', auth: 'Bearer Token' },
      confirm: { url: '/api/bookings/:id/confirm', method: 'PUT', description: 'Confirm booking', auth: 'Bearer Token (Landlord)' },
      cancel: { url: '/api/bookings/:id/cancel', method: 'PUT', description: 'Cancel booking', auth: 'Bearer Token' },
      complete: { url: '/api/bookings/:id/complete', method: 'PUT', description: 'Complete booking', auth: 'Bearer Token' }
    },
    inquiries: {
      create: { url: '/api/inquiries', method: 'POST', description: 'Create inquiry', auth: 'Bearer Token' },
      getAll: { url: '/api/inquiries', method: 'GET', description: 'Get user inquiries', auth: 'Bearer Token' },
      getOne: { url: '/api/inquiries/:id', method: 'GET', description: 'Get inquiry by ID', auth: 'Bearer Token' },
      reply: { url: '/api/inquiries/:id/reply', method: 'POST', description: 'Reply to inquiry', auth: 'Bearer Token' },
      close: { url: '/api/inquiries/:id/close', method: 'PUT', description: 'Close inquiry', auth: 'Bearer Token' }
    },
    reviews: {
      create: { url: '/api/properties/:propertyId/reviews', method: 'POST', description: 'Create review', auth: 'Bearer Token' },
      getPropertyReviews: { url: '/api/properties/:propertyId/reviews', method: 'GET', description: 'Get property reviews' },
      helpful: { url: '/api/reviews/:id/helpful', method: 'POST', description: 'Mark review helpful', auth: 'Bearer Token' },
      reply: { url: '/api/reviews/:id/reply', method: 'POST', description: 'Reply to review', auth: 'Bearer Token (Landlord)' }
    },
    users: {
      getById: { url: '/api/users/:id', method: 'GET', description: 'Get user by ID' },
      getProperties: { url: '/api/users/:id/properties', method: 'GET', description: 'Get user properties' },
      getReviews: { url: '/api/users/:id/reviews', method: 'GET', description: 'Get user reviews' },
      favorites: { url: '/api/users/favorites', method: 'GET', description: 'Get user favorites', auth: 'Bearer Token' }
    },
    blogs: {
      getAll: { url: '/api/blogs', method: 'GET', description: 'Get all blogs' },
      getOne: { url: '/api/blogs/:id', method: 'GET', description: 'Get blog by ID' },
      create: { url: '/api/blogs', method: 'POST', description: 'Create blog', auth: 'Bearer Token (Admin)' }
    },
    contact: {
      submit: { url: '/api/contact', method: 'POST', description: 'Submit contact form' },
      getAll: { url: '/api/contact', method: 'GET', description: 'Get all contacts', auth: 'Bearer Token (Admin)' }
    },
    subscribers: {
      subscribe: { url: '/api/subscribers', method: 'POST', description: 'Subscribe to newsletter' },
      unsubscribe: { url: '/api/subscribers/:email', method: 'DELETE', description: 'Unsubscribe' }
    },
    admin: {
      users: { url: '/api/admin/users', method: 'GET', description: 'Get all users', auth: 'Bearer Token (Admin)' },
      pendingProperties: { url: '/api/admin/properties/pending', method: 'GET', description: 'Get pending properties', auth: 'Bearer Token (Admin)' },
      stats: { url: '/api/admin/stats', method: 'GET', description: 'Get system stats', auth: 'Bearer Token (Admin)' }
    },
    database: {
      setup: { url: '/api/setup-db', method: 'GET', description: 'Setup database with sample data' },
      collections: { url: '/api/collections', method: 'GET', description: 'List all collections' }
    }
  };
  
  res.json({
    success: true,
    message: 'All available endpoints',
    baseUrl,
    swagger: `${baseUrl}/api-docs`,
    endpoints
  });
});

// ============================================
// PUBLIC ROUTES
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
// MOUNT ROUTE MODULES
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
app.use('/api/contact', contactRoutes);

// ============================================
// DATABASE SETUP ROUTES
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
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/collections', async (req, res) => {
  try {
    if (!mongoose.connection.db) {
      return res.status(500).json({ success: false, error: 'Database not connected' });
    }
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    const stats = {};
    for (const name of collectionNames) {
      const count = await mongoose.connection.db.collection(name).countDocuments();
      stats[name] = count;
    }
    
    res.json({
      success: true,
      collections: collectionNames,
      stats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// ERROR HANDLING
// ============================================

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

module.exports = app;

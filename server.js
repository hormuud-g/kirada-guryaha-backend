// server.js - ROOT DIRECTORY (FIXED)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const path = require('path');
const dotenv = require('dotenv');
const http = require('http');
const rateLimit = require('express-rate-limit');

// Load environment variables
dotenv.config();

// Create Express app
const app = express();
const server = http.createServer(app);

// ============================================
// Check if src directory exists before importing
// ============================================
const fs = require('fs');
let MOGADISHU_DISTRICTS = [];
let PROPERTY_TYPES = [];
let AMENITIES = [];
let APP_NAME = 'Kirada Guryaha';
let APP_VERSION = '1.0.0';
let HTTP_STATUS = { OK: 200, CREATED: 201, BAD_REQUEST: 400, NOT_FOUND: 404, SERVER_ERROR: 500 };
let ERROR = { RATE_LIMIT_EXCEEDED: 'Too many requests' };
let SUCCESS = { OPERATION_SUCCESSFUL: 'Success' };
let VALIDATION = { MIN_LENGTH: '{{field}} must be at least {{min}} characters' };

// Try to load constants from external files if they exist
try {
  if (fs.existsSync('./src/constants/districts.js')) {
    const districtsModule = require('./src/constants/districts');
    MOGADISHU_DISTRICTS = districtsModule.MOGADISHU_DISTRICTS || [];
  }
} catch (err) {
  console.log('⚠️ Could not load districts constants, using defaults');
}

try {
  if (fs.existsSync('./src/constants/property.js')) {
    const propertyModule = require('./src/constants/property');
    PROPERTY_TYPES = propertyModule.PROPERTY_TYPES || [];
    AMENITIES = propertyModule.AMENITIES || [];
  }
} catch (err) {
  console.log('⚠️ Could not load property constants, using defaults');
}

try {
  if (fs.existsSync('./src/constants/index.js')) {
    const indexModule = require('./src/constants/index');
    APP_NAME = indexModule.APP_NAME || APP_NAME;
    APP_VERSION = indexModule.APP_VERSION || APP_VERSION;
    HTTP_STATUS = indexModule.HTTP_STATUS || HTTP_STATUS;
  }
} catch (err) {
  console.log('⚠️ Could not load index constants, using defaults');
}

try {
  if (fs.existsSync('./src/constants/messages.js')) {
    const messagesModule = require('./src/constants/messages');
    ERROR = messagesModule.ERROR || ERROR;
    SUCCESS = messagesModule.SUCCESS || SUCCESS;
    VALIDATION = messagesModule.VALIDATION || VALIDATION;
  }
} catch (err) {
  console.log('⚠️ Could not load messages constants, using defaults');
}

// If no districts loaded, use default list
if (MOGADISHU_DISTRICTS.length === 0) {
  MOGADISHU_DISTRICTS = [
    { id: 'hodan', name: 'Hodan', somali: 'Hodan', zone: 'South' },
    { id: 'waberi', name: 'Waberi', somali: 'Waberi', zone: 'South' },
    { id: 'karaan', name: 'Karaan', somali: 'Karaan', zone: 'North' },
    { id: 'shangani', name: 'Shangani', somali: 'Shangaani', zone: 'Coastal' },
    { id: 'yaaqshiid', name: 'Yaaqshiid', somali: 'Yaaqshiid', zone: 'North' },
    { id: 'dharkenley', name: 'Dharkenley', somali: 'Dharkenley', zone: 'West' },
    { id: 'helwa', name: 'Heliwa', somali: 'Heliwa', zone: 'North' }
  ];
}

// If no property types loaded, use default list
if (PROPERTY_TYPES.length === 0) {
  PROPERTY_TYPES = ['apartment', 'house', 'room', 'office', 'shop', 'land', 'villa'];
}

// If no amenities loaded, use default list
if (AMENITIES.length === 0) {
  AMENITIES = ['wifi', 'parking', 'security', 'ac', 'furnished', 'kitchen', 'balcony'];
}

// ============================================
// Rate Limiting Configuration
// ============================================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { success: false, message: ERROR.RATE_LIMIT_EXCEEDED || 'Too many requests, please try again later.' }
});

const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 attempts per hour
  message: { success: false, message: 'Too many authentication attempts, please try again later.' }
});

// ============================================
// Middleware
// ============================================

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.mkdirSync(path.join(uploadsDir, 'properties'), { recursive: true });
  fs.mkdirSync(path.join(uploadsDir, 'profiles'), { recursive: true });
  fs.mkdirSync(path.join(uploadsDir, 'documents'), { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// MongoDB sanitization (prevent NoSQL injection)
app.use(mongoSanitize());

// Rate limiting
app.use('/api', limiter);
app.use('/api/auth', authLimiter);

// Simple request logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ============================================
// Database Connection
// ============================================
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kirada_guryaha';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    // Auto setup database after connection
    setTimeout(() => setupDatabase(), 2000);
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
  });

// ============================================
// Database Setup Function
// ============================================
async function setupDatabase() {
  try {
    console.log('\n🔄 Running database setup...');
    
    if (!mongoose.connection.db) {
      console.log('⏳ Database not ready yet');
      return;
    }
    
    const db = mongoose.connection.db;
    const collections = [
      'users', 'properties', 'bookings', 'inquiries', 'reviews',
      'favorites', 'reports', 'notifications', 'blogs', 'subscribers', 'contacts'
    ];
    
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map(c => c.name);
    
    for (const collection of collections) {
      if (!existingNames.includes(collection)) {
        await db.createCollection(collection);
        console.log(`✅ Created collection: ${collection}`);
      }
    }
    
    // Create admin user if no users exist
    const usersCount = await db.collection('users').countDocuments();
    if (usersCount === 0) {
      try {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        
        await db.collection('users').insertOne({
          name: 'Admin User',
          email: 'admin@kirada.com',
          phone: '+252612345678',
          passwordHash: hashedPassword,
          role: 'admin',
          isVerified: true,
          isEmailVerified: true,
          status: 'active',
          createdAt: new Date()
        });
        console.log('✅ Created admin user');
        
        // Create test tenant
        const tenantPassword = await bcrypt.hash('tenant123', salt);
        await db.collection('users').insertOne({
          name: 'Test Tenant',
          email: 'tenant@example.com',
          phone: '+252612345679',
          passwordHash: tenantPassword,
          role: 'tenant',
          isVerified: true,
          isEmailVerified: true,
          status: 'active',
          createdAt: new Date()
        });
        console.log('✅ Created test tenant');
        
        // Create test landlord
        const landlordPassword = await bcrypt.hash('landlord123', salt);
        await db.collection('users').insertOne({
          name: 'Test Landlord',
          email: 'landlord@example.com',
          phone: '+252612345680',
          passwordHash: landlordPassword,
          role: 'landlord',
          isVerified: true,
          isEmailVerified: true,
          status: 'active',
          verificationLevel: 'verified',
          createdAt: new Date()
        });
        console.log('✅ Created test landlord');
      } catch (err) {
        console.error('❌ Error creating users:', err.message);
      }
    }
    
    console.log('✅ Database setup completed\n');
  } catch (error) {
    console.error('❌ Database setup error:', error.message);
  }
}

// ============================================
// Routes
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Version
app.get('/version', (req, res) => {
  res.json({
    success: true,
    version: APP_VERSION,
    name: APP_NAME
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: `${APP_NAME} API`,
    version: APP_VERSION,
    endpoints: {
      health: '/health',
      version: '/version',
      public: '/api/public',
      test: '/api/test'
    }
  });
});

// Test endpoint
app.get('/api/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'API is working',
    timestamp: new Date()
  });
});

// Test users endpoint
app.get('/api/test/users', async (req, res) => {
  try {
    if (!mongoose.connection.db) {
      return res.status(500).json({ success: false, message: 'Database not connected' });
    }
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    let users = [];
    if (collectionNames.includes('users')) {
      users = await mongoose.connection.db.collection('users').find().toArray();
      // Remove password hashes from response
      users = users.map(u => {
        const { passwordHash, ...userWithoutPassword } = u;
        return userWithoutPassword;
      });
    }
    
    res.json({ 
      success: true, 
      count: users.length,
      collections: collectionNames,
      data: users 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// Public Routes
// ============================================

// Get all districts
app.get('/api/public/districts', (req, res) => {
  res.json({ 
    success: true, 
    count: MOGADISHU_DISTRICTS.length,
    data: MOGADISHU_DISTRICTS 
  });
});

// Get district by ID
app.get('/api/public/districts/:id', (req, res) => {
  const { id } = req.params;
  const district = MOGADISHU_DISTRICTS.find(d => d.id === id);
  
  if (!district) {
    return res.status(HTTP_STATUS.NOT_FOUND || 404).json({ 
      success: false, 
      message: 'District not found' 
    });
  }
  
  res.json({ success: true, data: district });
});

// Get property types
app.get('/api/public/property-types', (req, res) => {
  res.json({ 
    success: true, 
    count: PROPERTY_TYPES.length,
    data: PROPERTY_TYPES 
  });
});

// Get amenities
app.get('/api/public/amenities', (req, res) => {
  res.json({ 
    success: true, 
    count: AMENITIES.length,
    data: AMENITIES 
  });
});

// Get FAQs
app.get('/api/public/faqs', (req, res) => {
  const faqs = [
    {
      category: 'General',
      questions: [
        { question: 'What is Kirada Guryaha?', answer: 'Kirada Guryaha is a rental property platform for Mogadishu.' },
        { question: 'Is it free?', answer: 'Yes, it is completely free for both tenants and landlords.' }
      ]
    },
    {
      category: 'For Tenants',
      questions: [
        { question: 'How do I search for properties?', answer: 'You can search using filters like district, price range, and property type.' }
      ]
    }
  ];
  res.json({ success: true, data: faqs });
});

// Contact info
app.get('/api/public/contact', (req, res) => {
  res.json({
    success: true,
    data: {
      email: process.env.CONTACT_EMAIL || 'cabdirahmanjmaxamad@gmail.com',
      phone: process.env.CONTACT_PHONE || '+252 61 9655335',
      address: 'Mogadishu, Somalia'
    }
  });
});

// About info
app.get('/api/public/about', (req, res) => {
  res.json({
    success: true,
    data: {
      name: APP_NAME,
      description: 'Mogadishu\'s Premier Rental Property Platform',
      version: APP_VERSION,
      founded: 2024
    }
  });
});

// Platform stats
app.get('/api/public/stats', async (req, res) => {
  try {
    if (!mongoose.connection.db) {
      return res.json({
        success: true,
        data: {
          collections: {},
          totalDocuments: 0,
          districts: MOGADISHU_DISTRICTS.length,
          propertyTypes: PROPERTY_TYPES.length,
          amenities: AMENITIES.length
        }
      });
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
      data: {
        collections: stats,
        totalDocuments: Object.values(stats).reduce((a, b) => a + b, 0),
        districts: MOGADISHU_DISTRICTS.length,
        propertyTypes: PROPERTY_TYPES.length,
        amenities: AMENITIES.length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Global search
app.get('/api/public/search', (req, res) => {
  const { q, type = 'all' } = req.query;
  
  if (!q || q.length < 2) {
    return res.status(HTTP_STATUS.BAD_REQUEST || 400).json({ 
      success: false, 
      message: 'Search query must be at least 2 characters' 
    });
  }
  
  const results = {};
  
  if (type === 'all' || type === 'districts') {
    results.districts = MOGADISHU_DISTRICTS.filter(d => 
      d.name.toLowerCase().includes(q.toLowerCase()) ||
      (d.somali && d.somali.toLowerCase().includes(q.toLowerCase()))
    );
  }
  
  if (type === 'all' || type === 'properties') {
    results.properties = [
      { id: 1, title: 'Apartment in Hodan', price: 350 },
      { id: 2, title: 'House in Karaan', price: 500 }
    ];
  }
  
  res.json({ success: true, data: results });
});

// ============================================
// Database Setup Route
// ============================================
app.get('/api/setup-db', async (req, res) => {
  try {
    await setupDatabase();
    res.json({
      success: true,
      message: 'Database setup completed'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Collections list
app.get('/api/collections', async (req, res) => {
  try {
    if (!mongoose.connection.db) {
      return res.status(500).json({ success: false, message: 'Database not connected' });
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
      stats: stats
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================
// 404 Handler
// ============================================
app.use((req, res) => {
  res.status(HTTP_STATUS.NOT_FOUND || 404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ============================================
// Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(HTTP_STATUS.SERVER_ERROR || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                    ${APP_NAME} API - RUNNING                           ║
╠══════════════════════════════════════════════════════════════════════╣
║  Server:     http://localhost:${PORT}                                   ║
║  Health:     http://localhost:${PORT}/health                            ║
║  Version:    http://localhost:${PORT}/version                           ║
║  Setup DB:   http://localhost:${PORT}/api/setup-db                      ║
╠══════════════════════════════════════════════════════════════════════╣
║  Public:     /api/public/districts                                    ║
║  Public:     /api/public/property-types                               ║
║  Public:     /api/public/amenities                                    ║
║  Public:     /api/public/faqs                                         ║
║  Public:     /api/public/contact                                      ║
║  Public:     /api/public/about                                        ║
║  Public:     /api/public/stats                                        ║
║  Public:     /api/public/search                                       ║
╠══════════════════════════════════════════════════════════════════════╣
║  Districts:  ${MOGADISHU_DISTRICTS.length} loaded from external file                ║
║  Property Types: ${PROPERTY_TYPES.length} loaded                               ║
║  Amenities:  ${AMENITIES.length} loaded                                    ║
╠══════════════════════════════════════════════════════════════════════╣
║  Database:   ${mongoose.connection.readyState === 1 ? '✅ Connected' : '❌ Disconnected'}                           ║
║  Environment: ${process.env.NODE_ENV || 'development'}                                            ║
╚══════════════════════════════════════════════════════════════════════╝
  `);
});

// ============================================
// Graceful Shutdown
// ============================================
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

function gracefulShutdown() {
  console.log('\n🛑 Shutting down server...');
  
  mongoose.connection.close()
    .then(() => {
      console.log('✅ Database connection closed');
      server.close(() => {
        console.log('✅ HTTP server closed');
        process.exit(0);
      });
    })
    .catch(err => {
      console.error('Error closing database:', err.message);
      process.exit(1);
    });
  
  setTimeout(() => {
    console.log('⚠️ Force exiting...');
    process.exit(1);
  }, 5000);
}

module.exports = app;

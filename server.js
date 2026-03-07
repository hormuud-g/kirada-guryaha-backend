// server.js - ROOT DIRECTORY (FULL CODE - AUTOMATIC RUN)
const mongoose = require('mongoose');
const http = require('http');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables
dotenv.config();

// Import app from src directory
const app = require('./src/app');

// ============================================
// Create Uploads Directory Automatically
// ============================================
const createUploadDirectories = () => {
  const uploadsDir = path.join(__dirname, 'uploads');
  const subDirs = ['properties', 'profiles', 'documents', 'temp'];
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✅ Created uploads directory');
  }
  
  subDirs.forEach(dir => {
    const dirPath = path.join(uploadsDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created uploads/${dir} directory`);
    }
  });
};

// Create upload directories
createUploadDirectories();

// Create HTTP server
const server = http.createServer(app);

// ============================================
// Database Connection Function
// ============================================
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kirada_guryaha', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// ============================================
// Database Setup Function (Automatic)
// ============================================
const setupDatabase = async () => {
  try {
    console.log('\n🔄 Auto database setup started...');
    
    if (mongoose.connection.readyState !== 1) {
      console.log('⏳ Database not ready yet');
      return;
    }
    
    const db = mongoose.connection.db;
    
    // List of collections to create
    const collections = [
      'users', 'properties', 'bookings', 'inquiries', 'reviews',
      'favorites', 'reports', 'notifications', 'blogs', 'subscribers', 'contacts'
    ];
    
    // Get existing collections
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map(c => c.name);
    
    // Create missing collections
    for (const collection of collections) {
      if (!existingNames.includes(collection)) {
        try {
          await db.createCollection(collection);
          console.log(`✅ Created collection: ${collection}`);
        } catch (err) {
          if (err.code !== 48) { // 48 = already exists
            console.log(`❌ Error creating ${collection}:`, err.message);
          }
        }
      }
    }
    
    // Create indexes for better performance
    try {
      const usersCollection = db.collection('users');
      await usersCollection.createIndex({ email: 1 }, { unique: true, sparse: true });
      await usersCollection.createIndex({ phone: 1 }, { unique: true, sparse: true });
      
      const propertiesCollection = db.collection('properties');
      await propertiesCollection.createIndex({ 'location.district': 1 });
      await propertiesCollection.createIndex({ price: 1 });
      await propertiesCollection.createIndex({ type: 1 });
      await propertiesCollection.createIndex({ status: 1 });
      
      const bookingsCollection = db.collection('bookings');
      await bookingsCollection.createIndex({ propertyId: 1 });
      await bookingsCollection.createIndex({ tenantId: 1 });
      await bookingsCollection.createIndex({ landlordId: 1 });
      await bookingsCollection.createIndex({ status: 1 });
      
      console.log('✅ Database indexes created');
    } catch (indexError) {
      console.log('⚠️ Index creation warning:', indexError.message);
    }
    
    // Create sample data if no users exist
    const usersCount = await db.collection('users').countDocuments();
    
    if (usersCount === 0) {
      try {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        
        // Create admin user
        const adminPassword = await bcrypt.hash('admin123', salt);
        await db.collection('users').insertOne({
          name: "Admin User",
          email: "admin@kirada.com",
          phone: "+252612345678",
          passwordHash: adminPassword,
          role: "admin",
          isVerified: true,
          isEmailVerified: true,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log('✅ Created admin user (admin@kirada.com / admin123)');
        
        // Create test tenant
        const tenantPassword = await bcrypt.hash('tenant123', salt);
        await db.collection('users').insertOne({
          name: "Test Tenant",
          email: "tenant@example.com",
          phone: "+252612345679",
          passwordHash: tenantPassword,
          role: "tenant",
          isVerified: true,
          isEmailVerified: true,
          status: "active",
          createdAt: new Date()
        });
        console.log('✅ Created test tenant (tenant@example.com / tenant123)');
        
        // Create test landlord
        const landlordPassword = await bcrypt.hash('landlord123', salt);
        await db.collection('users').insertOne({
          name: "Test Landlord",
          email: "landlord@example.com",
          phone: "+252612345680",
          passwordHash: landlordPassword,
          role: "landlord",
          isVerified: true,
          isEmailVerified: true,
          status: "active",
          verificationLevel: "verified",
          createdAt: new Date()
        });
        console.log('✅ Created test landlord (landlord@example.com / landlord123)');
        
        // Create sample property
        const landlord = await db.collection('users').findOne({ role: 'landlord' });
        
        if (landlord) {
          await db.collection('properties').insertOne({
            title: "Beautiful Apartment in Hodan",
            description: "A beautiful 2-bedroom apartment with modern amenities in the heart of Hodan district. This property features spacious rooms, modern kitchen, and secure parking.",
            price: 350,
            type: "apartment",
            bedrooms: 2,
            bathrooms: 1,
            size: 85,
            location: {
              district: "hodan",
              address: "Street 42, Hodan District",
              coordinates: { lat: 2.0333, lng: 45.3333 }
            },
            amenities: ["wifi", "parking", "security", "ac"],
            landlordId: landlord._id,
            status: "available",
            featured: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          console.log('✅ Created sample property');
        }
      } catch (sampleError) {
        console.log('⚠️ Sample data creation warning:', sampleError.message);
      }
    }
    
    console.log('✅ Auto database setup completed!\n');
    
  } catch (error) {
    console.error('❌ Auto database setup failed:', error.message);
  }
};

// ============================================
// Redis Connection (Optional)
// ============================================
const connectRedis = async () => {
  if (process.env.REDIS_ENABLED !== 'true') {
    return null;
  }

  try {
    const redis = require('redis');
    const redisClient = redis.createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis error:', err);
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    await redisClient.connect();
    app.set('redis', redisClient);
    return redisClient;
  } catch (error) {
    console.error('❌ Redis connection failed:', error.message);
    return null;
  }
};

// ============================================
// Socket.io Initialization
// ============================================
const initializeSocket = (server) => {
  try {
    const socketIO = require('socket.io');
    const io = socketIO(server, {
      cors: {
        origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : ['http://localhost:3000'],
        credentials: true
      }
    });

    io.on('connection', (socket) => {
      console.log(`🔌 New socket connection: ${socket.id}`);
      
      socket.on('disconnect', () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
      });
      
      socket.on('join-room', (room) => {
        socket.join(room);
        console.log(`Socket ${socket.id} joined room: ${room}`);
      });
    });

    app.set('io', io);
    console.log('✅ Socket.io initialized');
    return io;
  } catch (error) {
    console.error('❌ Socket.io initialization failed:', error.message);
    return null;
  }
};

// ============================================
// Email Service Initialization (Minimal)
// ============================================
const initializeEmailService = async () => {
  try {
    // Simple email service placeholder
    console.log('✅ Email service ready (placeholder)');
    return true;
  } catch (error) {
    console.error('❌ Email service initialization failed:', error.message);
    return false;
  }
};

// ============================================
// Initialize Everything Automatically
// ============================================
(async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Auto setup database (creates collections and sample data)
    await setupDatabase();
    
    // Connect to Redis (optional)
    if (process.env.REDIS_ENABLED === 'true') {
      await connectRedis();
    }
    
    // Initialize Socket.io
    initializeSocket(server);
    
    // Initialize Email Service
    await initializeEmailService();
    
    console.log('✅ All services initialized successfully');
    
  } catch (error) {
    console.error('❌ Server initialization failed:', error.message);
  }
})();

// ============================================
// Start Server
// ============================================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════════════════╗
║                    KIRADA GURYHA API - RUNNING                        ║
╠══════════════════════════════════════════════════════════════════════╣
║  Server:     http://localhost:${PORT}                                   ║
║  Health:     http://localhost:${PORT}/health                            ║
║  Version:    http://localhost:${PORT}/version                           ║
║  API Base:   http://localhost:${PORT}/api                              ║
╠══════════════════════════════════════════════════════════════════════╣
║  📌 MAIN ENDPOINTS                                                    ║
║  ├─ /api/public          - Public data (districts, types)            ║
║  ├─ /api/auth            - Login, Register                            ║
║  ├─ /api/properties      - Property CRUD                             ║
║  ├─ /api/bookings        - Booking CRUD                              ║
║  ├─ /api/users           - User management                           ║
║  ├─ /api/admin           - Admin dashboard                           ║
║  └─ /api/setup-db        - Manual database setup                     ║
╠══════════════════════════════════════════════════════════════════════╣
║  🔑 DEFAULT USERS (AUTO-CREATED)                                      ║
║  ├─ Admin:    admin@kirada.com / admin123                            ║
║  ├─ Tenant:   tenant@example.com / tenant123                         ║
║  └─ Landlord: landlord@example.com / landlord123                     ║
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

module.exports = { app, server };

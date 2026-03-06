const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/kirada_guryaha';

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('✅ MongoDB connected successfully');
    console.log('📁 Using database: kirada_guryaha');
})
.catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
});

// ============================================
// DATABASE SETUP FUNCTION
// ============================================
const setupDatabase = async () => {
    try {
        console.log('\n🔄 Auto database setup started...');
        
        const db = mongoose.connection.db;
        
        // List of collections
        const collections = [
            'users', 'properties', 'bookings', 'inquiries', 'reviews',
            'favorites', 'reports', 'notifications', 'blogs', 'subscribers', 'contacts'
        ];
        
        // Get existing collections
        const existingCollections = await db.listCollections().toArray();
        const existingNames = existingCollections.map(c => c.name);
        
        const results = {
            created: [],
            existing: [],
            sampleData: []
        };

        // Create collections
        for (const collection of collections) {
            if (!existingNames.includes(collection)) {
                try {
                    await db.createCollection(collection);
                    results.created.push(collection);
                    console.log(`✅ Created collection: ${collection}`);
                } catch (err) {
                    if (err.code === 48) {
                        results.existing.push(collection);
                    } else {
                        console.log(`❌ Error creating ${collection}:`, err.message);
                    }
                }
            } else {
                results.existing.push(collection);
                console.log(`⏩ Collection exists: ${collection}`);
            }
        }

        // Create admin user if none exists
        const usersCollection = db.collection('users');
        const userCount = await usersCollection.countDocuments();
        
        if (userCount === 0) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('admin123', salt);
            
            // await usersCollection.insertOne({
            //     name: "Admin User",
            //     email: "admin@kirada.com",
            //     phone: "+252612345678",
            //     passwordHash,
            //     role: "admin",
            //     isVerified: true,
            //     createdAt: new Date(),
            //     updatedAt: new Date()
            // });
            
            results.sampleData.push('Created admin user');
            console.log('✅ Created admin user');
        }

        console.log('✅ Auto database setup completed!');
        console.log(`📊 Created ${results.created.length} collections, ${results.existing.length} already existed\n`);
        
        return results;
        
    } catch (error) {
        console.error('❌ Auto database setup failed:', error.message);
    }
};

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is running',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Kirada Guryaha API',
        endpoints: {
            health: '/health',
            setup: '/api/setup-db',
            collections: '/api/collections'
        }
    });
});

// Manual setup route
app.get('/api/setup-db', async (req, res) => {
    try {
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

// Get all collections
app.get('/api/collections', async (req, res) => {
    try {
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
// START SERVER
// ============================================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║    Kirada Guryaha API Server          ║
║    Running on port: ${PORT}                ║
║    Health: http://localhost:${PORT}/health ║
║    Setup:  http://localhost:${PORT}/api/setup-db ║
╚════════════════════════════════════════╝
    `);
    
    // AUTO SETUP - HADDA WAXAY SHAQEYN DOONTAa
    console.log('🔄 Auto setup will run in 3 seconds...');
    
    setTimeout(async () => {
        console.log('⏰ Auto setup timer triggered...');
        await setupDatabase();
    }, 3000); // 3 seconds
});

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
    console.log('❌ Unhandled Rejection:', err.message);
    server.close(() => process.exit(1));
});

module.exports = app;
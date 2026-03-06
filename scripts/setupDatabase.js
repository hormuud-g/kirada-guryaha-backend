const mongoose = require('mongoose');
const connectDB = require('../config/db');

// Import all models
const Blog = require('../models/Blog');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');
const Favorite = require('../models/Favorite');
const Inquiry = require('../models/Inquiry');
const Notification = require('../models/Notification');
const Property = require('../models/Property');
const Report = require('../models/Report');
const Review = require('../models/Review');
const Subscriber = require('../models/Subscriber');
const User = require('../models/User');

const setupDatabase = async () => {
    try {
        console.log('🚀 Auto database setup started...');
        
        // Connect to database
        await connectDB();
        
        // Get all collections
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(col => col.name);
        
        console.log('📁 Existing collections:', collectionNames);
        
        const results = {
            created: [],
            existing: [],
            sampleData: []
        };

        // Model-ka iyo collection magacyada
        const models = [
            { name: 'Blog', model: Blog, collection: 'blogs' },
            { name: 'Booking', model: Booking, collection: 'bookings' },
            { name: 'Contact', model: Contact, collection: 'contacts' },
            { name: 'Favorite', model: Favorite, collection: 'favorites' },
            { name: 'Inquiry', model: Inquiry, collection: 'inquiries' },
            { name: 'Notification', model: Notification, collection: 'notifications' },
            { name: 'Property', model: Property, collection: 'properties' },
            { name: 'Report', model: Report, collection: 'reports' },
            { name: 'Review', model: Review, collection: 'reviews' },
            { name: 'Subscriber', model: Subscriber, collection: 'subscribers' },
            { name: 'User', model: User, collection: 'users' }
        ];

        // Hubi collection walba
        for (const item of models) {
            if (!collectionNames.includes(item.collection)) {
                // Samee collection
                await mongoose.connection.db.createCollection(item.collection);
                results.created.push(item.collection);
                console.log(`✅ Created collection: ${item.collection}`);
            } else {
                results.existing.push(item.collection);
                console.log(`⏩ Collection exists: ${item.collection}`);
            }
        }

        // Ku dar xog tijaabo ah (optional)
        const propertyCount = await Property.countDocuments();
        if (propertyCount === 0) {
            const sampleProperty = await Property.create({
                title: "Sample Property",
                description: "This is a sample property for testing",
                type: "apartment",
                price: 500,
                size: 120,
                bedrooms: 2,
                bathrooms: 1,
                location: {
                    district: "Hodan",
                    address: "Sample Address"
                },
                landlordId: new mongoose.Types.ObjectId(), // Will be replaced by real user
                status: "available"
            });
            results.sampleData.push('Added sample property');
            console.log('✅ Added sample property');
        }

        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('password123', salt);
            
        //     await User.create({
        //         name: "Admin User",
        //         email: "admin@kirada.com",
        //         phone: "+252612345678",
        //         passwordHash,
        //         role: "admin",
        //         isVerified: true,
        //         isEmailVerified: true,
        //         isPhoneVerified: true
        //     });
        //     results.sampleData.push('Added admin user');
        //     console.log('✅ Added admin user');
        // }

        console.log('✅ Auto database setup completed!');
        console.log(`📊 Created ${results.created.length} collections, ${results.existing.length} already existed`);
        
        return results;
        
    } catch (error) {
        console.error('❌ Auto database setup failed:', error.message);
        throw error;
    }
};

// Run if called directly
if (require.main === module) {
    setupDatabase()
        .then(() => {
            console.log('✅ Setup complete');
            process.exit(0);
        })
        .catch(err => {
            console.error('❌ Setup failed:', err);
            process.exit(1);
        });
}

module.exports = setupDatabase;
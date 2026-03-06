const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

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

// @desc    Get all collections info
// @route   GET /api/collections
// @access  Public
router.get('/collections', async (req, res) => {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(col => col.name);
        
        const stats = {};
        
        for (let colName of collectionNames) {
            const count = await mongoose.connection.db.collection(colName).countDocuments();
            stats[colName] = count;
        }
        
        res.json({
            success: true,
            totalCollections: collectionNames.length,
            collections: collectionNames,
            stats: stats
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @desc    Get data from any collection
// @route   GET /api/collection/:name
// @access  Public
router.get('/collection/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const { limit = 10 } = req.query;
        
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(col => col.name);
        
        if (!collectionNames.includes(name)) {
            return res.status(404).json({
                success: false,
                message: `Collection '${name}' not found`
            });
        }
        
        const data = await mongoose.connection.db
            .collection(name)
            .find({})
            .limit(parseInt(limit))
            .toArray();
        
        res.json({
            success: true,
            collection: name,
            count: data.length,
            data: data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// @desc    Create sample data for all collections
// @route   POST /api/create-sample-data
// @access  Public
router.post('/create-sample-data', async (req, res) => {
    try {
        const results = [];
        
        // Create sample user if none exists
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            const bcrypt = require('bcryptjs');
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash('password123', salt);
            
            await User.create({
                name: "Test User",
                email: "test@example.com",
                phone: "+252612345678",
                passwordHash,
                role: "tenant"
            });
            results.push("Created test user");
        }
        
        // Get a user ID for relationships
        const user = await User.findOne();
        
        // Create sample property if none exists
        const propertyCount = await Property.countDocuments();
        if (propertyCount === 0 && user) {
            await Property.create({
                title: "Beautiful Apartment in Hodan",
                description: "A beautiful apartment with modern amenities",
                type: "apartment",
                price: 500,
                size: 120,
                bedrooms: 2,
                bathrooms: 1,
                location: {
                    district: "Hodan",
                    address: "Street 21, Hodan"
                },
                landlordId: user._id,
                status: "available"
            });
            results.push("Created sample property");
        }
        
        res.json({
            success: true,
            message: "Sample data created",
            results
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
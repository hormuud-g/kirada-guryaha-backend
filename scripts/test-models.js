// scripts/test-models.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import all models
const User = require('../src/models/User');
const Property = require('../src/models/Property');
const Booking = require('../src/models/Booking');
const Inquiry = require('../src/models/Inquiry');
const Review = require('../src/models/Review');
const Favorite = require('../src/models/Favorite');
const Report = require('../src/models/Report');
const Notification = require('../src/models/Notification');
const Blog = require('../src/models/Blog');
const Subscriber = require('../src/models/Subscriber');
const Contact = require('../src/models/Contact');

const testModels = async () => {
  console.log('\n🔍 HUBINTA MODELS-KA...\n');
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kirada_guryaha');
    console.log('✅ MongoDB connected\n');

    // Model list with status
    const models = [
      { name: 'User', model: User, status: '❌' },
      { name: 'Property', model: Property, status: '❌' },
      { name: 'Booking', model: Booking, status: '❌' },
      { name: 'Inquiry', model: Inquiry, status: '❌' },
      { name: 'Review', model: Review, status: '❌' },
      { name: 'Favorite', model: Favorite, status: '❌' },
      { name: 'Report', model: Report, status: '❌' },
      { name: 'Notification', model: Notification, status: '❌' },
      { name: 'Blog', model: Blog, status: '❌' },
      { name: 'Subscriber', model: Subscriber, status: '❌' },
      { name: 'Contact', model: Contact, status: '❌' }
    ];

    // Test each model
    for (const item of models) {
      try {
        // Check if model exists and has schema
        if (item.model && item.model.schema) {
          // Get collection name
          const collectionName = item.model.collection.name;
          
          // Count documents in collection
          const count = await item.model.countDocuments();
          
          console.log(`✅ ${item.name.padEnd(12)} - Collection: ${collectionName.padEnd(15)} - Documents: ${count}`);
          item.status = '✅';
        } else {
          console.log(`❌ ${item.name.padEnd(12)} - Model not properly defined`);
        }
      } catch (error) {
        console.log(`❌ ${item.name.padEnd(12)} - Error: ${error.message}`);
      }
    }

    // Get all collections from database
    console.log('\n📁 COLLECTIONS IN DATABASE:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    if (collections.length === 0) {
      console.log('   No collections found. Create some data first!');
    } else {
      collections.forEach(col => {
        console.log(`   - ${col.name}`);
      });
    }

    // Summary
    const totalModels = models.length;
    const workingModels = models.filter(m => m.status === '✅').length;
    
    console.log('\n📊 SUMMARY:');
    console.log(`   Total Models: ${totalModels}`);
    console.log(`   Working: ${workingModels}`);
    console.log(`   Issues: ${totalModels - workingModels}`);

    if (workingModels === totalModels) {
      console.log('\n🎉 ALL MODELS ARE WORKING CORRECTLY!');
    } else {
      console.log('\n⚠️ Some models have issues. Check above.');
    }

  } catch (error) {
    console.error('❌ Database connection error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
};

testModels();
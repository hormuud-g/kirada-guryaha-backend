// scripts/clear-data.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

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

const clearData = async () => {
  console.log('\n🗑️  CLEARING ALL DATA...\n');
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const results = await Promise.all([
      User.deleteMany({}),
      Property.deleteMany({}),
      Booking.deleteMany({}),
      Inquiry.deleteMany({}),
      Review.deleteMany({}),
      Favorite.deleteMany({}),
      Report.deleteMany({}),
      Notification.deleteMany({}),
      Blog.deleteMany({}),
      Subscriber.deleteMany({}),
      Contact.deleteMany({})
    ]);

    console.log('✅ All data cleared:');
    console.log(`   - Users: ${results[0].deletedCount} deleted`);
    console.log(`   - Properties: ${results[1].deletedCount} deleted`);
    console.log(`   - Bookings: ${results[2].deletedCount} deleted`);
    console.log(`   - Inquiries: ${results[3].deletedCount} deleted`);
    console.log(`   - Reviews: ${results[4].deletedCount} deleted`);
    console.log(`   - Favorites: ${results[5].deletedCount} deleted`);
    console.log(`   - Reports: ${results[6].deletedCount} deleted`);
    console.log(`   - Notifications: ${results[7].deletedCount} deleted`);
    console.log(`   - Blogs: ${results[8].deletedCount} deleted`);
    console.log(`   - Subscribers: ${results[9].deletedCount} deleted`);
    console.log(`   - Contacts: ${results[10].deletedCount} deleted`);

    console.log('\n✅ DATABASE CLEARED SUCCESSFULLY!\n');

  } catch (error) {
    console.error('\n❌ Error clearing data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');
  }
};

clearData();
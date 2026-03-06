// scripts/create-all-test-data.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

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

// Email configuration
const YOUR_EMAIL = 'abdirahmanmohamedabdulle10@gmail.com';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

// Send email notification
const sendEmailNotification = async (subject, message, data) => {
  try {
    const transporter = createTransporter();
    
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .data-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .data-table td { padding: 8px; border: 1px solid #ddd; }
        .data-table tr:nth-child(even) { background: #f2f2f2; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        .badge { 
          display: inline-block; 
          padding: 3px 8px; 
          border-radius: 3px; 
          color: white;
          font-size: 12px;
          font-weight: bold;
        }
        .badge-success { background: #4CAF50; }
        .badge-warning { background: #ff9800; }
        .badge-info { background: #2196F3; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Kirada Guryaha Test Data</h1>
        </div>
        <div class="content">
          <h2>${subject}</h2>
          <p>${message}</p>
          
          <h3>📊 Data Summary:</h3>
          <table class="data-table">
            ${Object.entries(data).map(([key, value]) => `
              <tr>
                <td><strong>${key}</strong></td>
                <td>${value}</td>
              </tr>
            `).join('')}
          </table>
          
          <p>✅ All test data has been successfully created in MongoDB.</p>
        </div>
        <div class="footer">
          <p>Kirada Guryaha - Rental Property Platform</p>
          <p>© ${new Date().getFullYear()} All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: `"Kirada Guryaha" <${process.env.EMAIL_FROM || 'noreply@kirada.com'}>`,
      to: YOUR_EMAIL,
      subject: subject,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent: ${info.messageId}`);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`📧 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed to send email:', error.message);
    return false;
  }
};

// Helper function to hash passwords
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Helper function to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0
  }).format(amount);
};

// Helper function to generate notification number
const generateNotificationNumber = () => {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `NOT${year}${month}${day}${random}`;
};

// Main function to create all test data
const createAllTestData = async () => {
  console.log('\n🚀 CREATING COMPLETE TEST DATA FOR ALL MODELS...\n');
  const startTime = Date.now();
  
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kirada_guryaha');
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Property.deleteMany({});
    await Booking.deleteMany({});
    await Inquiry.deleteMany({});
    await Review.deleteMany({});
    await Favorite.deleteMany({});
    await Report.deleteMany({});
    await Notification.deleteMany({});
    await Blog.deleteMany({});
    await Subscriber.deleteMany({});
    await Contact.deleteMany({});
    console.log('✅ Database cleared\n');

    // ============================================
    // 1. CREATE USERS (6 users)
    // ============================================
    console.log('📁 CREATING USERS...');
    
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@kirada.com',
      phone: '+252611111111',
      passwordHash: await hashPassword('Admin123'),
      role: 'admin',
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      profileImage: 'https://randomuser.me/api/portraits/men/1.jpg',
      bio: 'Platform administrator with 5 years experience',
      address: {
        street: '21 October Street',
        district: 'hodan',
        city: 'Mogadishu'
      }
    });
    console.log(`   ✅ Admin: ${admin.name} (${admin.email})`);

    const landlord1 = await User.create({
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@landlord.com',
      phone: '+252612345678',
      passwordHash: await hashPassword('Landlord123'),
      role: 'landlord',
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      profileImage: 'https://randomuser.me/api/portraits/men/2.jpg',
      bio: 'Property owner with 8 properties in Hodan and Karaan',
      address: {
        street: 'Hodan Street 45',
        district: 'hodan',
        city: 'Mogadishu'
      }
    });
    console.log(`   ✅ Landlord: ${landlord1.name}`);

    const landlord2 = await User.create({
      name: 'Fatima Ali',
      email: 'fatima.ali@landlord.com',
      phone: '+252612345679',
      passwordHash: await hashPassword('Landlord123'),
      role: 'landlord',
      isVerified: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      profileImage: 'https://randomuser.me/api/portraits/women/3.jpg',
      bio: 'Real estate investor with luxury properties in Shangani',
      address: {
        street: 'Shangani Beach Road',
        district: 'shangani',
        city: 'Mogadishu'
      }
    });
    console.log(`   ✅ Landlord: ${landlord2.name}`);

    const tenant1 = await User.create({
      name: 'Ali Yusuf',
      email: 'ali.yusuf@tenant.com',
      phone: '+252613456781',
      passwordHash: await hashPassword('Tenant123'),
      role: 'tenant',
      isVerified: true,
      isEmailVerified: true,
      profileImage: 'https://randomuser.me/api/portraits/men/4.jpg',
      bio: 'Software engineer looking for apartment near work'
    });
    console.log(`   ✅ Tenant: ${tenant1.name}`);

    const tenant2 = await User.create({
      name: 'Safia Mohamud',
      email: 'safia.mohamud@tenant.com',
      phone: '+252613456782',
      passwordHash: await hashPassword('Tenant123'),
      role: 'tenant',
      isVerified: true,
      isEmailVerified: true,
      profileImage: 'https://randomuser.me/api/portraits/women/5.jpg',
      bio: 'Teacher looking for family home'
    });
    console.log(`   ✅ Tenant: ${tenant2.name}`);

    const tenant3 = await User.create({
      name: 'Omar Farah',
      email: 'omar.farah@tenant.com',
      phone: '+252613456783',
      passwordHash: await hashPassword('Tenant123'),
      role: 'tenant',
      isVerified: true,
      isEmailVerified: true,
      profileImage: 'https://randomuser.me/api/portraits/men/6.jpg'
    });
    console.log(`   ✅ Tenant: ${tenant3.name}`);

    // ============================================
    // 2. CREATE PROPERTIES (6 properties)
    // ============================================
    console.log('\n📁 CREATING PROPERTIES...');

    const property1 = await Property.create({
      title: 'Spacious 2 Bedroom Apartment in Hodan',
      description: 'Beautiful modern apartment with stunning city views. Close to shopping malls, restaurants, and public transport. Features include high-speed WiFi, secure parking, and 24/7 security.',
      price: 350,
      type: 'apartment',
      bedrooms: 2,
      bathrooms: 1,
      size: 85,
      location: {
        district: 'hodan',
        address: 'Street 42, Hodan District',
        coordinates: { lat: 2.0333, lng: 45.3333 }
      },
      amenities: ['wifi', 'parking', 'security', 'water_tank', 'ac', 'furnished'],
      images: [{
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267',
        isPrimary: true
      }, {
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
        isPrimary: false
      }],
      landlordId: landlord1._id,
      status: 'available',
      featured: true,
      views: 145
    });
    console.log(`   ✅ Property: ${property1.title} - ${formatCurrency(property1.price)}/month`);

    const property2 = await Property.create({
      title: 'Modern House in Karaan with Garden',
      description: 'Spacious family house with large garden, perfect for families. Includes 4 bedrooms, 3 bathrooms, modern kitchen, and living area. Located in quiet neighborhood.',
      price: 550,
      type: 'house',
      bedrooms: 4,
      bathrooms: 3,
      size: 200,
      location: {
        district: 'karaan',
        address: 'Street 15, Karaan District',
        coordinates: { lat: 2.0667, lng: 45.3500 }
      },
      amenities: ['wifi', 'parking', 'security', 'generator', 'garden', 'furnished', 'cctv'],
      images: [{
        url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994',
        isPrimary: true
      }],
      landlordId: landlord1._id,
      status: 'available',
      views: 278
    });
    console.log(`   ✅ Property: ${property2.title} - ${formatCurrency(property2.price)}/month`);

    const property3 = await Property.create({
      title: 'Cozy Studio in Waberi',
      description: 'Perfect for single professionals, recently renovated studio with modern finishes. Includes kitchenette, bathroom, and small balcony.',
      price: 250,
      type: 'studio',
      bedrooms: 1,
      bathrooms: 1,
      size: 45,
      location: {
        district: 'waberi',
        address: 'Street 8, Waberi District',
        coordinates: { lat: 2.0333, lng: 45.3500 }
      },
      amenities: ['wifi', 'security', 'furnished', 'kitchen'],
      images: [{
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688',
        isPrimary: true
      }],
      landlordId: landlord2._id,
      status: 'available',
      views: 123
    });
    console.log(`   ✅ Property: ${property3.title} - ${formatCurrency(property3.price)}/month`);

    const property4 = await Property.create({
      title: 'Luxury Villa in Shangani with Ocean View',
      description: 'Beautiful villa with stunning ocean views, private pool and garden. Features 5 bedrooms, 4 bathrooms, modern kitchen, and large terrace.',
      price: 1200,
      type: 'villa',
      bedrooms: 5,
      bathrooms: 4,
      size: 350,
      location: {
        district: 'shangani',
        address: 'Coastal Road, Shangani',
        coordinates: { lat: 2.0333, lng: 45.3333 }
      },
      amenities: ['wifi', 'parking', 'security', 'generator', 'swimming_pool', 'gym', 'furnished', 'cctv'],
      images: [{
        url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811',
        isPrimary: true
      }],
      landlordId: landlord2._id,
      status: 'available',
      featured: true,
      views: 420
    });
    console.log(`   ✅ Property: ${property4.title} - ${formatCurrency(property4.price)}/month`);

    const property5 = await Property.create({
      title: 'Commercial Shop in Bakara Market',
      description: 'Prime location shop in Bakara Market. High foot traffic, perfect for retail business.',
      price: 800,
      type: 'shop',
      bedrooms: 0,
      bathrooms: 1,
      size: 60,
      location: {
        district: 'hawle-wadag',
        address: 'Bakara Market, Hawle Wadag',
        coordinates: { lat: 2.0333, lng: 45.3333 }
      },
      amenities: ['security', 'water_tank', 'generator'],
      images: [{
        url: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8',
        isPrimary: true
      }],
      landlordId: landlord1._id,
      status: 'available',
      views: 89
    });
    console.log(`   ✅ Property: ${property5.title} - ${formatCurrency(property5.price)}/month`);

    const property6 = await Property.create({
      title: '2 Bedroom Apartment in Yaaqshiid',
      description: 'Affordable apartment in developing area. Good for small family.',
      price: 280,
      type: 'apartment',
      bedrooms: 2,
      bathrooms: 1,
      size: 75,
      location: {
        district: 'yaaqshiid',
        address: 'Street 23, Yaaqshiid',
        coordinates: { lat: 2.0500, lng: 45.3500 }
      },
      amenities: ['wifi', 'security', 'water_tank'],
      images: [{
        url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb',
        isPrimary: true
      }],
      landlordId: landlord2._id,
      status: 'pending',
      views: 34
    });
    console.log(`   ✅ Property: ${property6.title} - ${formatCurrency(property6.price)}/month`);

    // ============================================
    // 3. CREATE BOOKINGS (5 bookings)
    // ============================================
    console.log('\n📁 CREATING BOOKINGS...');

    const booking1 = await Booking.create({
      bookingNumber: 'BOK' + Date.now() + '1',
      propertyId: property1._id,
      tenantId: tenant1._id,
      landlordId: landlord1._id,
      checkIn: new Date('2024-04-01'),
      checkOut: new Date('2024-04-07'),
      guests: { adults: 2, children: 1 },
      priceDetails: {
        nightlyRate: property1.price,
        totalNights: 6,
        subtotal: property1.price * 6,
        totalPrice: property1.price * 6
      },
      status: 'confirmed',
      specialRequests: 'Need extra towels and parking'
    });
    console.log(`   ✅ Booking: ${booking1.bookingNumber} - ${booking1.status}`);

    const booking2 = await Booking.create({
      bookingNumber: 'BOK' + Date.now() + '2',
      propertyId: property2._id,
      tenantId: tenant2._id,
      landlordId: landlord1._id,
      checkIn: new Date('2024-05-10'),
      checkOut: new Date('2024-05-20'),
      guests: { adults: 4, children: 2 },
      priceDetails: {
        nightlyRate: property2.price,
        totalNights: 10,
        subtotal: property2.price * 10,
        totalPrice: property2.price * 10
      },
      status: 'pending',
      specialRequests: 'Need baby cot and high chair'
    });
    console.log(`   ✅ Booking: ${booking2.bookingNumber} - ${booking2.status}`);

    const booking3 = await Booking.create({
      bookingNumber: 'BOK' + Date.now() + '3',
      propertyId: property3._id,
      tenantId: tenant3._id,
      landlordId: landlord2._id,
      checkIn: new Date('2024-06-15'),
      checkOut: new Date('2024-06-22'),
      guests: { adults: 1 },
      priceDetails: {
        nightlyRate: property3.price,
        totalNights: 7,
        subtotal: property3.price * 7,
        totalPrice: property3.price * 7
      },
      status: 'confirmed'
    });
    console.log(`   ✅ Booking: ${booking3.bookingNumber} - ${booking3.status}`);

    const booking4 = await Booking.create({
      bookingNumber: 'BOK' + Date.now() + '4',
      propertyId: property4._id,
      tenantId: tenant1._id,
      landlordId: landlord2._id,
      checkIn: new Date('2024-07-01'),
      checkOut: new Date('2024-07-10'),
      guests: { adults: 4, children: 2 },
      priceDetails: {
        nightlyRate: property4.price,
        totalNights: 9,
        subtotal: property4.price * 9,
        totalPrice: property4.price * 9
      },
      status: 'cancelled',
      cancellationReason: 'Change of plans'
    });
    console.log(`   ✅ Booking: ${booking4.bookingNumber} - ${booking4.status}`);

    const booking5 = await Booking.create({
      bookingNumber: 'BOK' + Date.now() + '5',
      propertyId: property1._id,
      tenantId: tenant2._id,
      landlordId: landlord1._id,
      checkIn: new Date('2024-08-05'),
      checkOut: new Date('2024-08-12'),
      guests: { adults: 2, children: 1 },
      priceDetails: {
        nightlyRate: property1.price,
        totalNights: 7,
        subtotal: property1.price * 7,
        totalPrice: property1.price * 7
      },
      status: 'completed'
    });
    console.log(`   ✅ Booking: ${booking5.bookingNumber} - ${booking5.status}`);

    // ============================================
    // 4. CREATE INQUIRIES (6 inquiries)
    // ============================================
    console.log('\n📁 CREATING INQUIRIES...');

    const inquiry1 = await Inquiry.create({
      inquiryNumber: 'INQ' + Date.now() + '1',
      propertyId: property3._id,
      tenantId: tenant1._id,
      landlordId: landlord2._id,
      subject: 'Question about availability',
      message: 'Is this property still available for next month? I am interested in a long-term lease.',
      status: 'replied',
      replies: [{
        message: 'Yes, it is available. Would you like to schedule a viewing?',
        senderId: landlord2._id,
        senderRole: 'landlord',
        createdAt: new Date()
      }]
    });
    console.log(`   ✅ Inquiry: ${inquiry1.inquiryNumber} - ${inquiry1.status}`);

    const inquiry2 = await Inquiry.create({
      inquiryNumber: 'INQ' + Date.now() + '2',
      propertyId: property4._id,
      tenantId: tenant2._id,
      landlordId: landlord2._id,
      subject: 'Viewing request',
      message: 'I would like to schedule a viewing this weekend. Saturday afternoon works best for me.',
      status: 'new'
    });
    console.log(`   ✅ Inquiry: ${inquiry2.inquiryNumber} - ${inquiry2.status}`);

    const inquiry3 = await Inquiry.create({
      inquiryNumber: 'INQ' + Date.now() + '3',
      propertyId: property1._id,
      tenantId: tenant3._id,
      landlordId: landlord1._id,
      subject: 'Price negotiation',
      message: 'Is the price negotiable for a 6-month lease?',
      status: 'read'
    });
    console.log(`   ✅ Inquiry: ${inquiry3.inquiryNumber} - ${inquiry3.status}`);

    const inquiry4 = await Inquiry.create({
      inquiryNumber: 'INQ' + Date.now() + '4',
      propertyId: property5._id,
      tenantId: tenant1._id,
      landlordId: landlord1._id,
      subject: 'Business inquiry',
      message: 'I am interested in renting this shop for my clothing business. What are the business hours for viewing?',
      status: 'replied',
      replies: [{
        message: 'You can visit any day between 9 AM and 5 PM.',
        senderId: landlord1._id,
        senderRole: 'landlord',
        createdAt: new Date()
      }]
    });
    console.log(`   ✅ Inquiry: ${inquiry4.inquiryNumber} - ${inquiry4.status}`);

    const inquiry5 = await Inquiry.create({
      inquiryNumber: 'INQ' + Date.now() + '5',
      propertyId: property2._id,
      tenantId: tenant2._id,
      landlordId: landlord1._id,
      subject: 'Pets allowed?',
      message: 'Do you allow small dogs? I have a friendly 5kg dog.',
      status: 'new'
    });
    console.log(`   ✅ Inquiry: ${inquiry5.inquiryNumber} - ${inquiry5.status}`);

    const inquiry6 = await Inquiry.create({
      inquiryNumber: 'INQ' + Date.now() + '6',
      propertyId: property6._id,
      tenantId: tenant3._id,
      landlordId: landlord2._id,
      subject: 'Utilities included?',
      message: 'Are water and electricity included in the rent?',
      status: 'new'
    });
    console.log(`   ✅ Inquiry: ${inquiry6.inquiryNumber} - ${inquiry6.status}`);

    // ============================================
    // 5. CREATE REVIEWS (4 reviews)
    // ============================================
    console.log('\n📁 CREATING REVIEWS...');

    const review1 = await Review.create({
      reviewNumber: 'REV' + Date.now() + '1',
      propertyId: property1._id,
      tenantId: tenant1._id,
      bookingId: booking1._id,
      landlordId: landlord1._id,
      ratings: {
        overall: 5,
        accuracy: 5,
        communication: 5,
        cleanliness: 5,
        location: 4,
        value: 5
      },
      title: 'Excellent stay!',
      comment: 'The apartment was exactly as described. Very clean and comfortable. The landlord was very helpful. Would definitely recommend!',
      pros: ['Clean', 'Spacious', 'Good location', 'Helpful host'],
      cons: ['A bit noisy at night'],
      moderationStatus: 'approved'
    });
    console.log(`   ✅ Review: ${review1.reviewNumber} - Rating: ${review1.ratings.overall}/5`);

    const review2 = await Review.create({
      reviewNumber: 'REV' + Date.now() + '2',
      propertyId: property2._id,
      tenantId: tenant2._id,
      bookingId: booking2._id,
      landlordId: landlord1._id,
      ratings: {
        overall: 4,
        accuracy: 4,
        communication: 5,
        cleanliness: 4,
        location: 4,
        value: 4
      },
      title: 'Great family home',
      comment: 'Very spacious house with beautiful garden. Kids loved it. Kitchen could be better equipped.',
      pros: ['Spacious', 'Garden', 'Safe neighborhood'],
      cons: ['Kitchen needs updating'],
      moderationStatus: 'approved'
    });
    console.log(`   ✅ Review: ${review2.reviewNumber} - Rating: ${review2.ratings.overall}/5`);

    const review3 = await Review.create({
      reviewNumber: 'REV' + Date.now() + '3',
      propertyId: property3._id,
      tenantId: tenant3._id,
      bookingId: booking3._id,
      landlordId: landlord2._id,
      ratings: {
        overall: 5,
        accuracy: 5,
        communication: 5,
        cleanliness: 5,
        location: 5,
        value: 5
      },
      title: 'Perfect studio for singles',
      comment: 'Exactly what I needed. Modern, clean, and in a great location. Landlord was very responsive.',
      pros: ['Modern', 'Clean', 'Good location'],
      cons: [],
      moderationStatus: 'approved'
    });
    console.log(`   ✅ Review: ${review3.reviewNumber} - Rating: ${review3.ratings.overall}/5`);

    const review4 = await Review.create({
      reviewNumber: 'REV' + Date.now() + '4',
      propertyId: property4._id,
      tenantId: tenant1._id,
      bookingId: booking4._id,
      landlordId: landlord2._id,
      ratings: {
        overall: 3,
        accuracy: 3,
        communication: 4,
        cleanliness: 3,
        location: 5,
        value: 2
      },
      title: 'Beautiful but overpriced',
      comment: 'The villa is stunning but too expensive for what you get. Some amenities were not working.',
      pros: ['Beautiful view', 'Spacious'],
      cons: ['Overpriced', 'Some amenities broken'],
      moderationStatus: 'pending'
    });
    console.log(`   ✅ Review: ${review4.reviewNumber} - Rating: ${review4.ratings.overall}/5 (pending)`);

    // ============================================
    // 6. CREATE FAVORITES (5 favorites)
    // ============================================
    console.log('\n📁 CREATING FAVORITES...');

    const favorite1 = await Favorite.create({
      tenantId: tenant1._id,
      propertyId: property2._id,
      notes: 'Perfect for family, love the garden!',
      tags: ['family', 'garden', 'spacious']
    });
    console.log(`   ✅ Favorite: ${tenant1.name} → ${property2.title}`);

    const favorite2 = await Favorite.create({
      tenantId: tenant1._id,
      propertyId: property4._id,
      notes: 'Dream home! Need to save up.',
      tags: ['luxury', 'dream', 'villa']
    });
    console.log(`   ✅ Favorite: ${tenant1.name} → ${property4.title}`);

    const favorite3 = await Favorite.create({
      tenantId: tenant2._id,
      propertyId: property1._id,
      notes: 'Good location, reasonable price',
      tags: ['affordable', 'good-location']
    });
    console.log(`   ✅ Favorite: ${tenant2.name} → ${property1.title}`);

    const favorite4 = await Favorite.create({
      tenantId: tenant2._id,
      propertyId: property3._id,
      notes: 'Perfect for my son who is moving out',
      tags: ['studio', 'son']
    });
    console.log(`   ✅ Favorite: ${tenant2.name} → ${property3.title}`);

    const favorite5 = await Favorite.create({
      tenantId: tenant3._id,
      propertyId: property5._id,
      notes: 'Business opportunity',
      tags: ['business', 'shop']
    });
    console.log(`   ✅ Favorite: ${tenant3.name} → ${property5.title}`);

    // ============================================
    // 7. CREATE BLOGS (4 blogs)
    // ============================================
    console.log('\n📁 CREATING BLOGS...');

    const blog1 = await Blog.create({
      title: 'Tips for Renting in Mogadishu',
      content: 'Finding the perfect rental in Mogadishu can be challenging. Here are some tips to help you navigate the market:\n\n1. Research districts: Each district has different price ranges and amenities.\n2. Verify landlord credentials: Always use verified landlords on our platform.\n3. Inspect the property: Always visit before making payment.\n4. Read reviews: Check what previous tenants say.\n5. Understand the contract: Make sure you read all terms before signing.',
      excerpt: 'Essential tips for first-time renters in Mogadishu',
      author: admin._id,
      category: 'tips',
      tags: ['renting', 'mogadishu', 'tips', 'guide'],
      coverImage: {
        url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa',
        alt: 'Rental tips'
      },
      status: 'published',
      publishedAt: new Date('2024-01-15'),
      views: 350,
      likes: [tenant1._id, tenant2._id]
    });
    console.log(`   ✅ Blog: "${blog1.title}" - ${blog1.views} views`);

    const blog2 = await Blog.create({
      title: 'Market Update: Rental Prices in Hodan District',
      content: 'The rental market in Hodan has seen significant changes this year. Average prices have increased by 15% compared to last year. A 2-bedroom apartment now averages $350/month. New developments are coming to the area, which may affect prices further.',
      excerpt: 'Latest trends and prices in Hodan district',
      author: admin._id,
      category: 'market-update',
      tags: ['market', 'hodan', 'prices', 'trends'],
      coverImage: {
        url: 'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8',
        alt: 'Market update'
      },
      status: 'published',
      publishedAt: new Date('2024-02-20'),
      views: 185,
      likes: [landlord1._id]
    });
    console.log(`   ✅ Blog: "${blog2.title}" - ${blog2.views} views`);

    const blog3 = await Blog.create({
      title: 'Understanding Rental Contracts in Somalia',
      content: 'Rental contracts in Somalia have unique aspects. Here\'s what you need to know:\n\n- Deposit: Usually 1-3 months rent\n- Notice period: Typically 30-60 days\n- Maintenance responsibilities\n- Utility payments\n- Renewal terms',
      excerpt: 'Legal guide for tenants and landlords',
      author: admin._id,
      category: 'guide',
      tags: ['contract', 'legal', 'guide'],
      coverImage: {
        url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73',
        alt: 'Contract guide'
      },
      status: 'published',
      publishedAt: new Date('2024-03-01'),
      views: 210,
      likes: [landlord1._id, landlord2._id, tenant1._id]
    });
    console.log(`   ✅ Blog: "${blog3.title}" - ${blog3.views} views`);

    const blog4 = await Blog.create({
      title: 'New Developments in Mogadishu Real Estate',
      content: 'Several new residential and commercial projects are underway in Mogadishu. Shangani and Hodan districts are seeing the most activity. New apartments with modern amenities are becoming available.',
      excerpt: 'What\'s coming to Mogadishu property market',
      author: admin._id,
      category: 'news',
      tags: ['news', 'development', 'mogadishu'],
      coverImage: {
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab',
        alt: 'New developments'
      },
      status: 'draft',
      views: 45
    });
    console.log(`   ✅ Blog: "${blog4.title}" - draft`);

    // ============================================
    // 8. CREATE SUBSCRIBERS (5 subscribers)
    // ============================================
    console.log('\n📁 CREATING SUBSCRIBERS...');

    const subscriber1 = await Subscriber.create({
      email: 'john.doe@example.com',
      name: 'John Doe',
      source: 'website',
      status: 'active',
      preferences: {
        frequency: 'weekly',
        categories: ['tips', 'market-update']
      }
    });
    console.log(`   ✅ Subscriber: ${subscriber1.email}`);

    const subscriber2 = await Subscriber.create({
      email: 'jane.smith@example.com',
      name: 'Jane Smith',
      source: 'blog',
      status: 'active',
      preferences: {
        frequency: 'monthly',
        categories: ['news', 'market-update']
      }
    });
    console.log(`   ✅ Subscriber: ${subscriber2.email}`);

    const subscriber3 = await Subscriber.create({
      email: 'ahmed.ali@example.com',
      name: 'Ahmed Ali',
      source: 'property',
      status: 'active'
    });
    console.log(`   ✅ Subscriber: ${subscriber3.email}`);

    const subscriber4 = await Subscriber.create({
      email: 'fatima.omar@example.com',
      name: 'Fatima Omar',
      source: 'signup',
      status: 'active'
    });
    console.log(`   ✅ Subscriber: ${subscriber4.email}`);

    const subscriber5 = await Subscriber.create({
      email: 'unsubscribed@example.com',
      name: 'Test User',
      source: 'website',
      status: 'unsubscribed',
      unsubscribedAt: new Date()
    });
    console.log(`   ✅ Subscriber: ${subscriber5.email} (unsubscribed)`);

    // ============================================
    // 9. CREATE CONTACTS (5 contacts)
    // ============================================
    console.log('\n📁 CREATING CONTACT MESSAGES...');

    const contact1 = await Contact.create({
      name: 'Mohamed Ali',
      email: 'mohamed@example.com',
      phone: '+252612345678',
      subject: 'Question about property listing',
      message: 'How can I list my property on your platform? I have a house in Hodan I want to rent out.',
      status: 'new',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    console.log(`   ✅ Contact: ${contact1.name} - ${contact1.subject}`);

    const contact2 = await Contact.create({
      name: 'Aisha Ahmed',
      email: 'aisha@example.com',
      subject: 'Technical support',
      message: 'I am having trouble resetting my password. Can you help?',
      status: 'read',
      ipAddress: '192.168.1.2',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS)'
    });
    console.log(`   ✅ Contact: ${contact2.name} - ${contact2.subject}`);

    const contact3 = await Contact.create({
      name: 'Omar Farah',
      email: 'omar@example.com',
      phone: '+252613456789',
      subject: 'Partnership inquiry',
      message: 'I own a real estate agency and would like to discuss partnership opportunities.',
      status: 'new',
      ipAddress: '192.168.1.3'
    });
    console.log(`   ✅ Contact: ${contact3.name} - ${contact3.subject}`);

    const contact4 = await Contact.create({
      name: 'Safia Mohamud',
      email: 'safia@example.com',
      subject: 'Report a problem',
      message: 'There is an issue with the booking system. I cannot confirm my booking.',
      status: 'replied',
      replies: [{
        message: 'We are looking into this issue. Thank you for reporting.',
        repliedBy: admin._id,
        repliedAt: new Date()
      }],
      ipAddress: '192.168.1.4'
    });
    console.log(`   ✅ Contact: ${contact4.name} - ${contact4.subject}`);

    const contact5 = await Contact.create({
      name: 'Ahmed Hassan',
      email: 'ahmed.hassan@example.com',
      subject: 'Feedback',
      message: 'Great platform! I found my dream apartment through Kirada Guryaha.',
      status: 'closed',
      ipAddress: '192.168.1.5'
    });
    console.log(`   ✅ Contact: ${contact5.name} - ${contact5.subject}`);

    // ============================================
    // 10. CREATE REPORTS (2 reports) - FIRST
    // ============================================
    console.log('\n📁 CREATING REPORTS...');

    const report1 = await Report.create({
      reportNumber: 'RPT' + Date.now() + '1',
      reporterId: tenant2._id,
      reporterRole: 'tenant',
      reportedItemId: review4._id,
      reportedItemType: 'Review',
      reason: 'inappropriate',
      description: 'This review contains offensive language about the landlord.',
      status: 'pending',
      priority: 'medium',
      meta: {
        ipAddress: '192.168.1.10',
        userAgent: 'Mozilla/5.0'
      }
    });
    console.log(`   ✅ Report: ${report1.reportNumber} - ${report1.reason}`);

    const report2 = await Report.create({
      reportNumber: 'RPT' + Date.now() + '2',
      reporterId: landlord1._id,
      reporterRole: 'landlord',
      reportedItemId: property6._id,
      reportedItemType: 'Property',
      reason: 'fake',
      description: 'This property listing has incorrect information about the location.',
      status: 'reviewing',
      priority: 'high',
      assignedTo: admin._id,
      assignedAt: new Date(),
      meta: {
        ipAddress: '192.168.1.11'
      }
    });
    console.log(`   ✅ Report: ${report2.reportNumber} - ${report2.reason}`);

    // ============================================
    // 11. CREATE NOTIFICATIONS (8 notifications) - SECOND
    // ============================================
    console.log('\n📁 CREATING NOTIFICATIONS...');

    const notifications = [];

    const notif1 = await Notification.create({
      notificationNumber: generateNotificationNumber(),
      userId: tenant1._id,
      type: 'booking_confirmed',
      title: 'Booking Confirmed! 🎉',
      message: `Your booking for "${property1.title}" from Apr 1-7 has been confirmed.`,
      data: { bookingId: booking1._id, propertyId: property1._id },
      category: 'booking',
      priority: 'high'
    });
    notifications.push(notif1);
    console.log(`   ✅ Notification: ${notif1.title}`);

    const notif2 = await Notification.create({
      notificationNumber: generateNotificationNumber(),
      userId: landlord1._id,
      type: 'booking_request',
      title: 'New Booking Request',
      message: `You have a new booking request for "${property2.title}" from May 10-20.`,
      data: { bookingId: booking2._id, propertyId: property2._id },
      category: 'booking',
      priority: 'high'
    });
    notifications.push(notif2);
    console.log(`   ✅ Notification: ${notif2.title}`);

    const notif3 = await Notification.create({
      notificationNumber: generateNotificationNumber(),
      userId: landlord2._id,
      type: 'inquiry_received',
      title: 'New Inquiry',
      message: `${tenant2.name} asked about "${property4.title}": "Viewing request"`,
      data: { inquiryId: inquiry2._id, propertyId: property4._id },
      category: 'inquiry',
      priority: 'medium'
    });
    notifications.push(notif3);
    console.log(`   ✅ Notification: ${notif3.title}`);

    const notif4 = await Notification.create({
      notificationNumber: generateNotificationNumber(),
      userId: tenant1._id,
      type: 'inquiry_replied',
      title: 'Reply to Your Inquiry',
      message: `Landlord replied to your inquiry about "${property3.title}".`,
      data: { inquiryId: inquiry1._id, propertyId: property3._id },
      category: 'inquiry',
      priority: 'medium'
    });
    notifications.push(notif4);
    console.log(`   ✅ Notification: ${notif4.title}`);

    const notif5 = await Notification.create({
      notificationNumber: generateNotificationNumber(),
      userId: landlord1._id,
      type: 'review_received',
      title: 'New Review ⭐',
      message: `${tenant1.name} left a 5-star review for "${property1.title}".`,
      data: { reviewId: review1._id, propertyId: property1._id },
      category: 'review',
      priority: 'medium'
    });
    notifications.push(notif5);
    console.log(`   ✅ Notification: ${notif5.title}`);

    const notif6 = await Notification.create({
      notificationNumber: generateNotificationNumber(),
      userId: admin._id,
      type: 'report_received',
      title: 'New Report Submitted',
      message: 'A user has reported content that needs review.',
      data: { reportId: report1._id }, // ✅ HADDA SAX - report1 waa la abuuray
      category: 'report',
      priority: 'high'
    });
    notifications.push(notif6);
    console.log(`   ✅ Notification: ${notif6.title}`);

    const notif7 = await Notification.create({
      notificationNumber: generateNotificationNumber(),
      userId: tenant2._id,
      type: 'welcome',
      title: 'Welcome to Kirada Guryaha! 🏠',
      message: 'Thank you for joining. Start exploring properties in Mogadishu.',
      category: 'account',
      priority: 'low'
    });
    notifications.push(notif7);
    console.log(`   ✅ Notification: ${notif7.title}`);

    const notif8 = await Notification.create({
      notificationNumber: generateNotificationNumber(),
      userId: landlord2._id,
      type: 'property_approved',
      title: 'Property Approved!',
      message: `Your property "${property4.title}" has been approved and is now live.`,
      data: { propertyId: property4._id },
      category: 'property',
      priority: 'high'
    });
    notifications.push(notif8);
    console.log(`   ✅ Notification: ${notif8.title}`);

    // ============================================
    // SUMMARY
    // ============================================
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    const userCount = await User.countDocuments();
    const propertyCount = await Property.countDocuments();
    const bookingCount = await Booking.countDocuments();
    const inquiryCount = await Inquiry.countDocuments();
    const reviewCount = await Review.countDocuments();
    const favoriteCount = await Favorite.countDocuments();
    const blogCount = await Blog.countDocuments();
    const subscriberCount = await Subscriber.countDocuments();
    const contactCount = await Contact.countDocuments();
    const notificationCount = await Notification.countDocuments();
    const reportCount = await Report.countDocuments();

    console.log('\n📊 FINAL SUMMARY - ALL MODELS:');
    console.log('   ============================');
    console.log(`   👥 Users: ${userCount} created`);
    console.log(`   🏠 Properties: ${propertyCount} created`);
    console.log(`   📅 Bookings: ${bookingCount} created`);
    console.log(`   💬 Inquiries: ${inquiryCount} created`);
    console.log(`   ⭐ Reviews: ${reviewCount} created`);
    console.log(`   ❤️ Favorites: ${favoriteCount} created`);
    console.log(`   📝 Blogs: ${blogCount} created`);
    console.log(`   📧 Subscribers: ${subscriberCount} created`);
    console.log(`   📞 Contacts: ${contactCount} created`);
    console.log(`   🔔 Notifications: ${notificationCount} created`);
    console.log(`   📋 Reports: ${reportCount} created`);
    console.log(`\n   ⏱️  Time taken: ${duration} seconds`);

    console.log('\n✅ COMPLETE TEST DATA CREATED SUCCESSFULLY!');
    console.log('   All 11 collections now have sample data.\n');

    // ============================================
    // SEND EMAIL NOTIFICATION
    // ============================================
    console.log('📧 Sending email notification...');
    
    const emailData = {
      '👥 Users': userCount,
      '🏠 Properties': propertyCount,
      '📅 Bookings': bookingCount,
      '💬 Inquiries': inquiryCount,
      '⭐ Reviews': reviewCount,
      '❤️ Favorites': favoriteCount,
      '📝 Blogs': blogCount,
      '📧 Subscribers': subscriberCount,
      '📞 Contacts': contactCount,
      '🔔 Notifications': notificationCount,
      '📋 Reports': reportCount,
      '⏱️ Duration': `${duration} seconds`,
      '📊 Total Documents': userCount + propertyCount + bookingCount + inquiryCount + 
                            reviewCount + favoriteCount + blogCount + subscriberCount + 
                            contactCount + notificationCount + reportCount
    };

    const emailSent = await sendEmailNotification(
      '✅ Kirada Guryaha - Test Data Created Successfully',
      `All 11 collections have been populated with sample data in ${duration} seconds.`,
      emailData
    );

    if (emailSent) {
      console.log(`✅ Email notification sent to ${YOUR_EMAIL}`);
    } else {
      console.log(`⚠️ Could not send email. Check your email configuration in .env file`);
    }

  } catch (error) {
    console.error('\n❌ Error creating test data:', error);
    
    // Send error email
    await sendEmailNotification(
      '❌ Kirada Guryaha - Test Data Creation Failed',
      `Error: ${error.message}`,
      { 'Error Details': error.message }
    );
    
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed\n');
  }
};

// Run the function
createAllTestData();
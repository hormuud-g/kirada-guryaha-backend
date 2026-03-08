// src/config/swagger.js - FULL COMPLETE VERSION
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kirada Guryaha API',
      version: '1.0.0',
      description: `
# 🏠 Kirada Guryaha API

Rental Property Platform API - Mogadishu District

## 📌 Base URL
\`\`\`
https://kirada-guryaha-backend.onrender.com
\`\`\`

## 🔑 Authentication
Most endpoints require a Bearer Token. Obtain it by logging in via \`/api/auth/login\`.

\`\`\`json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
\`\`\`

## 📋 Mogadishu Districts
| ID | Name | Somali | Zone |
|:---|:---|:---|:---|
| hodan | Hodan | Hodan | South |
| waberi | Waberi | Waberi | South |
| karaan | Karaan | Karaan | North |
| shangani | Shangani | Shangaani | Coastal |
| yaaqshiid | Yaaqshiid | Yaaqshiid | North |
| dharkenley | Dharkenley | Dharkenley | West |
| heliwa | Heliwa | Heliwa | North |
| warta-nabada | Warta Nabada | Warta Nabada | South |
| abdiaziz | Abdiaziz | Cabdi Casiis | Central |
| bondhere | Bondhere | Bondhere | Coastal |
| hamar-weyne | Hamar Weyne | Xamar Weyne | Coastal |

## 🏷️ Property Types
- apartment, house, room, office, shop, land, villa, commercial, warehouse, studio

## ✅ Common Amenities
- wifi, parking, security, generator, water_tank, ac, furnished, kitchen, balcony, elevator, cctv, guard, swimming_pool, gym

## 📊 Booking Status
- pending, confirmed, cancelled, completed, no_show, expired

## 👥 User Roles
- tenant, landlord, admin, moderator, editor, support, agent

## 📁 File Upload
- Maximum file size: 5MB
- Allowed types: JPEG, PNG, GIF, PDF
- Upload endpoints: /api/properties (images), /api/users/profile-image, /api/upload/documents

## ⚡ Rate Limiting
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 attempts per hour
- Upload: 20 files per hour
- Search: 30 searches per minute

## 📞 Support
- Email: cabdirahmanjmaxamad@gmail.com
- Phone: +252 61 9655335
      `,
      contact: {
        name: 'Support Team',
        email: 'cabdirahmanjmaxamad@gmail.com',
        url: 'https://kirada-guryaha-backend.onrender.com',
        phone: '+252619655335'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      },
      termsOfService: 'https://kirada-guryaha-backend.onrender.com/terms'
    },
    externalDocs: {
      description: 'Postman Collection',
      url: 'https://kirada-guryaha-backend.onrender.com/api/public/endpoints'
    },
    servers: [
      {
        url: 'https://kirada-guryaha-backend.onrender.com',
        description: '🌍 Production server (live)'
      },
      {
        url: 'http://localhost:5000',
        description: '💻 Development server (local)'
      },
      {
        url: 'http://127.0.0.1:5000',
        description: '🖥️ Localhost alternative'
      }
    ],
    tags: [
      { 
        name: 'Server', 
        description: '🔧 Server health and information endpoints',
        externalDocs: {
          description: 'Find out more',
          url: 'https://kirada-guryaha-backend.onrender.com/health'
        }
      },
      { name: 'Public', description: '🌐 Public data endpoints (no authentication required)' },
      { name: 'Auth', description: '🔐 Authentication endpoints - Get your token here' },
      { name: 'Properties', description: '🏠 Property management CRUD operations' },
      { name: 'Bookings', description: '📅 Booking management CRUD operations' },
      { name: 'Inquiries', description: '💬 Inquiry management CRUD operations' },
      { name: 'Reviews', description: '⭐ Review management CRUD operations' },
      { name: 'Users', description: '👤 User profile and data endpoints' },
      { name: 'Blogs', description: '📝 Blog post management' },
      { name: 'Contact', description: '📞 Contact form and messages' },
      { name: 'Subscribers', description: '📧 Newsletter subscription management' },
      { name: 'Notifications', description: '🔔 User notifications' },
      { name: 'Reports', description: '🚨 Report system' },
      { name: 'Admin', description: '👑 Administrative endpoints (Admin only)' },
      { name: 'Database', description: '🗄️ Database utility endpoints' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: '🔑 Enter your JWT token in the format: Bearer <token>\n\nExample: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        },
        apiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'API Key authentication (for external services)'
        }
      },
      schemas: {
        // ========== ERROR SCHEMAS ==========
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Error message'
            },
            stack: {
              type: 'string',
              example: 'Error stack trace (development only)'
            }
          }
        },
        ValidationError: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              example: 'Validation failed'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string', example: 'email' },
                  message: { type: 'string', example: 'Email is required' },
                  value: { type: 'string', example: 'invalid-email' }
                }
              }
            }
          }
        },
        
        // ========== USER SCHEMAS ==========
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d21b4667d0d8992e610c85' },
            name: { type: 'string', example: 'Ahmed Ali' },
            email: { type: 'string', example: 'ahmed@example.com' },
            phone: { type: 'string', example: '+252612345678' },
            role: { 
              type: 'string', 
              enum: ['tenant', 'landlord', 'admin', 'moderator', 'editor', 'support', 'agent'],
              example: 'tenant' 
            },
            profileImage: { type: 'string', example: '/uploads/profiles/user-123.jpg' },
            bio: { type: 'string', example: 'Software developer from Mogadishu' },
            isVerified: { type: 'boolean', example: true },
            isEmailVerified: { type: 'boolean', example: true },
            isPhoneVerified: { type: 'boolean', example: false },
            verificationLevel: { 
              type: 'string', 
              enum: ['none', 'basic', 'verified', 'trusted'],
              example: 'basic' 
            },
            status: { 
              type: 'string', 
              enum: ['active', 'suspended', 'deactivated', 'banned'],
              example: 'active' 
            },
            lastLogin: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        UserPublic: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            profileImage: { type: 'string' },
            bio: { type: 'string' },
            isVerified: { type: 'boolean' },
            stats: {
              type: 'object',
              properties: {
                propertyCount: { type: 'number' },
                totalReviews: { type: 'number' },
                averageRating: { type: 'number' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: { 
              type: 'string', 
              format: 'email',
              example: 'user@example.com',
              description: 'User email address'
            },
            password: { 
              type: 'string', 
              format: 'password',
              example: 'password123',
              description: 'User password (min 6 characters)'
            },
            rememberMe: { 
              type: 'boolean', 
              example: false,
              description: 'Remember me for 30 days'
            }
          }
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            token: { 
              type: 'string', 
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
              description: 'JWT token for authentication'
            },
            refreshToken: { 
              type: 'string', 
              example: '5a8f3c7e9b2d4a1e6f8c7d9b0a2c4e6f',
              description: 'Refresh token for getting new access tokens'
            },
            expiresIn: { type: 'number', example: 604800 },
            user: { $ref: '#/components/schemas/User' }
          }
        },
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'phone', 'password'],
          properties: {
            name: { 
              type: 'string', 
              example: 'Ahmed Ali',
              minLength: 2,
              maxLength: 50
            },
            email: { 
              type: 'string', 
              format: 'email',
              example: 'ahmed@example.com'
            },
            phone: { 
              type: 'string', 
              pattern: '^\\+252\\d{7,9}$',
              example: '+252612345678',
              description: 'Somalia phone number format: +252 followed by 7-9 digits'
            },
            password: { 
              type: 'string', 
              format: 'password',
              example: 'Password123',
              minLength: 6,
              description: 'At least 6 characters, must contain number and letter'
            },
            role: { 
              type: 'string', 
              enum: ['tenant', 'landlord'],
              example: 'tenant',
              default: 'tenant'
            }
          }
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', example: 'Ahmed Ali Updated' },
            phone: { type: 'string', example: '+252612345679' },
            bio: { type: 'string', example: 'I am a software developer' },
            occupation: { type: 'string', example: 'Engineer' },
            company: { type: 'string', example: 'Tech Solutions' },
            address: {
              type: 'object',
              properties: {
                street: { type: 'string', example: 'Street 42' },
                district: { type: 'string', example: 'hodan' },
                city: { type: 'string', example: 'Mogadishu' }
              }
            }
          }
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { 
              type: 'string', 
              format: 'password',
              example: 'Password123'
            },
            newPassword: { 
              type: 'string', 
              format: 'password',
              example: 'NewPassword123',
              minLength: 6
            }
          }
        },
        ForgotPasswordRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { 
              type: 'string', 
              format: 'email',
              example: 'user@example.com'
            }
          }
        },
        ResetPasswordRequest: {
          type: 'object',
          required: ['password'],
          properties: {
            password: { 
              type: 'string', 
              format: 'password',
              example: 'NewPassword123'
            }
          }
        },
        
        // ========== PROPERTY SCHEMAS ==========
        Property: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d21b4667d0d8992e610c86' },
            title: { type: 'string', example: 'Beautiful Apartment in Hodan' },
            description: { type: 'string', example: 'Spacious 2-bedroom apartment with modern amenities in the heart of Hodan district.' },
            summary: { type: 'string', example: '2-bed apartment in Hodan' },
            price: { type: 'number', example: 350 },
            priceUnit: { 
              type: 'string', 
              enum: ['monthly', 'weekly', 'daily', 'yearly'],
              example: 'monthly' 
            },
            securityDeposit: { type: 'number', example: 100 },
            cleaningFee: { type: 'number', example: 25 },
            type: { 
              type: 'string', 
              enum: ['apartment', 'house', 'room', 'office', 'shop', 'land', 'villa', 'commercial', 'warehouse', 'studio'],
              example: 'apartment' 
            },
            bedrooms: { type: 'number', example: 2 },
            bathrooms: { type: 'number', example: 1 },
            size: { type: 'number', example: 85 },
            sizeUnit: { 
              type: 'string', 
              enum: ['sqft', 'sqm'],
              example: 'sqm' 
            },
            location: {
              type: 'object',
              properties: {
                district: { 
                  type: 'string', 
                  enum: ['hodan', 'waberi', 'karaan', 'shangani', 'yaaqshiid', 'dharkenley', 'heliwa', 'warta-nabada', 'abdiaziz', 'bondhere', 'hamar-weyne'],
                  example: 'hodan' 
                },
                subDistrict: { type: 'string', example: 'Hodan' },
                address: { type: 'string', example: 'Street 42, Hodan District' },
                landmark: { type: 'string', example: 'Near City Hospital' },
                coordinates: {
                  type: 'object',
                  properties: {
                    lat: { type: 'number', example: 2.0333 },
                    lng: { type: 'number', example: 45.3333 }
                  }
                }
              }
            },
            amenities: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['wifi', 'parking', 'security', 'ac', 'furnished'] 
            },
            furnishing: { 
              type: 'string', 
              enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
              example: 'semi-furnished' 
            },
            images: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  url: { type: 'string', example: '/uploads/properties/image-123.jpg' },
                  thumbnail: { type: 'string', example: '/uploads/properties/thumb-123.jpg' },
                  isPrimary: { type: 'boolean', example: true }
                }
              }
            },
            rules: {
              type: 'object',
              properties: {
                smoking: { type: 'string', enum: ['allowed', 'not-allowed', 'outdoor-only'] },
                pets: { type: 'string', enum: ['allowed', 'not-allowed', 'small-only'] },
                parties: { type: 'string', enum: ['allowed', 'not-allowed', 'quiet-only'] }
              }
            },
            status: { 
              type: 'string', 
              enum: ['available', 'rented', 'pending', 'rejected', 'archived', 'under_maintenance'],
              example: 'available' 
            },
            featured: { type: 'boolean', example: false },
            landlordId: { type: 'string', example: '60d21b4667d0d8992e610c85' },
            metrics: {
              type: 'object',
              properties: {
                views: { type: 'number', example: 150 },
                favorites: { type: 'number', example: 12 },
                inquiries: { type: 'number', example: 8 },
                bookings: { type: 'number', example: 3 },
                averageRating: { type: 'number', example: 4.5 }
              }
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        CreatePropertyRequest: {
          type: 'object',
          required: ['title', 'description', 'price', 'type', 'bedrooms', 'bathrooms', 'size', 'location'],
          properties: {
            title: { 
              type: 'string', 
              example: 'Beautiful Apartment in Hodan',
              minLength: 5,
              maxLength: 100
            },
            description: { 
              type: 'string', 
              example: 'Spacious 2-bedroom apartment with modern amenities in the heart of Hodan district.',
              minLength: 20,
              maxLength: 2000
            },
            price: { 
              type: 'number', 
              example: 350,
              minimum: 1,
              maximum: 1000000
            },
            type: { 
              type: 'string', 
              enum: ['apartment', 'house', 'room', 'office', 'shop', 'land', 'villa', 'commercial', 'warehouse', 'studio'],
              example: 'apartment' 
            },
            bedrooms: { 
              type: 'number', 
              example: 2,
              minimum: 0,
              maximum: 20
            },
            bathrooms: { 
              type: 'number', 
              example: 1,
              minimum: 0,
              maximum: 20
            },
            size: { 
              type: 'number', 
              example: 85,
              minimum: 1
            },
            location: {
              type: 'object',
              required: ['district', 'address'],
              properties: {
                district: { 
                  type: 'string', 
                  enum: ['hodan', 'waberi', 'karaan', 'shangani', 'yaaqshiid', 'dharkenley', 'heliwa', 'warta-nabada', 'abdiaziz', 'bondhere', 'hamar-weyne'],
                  example: 'hodan' 
                },
                address: { 
                  type: 'string', 
                  example: 'Street 42, Hodan District',
                  maxLength: 300
                },
                lat: { type: 'number', example: 2.0333 },
                lng: { type: 'number', example: 45.3333 }
              }
            },
            amenities: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['wifi', 'parking', 'security'] 
            },
            furnishing: { 
              type: 'string', 
              enum: ['unfurnished', 'semi-furnished', 'fully-furnished'],
              example: 'semi-furnished' 
            },
            rules: {
              type: 'object',
              properties: {
                smoking: { type: 'string', enum: ['allowed', 'not-allowed', 'outdoor-only'] },
                pets: { type: 'string', enum: ['allowed', 'not-allowed', 'small-only'] },
                parties: { type: 'string', enum: ['allowed', 'not-allowed', 'quiet-only'] }
              }
            }
          }
        },
        UpdatePropertyRequest: {
          type: 'object',
          properties: {
            title: { type: 'string', example: 'Updated Apartment Title' },
            description: { type: 'string', example: 'Updated description' },
            price: { type: 'number', example: 375 },
            type: { type: 'string', enum: ['apartment', 'house', 'room', 'office', 'shop', 'land', 'villa'] },
            bedrooms: { type: 'number', example: 2 },
            bathrooms: { type: 'number', example: 1 },
            size: { type: 'number', example: 85 },
            location: {
              type: 'object',
              properties: {
                district: { type: 'string', example: 'hodan' },
                address: { type: 'string', example: 'Updated address' }
              }
            },
            amenities: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['available', 'rented', 'pending'] }
          }
        },
        PropertySearchRequest: {
          type: 'object',
          properties: {
            q: { type: 'string', example: 'apartment' },
            district: { type: 'string', example: 'hodan' },
            minPrice: { type: 'number', example: 200 },
            maxPrice: { type: 'number', example: 500 },
            type: { type: 'string', example: 'apartment' },
            bedrooms: { type: 'number', example: 2 },
            bathrooms: { type: 'number', example: 1 },
            amenities: { type: 'string', example: 'wifi,parking' },
            furnished: { type: 'string', enum: ['unfurnished', 'semi-furnished', 'fully-furnished'] },
            page: { type: 'number', example: 1, default: 1 },
            limit: { type: 'number', example: 10, default: 10 },
            sort: { 
              type: 'string', 
              enum: ['price_asc', 'price_desc', 'newest', 'oldest', 'most_viewed', 'highest_rated'],
              default: 'newest'
            }
          }
        },
        
        // ========== BOOKING SCHEMAS ==========
        Booking: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '60d21b4667d0d8992e610c87' },
            bookingNumber: { type: 'string', example: 'BOK2403011234' },
            propertyId: { type: 'string', example: '60d21b4667d0d8992e610c86' },
            tenantId: { type: 'string', example: '60d21b4667d0d8992e610c85' },
            landlordId: { type: 'string', example: '60d21b4667d0d8992e610c88' },
            checkIn: { type: 'string', format: 'date', example: '2024-04-01' },
            checkOut: { type: 'string', format: 'date', example: '2024-04-07' },
            guests: {
              type: 'object',
              properties: {
                adults: { type: 'number', example: 2 },
                children: { type: 'number', example: 1 },
                infants: { type: 'number', example: 0 },
                pets: { type: 'number', example: 0 }
              }
            },
            totalNights: { type: 'number', example: 6 },
            priceDetails: {
              type: 'object',
              properties: {
                nightlyRate: { type: 'number', example: 350 },
                subtotal: { type: 'number', example: 2100 },
                cleaningFee: { type: 'number', example: 25 },
                serviceFee: { type: 'number', example: 105 },
                totalPrice: { type: 'number', example: 2230 },
                currency: { type: 'string', example: 'USD' }
              }
            },
            specialRequests: { type: 'string', example: 'Need parking space' },
            status: { 
              type: 'string', 
              enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no_show', 'expired'],
              example: 'pending' 
            },
            payment: {
              type: 'object',
              properties: {
                status: { type: 'string', enum: ['pending', 'paid', 'refunded', 'not_required'] },
                method: { type: 'string', enum: ['cash', 'bank_transfer', 'mobile_money'] }
              }
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateBookingRequest: {
          type: 'object',
          required: ['propertyId', 'checkIn', 'checkOut', 'guests'],
          properties: {
            propertyId: { 
              type: 'string', 
              example: '60d21b4667d0d8992e610c86',
              description: 'ID of the property to book'
            },
            checkIn: { 
              type: 'string', 
              format: 'date', 
              example: '2024-04-01',
              description: 'Check-in date (YYYY-MM-DD)'
            },
            checkOut: { 
              type: 'string', 
              format: 'date', 
              example: '2024-04-07',
              description: 'Check-out date (YYYY-MM-DD)'
            },
            guests: {
              type: 'object',
              required: ['adults'],
              properties: {
                adults: { 
                  type: 'number', 
                  example: 2,
                  minimum: 1,
                  maximum: 10
                },
                children: { 
                  type: 'number', 
                  example: 1,
                  minimum: 0,
                  maximum: 5
                },
                infants: { 
                  type: 'number', 
                  example: 0,
                  minimum: 0,
                  maximum: 3
                },
                pets: { 
                  type: 'number', 
                  example: 0,
                  minimum: 0,
                  maximum: 5
                }
              }
            },
            specialRequests: { 
              type: 'string', 
              example: 'Need parking space',
              maxLength: 500
            },
            guestDetails: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Ahmed Ali' },
                email: { type: 'string', example: 'ahmed@example.com' },
                phone: { type: 'string', example: '+252612345678' }
              }
            }
          }
        },
        CancelBookingRequest: {
          type: 'object',
          properties: {
            reason: { 
              type: 'string', 
              example: 'Change of plans',
              maxLength: 200
            }
          }
        },
        
        // ========== INQUIRY SCHEMAS ==========
        Inquiry: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            inquiryNumber: { type: 'string', example: 'INQ2403011234' },
            propertyId: { type: 'string' },
            tenantId: { type: 'string' },
            landlordId: { type: 'string' },
            subject: { type: 'string', example: 'Question about parking' },
            message: { type: 'string', example: 'Is there secure parking available?' },
            category: { 
              type: 'string', 
              enum: ['general', 'booking', 'price', 'availability', 'viewing', 'amenities'],
              example: 'general' 
            },
            status: { 
              type: 'string', 
              enum: ['new', 'read', 'replied', 'closed'],
              example: 'new' 
            },
            replies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  senderId: { type: 'string' },
                  senderRole: { type: 'string', enum: ['tenant', 'landlord'] },
                  createdAt: { type: 'string', format: 'date-time' },
                  isRead: { type: 'boolean' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateInquiryRequest: {
          type: 'object',
          required: ['propertyId', 'subject', 'message'],
          properties: {
            propertyId: { 
              type: 'string', 
              example: '60d21b4667d0d8992e610c86' 
            },
            subject: { 
              type: 'string', 
              example: 'Question about parking',
              maxLength: 200
            },
            message: { 
              type: 'string', 
              example: 'Is there secure parking available?',
              minLength: 10,
              maxLength: 1000
            },
            category: { 
              type: 'string', 
              enum: ['general', 'booking', 'price', 'availability', 'viewing', 'amenities', 'location', 'contract', 'other'],
              example: 'general',
              default: 'general'
            }
          }
        },
        ReplyToInquiryRequest: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { 
              type: 'string', 
              example: 'Yes, we have secure parking available 24/7',
              maxLength: 1000
            }
          }
        },
        ScheduleViewingRequest: {
          type: 'object',
          required: ['date', 'time'],
          properties: {
            date: { 
              type: 'string', 
              format: 'date', 
              example: '2024-04-15' 
            },
            time: { 
              type: 'string', 
              example: '10:00',
              description: 'Time in HH:MM format'
            },
            notes: { 
              type: 'string', 
              example: 'I will be coming after work',
              maxLength: 200
            }
          }
        },
        
        // ========== REVIEW SCHEMAS ==========
        Review: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            propertyId: { type: 'string' },
            tenantId: { type: 'string' },
            bookingId: { type: 'string' },
            ratings: {
              type: 'object',
              properties: {
                overall: { type: 'number', example: 4.5 },
                accuracy: { type: 'number', example: 5 },
                communication: { type: 'number', example: 4 },
                cleanliness: { type: 'number', example: 5 },
                location: { type: 'number', example: 4 },
                checkIn: { type: 'number', example: 5 },
                value: { type: 'number', example: 4 }
              }
            },
            title: { type: 'string', example: 'Great place!' },
            comment: { type: 'string', example: 'The apartment was clean and the host was friendly.' },
            pros: { type: 'array', items: { type: 'string' }, example: ['Clean', 'Good location'] },
            cons: { type: 'array', items: { type: 'string' }, example: ['A bit noisy'] },
            landlordReply: {
              type: 'object',
              properties: {
                comment: { type: 'string' },
                repliedAt: { type: 'string', format: 'date-time' }
              }
            },
            helpful: {
              type: 'object',
              properties: {
                count: { type: 'number', example: 5 },
                users: { type: 'array', items: { type: 'string' } }
              }
            },
            moderationStatus: { 
              type: 'string', 
              enum: ['pending', 'approved', 'rejected'],
              example: 'approved' 
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateReviewRequest: {
          type: 'object',
          required: ['bookingId', 'ratings', 'comment'],
          properties: {
            bookingId: { 
              type: 'string', 
              example: '60d21b4667d0d8992e610c87' 
            },
            ratings: {
              type: 'object',
              required: ['overall'],
              properties: {
                overall: { 
                  type: 'number', 
                  example: 4.5,
                  minimum: 1,
                  maximum: 5
                },
                accuracy: { type: 'number', example: 5, minimum: 1, maximum: 5 },
                communication: { type: 'number', example: 4, minimum: 1, maximum: 5 },
                cleanliness: { type: 'number', example: 5, minimum: 1, maximum: 5 },
                location: { type: 'number', example: 4, minimum: 1, maximum: 5 },
                value: { type: 'number', example: 4, minimum: 1, maximum: 5 }
              }
            },
            title: { 
              type: 'string', 
              example: 'Great place!',
              maxLength: 100
            },
            comment: { 
              type: 'string', 
              example: 'The apartment was clean and the host was friendly.',
              minLength: 10,
              maxLength: 1000
            },
            pros: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['Clean', 'Good location'] 
            },
            cons: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['A bit noisy'] 
            }
          }
        },
        ReplyToReviewRequest: {
          type: 'object',
          required: ['comment'],
          properties: {
            comment: { 
              type: 'string', 
              example: 'Thank you for your review! We hope to host you again.',
              maxLength: 500
            }
          }
        },
        ReportReviewRequest: {
          type: 'object',
          required: ['reason', 'description'],
          properties: {
            reason: { 
              type: 'string', 
              enum: ['spam', 'inappropriate', 'offensive', 'fake', 'harassment', 'other'],
              example: 'inappropriate' 
            },
            description: { 
              type: 'string', 
              example: 'This review contains inappropriate language',
              maxLength: 500
            }
          }
        },
        
        // ========== BLOG SCHEMAS ==========
        Blog: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            title: { type: 'string', example: 'Tips for Renting in Mogadishu' },
            slug: { type: 'string', example: 'tips-for-renting-in-mogadishu' },
            content: { type: 'string', example: 'Here are some tips...' },
            excerpt: { type: 'string', example: 'Short summary' },
            author: { type: 'string' },
            category: { 
              type: 'string', 
              enum: ['news', 'tips', 'market-update', 'guide', 'announcement'],
              example: 'tips' 
            },
            tags: { type: 'array', items: { type: 'string' }, example: ['renting', 'mogadishu'] },
            coverImage: {
              type: 'object',
              properties: {
                url: { type: 'string' },
                alt: { type: 'string' }
              }
            },
            status: { 
              type: 'string', 
              enum: ['draft', 'published', 'archived'],
              example: 'published' 
            },
            views: { type: 'number', example: 150 },
            likes: { type: 'array', items: { type: 'string' } },
            comments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  comment: { type: 'string' },
                  createdAt: { type: 'string', format: 'date-time' },
                  approved: { type: 'boolean' }
                }
              }
            },
            publishedAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateBlogRequest: {
          type: 'object',
          required: ['title', 'content'],
          properties: {
            title: { 
              type: 'string', 
              example: 'Tips for Renting in Mogadishu',
              minLength: 5,
              maxLength: 200
            },
            content: { 
              type: 'string', 
              example: 'Here are some tips for renting properties in Mogadishu...',
              minLength: 50
            },
            excerpt: { 
              type: 'string', 
              example: 'Short summary of the blog post',
              maxLength: 300
            },
            category: { 
              type: 'string', 
              enum: ['news', 'tips', 'market-update', 'guide', 'announcement'],
              default: 'news' 
            },
            tags: { 
              type: 'array', 
              items: { type: 'string' },
              example: ['renting', 'mogadishu'] 
            },
            coverImage: {
              type: 'object',
              properties: {
                url: { type: 'string' },
                alt: { type: 'string' }
              }
            },
            status: { 
              type: 'string', 
              enum: ['draft', 'published'],
              default: 'draft' 
            }
          }
        },
        AddCommentRequest: {
          type: 'object',
          required: ['comment'],
          properties: {
            name: { 
              type: 'string', 
              example: 'Ahmed Ali',
              description: 'Required for non-logged in users'
            },
            email: { 
              type: 'string', 
              format: 'email',
              example: 'ahmed@example.com' 
            },
            comment: { 
              type: 'string', 
              example: 'Great article! Very helpful.',
              minLength: 1
            }
          }
        },
        
        // ========== CONTACT SCHEMAS ==========
        Contact: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Ahmed Ali' },
            email: { type: 'string', example: 'ahmed@example.com' },
            phone: { type: 'string', example: '+252612345678' },
            subject: { type: 'string', example: 'Question about platform' },
            message: { type: 'string', example: 'How do I list my property?' },
            status: { 
              type: 'string', 
              enum: ['new', 'read', 'replied', 'closed'],
              example: 'new' 
            },
            assignedTo: { type: 'string' },
            replies: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  message: { type: 'string' },
                  repliedBy: { type: 'string' },
                  repliedAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        SubmitContactRequest: {
          type: 'object',
          required: ['name', 'email', 'subject', 'message'],
          properties: {
            name: { 
              type: 'string', 
              example: 'Ahmed Ali' 
            },
            email: { 
              type: 'string', 
              format: 'email',
              example: 'ahmed@example.com' 
            },
            phone: { 
              type: 'string', 
              example: '+252612345678' 
            },
            subject: { 
              type: 'string', 
              example: 'Question about platform',
              maxLength: 200
            },
            message: { 
              type: 'string', 
              example: 'How do I list my property?',
              maxLength: 2000
            }
          }
        },
        ReplyToContactRequest: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { 
              type: 'string', 
              example: 'Thank you for contacting us. We will get back to you soon.',
              maxLength: 2000
            }
          }
        },
        
        // ========== SUBSCRIBER SCHEMAS ==========
        Subscriber: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            email: { type: 'string', example: 'user@example.com' },
            name: { type: 'string', example: 'Ahmed Ali' },
            status: { 
              type: 'string', 
              enum: ['active', 'unsubscribed', 'bounced'],
              example: 'active' 
            },
            source: { 
              type: 'string', 
              enum: ['website', 'blog', 'property', 'signup'],
              example: 'website' 
            },
            preferences: {
              type: 'object',
              properties: {
                frequency: { 
                  type: 'string', 
                  enum: ['daily', 'weekly', 'monthly'],
                  default: 'weekly' 
                },
                categories: { 
                  type: 'array', 
                  items: { type: 'string' } 
                }
              }
            },
            subscribedAt: { type: 'string', format: 'date-time' },
            unsubscribedAt: { type: 'string', format: 'date-time' }
          }
        },
        SubscribeRequest: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { 
              type: 'string', 
              format: 'email',
              example: 'user@example.com' 
            },
            name: { 
              type: 'string', 
              example: 'Ahmed Ali' 
            },
            source: { 
              type: 'string', 
              enum: ['website', 'blog', 'property', 'signup'],
              default: 'website' 
            },
            preferences: {
              type: 'object',
              properties: {
                frequency: { 
                  type: 'string', 
                  enum: ['daily', 'weekly', 'monthly'],
                  default: 'weekly' 
                },
                categories: { 
                  type: 'array', 
                  items: { type: 'string' } 
                }
              }
            }
          }
        },
        
        // ========== NOTIFICATION SCHEMAS ==========
        Notification: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            type: { 
              type: 'string',
              enum: ['welcome', 'booking_request', 'booking_confirmed', 'booking_cancelled', 'inquiry_received', 'review_received', 'payment_due', 'system_alert']
            },
            title: { type: 'string' },
            message: { type: 'string' },
            data: { type: 'object' },
            isRead: { type: 'boolean', default: false },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        
        // ========== REPORT SCHEMAS ==========
        Report: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            reportNumber: { type: 'string' },
            reporterId: { type: 'string' },
            reportedItemId: { type: 'string' },
            reportedItemType: { 
              type: 'string',
              enum: ['Property', 'User', 'Review', 'Inquiry', 'Booking', 'Message']
            },
            reason: { 
              type: 'string',
              enum: ['spam', 'inappropriate', 'fake', 'harassment', 'scam', 'misleading', 'offensive', 'illegal']
            },
            description: { type: 'string' },
            priority: { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
            status: { 
              type: 'string',
              enum: ['pending', 'reviewing', 'resolved', 'dismissed', 'escalated']
            },
            assignedTo: { type: 'string' },
            actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string' },
                  description: { type: 'string' },
                  takenBy: { type: 'string' },
                  takenAt: { type: 'string', format: 'date-time' }
                }
              }
            },
            resolution: {
              type: 'object',
              properties: {
                summary: { type: 'string' },
                decision: { type: 'string', enum: ['upheld', 'rejected', 'partially_upheld'] },
                resolvedAt: { type: 'string', format: 'date-time' },
                resolvedBy: { type: 'string' }
              }
            },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        CreateReportRequest: {
          type: 'object',
          required: ['reportedItemId', 'reportedItemType', 'reason', 'description'],
          properties: {
            reportedItemId: { 
              type: 'string', 
              example: '60d21b4667d0d8992e610c86' 
            },
            reportedItemType: { 
              type: 'string', 
              enum: ['Property', 'User', 'Review', 'Inquiry', 'Booking', 'Message'],
              example: 'Review' 
            },
            reason: { 
              type: 'string', 
              enum: ['spam', 'inappropriate', 'fake', 'harassment', 'scam', 'misleading', 'offensive', 'illegal', 'duplicate', 'wrong_category', 'incorrect_info', 'other'],
              example: 'inappropriate' 
            },
            description: { 
              type: 'string', 
              example: 'This review contains inappropriate language',
              maxLength: 500
            },
            priority: { 
              type: 'string', 
              enum: ['low', 'medium', 'high', 'critical'],
              default: 'medium' 
            }
          }
        },
        
        // ========== DISTRICT SCHEMAS ==========
        District: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'hodan' },
            name: { type: 'string', example: 'Hodan' },
            somali: { type: 'string', example: 'Hodan' },
            arabic: { type: 'string', example: 'هودان' },
            zone: { type: 'string', example: 'South' },
            population: { type: 'number', example: 450000 },
            area: { type: 'number', example: 15 },
            description: { type: 'string', example: 'Commercial and residential district' }
          }
        },
        DistrictDetail: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            somali: { type: 'string' },
            zone: { type: 'string' },
            population: { type: 'number' },
            area: { type: 'number' },
            coordinates: {
              type: 'object',
              properties: {
                lat: { type: 'number' },
                lng: { type: 'number' }
              }
            },
            stats: {
              type: 'object',
              properties: {
                avgRent: { type: 'number' },
                propertyCount: { type: 'number' },
                avgPricePerSqm: { type: 'number' },
                occupancyRate: { type: 'number' }
              }
            }
          }
        },
        
        // ========== STATS SCHEMAS ==========
        PlatformStats: {
          type: 'object',
          properties: {
            users: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                tenants: { type: 'number' },
                landlords: { type: 'number' },
                admins: { type: 'number' }
              }
            },
            properties: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                available: { type: 'number' },
                pending: { type: 'number' },
                rented: { type: 'number' }
              }
            },
            bookings: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                pending: { type: 'number' },
                confirmed: { type: 'number' },
                completed: { type: 'number' },
                cancelled: { type: 'number' }
              }
            },
            reviews: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                averageRating: { type: 'number' }
              }
            }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 100 },
            pages: { type: 'number', example: 10 }
          }
        }
      },
      parameters: {
        pageParam: {
          in: 'query',
          name: 'page',
          schema: { type: 'integer', minimum: 1, default: 1 },
          description: 'Page number'
        },
        limitParam: {
          in: 'query',
          name: 'limit',
          schema: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
          description: 'Number of items per page'
        },
        searchParam: {
          in: 'query',
          name: 'q',
          schema: { type: 'string', minLength: 2 },
          description: 'Search query'
        },
        districtParam: {
          in: 'query',
          name: 'district',
          schema: { type: 'string' },
          description: 'Filter by district'
        },
        minPriceParam: {
          in: 'query',
          name: 'minPrice',
          schema: { type: 'number', minimum: 0 },
          description: 'Minimum price'
        },
        maxPriceParam: {
          in: 'query',
          name: 'maxPrice',
          schema: { type: 'number', minimum: 0 },
          description: 'Maximum price'
        },
        typeParam: {
          in: 'query',
          name: 'type',
          schema: { type: 'string' },
          description: 'Property type'
        },
        bedroomsParam: {
          in: 'query',
          name: 'bedrooms',
          schema: { type: 'integer', minimum: 0 },
          description: 'Number of bedrooms'
        },
        sortParam: {
          in: 'query',
          name: 'sort',
          schema: { 
            type: 'string',
            enum: ['price_asc', 'price_desc', 'newest', 'oldest', 'most_viewed', 'highest_rated']
          },
          description: 'Sort order'
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Not authorized, no token'
              }
            }
          }
        },
        ForbiddenError: {
          description: 'Insufficient permissions',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Not authorized to access this resource'
              }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Resource not found'
              }
            }
          }
        },
        ValidationError: {
          description: 'Validation failed',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/ValidationError'
              }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: {
                $ref: '#/components/schemas/Error'
              },
              example: {
                success: false,
                message: 'Internal server error'
              }
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.js',
    './src/controllers/*.js',
    './src/models/*.js'
  ],
};

const specs = swaggerJsdoc(options);

// Custom Swagger UI options
const swaggerUiOptions = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none } .swagger-ui .info { margin: 20px 0 } .swagger-ui .scheme-container { margin: 10px 0 }',
  customSiteTitle: 'Kirada Guryaha API Documentation',
  customfavIcon: 'https://kirada-guryaha-backend.onrender.com/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    syntaxHighlight: {
      theme: 'monokai'
    },
    defaultModelsExpandDepth: -1,
    defaultModelExpandDepth: 5,
    docExpansion: 'list',
    tagsSorter: 'alpha',
    operationsSorter: 'alpha'
  }
};

module.exports = {
  swaggerUi,
  swaggerUiOptions,
  specs
};

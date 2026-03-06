# 🏠 Kirada Guryaha Backend API

<div align="center">
  <img src="https://via.placeholder.com/200x200.png?text=KG" alt="Kirada Guryaha Logo" width="200"/>
  <h3>Mogadishu's Premier Rental Property Platform</h3>
  <p>Connecting Landlords and Tenants Across All Districts of Mogadishu</p>
</div>

---

## 📋 Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Authentication](#authentication)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## 📖 Overview

**Kirada Guryaha** (Rental Properties in Somali) is a comprehensive backend API platform designed specifically for the Mogadishu rental property market. It connects landlords with tenants, enabling seamless property listings, bookings, inquiries, and secure communication without any payment processing.

The platform is tailored to the local context, supporting all 14 districts of Mogadishu, Somali phone number formats, and multiple languages (English, Somali, Arabic).

### 🎯 Key Objectives
- Digitize the rental property market in Mogadishu
- Provide verified landlord system to prevent scams
- Enable price comparison across different districts
- Create a trusted platform for tenants
- Support local context and languages

---

## ✨ Features

### 👥 User Management
- **Multi-role system**: Tenants, Landlords, Admins
- **JWT Authentication** with email verification
- **Phone verification** with Somali number support
- **Profile management** with avatar upload
- **Notification preferences** (email, push, SMS)
- **Two-factor authentication** (2FA) support

### 🏠 Property Management
- **Full CRUD operations** for properties
- **Rich property details** (amenities, rules, images)
- **Image upload** with automatic optimization
- **Featured properties** system
- **Property verification** by admins
- **Analytics tracking** (views, inquiries, bookings)

### 🔍 Search & Discovery
- **Advanced filtering** by district, price, type, amenities
- **Full-text search** across property listings
- **Price comparison** across districts
- **Nearby properties** with geolocation
- **Similar properties** recommendations
- **Favorites** system with notes and tags

### 📅 Booking System
- **Booking requests** with date selection
- **Availability calendar** integration
- **Status tracking** (pending, confirmed, cancelled, completed)
- **Booking reminders** via email and notifications
- **Check-in/out management**
- **No-show tracking**

### 💬 Communication
- **Inquiry system** for tenant-landlord communication
- **Real-time messaging** via Socket.io
- **Viewing scheduling** with confirmation
- **Reply notifications**
- **Inquiry rating** system

### ⭐ Reviews & Ratings
- **Multi-criteria ratings** (accuracy, communication, cleanliness, location, value)
- **Review moderation** by admins
- **Helpful votes** system
- **Landlord replies** to reviews
- **Review reporting** for inappropriate content

### 🔔 Notifications
- **Real-time notifications** via Socket.io
- **Email notifications** for all important events
- **Push notification** support
- **Notification preferences** per user
- **Unread count tracking**

### 📊 Analytics & Reporting
- **Property analytics** (views, inquiries, bookings)
- **User statistics** dashboard
- **Platform-wide statistics** for admins
- **Report system** for inappropriate content
- **Audit logs** for admin actions

### 🛡️ Security
- **JWT authentication** with refresh tokens
- **Rate limiting** to prevent abuse
- **Input validation** and sanitization
- **XSS protection**
- **NoSQL injection prevention**
- **CORS configuration**
- **Helmet.js** security headers

### 🗺️ Mogadishu-Specific Features
- **All 14 districts** with detailed information
- **District price comparison**
- **Somali language support** (`so` locale)
- **Somali phone number** validation (`+252` format)
- **Local timezone** (Africa/Mogadishu)

---

## 🛠️ Tech Stack

### Core Technologies
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | >= 18.0.0 | JavaScript runtime |
| Express.js | 4.18.x | Web framework |
| MongoDB | 7.0.x | Database |
| Mongoose | 7.5.x | ODM |
| JWT | 9.0.x | Authentication |
| Socket.io | 4.7.x | Real-time communication |

### Supporting Services
| Technology | Version | Purpose |
|------------|---------|---------|
| Redis | 7.0.x | Caching & rate limiting |
| Nodemailer | 6.9.x | Email sending |
| Bull | 4.11.x | Job queues |
| Multer | 1.4.x | File uploads |
| Sharp | 0.32.x | Image optimization |

### Security & Validation
| Technology | Version | Purpose |
|------------|---------|---------|
| Helmet | 7.0.x | Security headers |
| CORS | 2.8.x | Cross-origin resource sharing |
| Express-validator | 7.0.x | Request validation |
| Express-rate-limit | 6.10.x | Rate limiting |
| Bcryptjs | 2.4.x | Password hashing |
| XSS | 1.0.x | XSS prevention |
| Mongo-sanitize | 1.1.x | NoSQL injection prevention |

### Development Tools
| Tool | Version | Purpose |
|------|---------|---------|
| Nodemon | 3.0.x | Auto-restart during development |
| Jest | 29.6.x | Testing framework |
| Supertest | 6.3.x | HTTP assertions |
| ESLint | 8.49.x | Code linting |
| Prettier | 3.0.x | Code formatting |
| Husky | 8.0.x | Git hooks |

---

## 📁 Project Structure
kirada-guryaha-backend/
├── 📁 src/
│ ├── 📁 config/ # Configuration files
│ ├── 📁 constants/ # Constants (roles, districts, etc.)
│ ├── 📁 models/ # Database models
│ ├── 📁 controllers/ # Business logic
│ ├── 📁 routes/ # API routes
│ ├── 📁 middleware/ # Custom middleware
│ ├── 📁 services/ # External services
│ ├── 📁 utils/ # Helper functions
│ ├── 📁 validations/ # Request validation
│ ├── 📁 jobs/ # Scheduled jobs
│ ├── 📁 sockets/ # Socket.io handlers
│ └── 📁 templates/ # Email templates
├── 📁 tests/ # Test files
├── 📁 scripts/ # Utility scripts
├── 📁 uploads/ # File uploads
├── 📁 logs/ # Application logs
├── 📁 docs/ # Documentation
├── .env.example # Environment variables example
├── server.js # Entry point
└── package.json # Dependencies


---

## 🚀 Installation

### Prerequisites
- Node.js >= 18.0.0
- MongoDB >= 5.0
- Redis (optional, for caching)
- Git

### Step-by-Step Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/kirada-guryaha-backend.git
cd kirada-guryaha-backend

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env

# 4. Edit .env with your configuration
nano .env

# 5. Start MongoDB
# Ubuntu:
sudo systemctl start mongod
# macOS:
brew services start mongodb-community

# 6. Start Redis (optional)
redis-server

# 7. Create database indexes
npm run db:indexes

# 8. Seed database with sample data (optional)
npm run db:seed

# 9. Start development server
npm run dev"# kiro_guri_backend" 

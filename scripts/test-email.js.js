// scripts/test-email.js
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Email configuration
const YOUR_EMAIL = 'abdirahmanmohamedabdulle10@gmail.com';

// Create email transporter
const createTransporter = () => {
  // Check if email credentials exist
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email credentials not found in .env file');
    console.log('\nPlease add to .env:');
    console.log('EMAIL_USER=your-email@gmail.com');
    console.log('EMAIL_PASS=your-app-password');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false // Only for development
    }
  });
};

// Send test email
const sendTestEmail = async () => {
  console.log('\n📧 TESTING EMAIL CONFIGURATION...\n');
  
  try {
    // Create transporter
    const transporter = createTransporter();
    
    if (!transporter) {
      return;
    }

    // Verify connection
    console.log('🔍 Verifying email connection...');
    await transporter.verify();
    console.log('✅ Email connection verified successfully\n');

    // Create email content
    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          line-height: 1.6; 
          color: #333;
          margin: 0;
          padding: 0;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 10px;
        }
        .header { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white; 
          padding: 30px; 
          text-align: center;
          border-radius: 10px 10px 0 0;
          margin: -20px -20px 0 -20px;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content { 
          padding: 30px 20px;
          background: #f9f9f9;
        }
        .success-box {
          background: #d4edda;
          color: #155724;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          border: 1px solid #c3e6cb;
        }
        .info-box {
          background: #e7f3ff;
          color: #004085;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          border: 1px solid #b8daff;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
        }
        .footer { 
          text-align: center; 
          padding: 20px; 
          color: #666; 
          font-size: 12px;
          background: #f1f1f1;
          margin: 0 -20px -20px -20px;
          border-radius: 0 0 10px 10px;
        }
        .badge {
          display: inline-block;
          padding: 5px 10px;
          background: #28a745;
          color: white;
          border-radius: 3px;
          font-size: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        td {
          padding: 10px;
          border: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background: #f2f2f2;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 Kirada Guryaha</h1>
          <p>Email Test Successful!</p>
        </div>
        
        <div class="content">
          <div class="success-box">
            <strong>✅ Email Configuration is Working!</strong>
          </div>
          
          <h2>Test Email Details:</h2>
          
          <table>
            <tr>
              <td><strong>📧 From:</strong></td>
              <td>${process.env.EMAIL_FROM || 'noreply@kirada.com'}</td>
            </tr>
            <tr>
              <td><strong>📧 To:</strong></td>
              <td>${YOUR_EMAIL}</td>
            </tr>
            <tr>
              <td><strong>🕐 Time:</strong></td>
              <td>${new Date().toLocaleString()}</td>
            </tr>
            <tr>
              <td><strong>🔧 Host:</strong></td>
              <td>${process.env.EMAIL_HOST || 'smtp.gmail.com'}</td>
            </tr>
            <tr>
              <td><strong>🔌 Port:</strong></td>
              <td>${process.env.EMAIL_PORT || '587'}</td>
            </tr>
          </table>
          
          <div class="info-box">
            <h3>📋 Next Steps:</h3>
            <ul>
              <li>✅ Your email configuration is working correctly</li>
              <li>📧 You can now send real emails from your application</li>
              <li>🔔 Test notifications will be delivered to your inbox</li>
              <li>📨 Users will receive welcome emails, booking confirmations, etc.</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <span class="badge">✓ Verified</span>
          </div>
        </div>
        
        <div class="footer">
          <p>Kirada Guryaha - Rental Property Platform</p>
          <p>© ${new Date().getFullYear()} All rights reserved.</p>
          <p style="font-size: 11px; color: #999;">This is a test email. No action required.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    const mailOptions = {
      from: `"Kirada Guryaha Test" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: YOUR_EMAIL,
      subject: '✅ Kirada Guryaha - Email Test Successful',
      html: htmlContent,
      text: `
        Kirada Guryaha - Email Test Successful
        
        Your email configuration is working correctly!
        
        Time: ${new Date().toLocaleString()}
        From: ${process.env.EMAIL_FROM || process.env.EMAIL_USER}
        To: ${YOUR_EMAIL}
        
        Next Steps:
        - Your email configuration is working correctly
        - You can now send real emails from your application
        - Test notifications will be delivered to your inbox
        - Users will receive welcome emails, booking confirmations, etc.
        
        Kirada Guryaha - Rental Property Platform
      `
    };

    console.log('📧 Sending test email...');
    const info = await transporter.sendMail(mailOptions);
    
    console.log('\n✅ TEST EMAIL SENT SUCCESSFULLY!');
    console.log(`   📧 From: ${mailOptions.from}`);
    console.log(`   📧 To: ${YOUR_EMAIL}`);
    console.log(`   📧 Subject: ${mailOptions.subject}`);
    console.log(`   📧 Message ID: ${info.messageId}`);
    
    // Gmail specific - if using Gmail, show the sent folder link
    if (process.env.EMAIL_HOST?.includes('gmail')) {
      console.log(`   📧 Check your Gmail inbox: https://mail.google.com/`);
    }
    
    // Preview URL for ethereal (if using ethereal)
    if (info.previewUrl) {
      console.log(`   📧 Preview URL: ${info.previewUrl}`);
    }
    
    console.log('\n✅ Email test completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Email test failed:');
    console.error(`   Error: ${error.message}`);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔧 Authentication Error:');
      console.error('   - Check your EMAIL_USER and EMAIL_PASS in .env file');
      console.error('   - For Gmail, you need to use an "App Password" not your regular password');
      console.error('   - Enable 2-Factor Authentication and generate App Password');
    } else if (error.code === 'ESOCKET') {
      console.error('\n🔧 Connection Error:');
      console.error('   - Check your EMAIL_HOST and EMAIL_PORT');
      console.error('   - Make sure your internet connection is working');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('\n🔧 Timeout Error:');
      console.error('   - SMTP server is not responding');
      console.error('   - Check your firewall settings');
    }
    
    console.error('\n📋 Current Email Configuration:');
    console.error(`   EMAIL_HOST: ${process.env.EMAIL_HOST || 'NOT SET'}`);
    console.error(`   EMAIL_PORT: ${process.env.EMAIL_PORT || 'NOT SET'}`);
    console.error(`   EMAIL_USER: ${process.env.EMAIL_USER ? '✓ SET' : '✗ NOT SET'}`);
    console.error(`   EMAIL_PASS: ${process.env.EMAIL_PASS ? '✓ SET' : '✗ NOT SET'}`);
    console.error(`   EMAIL_FROM: ${process.env.EMAIL_FROM || 'NOT SET'}`);
  }
};

// Run the test
sendTestEmail();
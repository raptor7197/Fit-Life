const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
    this.init();
  }

  /**
   * Initialize email service with SMTP configuration
   */
  async init() {
    try {
      if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('⚠️ Email service not configured. Email notifications will be disabled.');
        return;
      }

      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false // Allow self-signed certificates
        }
      });

      // Verify SMTP configuration
      await this.transporter.verify();
      this.isConfigured = true;
      console.log('✅ Email service configured successfully');
    } catch (error) {
      console.error('❌ Email service configuration failed:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Send email notification
   */
  async sendNotification(user, notification) {
    if (!this.isConfigured) {
      console.log('📧 Email service not configured, skipping email notification');
      return false;
    }

    try {
      const emailTemplate = this.getEmailTemplate(notification);
      
      const mailOptions = {
        from: `"FitLife Gym Buddy" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
        text: emailTemplate.text
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Email sent to ${user.email}:`, result.messageId);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send email to ${user.email}:`, error.message);
      return false;
    }
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(user) {
    if (!this.isConfigured) return false;

    try {
      const mailOptions = {
        from: `"FitLife Gym Buddy" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Welcome to FitLife - Your Fitness Journey Begins!',
        html: this.getWelcomeEmailTemplate(user),
        text: `Welcome to FitLife, ${user.name}! We're excited to help you achieve your fitness goals.`
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Welcome email sent to ${user.email}:`, result.messageId);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send welcome email to ${user.email}:`, error.message);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(user, resetToken) {
    if (!this.isConfigured) return false;

    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: `"FitLife Gym Buddy" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Password Reset Request - FitLife',
        html: this.getPasswordResetTemplate(user, resetUrl),
        text: `Password reset requested for ${user.email}. Visit: ${resetUrl}`
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Password reset email sent to ${user.email}:`, result.messageId);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send password reset email to ${user.email}:`, error.message);
      return false;
    }
  }

  /**
   * Send weekly progress report email
   */
  async sendWeeklyReport(user, reportData) {
    if (!this.isConfigured) return false;

    try {
      const mailOptions = {
        from: `"FitLife Gym Buddy" <${process.env.SMTP_USER}>`,
        to: user.email,
        subject: 'Your Weekly Fitness Progress Report',
        html: this.getWeeklyReportTemplate(user, reportData),
        text: `Weekly fitness report for ${user.name}. Login to view detailed progress.`
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Weekly report sent to ${user.email}:`, result.messageId);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send weekly report to ${user.email}:`, error.message);
      return false;
    }
  }

  /**
   * Get email template based on notification type
   */
  getEmailTemplate(notification) {
    const baseTemplate = {
      subject: notification.title,
      html: this.getBaseEmailTemplate(notification.title, notification.message, notification.metadata?.actionUrl),
      text: `${notification.title}\n\n${notification.message}`
    };

    switch (notification.type) {
      case 'reminder':
        baseTemplate.subject = `🏋️ ${notification.title}`;
        break;
      case 'achievement':
        baseTemplate.subject = `🎉 ${notification.title}`;
        break;
      case 'goal-deadline':
        baseTemplate.subject = `⏰ ${notification.title}`;
        break;
      case 'encouragement':
        baseTemplate.subject = `💪 ${notification.title}`;
        break;
      default:
        break;
    }

    return baseTemplate;
  }

  /**
   * Base email template with FitLife branding
   */
  getBaseEmailTemplate(title, message, actionUrl = null) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: 'Poppins', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f7fa;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .logo {
            font-size: 32px;
            font-weight: bold;
            color: #666A86;
            margin-bottom: 10px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #666A86;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #788AA3;
            margin-bottom: 30px;
            line-height: 1.8;
        }
        .cta-button {
            display: inline-block;
            background: #92B6B1;
            color: white;
            padding: 15px 30px;
            border-radius: 12px;
            text-decoration: none;
            font-weight: 600;
            text-align: center;
            transition: all 0.3s ease;
        }
        .cta-button:hover {
            background: #666A86;
            transform: translateY(-2px);
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #E8DDB5;
            text-align: center;
            font-size: 14px;
            color: #788AA3;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #92B6B1;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">FitLife</div>
            <div style="color: #B2C9AB; font-size: 14px;">Your Fitness Journey Partner</div>
        </div>
        
        <div class="title">${title}</div>
        
        <div class="message">${message}</div>
        
        ${actionUrl ? `
        <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}" class="cta-button">Take Action</a>
        </div>
        ` : ''}
        
        <div class="footer">
            <div class="social-links">
                <a href="#">Facebook</a>
                <a href="#">Instagram</a>
                <a href="#">Twitter</a>
            </div>
            <p>Transform your fitness journey with FitLife!</p>
            <p>© ${new Date().getFullYear()} FitLife Gym Buddy. All rights reserved.</p>
            <p style="font-size: 12px; color: #999;">
                If you no longer wish to receive these emails, 
                <a href="#" style="color: #92B6B1;">unsubscribe here</a>
            </p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Welcome email template
   */
  getWelcomeEmailTemplate(user) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to FitLife</title>
    <style>
        body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f7fa; }
        .container { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 32px; font-weight: bold; color: #666A86; margin-bottom: 10px; }
        .welcome-title { font-size: 28px; font-weight: 600; color: #666A86; margin: 20px 0; }
        .message { font-size: 16px; color: #788AA3; margin-bottom: 20px; line-height: 1.8; }
        .feature-list { background: #E8DDB5; padding: 20px; border-radius: 12px; margin: 20px 0; }
        .feature-item { margin: 10px 0; font-size: 14px; color: #666A86; }
        .cta-button { display: inline-block; background: #92B6B1; color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E8DDB5; text-align: center; font-size: 14px; color: #788AA3; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">FitLife</div>
            <div style="color: #B2C9AB; font-size: 14px;">Your Fitness Journey Partner</div>
        </div>
        
        <div class="welcome-title">Welcome, ${user.name}! 🎉</div>
        
        <div class="message">
            We're thrilled to have you join the FitLife community! Your fitness journey starts now, and we're here to support you every step of the way.
        </div>
        
        <div class="feature-list">
            <div style="font-weight: 600; color: #666A86; margin-bottom: 15px;">What you can do with FitLife:</div>
            <div class="feature-item">📊 Track your workouts and progress</div>
            <div class="feature-item">🎯 Set and achieve fitness goals</div>
            <div class="feature-item">🤖 Get AI-powered recommendations</div>
            <div class="feature-item">🏆 Earn achievements and build streaks</div>
            <div class="feature-item">💬 Receive personalized notifications</div>
        </div>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/dashboard" class="cta-button">Start Your Journey</a>
        </div>
        
        <div class="message">
            Ready to transform your life? Log your first workout and begin building healthy habits that will last a lifetime!
        </div>
        
        <div class="footer">
            <p>Need help getting started? Reply to this email and we'll be happy to assist you!</p>
            <p>© ${new Date().getFullYear()} FitLife Gym Buddy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Password reset email template
   */
  getPasswordResetTemplate(user, resetUrl) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - FitLife</title>
    <style>
        body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f7fa; }
        .container { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 32px; font-weight: bold; color: #666A86; margin-bottom: 10px; }
        .title { font-size: 24px; font-weight: 600; color: #666A86; margin-bottom: 20px; text-align: center; }
        .message { font-size: 16px; color: #788AA3; margin-bottom: 20px; line-height: 1.8; }
        .cta-button { display: inline-block; background: #92B6B1; color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0; }
        .security-note { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #856404; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #E8DDB5; text-align: center; font-size: 14px; color: #788AA3; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">FitLife</div>
            <div style="color: #B2C9AB; font-size: 14px;">Your Fitness Journey Partner</div>
        </div>
        
        <div class="title">Password Reset Request</div>
        
        <div class="message">
            Hi ${user.name},<br><br>
            We received a request to reset your password for your FitLife account. Click the button below to create a new password:
        </div>
        
        <div style="text-align: center;">
            <a href="${resetUrl}" class="cta-button">Reset Password</a>
        </div>
        
        <div class="security-note">
            <strong>Security Note:</strong> This password reset link will expire in 1 hour for your security. 
            If you didn't request this reset, please ignore this email and your password will remain unchanged.
        </div>
        
        <div class="message">
            If the button doesn't work, you can copy and paste this link into your browser:<br>
            <a href="${resetUrl}" style="color: #92B6B1; word-break: break-all;">${resetUrl}</a>
        </div>
        
        <div class="footer">
            <p>If you have any questions, please contact our support team.</p>
            <p>© ${new Date().getFullYear()} FitLife Gym Buddy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Weekly report email template
   */
  getWeeklyReportTemplate(user, reportData) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Weekly Progress Report</title>
    <style>
        body { font-family: 'Poppins', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f7fa; }
        .container { background: white; padding: 40px; border-radius: 20px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .logo { font-size: 32px; font-weight: bold; color: #666A86; margin-bottom: 10px; }
        .title { font-size: 24px; font-weight: 600; color: #666A86; margin-bottom: 20px; text-align: center; }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
        .stat-card { background: #E8DDB5; padding: 15px; border-radius: 12px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: bold; color: #666A86; }
        .stat-label { font-size: 12px; color: #788AA3; }
        .message { font-size: 16px; color: #788AA3; margin-bottom: 20px; line-height: 1.8; }
        .cta-button { display: inline-block; background: #92B6B1; color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: 600; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">FitLife</div>
            <div style="color: #B2C9AB; font-size: 14px;">Your Weekly Progress Report</div>
        </div>
        
        <div class="title">Great Week, ${user.name}! 📊</div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-value">${reportData?.workouts || 0}</div>
                <div class="stat-label">Workouts Completed</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${reportData?.minutes || 0}</div>
                <div class="stat-label">Minutes Exercised</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${reportData?.streak || 0}</div>
                <div class="stat-label">Current Streak</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${reportData?.goals || 0}</div>
                <div class="stat-label">Goals Achieved</div>
            </div>
        </div>
        
        <div class="message">
            You're making excellent progress on your fitness journey! Keep up the momentum and remember that consistency is the key to long-term success.
        </div>
        
        <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL}/stats" class="cta-button">View Full Report</a>
        </div>
        
        <div class="footer">
            <p>Keep pushing towards your goals!</p>
            <p>© ${new Date().getFullYear()} FitLife Gym Buddy. All rights reserved.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Test email configuration
   */
  async testConnection() {
    if (!this.isConfigured) {
      return { success: false, message: 'Email service not configured' };
    }

    try {
      await this.transporter.verify();
      return { success: true, message: 'Email service connection successful' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
}

module.exports = new EmailService();
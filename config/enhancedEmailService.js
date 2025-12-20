const { Resend } = require('resend');
const nodemailer = require('nodemailer');

// Enhanced email service with multiple providers
class EmailService {
  constructor() {
    this.resend = null;
    this.nodemailerTransporter = null;
    this.isResendReady = false;
    this.isNodemailerReady = false;
    this.init();
  }

  async init() {
    // Initialize Resend if API key is available
    if (process.env.RESEND_API_KEY) {
      try {
        this.resend = new Resend(process.env.RESEND_API_KEY);
        this.isResendReady = true;
        console.log('✅ Resend email service initialized');
      } catch (error) {
        console.error('❌ Resend initialization failed:', error.message);
      }
    }

    // Initialize Nodemailer as fallback
    if (process.env.EMAIL && process.env.EMAIL_PASSWORD) {
      try {
        this.nodemailerTransporter = nodemailer.createTransporter({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
          },
          tls: {
            rejectUnauthorized: false
          }
        });

        // Verify nodemailer connection
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Verification timeout')), 15000);
          
          this.nodemailerTransporter.verify((error, success) => {
            clearTimeout(timeout);
            if (error) {
              console.warn('⚠️ Nodemailer verification failed:', error.message);
              resolve(false);
            } else {
              console.log('✅ Nodemailer email service initialized');
              resolve(true);
            }
          });
        }).then(() => {
          this.isNodemailerReady = true;
        }).catch(() => {
          this.isNodemailerReady = false;
        });

      } catch (error) {
        console.error('❌ Nodemailer initialization failed:', error.message);
        this.isNodemailerReady = false;
      }
    }

    if (!this.isResendReady && !this.isNodemailerReady) {
      console.error('❌ No email service available. Please configure RESEND_API_KEY or EMAIL credentials');
    }
  }

  // Enhanced HTML template
  generateOTPEmailTemplate(otp) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Redigo - Email Verification</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f8fafc;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: white; border-radius: 16px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1); overflow: hidden;">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); padding: 40px 30px; text-align: center;">
              <div style="display: inline-block; background-color: rgba(255, 255, 255, 0.2); border-radius: 50%; padding: 20px; margin-bottom: 20px;">
                <div style="font-size: 48px;">🚗</div>
              </div>
              <h1 style="color: white; margin: 0; font-size: 32px; font-weight: 700; letter-spacing: -0.5px;">Redigo</h1>
              <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Your trusted carpooling companion</p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 28px; font-weight: 600;">Verify Your Email</h2>
              
              <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Welcome to Redigo! To complete your registration and start your carpooling journey, please verify your email address using the OTP code below.
              </p>

              <!-- OTP Section -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border: 2px solid #0891b2; border-radius: 16px; padding: 30px; text-align: center; margin: 30px 0;">
                <p style="color: #0891b2; margin: 0 0 15px 0; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
                <div style="background-color: #0891b2; color: white; font-size: 42px; font-weight: 700; letter-spacing: 12px; padding: 20px; border-radius: 12px; font-family: 'Courier New', monospace; text-align: center; box-shadow: 0 4px 12px rgba(8, 145, 178, 0.3);">
                  ${otp}
                </div>
                <p style="color: #0369a1; margin: 15px 0 0 0; font-size: 14px;">Enter this code in your Redigo app</p>
              </div>

              <!-- Important Notice -->
              <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 30px 0; border-radius: 8px;">
                <div style="display: flex; align-items: flex-start;">
                  <div style="font-size: 20px; margin-right: 12px;">⏰</div>
                  <div>
                    <p style="color: #92400e; margin: 0; font-size: 15px; font-weight: 600;">Time Sensitive Code</p>
                    <p style="color: #a16207; margin: 5px 0 0 0; font-size: 14px;">This verification code expires in <strong>5 minutes</strong>. Please use it promptly to complete your registration.</p>
                  </div>
                </div>
              </div>

              <!-- Features Preview -->
              <div style="margin: 40px 0;">
                <h3 style="color: #1f2937; margin: 0 0 20px 0; font-size: 20px;">What you can do with Redigo:</h3>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                  <div style="display: flex; align-items: center; padding: 15px; background-color: #f8fafc; border-radius: 8px;">
                    <div style="font-size: 24px; margin-right: 12px;">🔍</div>
                    <div>
                      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">Find Rides</p>
                      <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Search & book rides</p>
                    </div>
                  </div>
                  <div style="display: flex; align-items: center; padding: 15px; background-color: #f8fafc; border-radius: 8px;">
                    <div style="font-size: 24px; margin-right: 12px;">🚙</div>
                    <div>
                      <p style="margin: 0; font-size: 14px; font-weight: 600; color: #374151;">Offer Rides</p>
                      <p style="margin: 2px 0 0 0; font-size: 12px; color: #6b7280;">Share your journey</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Security Notice -->
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 12px; margin-top: 30px;">
                <p style="color: #6b7280; font-size: 14px; margin: 0; text-align: center;">
                  🔒 <strong>Security Notice:</strong> Never share this code with anyone. Redigo will never ask for your OTP via phone or email.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background-color: #f9fafb; padding: 30px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">
                Need help? Contact us at <a href="mailto:support@redigo.com" style="color: #0891b2; text-decoration: none;">support@redigo.com</a>
              </p>
              <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                © 2025 Redigo. Making carpooling simple and sustainable.
              </p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Send email using Resend (primary method)
  async sendWithResend(to, subject, otp) {
    if (!this.isResendReady) {
      throw new Error('Resend service not available');
    }

    try {
      console.log('📧 Sending email via Resend to:', to);
      
      const data = await this.resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'Redigo <noreply@redigo.com>',
        to: [to],
        subject: subject || 'Your Redigo Verification Code',
        html: this.generateOTPEmailTemplate(otp),
        text: `
Welcome to Redigo!

Your verification code is: ${otp}

This code expires in 5 minutes. Please use it to complete your email verification.

If you didn't request this code, please ignore this email.

Best regards,
The Redigo Team
        `.trim()
      });

      console.log('✅ Email sent via Resend:', data.id);
      return { success: true, provider: 'Resend', messageId: data.id };
    } catch (error) {
      console.error('❌ Resend failed:', error.message);
      throw error;
    }
  }

  // Send email using Nodemailer (fallback method)
  async sendWithNodemailer(to, subject, otp) {
    if (!this.isNodemailerReady) {
      throw new Error('Nodemailer service not available');
    }

    try {
      console.log('📧 Sending email via Nodemailer to:', to);
      
      const mailOptions = {
        from: `"Redigo" <${process.env.EMAIL}>`,
        to: to,
        subject: subject || 'Your Redigo Verification Code',
        html: this.generateOTPEmailTemplate(otp),
        text: `
Welcome to Redigo!

Your verification code is: ${otp}

This code expires in 5 minutes. Please use it to complete your email verification.

If you didn't request this code, please ignore this email.

Best regards,
The Redigo Team
        `.trim()
      };

      const info = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Email timeout')), 30000);
        
        this.nodemailerTransporter.sendMail(mailOptions, (error, result) => {
          clearTimeout(timeout);
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      });

      console.log('✅ Email sent via Nodemailer:', info.messageId);
      return { success: true, provider: 'Nodemailer', messageId: info.messageId };
    } catch (error) {
      console.error('❌ Nodemailer failed:', error.message);
      throw error;
    }
  }

  // Main send method with automatic fallback
  async sendOTP(to, subject, otp) {
    const errors = [];

    // Try Resend first (primary)
    if (this.isResendReady) {
      try {
        return await this.sendWithResend(to, subject, otp);
      } catch (error) {
        errors.push(`Resend: ${error.message}`);
        console.warn('⚠️ Resend failed, trying Nodemailer...');
      }
    }

    // Fallback to Nodemailer
    if (this.isNodemailerReady) {
      try {
        return await this.sendWithNodemailer(to, subject, otp);
      } catch (error) {
        errors.push(`Nodemailer: ${error.message}`);
        console.warn('⚠️ Nodemailer also failed');
      }
    }

    // Both methods failed
    const errorMessage = `All email services failed: ${errors.join(', ')}`;
    console.error('❌', errorMessage);
    throw new Error(errorMessage);
  }

  // Get service status
  getStatus() {
    return {
      resend: this.isResendReady,
      nodemailer: this.isNodemailerReady,
      hasAnyService: this.isResendReady || this.isNodemailerReady
    };
  }
}

// Create singleton instance
const emailService = new EmailService();

module.exports = emailService;
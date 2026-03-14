import nodemailer from 'nodemailer';

const getEmailFrom = () => process.env.EMAIL_FROM || process.env.EMAIL_USER;

const createTransporter = () => {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        return null;
    }

    if (process.env.EMAIL_HOST) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT || 587),
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

const getTransporter = () => createTransporter();

// Send OTP email to student
export const sendOTPEmail = async (email, otp, fullName) => {
    const transporter = getTransporter();
    if (!transporter) {
        throw new Error('Email service is not configured');
    }

    try {
        const mailOptions = {
            from: getEmailFrom(),
            to: email,
            subject: '📧 Email Verification - Placement Management System',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        
                        <h2 style="color: #1e40af; text-align: center; margin-bottom: 10px;">Welcome to Placement Management System!</h2>
                        <p style="text-align: center; color: #666; margin-bottom: 30px;">Verify your email to complete registration</p>
                        
                        <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0; color: #333;">
                                <strong>Hi ${fullName || 'Student'},</strong>
                            </p>
                            <p style="margin: 10px 0 0 0; color: #555;">
                                Thank you for registering! Use the OTP below to verify your email address.
                            </p>
                        </div>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="background-color: #0284c7; color: white; padding: 20px; border-radius: 8px; display: inline-block;">
                                <p style="margin: 0; font-size: 14px; color: #e0f2fe;">Your OTP</p>
                                <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
                                    ${otp}
                                </p>
                            </div>
                        </div>
                        
                        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                            <p style="margin: 0; color: #92400e; font-size: 14px;">
                                <strong>⏰ Important:</strong> This OTP is valid for 15 minutes only. Do not share it with anyone.
                            </p>
                        </div>
                        
                        <p style="color: #666; margin: 20px 0; font-size: 14px;">
                            If you didn't register for this account, please ignore this email.
                        </p>
                        
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
                        
                        <p style="text-align: center; color: #999; font-size: 12px; margin: 0;">
                            Training & Placement Office (TPO)<br>
                            © 2026 All rights reserved
                        </p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ OTP email sent to ${email}`, info.response);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send OTP email to ${email}:`, error.message);
        throw error;
    }
};

// General purpose notification email (used for applicant notifications)
export const sendNotificationEmail = async (to, subject, html, text = '') => {
    const transporter = getTransporter();
    if (!transporter) {
        console.log(`⚠️  Email not configured. Would send to ${to}: ${subject}`);
        return { skipped: true };
    }

    const mailOptions = {
        from: getEmailFrom(),
        to,
        subject,
        html,
        text
    };

    const info = await transporter.sendMail(mailOptions);
    return { skipped: false, response: info.response };
};

// Verify transporter connection
export const verifyEmailConfig = async () => {
    try {
        const transporter = getTransporter();
        if (!transporter) {
            console.log('⚠️  Email not configured');
            return false;
        }
        await transporter.verify();
        return true;
    } catch (error) {
        console.error('❌ Email service configuration failed:', error.message);
        return false;
    }
};

export const sendPasswordResetEmail = async (email, otp, name = 'User') => {
    const transporter = getTransporter();
    if (!transporter) {
        throw new Error('Email service is not configured');
    }

    try {
        const mailOptions = {
            from: getEmailFrom(),
            to: email,
            subject: '🔐 Password Reset OTP - Placement Management System',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">
                    <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                        <h2 style="color: #1e40af; text-align: center; margin-bottom: 10px;">Password Reset Request</h2>
                        <p style="text-align: center; color: #666; margin-bottom: 30px;">Use the OTP below to reset your password</p>

                        <div style="background-color: #f0f9ff; border-left: 4px solid #0284c7; padding: 15px; margin: 20px 0;">
                            <p style="margin: 0; color: #333;"><strong>Hi ${name},</strong></p>
                            <p style="margin: 10px 0 0 0; color: #555;">We received a password reset request for your account.</p>
                        </div>

                        <div style="text-align: center; margin: 30px 0;">
                            <div style="background-color: #0284c7; color: white; padding: 20px; border-radius: 8px; display: inline-block;">
                                <p style="margin: 0; font-size: 14px; color: #e0f2fe;">Reset OTP</p>
                                <p style="margin: 10px 0 0 0; font-size: 32px; font-weight: bold; letter-spacing: 5px;">
                                    ${otp}
                                </p>
                            </div>
                        </div>

                        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
                            <p style="margin: 0; color: #92400e; font-size: 14px;">
                                <strong>⏰ Important:</strong> This OTP is valid for 15 minutes only.
                            </p>
                        </div>

                        <p style="color: #666; margin: 20px 0; font-size: 14px;">If you did not request this reset, please ignore this email.</p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Password reset email sent to ${email}`, info.response);
        return true;
    } catch (error) {
        console.error(`❌ Failed to send password reset email to ${email}:`, error.message);
        throw error;
    }
};

export default getTransporter;

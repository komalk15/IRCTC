require('dotenv').config();

const sgMail = require('@sendgrid/mail');
const { config } = require('../config');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendOtpEmail(email, otp) {
    const msg = {
        to: email,
        from: `${config.MAIL_SEND}`,
        subject: 'Your DesignKarle verification code',
        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 420px;
                margin: auto;
                padding: 24px;
                border: 1px solid #e5e5e5;
                border-radius: 10px;
                background: #ffffff;
                box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            ">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #4A3AFF; margin: 0;">
                        DesignKarle
                    </h2>
                </div>

                <p style="font-size: 16px; color: #333;">
                    Hi,
                </p>

                <p style="font-size: 16px; color: #333;">
                    Use the verification code below to verify your email address.
                </p>

                <div style="
                    text-align: center;
                    margin: 24px 0;
                    padding: 16px;
                    background: #f5f5ff;
                    border-radius: 8px;
                ">
                    <h1 style="
                        color: #4A3AFF;
                        letter-spacing: 6px;
                        margin: 0;
                        font-size: 30px;
                    ">
                        ${otp}
                    </h1>
                </div>

                <p style="font-size: 14px; color: #555;">
                    This verification code expires in 5 minutes.
                    Please do not share it with anyone.
                </p>

                <p style="font-size: 14px; color: #555;">
                    If you did not request this code, you can safely ignore this email.
                </p>

                <hr style="border: none; border-top: 1px solid #e5e5e5;">

                <p style="
                    font-size: 12px;
                    color: #888;
                    text-align: center;
                ">
                    &copy; DesignKarle. All rights reserved.
                </p>
            </div>
        `
    };

    try {
        await sgMail.send(msg);
        console.log(`[SendGrid] OTP email sent successfully to ${email}`);
    } catch (error) {
        console.error('[SendGrid Error]:', error.response?.body?.errors || error.message);

        // In development mode, log OTP to console so signup flow isn't blocked by unverified sender
        if (config.NODE_ENV === 'development') {
            console.log(`\n========================================`);
            console.log(`⚠️  [DEV FALLBACK] SendGrid sender not verified yet.`);
            console.log(`👉 Verification OTP for ${email} is: ${otp}`);
            console.log(`========================================\n`);
            return;
        }

        throw error;
    }
}

async function verifyOtpEmail(meta) {
    const msg = {
        to: meta.email,
        from: `${config.MAIL_SEND}`,
        subject: 'Welcome to DesignKarle - Account Verified',
        html: `
            <div style="
                font-family: Arial, sans-serif;
                max-width: 420px;
                margin: auto;
                padding: 24px;
                border: 1px solid #e5e5e5;
                border-radius: 10px;
                background: #ffffff;
                box-shadow: 0 4px 10px rgba(0,0,0,0.05);
            ">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h2 style="color: #4A3AFF; margin: 0;">
                        DesignKarle
                    </h2>
                </div>
                <p style="font-size: 16px; color: #333;">
                    Hi ${meta.firstName || ''},
                </p>
                <p style="font-size: 16px; color: #333;">
                    Your account has been successfully verified and registered! Welcome aboard.
                </p>
                <hr style="border: none; border-top: 1px solid #e5e5e5;">
                <p style="font-size: 12px; color: #888; text-align: center;">
                    &copy; DesignKarle. All rights reserved.
                </p>
            </div>
        `
    };

    try {
        await sgMail.send(msg);
        console.log(`[SendGrid] Welcome email sent successfully to ${meta.email}`);
    } catch (error) {
        console.error('[SendGrid Error]:', error.response?.body?.errors || error.message);
        if (config.NODE_ENV === 'development') {
            console.log(`[DEV FALLBACK] Account verification welcome email triggered for ${meta.email}`);
            return;
        }
    }
}

module.exports = { sendOtpEmail, verifyOtpEmail };

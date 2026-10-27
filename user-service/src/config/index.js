const dotenv = require('dotenv');
dotenv.config();

const config = {
    PORT: process.env.PORT || 4001,
    SERVER_NAME: process.env.SERVER_NAME || 'User Service',
    NODE_ENV: process.env.NODE_ENV || 'development',
    ALLOWED_ORIGIN: process.env.ALLOWED_ORIGIN || '*',
    DATABASE_URL: process.env.DATABASE_URL,
    REDIS_URL: process.env.REDIS_URL || 'redis://:irctcpass@localhost:6379',
    REDIS_USER_TTL: parseInt(process.env.REDIS_USER_TTL || '86400', 10),
    SENDGRID_API_KEY: process.env.SENDGRID_API_KEY,
    SENDGRID_FROM_EMAIL: process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
    MAIL_SEND: process.env.MAIL_SEND || process.env.SENDGRID_FROM_EMAIL || 'noreply@example.com',
    HMAC_SECRET: process.env.HMAC_SECRET || 'your_hmac_secret_key_here',
    OTP_TTL: parseInt(process.env.OTP_TTL || '300', 10),
    OTP_RATE_MAX_PER_HOUR: parseInt(process.env.OTP_RATE_MAX_PER_HOUR || '5', 10),
    OTP_MAX_VERIFY_ATTEMPT: parseInt(process.env.OTP_MAX_VERIFY_ATTEMPT || '5', 10)
};

module.exports = { config };

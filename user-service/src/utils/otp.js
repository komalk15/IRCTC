const { TooManyRequestsError } = require("./error");
const { config } = require('../config');
const { redis } = require('../config/redis');
const otpGenerator = require('otp-generator');
const crypto = require('crypto');

const RATE_MAX = parseInt(config.OTP_RATE_MAX_PER_HOUR || '5', 10);
const OTP_TTL = parseInt(config.OTP_TTL || '300', 10);
const HMAC_SECRET = config.HMAC_SECRET;
const ATTEMPT_MAX = parseInt(config.OTP_MAX_VERIFY_ATTEMPT || '5',10);
function hmacFor(email,otp)
{
    return crypto.createHmac('sha256' ,HMAC_SECRET ).update(email + ":"+otp).digest('hex');
}
//rate limiting in opt generation
async function generateAndStoreOtp(meta)
{
    // how many otp req has been send to this email
    const rateKey = `otp:rate:${meta.email}`;
    // This value will be found from redis because redis hold key like this
    // Redis stores value like this otp:rate:komal@example.com -> "3"
    // The 10 tells parseInt() to interpret the string as a base-10 decimal number.
    const sentCount = parseInt(await redis.get(rateKey) || '0', 10);
    if(sentCount >= RATE_MAX)
    {
        throw new TooManyRequestsError("Too many requests. Try again later. OTP rate limit reached.");
    }

    // Generate 6-digit numeric OTP
    const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false
    });

    const otpSessionId = crypto.randomUUID();
    const hashed = hmacFor(meta.email, otp);
    await redis.set(`otp:session:${otpSessionId}`, JSON.stringify({
        hashedOtp: hashed,
        meta
    }),
    'EX',
    OTP_TTL);

    await redis.incr(rateKey);
    // 3600 = 1 hour window
    await redis.expire(rateKey, 3600);

    return { otp, otpSessionId };
}
async function verifyOtp(otp, otpSessionId){
    const rawData = await redis.get(`otp:session:${otpSessionId}`);
    if(!rawData) return null;
    const {hashedOtp : storedOtp , meta} = JSON.parse(rawData);

    const attemptsKey = `otp:attempts:${meta.email}`;
    const attemptsCount = parseInt(await redis.get(attemptsKey)|| '0', 10);

    if(attemptsCount>= ATTEMPT_MAX)
    {
        throw new TooManyRequestsError("Too many attemps to verify OTP")
    }

    const hashedOtp = hmacFor(meta.email, otp);
    if(crypto.timingSafeEqual(
        Buffer.from(hashedOtp ,'hex'),
        Buffer.from(storedOtp,'hex')))
        {
        await redis.del(`otp:session:${otpSessionId}`, attemptsKey);
        await redis.del(`otp:rate:${meta.email}`);
        return meta;
        }
        else{
        await redis.incr(attemptsKey);
            await redis.expire(attemptsKey,config.OTP_TTL);
        return null;
    }
    

}

module.exports = { generateAndStoreOtp, verifyOtp};
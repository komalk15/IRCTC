
const { BadRequestError } = require("../utils/error");
const {asyncHandler} = require("../utils/asyncHandler");
const {config} = require("../config");
const authService = require("../services/auth.service");

// Routes the HTTP request to the correct handler
// This code is the controller for sending an OTP during user registration in your IRCTC backend.

// Its job is to receive registration details from the frontend, validate them, call the authentication service to send an OTP, store an OTP session ID in a cookie, and return a response to the frontend.
exports.sendOTP = asyncHandler(async (req, res) => {
    const {
        firstName,
        lastName,
        email,
        password,
        confirmPassword
    } = req.body;

    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        throw new BadRequestError("All fields are mandatory");
    }

    if (password !== confirmPassword) {
        throw new BadRequestError("Passwords do not match");
    }

    const { otpSessionId } = await authService.sendOTP(
        firstName,
        lastName,
        email,
        password
    );

    res.cookie("otp_session", otpSessionId, {
        httpOnly: true,
        secure: config.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: config.OTP_TTL * 1000
    });

    return res.status(200).json({
        success: true,
        message: "OTP sent successfully"
    });
});

// An async function is a function that allows you to use await to handle asynchronous operations such as API calls, database queries, Redis operations, and reading files.

// In simple words, an asynchronous operation allows JavaScript to continue doing other work while waiting for an operation to complete.




exports.verifyOTP = asyncHandler(async (req, res) =>
{
    const {otp} = req.body;
    const otpSessionId = req.cookies.otp_session;
    if(!otp  || !otpSessionId)
    {
        throw new BadRequestError("OTP or OTPSession is missing")

    }
    const user = await authService.verifyOTP(otp, otpSessionId);
    res.clearCookie("otp_session");

    return res.status(201).json({
        success: true,
        message: "User Account created successfully",
        data: user
    });
});

exports.verifyOtp = exports.verifyOTP;
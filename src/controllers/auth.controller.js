import authModel from "../models/auth.model.js";
import { validationResult } from "express-validator";
import { hashPassword, verifyPassword } from "../lib/hashingPassword.js";
import jwt from "jsonwebtoken";
import redis from "../lib/redis.js";

const {
  registerModel,
  loginModel,
  forgotPasswordModel,
  updateUserPasswordModel,
  CheckPassword
} = authModel;

/**
 * POST /auth/register
 * @summary Register new user
 * @tags Auth
 * @param {object} request.body.required - Register data
 * @return {object} 200 - Success response
 * @return {object} 400 - Validation error
 * @return {object} 500 - Server error
 * @example request - Register payload example
 * {
 *   "username": "Abdullah Fikri",
 *   "email": "fiki@mail.com",
 *   "password": "12345678"
 * }
 */
async function authRegister(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "validation error",
        result: errors.array(),
      });
    }
    const { username, email, password } = req.body;
    const hashed = await hashPassword(password);
    const newUser = await registerModel(username, email, hashed);

    res.status(200).json({
      success: true,
      message: "register success",
      result: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * POST /auth/login
 * @summary Login user
 * @tags Auth
 * @param {object} request.body.required - Login credentials
 * @return {object} 200 - Login success with JWT token
 * @return {object} 400 - Wrong credentials or validation error
 * @return {object} 500 - Server error
 * @example request - Login payload example
 * {
 *   "email": "fiki@mail.com",
 *   "password": "12345678"
 * }
 */
async function authLogin(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "validation error",
        result: errors.array(),
      });
    }
    const { email, password } = req.body;
    const user = await loginModel(email);

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "wrong email or password",
      });
    }

    const verify = await verifyPassword(password, user.password);
    if (!verify) {
      return res.status(400).json({
        success: false,
        message: "wrong email or password",
      });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.APP_SECRET,
      {
        expiresIn: "15m",
      }
    );

    return res.status(200).json({
      success: true,
      message: "login success",
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        token: token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}


/**
 * POST /forgot-password
 * @summary Request OTP for password reset
 * @tags Auth
 * @param {object} request.body.required - Email for OTP request
 * @return {object} 200 - OTP created successfully
 * @return {object} 400 - Email is required
 * @return {object} 404 - Email not found
 * @return {object} 500 - Server error
 * @example request - Forgot password payload example
 * {
 *   "email": "admin123@gmail.com"
 * }
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: "Email is required" 
      });
    }

    const user = await forgotPasswordModel(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found" 
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await redis.setEx(`otp:${user.email}`, 600, otp);

    return res.status(200).json({
      success: true,
      message: "OTP created",
      result: otp,
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);
    return res.status(500).json({
      success: false,
      message: error.message 
    });
  }
}



/**
 * POST /reset-password
 * @summary Reset password using OTP
 * @tags Auth
 * @param {object} request.body.required - Reset password credentials
 * @return {object} 200 - Password updated successfully
 * @return {object} 400 - Invalid request or invalid/expired OTP
 * @return {object} 500 - Server error
 * @example request - Reset password payload example
 * {
 *   "email": "admin123@gmail.com",
 *   "otp": "215388",
 *   "newPassword": "newPassword"
 * }
 */
// reset password
async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword)
      return res.status(400).json({
        success: false,
        message: "invalid request",
      });

    const redisOtp = await redis.get(`otp:${email}`);

    if (!redisOtp || redisOtp !== otp)
      return res.status(400).json({
        success: false,
        message: "invalid or expired OTP",
      });

    const check = await CheckPassword(email, null, newPassword);
    if (!check.success) {
      return res.status(400).json({
        success: false,
        message: check.message,
      });
    }

    const hashed = await hashPassword(newPassword);
    await updateUserPasswordModel(email, hashed);

    await redis.del(`otp:${email}`);

    return res.status(200).json({
      success: true,
      message: "password updated successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}


export default {
  authRegister,
  authLogin,
  forgotPassword,
  resetPassword,
};

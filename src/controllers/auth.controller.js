import authModel from "../models/auth.model.js";
import { validationResult } from "express-validator";
import {hashPassword, verifyPassword} from "../lib/hashingPassword.js";
import jwt from "jsonwebtoken"

const { registerModel, loginModel } = authModel;

/**
 * POST /auth/register
 * @summary register new user
 * @tags auth
 * @param {object} request.body.required - register payload
 * @example request - example payload
 * {
 *   "fullName": "Abdullah Fikri",
 *   "email": "fiki@mail.com",
 *   "password": "123"
 * }
 * @returns {object} 200 - success response
 */
async function authRegister(req, res){
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "validation error",
                result: errors.array()
            });
        }
        const { fullname, email, password } = req.body;
        const hashed = await hashPassword(password)
        const newUser = await registerModel(fullname, email, hashed);
    
        res.status(200).json({
            success: true,
            message: "register success",
            result: newUser
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

/**
 * POST /auth/login
 * @summary login user
 * @tags auth
 * @param {object} request.body.required - login payload
 * @example request - example payload
 * {
 *   "email": "fiki@mail.com",
 *   "password": "123"
 * }
 * @returns {object} 200 - login success
 * @returns {object} 400 - wrong email or password
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
      const token = jwt.sign({id: user.id}, process.env.APP_SECRET, {
        expiresIn: "15m"
      })
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
  
      return res.status(200).json({
        success: true,
        message: "login success",
        result: token
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
    authLogin
};

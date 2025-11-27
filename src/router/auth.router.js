import { Router } from "express";
import { checkSchema } from "express-validator";
import auth from "../controllers/auth.controller.js";

const router = Router();

router.post(
  "/auth/register",
  checkSchema({
    fullname: { isLength: {options: { min: 3 },},
      errorMessage: "Full name must be at 3 characters", },

    email: { isEmail: true,
      errorMessage: "Email is not valid", },

    password: {isLength: { options: { min: 8 },},
      errorMessage: "Password must be at 8 characters", },
  }),
  auth.authRegister
);

router.post(
  "/auth/login",
  checkSchema({email: { isEmail: true, errorMessage: "Email is not valid",},

    password: { notEmpty: true, errorMessage: "Password is required",},
  }),
  auth.authLogin
);

export default router;

import express from  "express";
import user from "../controllers/user.controller.js"

const router = express.Router()

router.get("/admin/user", user.getAllUserController)
router.get("/admin/user/:id", user.getUserByIdController)

export default router
import express from  "express";
import user from "../controllers/user.controller.js"
import adminOnly from "../middleware/admin.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js"

const router = express.Router()

router.get("/admin/user", authMiddleware,adminOnly,user.getAllUserController)
router.get("/admin/user/:id", user.getUserByIdController)
router.patch("/admin/user/:id", user.updateUserController)
router.delete("/admin/user/:id", user.removeUserController)
router.patch("/admin/user/:id/image", user.uploadProfilePicture)

//
router.get("/user/profile", authMiddleware, user.getMyProfileController)
router.patch("/user/profile", authMiddleware,user.updateMyProfileController)
router.patch("/user/image", authMiddleware, user.uploadMyProfilePictureController)

export default router
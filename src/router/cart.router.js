import express from "express"
import cart from "../controllers/cart.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/cart", authMiddleware, cart.addToCartController)
router.get("/cart", authMiddleware, cart.getCartController)
router.delete("/cart/:id", authMiddleware, cart.deleteCartController)

export default router
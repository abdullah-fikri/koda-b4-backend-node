import express from "express"
import order from "../controllers/order.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"

const router = express.Router()

router.post("/order", authMiddleware, order.createOrderController)
router.get("/history", authMiddleware, order.orderHistoryController)
router.get("/order/:id", authMiddleware, order.orderDetailController)

export default router
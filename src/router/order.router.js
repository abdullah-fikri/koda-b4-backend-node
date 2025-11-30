import express from "express"
import order from "../controllers/order.controller.js"
import authMiddleware from "../middleware/auth.middleware.js"
import adminOnly from "../middleware/admin.middleware.js"

const router = express.Router()

router.post("/order", authMiddleware, order.createOrderController)
router.get("/history", authMiddleware, order.orderHistoryController)
router.get("/order/:id", authMiddleware, order.orderDetailController)
router.get("/orders", authMiddleware, adminOnly, order.adminOrderListController)
router.put("/orders/:id/status", authMiddleware, adminOnly, order.updateOrderStatusController)

export default router
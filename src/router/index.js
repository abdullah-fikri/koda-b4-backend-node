import express from "express";
import authRouter from "./auth.router.js";
import productsRouter from "./products.router.js";
import authMiddleware from "../middleware/auth.middleware.js";
import userRouter from "../router/user.router.js"
import cartRouter from "./cart.router.js"
import orderRouter from "./order.router.js"

const router = express.Router();

router.get("/", (req, res)=>{
    res.status(200).json({
        success: true,
        message: "bacend is running well"
    })
})
router.use(authRouter);
router.use(productsRouter);
router.use(userRouter)
router.use(cartRouter)
router.use(orderRouter)

router.use("/up", express.static("uploads"));

export default router;

import express from "express";
import products from "../controllers/products.controller.js";
import { checkSchema } from "express-validator";
import authMiddleware from "../middleware/auth.middleware.js";
import adminOnly from "../middleware/admin.middleware.js";

const router = express.Router();

router.get("/admin/products",authMiddleware, adminOnly, products.getProducts);
router.get("/products/:id", products.getProduct);
router.get("/favorite-products", products.favoriteProducts)

router.post(
  "/products",
  authMiddleware,
  adminOnly,
  checkSchema({
    name: {
      notEmpty: { errorMessage: "name product is required" },
    },
  }),
  products.create
);

router.patch(
  "/products/:id",
  authMiddleware,
  adminOnly,
  checkSchema({
    name: {
      notEmpty: { errorMessage: "name product is required" },
    },
    price: {
      notEmpty: { errorMessage: "price is required" },
      isInt: { errorMessage: "price must be an integer" },
    },
  }),
  products.update
);

router.patch("/products/:id/picture", authMiddleware,adminOnly,products.uploadPictureProduct);
router.delete("/products/:id", authMiddleware,adminOnly,products.remove);

router.get("/products", products.getAllProductsUserControler)

export default router;

import express from "express";
import products from "../controllers/products.controller.js";
import { checkSchema } from "express-validator";

const router = express.Router();

router.get("/products", products.getProducts);
router.get("/products/:id", products.getProduct);

router.post(
  "/products",
  checkSchema({
    name: {
      notEmpty: { errorMessage: "name product is required" },
    },
    price: {
      notEmpty: { errorMessage: "price is required" },
      isInt: { errorMessage: "price must be an integer" },
    },
  }),
  products.create
);

router.patch(
  "/products/:id",
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

router.patch("/products/:id/picture", products.uploadPictureProduct);
router.delete("/products/:id", products.remove);

export default router;

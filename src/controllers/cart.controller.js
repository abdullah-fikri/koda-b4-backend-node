import cartModel from "../models/cart.model.js"
const {
    addToCart,
} = cartModel


async function addToCartController(req, res) {
  try {
    const userID = req.jwtpayload.id;

    if (!req.body.qty || req.body.qty <= 0) {
      return res.status(400).json({
        success: false,
        message: "quantity must not be less than 0",
      });
    }

    const cartId = await addToCart({
      userId: userID,
      productId: req.body.productId,
      variantId: req.body.variantId,
      sizeId: req.body.sizeId,
      qty: req.body.qty,
    });

    return res.json({
      success: true,
      message: "added to cart",
      data: cartId,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}




export default {
    addToCartController,
}
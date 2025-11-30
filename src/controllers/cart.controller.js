import cartModel from "../models/cart.model.js"
const {
    addToCart,
    getCart,
    deleteCartItem
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



async function getCartController(req, res) {
  try {
    const userID = req.jwtpayload.id;
    const carts = await getCart(userID);

    return res.json({
      success: true,
      message: "cart successfully",
      data: carts,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}



async function deleteCartController(req, res) {
  try {
    const userID = req.jwtpayload.id;
    const cartItemID = parseInt(req.params.id);

    await deleteCartItem(userID, cartItemID);

    return res.json({
      success: true,
      message: "Product removed from cart",
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
    getCartController,
    deleteCartController
}
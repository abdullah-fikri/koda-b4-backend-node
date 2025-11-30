import cartModel from "../models/cart.model.js"
const {
    addToCart,
    getCart,
    deleteCartItem
} = cartModel

/**
 * POST /cart
 * @summary Add product to cart
 * @tags Cart
 * @security bearerAuth
 * @param {object} request.body.required - Cart item data
 * @return {object} 200 - Product added to cart successfully
 * @return {object} 400 - Validation error (qty invalid)
 * @return {object} 500 - Server error
 * @example request - Add to cart example
 * {
 *   "productId": 1,
 *   "variantId": 2,
 *   "sizeId": 3,
 *   "qty": 2
 * }
 */
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

/**
 * GET /cart
 * @summary Get user's cart items
 * @tags Cart
 * @security bearerAuth
 * @return {object} 200 - Cart items retrieved successfully
 * @return {object} 500 - Server error
 */
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

/**
 * DELETE /cart/{id}
 * @summary Remove item from cart
 * @tags Cart
 * @security bearerAuth
 * @param {integer} id.path.required - Cart item ID
 * @return {object} 200 - Item removed successfully
 * @return {object} 500 - Server error
 */
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
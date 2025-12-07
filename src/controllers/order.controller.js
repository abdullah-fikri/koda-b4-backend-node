import orderModel from "../models/order.model.js";
const {
    createOrder,
    getOrderHistory,
    getOrderDetail,
    getAllOrdersModel,
    updateOrderStatusModel,
} = orderModel

/**
 * POST /order
 * @summary Create new order from cart
 * @tags Order
 * @security bearerAuth
 * @param {object} request.body.required - Order data
 * @return {object} 200 - Order created successfully
 * @return {object} 400 - Validation error or cart empty
 * @return {object} 500 - Server error
 * @example request - Create order example
 * {
 *   "paymentId": 1,
 *   "methodId": 2,
 *   "customerName": "fiki",
 *   "customerPhone": "08123456789",
 *   "customerAddress": "Jl. pancoran mas"
 * }
 */
async function createOrderController(req, res) {
  try {
    const userId = req.jwtpayload.id;
    const body = req.body;

    if (!body.paymentId || !body.methodId) {
      return res.status(400).json({
        success: false,
        message: "paymentId and methodId are required"
      });
    }

    const data = await createOrder(userId, body);

    return res.json({
      success: true,
      message: "Order created successfully",
      data
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
}

/**
 * GET /history
 * @summary Get order history with filters
 * @tags Order
 * @security bearerAuth
 * @param {integer} month.query - Filter by month 1-12
 * @param {integer} shipping_id.query - Filter by status 
 * @param {integer} page.query - Page number (default: 1)
 * @return {object} 200 - Order history with pagination
 * @return {object} 500 - Server error
 */
async function orderHistoryController(req, res) {
  try {
    const userId = req.jwtpayload.id;
    const month = Number(req.query.month || 0);
    const shippingId = Number(req.query.shipping_id || 0);
    const page = Number(req.query.page || 1);
    const limit = 4;

    const { data, totalItems } = await getOrderHistory(
      userId,
      month,
      shippingId,
      page,
      limit
    );

    return res.json({
      success: true,
      message: "Success",
      pagination: {
        page,
        limit,
        totalItems,
        totalPage: Math.ceil(totalItems / limit)
      },
      data
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
}

/**
 * GET /order/{id}
 * @summary Get order detail by ID
 * @tags Order
 * @security bearerAuth
 * @param {integer} id.path.required - Order ID
 * @return {object} 200 - Order detail
 * @return {object} 500 - Server error or order not found
 */
async function orderDetailController(req, res) {
  try {
    const id = Number(req.params.id);
    const data = await getOrderDetail(id);

    res.json({
      success: true,
      data
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
}


async function adminOrderListController(req, res) {
  try {
    const orders = await getAllOrdersModel();

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

async function updateOrderStatusController(req, res) {
  try {
    const orderID = parseInt(req.params.id);
    if (isNaN(orderID)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    await updateOrderStatusModel(orderID, status);

    return res.status(200).json({
      success: true,
      message: "Order status updated",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

export default {
    createOrderController,
    orderHistoryController,
    orderDetailController,
    adminOrderListController,
    updateOrderStatusController,
}
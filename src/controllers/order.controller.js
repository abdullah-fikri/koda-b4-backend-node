import orderModel from "../models/order.model.js";
const {
    createOrder,
    getOrderHistory,
    getOrderDetail
} = orderModel


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


export default {
    createOrderController,
    orderHistoryController,
    orderDetailController
}
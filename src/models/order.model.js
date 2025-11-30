import prisma from "../lib/prisma.js";

// create order
async function createOrder(userId, body) {
  const { paymentId, methodId, customerName, customerPhone, customerAddress } =
    body;

  // cek cart item
  const cart = await prisma.cart.findFirst({
    where: { user_id: userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              product_discount: {
                include: {
                  discount: true,
                },
              },
            },
          },
          size: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  // hitung total cart
  let cartTotal = 0;

  const now = new Date()
  for (const item of cart.items) {
    const basePrice = item.size?.price ?? item.product.price;

    const prodDisc = item.product.product_discount[0]?.discount;

    const discountPercent = prodDisc?.percent_discount ?? 0;

    const start = prodDisc?.start_discount;
    const end = prodDisc?.end_discount;

    const isActive = start && end && now >= start && now <= end;

    const finalPrice = isActive
      ? basePrice - basePrice * (discountPercent / 100)
      : basePrice;

    cartTotal += Number(finalPrice) * item.qty;
  }

  const tax = cartTotal * 0.1;

  const method = await prisma.method.findUnique({
    where: { id: methodId },
  });

  const additional = method?.additional_price
  ? Number(method.additional_price)
  : 0;

  const totalFinal = cartTotal + tax + additional;

  const invoice = `INV-${Date.now()}-${userId}`;

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.orders.create({
      data: {
        users_id: userId,
        payment_id: paymentId,
        method_id: methodId,
        shipping_id: 3,
        order_date: new Date(),
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        total: totalFinal,
        tax,
        invoice,
      },
    });

    for (const item of cart.items) {
      const basePrice = item.size?.price ?? item.product.price;

      const discountPercent =
        item.product.discount?.discount?.percent_discount ?? 0;

      const now = new Date();
      const start = item.product.discount?.discount?.start_discount;
      const end = item.product.discount?.discount?.end_discount;
      const isActive = start && end && now >= start && now <= end;

      const discountPrice = isActive
        ? basePrice - basePrice * (discountPercent / 100)
        : basePrice;

      const subtotal = Number(discountPrice) * item.qty;

      await tx.order_items.create({
        data: {
          order_id: newOrder.id,
          product_id: item.product_id,
          variant_id: item.variant_id,
          size_id: item.size_id,
          qty: item.qty,
          base_price: basePrice,
          discount_price: discountPrice,
          discount_percent: discountPercent,
          subtotal,
        },
      });
    }

    await tx.cart_items.deleteMany({
      where: { cart_id: cart.id },
    });

    return newOrder;
  });

  return {
    orderId: order.id,
    invoice,
    totalCart: cartTotal,
    tax,
    additionalPrice: additional,
    total: totalFinal,
    customerName,
    customerPhone,
    customerAddress,
    status: "On Progress",
  };
}

// history
async function getOrderHistory(
  userId,
  month = 0,
  shippingId = 0,
  page = 1,
  limit = 4
) {
  const skip = (page - 1) * limit;

  const filter = {
    users_id: userId,
    ...(shippingId !== 0 && { shipping_id: shippingId }),
  };

  // filter bulan
  if (month > 0) {
    filter.order_date = {
      gte: new Date(`${new Date().getFullYear()}-${month}-01`),
      lte: new Date(`${new Date().getFullYear()}-${month}-31`),
    };
  }

  const orders = await prisma.orders.findMany({
    where: filter,
    include: {
      shipping: true,
      items: {
        include: {
          product: {
            include: { images: { take: 1 } },
          },
        },
      },
    },
    orderBy: { order_date: "desc" },
    skip,
    take: limit,
  });

  const totalItems = await prisma.orders.count({ where: filter });

  const data = orders.map((o) => ({
    order_id: o.id,
    invoice: o.invoice,
    order_date: o.order_date,
    total: Number(o.total),
    status: o.shipping.name,
    image: o.items[0]?.product?.images[0]?.image ?? "",
  }));

  return { data, totalItems };
}

// order detail
async function getOrderDetail(orderId) {
  const order = await prisma.orders.findUnique({
    where: { id: orderId },
    include: {
      payment: true,
      shipping: true,
      method: true,
      items: {
        include: {
          product: {
            include: { images: { take: 1 } },
          },
          variant: true,
          size: true,
        },
      },
    },
  });

  if (!order) throw new Error("Order not found");

  return {
    id: order.id,
    invoice: order.invoice,
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    customerAddress: order.customer_address,
    orderDate: order.order_date,
    status: order.shipping.name,
    paymentMethod: order.payment.name,
    shippingMethod: order.method.name,
    total: order.total,
    items: order.items.map((i) => ({
      productName: i.product.name,
      variant: i.variant?.name ?? "-",
      size: i.size?.name ?? "-",
      qty: i.qty,
      discountPrice: i.discount_price,
      discountPercent: i.discount_percent,
      basePrice: i.base_price,
      image: i.product.images[0]?.image ?? "",
    })),
  };
}


// all order admin
async function getAllOrdersModel() {
  const orders = await prisma.orders.findMany({
    select: {
      id: true,
      order_date: true,
      shipping: {
        select: {
          name: true,
        },
      },
      items: {
        select: {
          subtotal: true,
        },
      },
    },
    orderBy: {
      order_date: "desc",
    },
  });

  return orders.map(o => ({
    id: o.id,
    date: o.order_date,
    status: o.shipping?.name || null,
    total: o.items.reduce((acc, item) => acc + Number(item.subtotal || 0), 0),
  }));
}

// update order status admin
async function updateOrderStatusModel(orderID, statusID) {
  return prisma.orders.update({
    where: { id: orderID },
    data: {
      shipping_id: statusID,
    },
  });
}

export default {
  createOrder,
  getOrderHistory,
  getOrderDetail,
  getAllOrdersModel,
  updateOrderStatusModel
};

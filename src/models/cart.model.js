import prisma from "../lib/prisma.js";

async function addToCart({ userId, productId, variantId, sizeId, qty }) {
  let cart = await prisma.cart.findFirst({
    where: { user_id: userId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { user_id: userId },
    });
  }

  // cek cart 
  const existing = await prisma.cart_items.findFirst({
    where: {
      cart_id: cart.id,
      product_id: productId,
      variant_id: variantId ?? null,
      size_id: sizeId ?? null,
    },
  });

  if (existing) {
    await prisma.cart_items.update({
      where: { id: existing.id },
      data: {
        qty: existing.qty + qty,
      },
    });

    return { cartId: cart.id};
  }

  await prisma.cart_items.create({
    data: {
      cart_id: cart.id,
      product_id: productId,
      variant_id: variantId ?? null,
      size_id: sizeId ?? null,
      qty,
    },
  });

  return { cartId: cart.id };
}

async function getCart(userId) {
  const cart = await prisma.cart.findFirst({
    where: { user_id: userId },
    include: {
      items: {
        orderBy: { id: "desc" },
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

  if (!cart) return [];

  return cart.items.map(item => {
    const price = Number(item.size?.price ?? item.product.price);

    return {
      id: item.id,
      productId: item.product_id,   
      productName: item.product.name,

      variant: item.variant?.name || "", 
      size: item.size?.name || "",        

      price: price,
      subtotal: price * item.qty,
      qty: item.qty,
      image: item.product.images[0]?.image || null,
    };
  });
}



async function deleteCartItem(userId, cartItemId) {
  const deleted = await prisma.cart_items.deleteMany({
    where: { 
      id: cartItemId, 
      cart: { user_id: userId },
    },
  });

  return deleted;
}


export default {
  addToCart,
  getCart,
  deleteCartItem
}
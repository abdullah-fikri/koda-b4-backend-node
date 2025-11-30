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


export default {
  addToCart,
}
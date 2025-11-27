import prisma from "../lib/prisma.js";

let idProducts = 1;
const products = [
  {
    id: idProducts++,
    picture: null,
    name: "nasgor",
    price: 20000,
  },
  {
    id: idProducts++,
    picture: null,
    name: "mie",
    price: 1000,
  },
];

// get all
async function getAllProducts(name = "") {
  const results = await prisma.products.findMany({
    where: {
      name: {
        contains: name,
      },
    },
  });
  return results;
}

// get by id
async function getProductById(id) {
  const result = await prisma.products.findUnique({
    where: {
      id: id,
    },
  });
  return result;
}

// create product
async function createProduct(req) {
  const {
    name,
    description,
    stock,
    category_id,
    variants = [],
    sizes = [],
  } = req;

  try {
    const product = await prisma.products.create({
      data: {
        name,
        description,
        stock,
        category_id,
        price: 0,
      },
    });

    const productId = product.id;

    // product_variat
    if (variants.length > 0) {
      await prisma.product_variant.createMany({
        data: variants.map((v) => ({
          variant_id: v,
          product_id: productId,
        })),
      });
    }

    // product_size
    if (sizes.length > 0) {
      await prisma.product_size.createMany({
        data: sizes.map((s) => ({
          product_id: productId,
          size_id: s.size_id,
          price: s.price,
        })),
      });
    }

    const result = await prisma.products.findUnique({
      where: { id: productId },
      include: {
        variants: {
          include: {
            variant: true,
          },
        },
        sizes: {
          include: {
            size: true,
          },
        },
      },
    });

    return result;
  } catch (err) {
    return null;
  }
}

// update
async function updateProduct(id, name, price, image = null) {
  try {
    const newData = {};
    if (name !== undefined) newData.name = name;
    if (price !== undefined) newData.price = price;
    if (image !== undefined) newData.image = image;

    const updated = await prisma.products.update({
      where: { id },
      data: newData,
    });
    return updated;
  } catch (error) {
    return null;
  }
}

// delete
async function deleteProduct(id) {
  try {
    await prisma.products.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    return false;
  }
}

export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};

import prisma from "../lib/prisma.js";

// get all
async function getAllProducts(search = "", limit = 5, offset = 0) {
  const temp = search ? { name: { contains: search } } : {};

  const products = await prisma.products.findMany({
    where: temp,
    skip: offset,
    take: limit,
    orderBy: {
      created_at: "desc",
    },
    include: {
      category: { select: { name: true } },
      images: { select: { image: true }, orderBy: { id: "asc" } },
      sizes: {
        include: { size: { select: { id: true, name: true } } },
        orderBy: { size_id: "asc" },
      },
      variants: {
        include: { variant: { select: { id: true, name: true } } },
        orderBy: { variant_id: "asc", }
      }
    }
  });

  const totalItems = await prisma.products.count({
    where: temp,
  });

  const productsResponse = products.map((product) => {
    const minPrice =
      product.sizes.length > 0
        ? Math.min(...product.sizes.map((ps) => Number(ps.price)))
        : 0;

    // image
    const images = product.images.map((img) => img.image || "");

    // size dan harga
    const sizes = product.sizes.map((ps) => ({
      size_id: ps.size?.id || 0,
      size_name: ps.size?.name || "",
      price: Number(ps.price),
    }));

    // variant
    const variants = product.variants.map((pv) => ({
      variant_id: pv.variant?.id || 0,
      name: pv.variant?.name || "",
    }));

    return {
      id: product.id,
      name: product.name || "",
      description: product.description || "",
      min_price: minPrice,
      stock: product.stock || 0,
      category: product.category?.name || "",
      images: images,
      sizes: sizes,
      variants: variants,
      created_at: product.created_at,
      updated_at: product.updated_at,
    };
  });

  return { products: productsResponse, totalItems };
}

// get by id
async function getProductById(id) {
  const result = await prisma.products.findUnique({
    where: { id },
    include: {
      category: true,

      images: true, 

      variants: {
        include: {
          variant: true, 
        },
      },
      sizes: { include: { size: true }} },
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
    price,
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
        price: parseInt(price),
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
async function updateProduct(id, req) {
  const updateData = {};
  let hasUpdate = false;

  if (req.name !== undefined) {
    updateData.name = req.name;
    hasUpdate = true;
  }

  if (req.description !== undefined) {
    updateData.description = req.description;
    hasUpdate = true;
  }

  if (req.stock !== undefined) {
    updateData.stock = req.stock;
    hasUpdate = true;
  }

  if (req.category_id !== undefined) {
    updateData.category_id = req.category_id;
    hasUpdate = true;
  }

  if (hasUpdate) {
    updateData.updated_at = new Date();

    await prisma.products.update({
      where: { id },
      data: updateData,
    });
  }

  if (req.images !== undefined) {
    await prisma.product_img.deleteMany({
      where: { product_id: id },
    });

    for (const img of req.images) {
      await prisma.product_img.create({
        data: {
          image: img,
          product_id: id,
        },
      });
    }
  }

  if (req.variants !== undefined) {
    await prisma.product_variant.deleteMany({
      where: { product_id: id },
    });

    for (const v of req.variants) {
      await prisma.product_variant.create({
        data: {
          variant_id: v,
          product_id: id,
        },
      });
    }
  }

  if (req.sizes !== undefined) {
    await prisma.product_size.deleteMany({
      where: { product_id: id },
    });

    for (const s of req.sizes) {
      await prisma.product_size.create({
        data: {
          product_id: id,
          size_id: s.sizeId,
          price: s.price,
        },
      });
    }
  }

  return prisma.products.findUnique({
    where: { id },
    include: {
      images: true,
      variants: true,
      sizes: true,
    },
  });
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

async function getRecommendationsByCategory(categoryName, excludeID) {
  const products = await prisma.products.findMany({
    where: {
      category: { name: categoryName },
      NOT: { id: excludeID }
    },
    include: {
      category: true,
      images: true, 
      variants: { include: { variant: true }},
      sizes: { include: { size: true }}
    },
    take: 3,
    orderBy: { created_at: "desc" }
  });

  return products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    min_price: p.sizes.length > 0
      ? Math.min(...p.sizes.map(ps => Number(ps.price)))
      : Number(p.price),

    stock: p.stock,
    category: p.category?.name ?? "",

    images: p.images.map(img => img.image),

    variants: p.variants.map(v => ({
      variant_id: v.variant?.id || 0,
      name: v.variant?.name || ""
    })),

    sizes: p.sizes.map(s => ({
      size_id: s.size.id,
      size_name: s.size.name,
      price: Number(s.price)
    }))
  }));
}



export async function getFavoriteProducts(page, limit) {
  const offset = (page - 1) * limit;

  const products = await prisma.products.findMany({
    where: { is_favorite: true },

    include: {
      category: { select: { name: true } },

      images: {                  
        select: { image: true },
      },

      variants: {               
        select: {
          variant: { select: { id: true, name: true } }
        },
      },

      sizes: {                   
        select: {
          size: { select: { id: true, name: true } },
          price: true,
        },
      },
    },

    skip: offset,
    take: limit,
    orderBy: { created_at: "desc" },
  });

  const total = await prisma.products.count({
    where: { is_favorite: true }
  });

  return { products, total };
}


/// user products
async function getAllProductsUser({
  search = "",
  page = 1,
  limit = 10,
  sort = "",
  minPrice,
  maxPrice,
  categoryIDs = [],
}) {
  const offset = (page - 1) * limit;

  const orderByMap = {
    oldest:     { created_at: "asc" },
    price_low:  { price: "asc" },
    price_high: { price: "desc" },
    name_asc:   { name: "asc" },
    name_desc:  { name: "desc" },
  };

  const orderBy = orderByMap[sort] || { created_at: "desc" };

  const where = {
    AND: [],
  };

  if (search) {
    where.AND.push({
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { category: { name: { contains: search, mode: "insensitive" } } },
      ],
    });
  }

  if (categoryIDs.length > 0) {
    where.AND.push({
      category_id: { in: categoryIDs },
    });
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceCondition = {};
    if (minPrice !== undefined) priceCondition.gte = minPrice;
    if (maxPrice !== undefined) priceCondition.lte = maxPrice;

    where.AND.push({
      price: priceCondition,
    });
  }

  if (where.AND.length === 0) {
    delete where.AND;
  }

  const [products, total] = await Promise.all([
    prisma.products.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy,
      include: {
        category: { select: { name: true } },
        images: { select: { image: true } },
        variants: { include: { variant: true } },
        sizes: { include: { size: true } },
      },
    }),

    prisma.products.count({ where }),
  ]);

  return { products, total };
}


export default {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getRecommendationsByCategory,
  getFavoriteProducts,
  getAllProductsUser
};

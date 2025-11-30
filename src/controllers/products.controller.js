import hateoas from "../lib/hateoas.js";
import upload from "../lib/upload.js";
import productsModel from "../models/products.model.js";
import { validationResult } from "express-validator";
import redis from "../lib/redis.js"

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFavoriteProducts,
  getAllProductsUser,
  getRecommendationsByCategory
} = productsModel;

/**
 * GET /products
 * @summary Get all products (admin)
 * @tags products
 * @param {string} search.query.optional - Search keyword
 * @param {number} page.query.optional - Page number
 * @param {number} limit.query.optional - Number of items per page
 * @returns {object} 200 - List of products with pagination
 */
async function getProducts(req, res) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;
    const search = req.query.search || "";

    const offset = (page - 1) * limit;

    const { products, totalItems } = await getAllProducts(search, limit, offset);
    const totalPage = Math.ceil(totalItems / limit);

    const links = hateoas(req, page, limit, totalPage);

    res.status(200).json({
      success: true,
      message: "product list",
      pagination: {
        page,
        limit,
        total_page: totalPage,
        total_items: totalItems,
        links,
      },
      data: products,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * GET /products/{id}
 * @summary Get product by ID
 * @tags products
 * @param {number} id.path.required - Product ID
 * @returns {object} 200 - Product detail + recommendations
 * @returns {object} 404 - Product not found
 */
async function getProduct(req, res) {
  try {
    const id = parseInt(req.params.id);
    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "product not found",
      });
    }

    const formatRespon = formatProduct(product);
    const categoryProduct = product.category?.name;
    const recommendation = await getRecommendationsByCategory(categoryProduct, id)
    res.status(200).json({
      success: true,
      message: "product found",
      results: formatRespon,
      recommendation: recommendation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * POST /products
 * @summary Create product
 * @tags products
 * @param {object} request.body.required - Product payload
 * @property {string} name
 * @property {string} description
 * @property {number} price
 * @property {number} stock
 * @property {number} category_id
 * @property {array<number>} variants
 * @property {array<object>} sizes
 * @property {number} sizes[].size_id
 * @property {number} sizes[].price
 * @returns {object} 201 - Created successfully
 * @returns {object} 400 - Validation error
 */
async function create(req, res) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "validation error",
        result: errors.array()
      });
    }

    const {
      name,
      description,
      stock,
      category_id,
      price,
      variants = [],
      sizes = [],
    } = req.body;

    const newProduct = await createProduct({
      name,
      description,
      stock: parseInt(stock),
      category_id: parseInt(category_id),
      price: parseInt(price),
      variants,
      sizes,
    });

    if (!newProduct) {
      return res.status(500).json({
        success: false,
        message: "failed to create product",
      });
    }

    res.status(201).json({
      success: true,
      message: "create product success",
      results: newProduct,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

/**
 * POST /products/{id}/picture
 * @summary Upload product picture
 * @tags products
 * @param {number} id.path.required
 * @param {file} picture.formData.required
 * @returns {object} 200 - upload result
 */
async function uploadPictureProduct(req, res) {
  const id = parseInt(req.params.id);
  const product = await getProductById(id);

  if (!product) {
    return res.status(400).json({
      success: false,
      message: "product not found",
    });
  }

  upload.single("picture")(req, res, async (err) => {
    try {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "file not available",
        });
      }
      const updated = await updateProduct(
        id,
        product.name,
        product.price,
        req.file.filename
      );

      return res.status(200).json({
        success: true,
        message: "upload successfully",
        result: updated,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  });
}

/**
 * PATCH /products/{id}
 * @summary Update product
 * @tags products
 * @param {number} id.path.required
 * @param {ProductCreate} request.body
 * @returns {Product} 200
 */
async function update(req, res) {
  try {
    const id = parseInt(req.params.id);
    const product = await updateProduct(id, req.body);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Product updated",
      data: product,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}

/**
 * DELETE /products/{id}
 * @summary Delete product
 * @tags products
 * @param {number} id.path.required
 * @returns {object} 200 - success message
 */
async function remove(req, res) {
  try {
    const id = parseInt(req.params.id);
    const deleted = await deleteProduct(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "product deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}

function formatProduct(p) {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    min_price:
      p.sizes.length > 0
        ? Math.min(...p.sizes.map((s) => Number(s.price)))
        : Number(p.price),

    stock: p.stock,
    category: p.category?.name ?? "",

    images: p.images.map((img) => img.image),

    variants: p.variants.map((v) => ({
      variant_id: v.variant?.id ?? 0,
      name: v.variant?.name ?? "",
    })),

    sizes: p.sizes.map((s) => ({
      size_id: s.size?.id ?? 0,
      size_name: s.size?.name ?? "",
      price: Number(s.price),
    })),

    created_at: p.created_at,
    updated_at: p.updated_at,
  };
}

/**
 * GET /products/favorite
 * @summary Get favorite products (cached)
 * @tags products
 * @param {number} page.query.optional
 * @param {number} limit.query.optional
 * @returns {object} 200 - favorite products
 */
async function favoriteProducts(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;

    const cacheKey = `favorite:page=${page}:limit=${limit}`;

    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);

      return res.status(200).json({
        success: true,
        message: "favorite products (from cache)",
        links: parsed.links,
        data: parsed.data,
      });
    }

    const { products, total } = await getFavoriteProducts(page, limit);
    const mapped = products.map(formatProduct);
    const totalPage = Math.ceil(total / limit);
    const links = hateoas(req, page, limit, totalPage);

    const responseData = { links, data: mapped };

    await redis.setEx(cacheKey, 60, JSON.stringify(responseData));

    return res.status(200).json({
      success: true,
      message: "favorite products",
      ...responseData
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
}


async function getAllProductsUserControler(req, res) {
  try {
    const search = req.query.search || "";
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const sort = req.query.sort || "";
    const minPrice = req.query.min_price ? parseInt(req.query.min_price) : undefined;
    const maxPrice = req.query.max_price ? parseInt(req.query.max_price) : undefined;

    const categoryIDs = req.query["category[]"]
      ? Array.isArray(req.query["category[]"])
        ? req.query["category[]"].map(Number)
        : [Number(req.query["category[]"])]
      : [];

    const isCachable = (
      search === "" && 
      sort === "" && 
      minPrice === undefined && 
      maxPrice === undefined && 
      categoryIDs.length === 0
    );

    let cacheKey = "";
    if (isCachable) {
      cacheKey = `products:page:${page}:limit:${limit}`;

      // cek cache
      try {
        const cachedData = await redis.get(cacheKey);
        if (cachedData) {
          const parsed = JSON.parse(cachedData);
          return res.json({
            success: true,
            message: "success from cache",
            pagination: parsed.pagination,
            _links: parsed._links,
            result: parsed.result,
          });
        }
      } catch (cacheErr) {
        console.error("Cache error:", cacheErr);
      }
    }

    const { products, total } = await getAllProductsUser({
      search,
      page,
      limit,
      sort,
      minPrice,
      maxPrice,
      categoryIDs,
    });

    const formatRespon = products.map(formatProduct);

    const totalPage = Math.ceil(total / limit);

    const links = hateoas(req, page, limit, totalPage);

    const responseData = {
      success: true,
      message: "products fetched",
      pagination: {
        total,
        page,
        limit,
        totalPage,
      },
      _links: links,
      result: formatRespon,
    };

    if (isCachable) {
      try {
        await redis.setEx(cacheKey, 900, JSON.stringify(responseData));
      } catch (cacheErr) {
        console.error("Cache set error:", cacheErr);
      }
    }

    res.json(responseData);

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
}



export default {
  getProducts,
  getProduct,
  create,
  update,
  remove,
  uploadPictureProduct,
  favoriteProducts,
  getAllProductsUserControler
};

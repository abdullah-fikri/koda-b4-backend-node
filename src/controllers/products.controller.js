import hateoas from "../lib/hateoas.js";
import upload from "../lib/upload.js";
import productsModel from "../models/products.model.js";
import { validationResult } from "express-validator";

const {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = productsModel;

/**
 * GET /products
 * @summary get all products
 * @tags products
 * @param {string} search.query - search products by name
 * @param {string} sort.query - cheap or expensive
 * @return {object} 200 - success response
 * @return {object} 401 - not found response
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
      message: "admin product list",
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
 * @summary get product by id
 * @param {string} id.path - id product
 * @tags products
 * @returns {object} 200 - success response
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
    res.status(200).json({
      success: true,
      message: "product found",
      results: formatRespon,
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
 * @summary create product
 * @tags products
 * @param {object} request.body.required - Product data
 * @example request - example payload
 * {
 *   "name": "soto",
 *   "price": 25000
 * }
 * @returns {object} 200 - success response
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
      variants = [],
      sizes = [],
    } = req.body;

    const newProduct = await createProduct({
      name,
      description,
      stock: parseInt(stock),
      category_id: parseInt(category_id),
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
 * PUT /products/{id}
 * @summary update product
 * @tags products
 * @param {number} id.path.required - product id
 * @param {object} request.body.required - product data to update
 * @example request - example payload
 * {
 *   "name": "matcha latte",
 *   "price": 30000
 * }
 * @returns {object} 200 - success response
 * @returns {object} 400 - product update error
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
 * @summary delete product
 * @tags products
 * @param {number} id.path.required - product id
 * @returns {object} 200 - success response
 * @returns {object} 400 - product not found
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


export default {
  getProducts,
  getProduct,
  create,
  update,
  remove,
  uploadPictureProduct,
};

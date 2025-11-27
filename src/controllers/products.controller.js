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
    const { search = "", sort = "" } = req.query;
    let results = await getAllProducts(search);

    if (sort === "cheap") {
      results = results.sort((a, b) => a.price - b.price);
    } else if (sort === "expensive") {
      results = results.sort((a, b) => b.price - a.price);
    }
    res.status(200).json({
      success: true,
      message: "list all products",
      results,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
    const result = await getProductById(id);

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "product found",
      results: result,
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
    const { name, price } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "validation error",
        result: errors.array(),
      });
    }

    const updated = await updateProduct(
      id,
      name,
      price ? parseFloat(price) : undefined
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "product not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "product updated successfully",
      results: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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

export default {
  getProducts,
  getProduct,
  create,
  update,
  remove,
  uploadPictureProduct,
};

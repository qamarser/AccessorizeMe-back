import {
  Product,
  Image,
  Review,
  Category,
  ProductColor,
  ProductVariant,
} from "../config/db.js";

// Admin: Add Product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category_id } = req.body;

    const newProduct = await Product.create({
      name,
      description,
      price,
      stock,
      category_id,
    });

    res.status(201).json(newProduct);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create product", error: err.message });
  }
};

// Admin: Update Product
export const updateProduct = async (req, res) => {
  try {
    await Product.update(req.body, { where: { id: req.params.id } });
    res.json({ message: "Product updated" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update product", error: err.message });
  }
};

// Admin: Delete Product
export const deleteProduct = async (req, res) => {
  try {
    await Product.destroy({ where: { id: req.params.id } });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete product", error: err.message });
  }
};

// User: Fetch all products (image, name, price only)
// GET /products?category=3
export const getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;

    const whereClause = category ? { category_id: category } : {};

    const products = await Product.findAll({
      where: whereClause,
      attributes: ["id", "name", "price"],
      include: [
        {
          model: Image,
          where: { related_type: "product" },
          required: false,
          attributes: ["image_url", "alt_text"],
        },
      ],
    });

    res.json(products);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: err.message });
  }
};

import { Op } from "sequelize";

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      attributes: ["id", "name", "description", "price"],
      include: [
        {
          model: Image,
          where: { related_type: "product" },
          required: false,
          attributes: ["image_url", "alt_text"],
        },
        {
          model: Review,
          attributes: ["rating", "comment", "created_at"],
          include: [
            {
              association: "User",
              attributes: ["name"],
            },
          ],
        },
        {
          model: ProductVariant,
          attributes: ["variant_name", "stock", "additional_price"],
          include: [
            {
              model: ProductColor,
              attributes: ["id", "color_name", "color_code"],
            },
          ],
        },
      ],
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    // Fetch images for each product color
    const productColors = product.ProductVariants.flatMap((variant) =>
      variant.ProductColor ? [variant.ProductColor] : []
    );

    const colorIds = productColors.map((color) => color.id);

    const colorImages = await Image.findAll({
      where: {
        related_type: "productColor",
        related_id: {
          [Op.in]: colorIds,
        },
      },
      attributes: ["image_url", "alt_text", "related_id"],
    });

    // Map images to their respective colors
    const imagesByColorId = {};
    colorImages.forEach((img) => {
      if (!imagesByColorId[img.related_id]) {
        imagesByColorId[img.related_id] = [];
      }
      imagesByColorId[img.related_id].push({
        image_url: img.image_url,
        alt_text: img.alt_text,
      });
    });

    // Attach images array to each color
    product.ProductVariants.forEach((variant) => {
      if (variant.ProductColor) {
        variant.ProductColor.images =
          imagesByColorId[variant.ProductColor.id] || [];
      }
    });

    res.json(product);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch product details", error: err.message });
  }
};

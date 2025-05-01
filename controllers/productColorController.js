import { ProductColor, Product, ProductVariant } from "../config/db.js";

// Create a new product color
export const createProductColor = async (req, res) => {
  try {
    const { color_name, color_code, product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: "product_id is required" });
    }

    // Check if product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    const existing = await ProductColor.findOne({ where: { color_name, product_id } });
    if (existing) {
      return res.status(400).json({ message: "Color already exists for this product" });
    }

    const newColor = await ProductColor.create({ color_name, color_code, product_id });

    // Automatically link existing ProductVariants without product_color_id to this new ProductColor if color_name matches
    const variantsToUpdate = await ProductVariant.findAll({
      where: {
        product_id,
        product_color_id: null,
      },
    });

    let updatedCount = 0;

    // Function to normalize spaces: trim and replace multiple spaces with single space
    const normalizeSpaces = (str) => str.trim().replace(/\s+/g, " ").toLowerCase();

    const normalizedColorName = normalizeSpaces(color_name);

    for (const variant of variantsToUpdate) {
      const variantName = normalizeSpaces(variant.variant_name || "");
      const variantValue = normalizeSpaces(variant.variant_value || "");

      if (
        variantName === normalizedColorName ||
        variantValue === normalizedColorName ||
        variantName.includes(normalizedColorName) ||
        variantValue.includes(normalizedColorName)
      ) {
        variant.product_color_id = newColor.id;
        await variant.save();
        updatedCount++;
      }
    }

    res.status(201).json({
      message: `Color created for product and linked to ${updatedCount} variants`,
      color: newColor,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create color", error: err.message });
  }
};

// Get all product colors
export const getAllProductColors = async (req, res) => {
  try {
    const colors = await ProductColor.findAll();
    res.json(colors);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch colors", error: err.message });
  }
};

// Get a specific product color by ID
export const getProductColorById = async (req, res) => {
  try {
    const color = await ProductColor.findByPk(req.params.id);
    if (!color) {
      return res.status(404).json({ message: "Color not found" });
    }
    res.json(color);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch color", error: err.message });
  }
};

// Update a product color
export const updateProductColor = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await ProductColor.update(req.body, { where: { id } });

    if (updated === 0) {
      return res
        .status(404)
        .json({ message: "Color not found or no changes made" });
    }

    res.json({ message: "Color updated successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update color", error: err.message });
  }
};

// Delete a product color
export const deleteProductColor = async (req, res) => {
  try {
    const { id } = req.params;
    await ProductColor.destroy({ where: { id } });
    res.json({ message: "Color deleted successfully" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete color", error: err.message });
  }
};

import { ProductColor, Product, ProductVariant, Image } from "../config/db.js";
import { uploadToImgBB } from "../utils/uploadToImgBB.js";  


// Create a new product color
export const createProductColor = async (req, res) => {
  try {
    const { color_name, color_code, product_name } = req.body;

    if (!product_name) {
      return res.status(400).json({ message: "product_name is required" });
    }

    // Find product by name
    const product = await Product.findOne({ where: { name: product_name } });
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    const existing = await ProductColor.findOne({ where: { color_name, product_id: product.id } });
    if (existing) {
      return res.status(400).json({ message: "Color already exists for this product" });
    }

    const newColor = await ProductColor.create({ color_name, color_code, product_id: product.id });

    // Handle image uploads for product color
    const files = req.files || [];
    const colorImageUrls = await Promise.all(
      files.map(async (file) => await uploadToImgBB(file.path))
    );

    // Save images linked to the new product color
    await Promise.all(
      colorImageUrls.map((url) =>
        Image.create({
          image_url: url,
          alt_text: "",
          related_type: "productColor",
          related_id: newColor.id,
        })
      )
    );

    // Automatically link existing ProductVariants without product_color_id to this new ProductColor if color_name matches
    const variantsToUpdate = await ProductVariant.findAll({
      where: {
        product_id: product.id,
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
      images: colorImageUrls,
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
  } catch ( err )
  {
    console.error("Error fetching product colors:", err);
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

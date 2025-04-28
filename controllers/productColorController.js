import { ProductColor } from "../config/db.js";

// Create a new product color
export const createProductColor = async (req, res) => {
  try {
    const { color_name, color_code } = req.body;

    const existing = await ProductColor.findOne({ where: { color_name } });
    if (existing) {
      return res.status(400).json({ message: "Color already exists" });
    }

    const newColor = await ProductColor.create({ color_name, color_code });
    res.status(201).json({ message: "Color created", color: newColor });
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

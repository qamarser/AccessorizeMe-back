import { Product, Category, Image } from "../config/db.js";
import { uploadToImgBB } from "../utils/uploadToImgBB.js";

// Admin: Add category
export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    // When using uploadAny, files are in req.files array
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: "No image file uploaded" });
    }
    const filePath = req.files[0].path;

    // Upload image to ImgBB
    const imageUrl = await uploadToImgBB(filePath);

    // Save image URL to background_image_url column in the database
    const newCategory = await Category.create({
      name,
      background_image_url: imageUrl,
    });

    res.status(201).json({ success: true, data: newCategory });
  } catch (error) {
    console.error("Create Category Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// Admin: Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Category.update(req.body, { where: { id } });
    res.json({ message: "Category updated", updated });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update category", error: err.message });
  }
};

// Admin: Delete category
export const deleteCategory = async (req, res) => {
  try {
    await Category.destroy({ where: { id: req.params.id } });
    res.json({ message: "Category deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete category", error: err.message });
  }
};

// User: Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch categories", error: err.message });
  }
};
// User: Get a category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch category", error: err.message });
  }
};
    
// User: Get all products under a specific category
export const getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const products = await Product.findAll({
      where: { category_id: categoryId },
      attributes: ["id", "name", "price"],
      include: [
        {
          model: Image,
          where: { related_type: "product" },
          required: false,
          attributes: ["image_url"],
        },
      ],
    });

    res.json(products);
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch products for this category",
      error: err.message,
    });
  }
};

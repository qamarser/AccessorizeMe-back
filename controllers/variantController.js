import { ProductVariant, ProductColor, Product, Image } from "../config/db.js";
import { Op } from "sequelize";

// Admin: Get all variants (optional filter by product)
export const getAllVariants = async (req, res) => {
  try {
    const { product_id } = req.query;
    const whereClause = product_id ? { product_id } : {};

    const variants = await ProductVariant.findAll({
      where: whereClause,
      include: [
        { model: Product, attributes: ["name"] },
        {
          model: ProductColor,
          attributes: ["color_name", "color_code"],
          include: [
            {
              model: Image,
              where: { related_type: "productColor" },
              required: false,
              attributes: ["image_url", "alt_text"],
            },
          ],
        },
      ],
    });

    res.json(variants);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch variants", error: err.message });
  }
};

// Admin: Update specific variant
export const updateVariant = async (req, res) => {
  try {
    const { id } = req.params;
    const [updated] = await ProductVariant.update(req.body, { where: { id } });

    if (updated === 0)
      return res
        .status(404)
        .json({ message: "Variant not found or no changes made" });

    res.json({ message: "Variant updated" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to update variant", error: err.message });
  }
};

// Admin: Delete specific variant
export const deleteVariant = async (req, res) => {
  try {
    const { id } = req.params;
    await ProductVariant.destroy({ where: { id } });
    res.json({ message: "Variant deleted" });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to delete variant", error: err.message });
  }
};

import
  {
  User,
  Product,
  Image,
  Review,
  Category,
  ProductColor,
  ProductVariant,
} from "../config/db.js";
import { Op } from "sequelize";
// Admin: Add Product
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, category_name } = req.body;

     const category = await Category.findOne({
       where: { name: category_name },
     });

     if (!category) {
       return res.status(400).json({ message: "Category not found" });
    }
    
    const newProduct = await Product.create({
      name,
      description,
      price,
      stock,
      category_id: category.id,
    });

    res.status(201).json(newProduct);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create product", error: err.message });
  }
};

// Admin: Update Product
// Admin: Update Product (category by name)
export const updateProduct = async (req, res) => {
  try {
    const { category_name, ...otherFields } = req.body;

    let category_id;
    if (category_name) {
      const category = await Category.findOne({ where: { name: category_name } });
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      category_id = category.id;
    }

    const updateData = {
      ...otherFields,
      ...(category_id && { category_id }),
    };

    const [updated] = await Product.update(updateData, { where: { id: req.params.id } });

    if (updated === 0) {
      return res.status(404).json({ message: "Product not found or no changes made" });
    }

    res.json({ message: "Product updated successfully" });
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
    const { category, minPrice, maxPrice, search } = req.query;

    // const whereClause = category ? { category_id: category } : {};
    const whereClause = {};

     if (category) whereClause.category_id = category;

     if (minPrice || maxPrice) {
       whereClause.price = {};
       if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
       if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
     }

     if (search) {
       whereClause.name = {
         [Op.iLike]: `%${search}%`, // PostgreSQL; use Op.substring for MySQL
       };
    }
    
    const products = await Product.findAll({
      where: whereClause,
      attributes: ["id", "name", "price"],
      include: [
        {
          model: ProductColor,
          include: [
            {
              model: Image,
              where: { related_type: "productColor" },
              required: false,
              attributes: ["image_url", "alt_text"],
            },
          ],
          required: false,
        },
      ],
    });

    const formatted = products.map((product) => {
      let image = null;
      if (product.ProductColors?.length > 0) {
        const firstColor = product.ProductColors[0];
        image = firstColor.Images?.[0];
      }

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: image?.image_url || null,
        alt_text: image?.alt_text || null,
      };
    });

    res.json(formatted);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch products", error: err.message });
  }
};


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
              model: User,
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

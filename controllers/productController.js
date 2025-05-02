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
import { Op} from "sequelize";
import { uploadToImgBB } from "../utils/uploadToImgBB.js";  // Added import
import sequelize from "sequelize";

// Admin: Add Product
export const createProduct = async (req, res) => {
  try {
    if (!req.body) {
      return res.status(400).json({ message: "Request body is missing" });
    }

    const { name, description, price, stock, category_name, variants } =
      req.body;

    // Validate and convert stock to integer
    const stockInt = parseInt(stock, 10);
    if (isNaN(stockInt)) {
      return res.status(400).json({ message: "Invalid stock value" });
    }

    // Validate and convert price to float
    const priceFloat = parseFloat(price);
    if (isNaN(priceFloat)) {
      return res.status(400).json({ message: "Invalid price value" });
    }

    const imageUrls = [];

    for (const file of req.files) {
      const imageUrl = await uploadToImgBB(file.path);
      imageUrls.push(imageUrl);
    }

    const category = await Category.findOne({
      where: { name: category_name },
    });

    if (!category) {
      return res.status(400).json({ message: "Category not found" });
    }

    const newProduct = await Product.create({
      name,
      description,
      price: priceFloat,
      stock: stockInt,
      category_id: category.id,
    });

    // Save main product images
    await Promise.all(
      imageUrls.map((url) =>
        Image.create({
          related_type: "product",
          related_id: newProduct.id,
          image_url: url,
          alt_text: "",
        })
      )
    );

    // Handle variants
    if (variants?.length > 0) {
      for (const variant of variants) {
        let productColor = await ProductColor.findOne({
          where: { color_name: variant.color_name },
        });

        if (!productColor) {
          productColor = await ProductColor.create({
            color_name: variant.color_name,
            color_code: variant.color_code || "#FFFFFF",
            product_id: newProduct.id,
          });
        }

        const productVariant = await ProductVariant.create({
          variant_name: variant.variant_name,
          stock: variant.stock,
          additional_price: variant.additional_price || 0,
          product_id: newProduct.id,
          product_color_id: productColor.id,
        });

        // Save images for productColor if provided
        if (variant.images?.length > 0) {
          await Promise.all(
            variant.images.map((img) =>
              Image.create({
                image_url: img.image_url,
                alt_text: img.alt_text || "",
                related_type: "productColor",
                related_id: productColor.id,
              })
            )
          );
        }
      }
    }

    res.status(201).json({
      message: "Product created",
      product: newProduct,
      images: imageUrls,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to create product", error: err.message });
  }
};


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
         [Op.like]: `%${search}%`,
       };
    }
    
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
        {
          model: ProductColor,
          where: { product_id: { [Op.col]: "Product.id" } }, // Ensures match
          required: false,
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

    const formatted = products.map((product) => {
      let image = null;
      if (product.Images?.length > 0) {
        image = product.Images[0];
      } else if (product.ProductColors?.length > 0) {
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

// User: Fetch best sellers products (productname, img, review, price)
export const getBestSellersProducts = async (req, res) => {
  try {
    // Fetch products with average rating and review count using subqueries
    const products = await Product.findAll({
      attributes: [
        "id",
        "name",
        "price",
        [
          sequelize.literal(`(
            SELECT AVG(rating)
            FROM reviews AS review
            WHERE review.product_id = Product.id
          )`),
          "avgRating",
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM reviews AS review
            WHERE review.product_id = Product.id
          )`),
          "reviewCount",
        ],
      ],
      include: [
        {
          model: Image,
          where: { related_type: "product" },
          required: false,
          attributes: ["image_url"],
        },
      ],
      having: sequelize.and(
        sequelize.literal(`(
          SELECT AVG(rating)
          FROM reviews AS review
          WHERE review.product_id = Product.id
        ) >= 3`),
        sequelize.literal(`(
          SELECT AVG(rating)
          FROM reviews AS review
          WHERE review.product_id = Product.id
        ) <= 5`)
      ),
      order: [[sequelize.literal("reviewCount"), "DESC"]],
      limit: 10,
      group: ['Product.id']
    });

    // Format the response
    const formatted = products.map((product) => {
      return {
        id: product.id,
        name: product.name,
        price: product.price,
        image_url: product.Images[0]?.image_url || null,
        avgRating: parseFloat(product.get("avgRating")) || 0,
        reviewCount: parseInt(product.get("reviewCount")) || 0,
      };
    });

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch best sellers", error: err.message });
  }
};

import {
  User,
  Product,
  Image,
  Review,
  Category,
  ProductColor,
  ProductVariant,
  // Tag,
} from "../config/db.js";
import { Op, fn, col } from "sequelize";
import { uploadToImgBB } from "../utils/uploadToImgBB.js"; // Added import
import sequelize from "sequelize";

// Admin: Add Product
// export const createProduct = async (req, res) => {
//   try {
//     if (!req.body) {
//       return res.status(400).json({ message: "Request body is missing" });
//     }

//     const { name, description, price, stock, category_name, variants, Tag } =
//       req.body;

//     // Validate and convert stock to integer
//     const stockInt = parseInt(stock, 10);
//     if (isNaN(stockInt)) {
//       return res.status(400).json({ message: "Invalid stock value" });
//     }

//     // Validate and convert price to float
//     const priceFloat = parseFloat(price);
//     if (isNaN(priceFloat)) {
//       return res.status(400).json({ message: "Invalid price value" });
//     }

//     const imageUrls = [];

//     for (const file of req.files) {
//       const imageUrl = await uploadToImgBB(file.path);
//       imageUrls.push(imageUrl);
//     }

//     // Find or create the category
//     const category = await Category.findOne({
//       where: { name: category_name },
//     });

//     if (!category) {
//       return res.status(400).json({ message: "Category not found" });
//     }

//     const newProduct = await Product.create({
//       name,
//       description,
//       price: priceFloat,
//       stock: stockInt,
//       category_id: category.id,
//     });

//     // Handle tags
//     if (tags?.length > 0) {
//       const tagInstances = await Promise.all(
//         tags.map((tagName) =>
//           Tag.findOrCreate({ where: { name: tagName.trim() } }).then(
//             ([tag]) => tag
//           )
//         )
//       );
//       await newProduct.setTags(tagInstances);
//     }

//     // Handle general product images
//     if (images?.length > 0) {
//       const uploadedImages = await Promise.all(
//         images.map(async (file) => {
//           const uploadedUrl = await uploadToImgBB(file.path);
//           return {
//             image_url: uploadedUrl,
//             alt_text: file.alt_text || "",
//             related_type: "product",
//             related_id: newProduct.id,
//           };
//         })
//       );
//       await Image.bulkCreate(uploadedImages);
//     }

//     // Save main product images
//     await Promise.all(
//       imageUrls.map((url) =>
//         Image.create({
//           related_type: "product",
//           related_id: newProduct.id,
//           image_url: url,
//           alt_text: "",
//         })
//       )
//     );

//     // Handle variants
//     if (variants?.length > 0) {
//       for (const variant of variants) {
//         let productColor = await ProductColor.findOne({
//           where: { color_name: variant.color_name },
//         });

//         if (!productColor) {
//           productColor = await ProductColor.create({
//             color_name: variant.color_name,
//             color_code: variant.color_code || "#FFFFFF",
//             product_id: newProduct.id,
//           });
//         }

//         const productVariant = await ProductVariant.create({
//           variant_name: variant.variant_name,
//           stock: variant.stock,
//           additional_price: parseFloat(variant.additional_price || 0),
//           product_id: newProduct.id,
//           product_color_id: productColor.id,
//         });

//         // Save images for productColor if provided
//         if (variant.images?.length > 0) {
//           await Promise.all(
//             variant.images.map((img) =>
//               Image.create({
//                 image_url: img.image_url,
//                 alt_text: img.alt_text || "",
//                 related_type: "productColor",
//                 related_id: productColor.id,
//               })
//             )
//           );
//         }
//       }
//     }

//     res.status(201).json({
//       message: "Product created",
//       product: newProduct,
//       images: imageUrls,
//     });
//   } catch (err) {
//     res
//       .status(500)
//       .json({ message: "Failed to create product", error: err.message });
//   }
// };
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      category_name,
      // tags,
      variants,
    } = req.body;

    const files = req.files || []; // Multer files
    const imageUrls = await Promise.all(
      files.map(async (file) => await uploadToImgBB(file.path))
    );

    // Validate and convert price and stock
    const priceFloat = parseFloat(price);
    const stockInt = parseInt(stock, 10);
    if (isNaN(priceFloat) || isNaN(stockInt)) {
      return res.status(400).json({ message: "Invalid price or stock" });
    }

    // Get or create category
    const category = await Category.findOne({ where: { name: category_name } });
    if (!category) {
      return res.status(400).json({ message: "Category not found" });
    }

    // Create product
    const newProduct = await Product.create({
      name,
      description,
      price: priceFloat,
      stock: stockInt,
      category_id: category.id,
    });

    // Upload and save main product images
    await Promise.all(
      imageUrls.map((url) =>
        Image.create({
          image_url: url,
          alt_text: "",
          related_type: "product",
          related_id: newProduct.id,
        })
      )
    );

    // // Handle tags
    // if (tags?.length > 0) {
    //   const tagInstances = await Promise.all(
    //     tags.map((tagName) =>
    //       Tag.findOrCreate({ where: { name: tagName.trim() } }).then(([tag]) => tag)
    //     )
    //   );
    //   await newProduct.setTags(tagInstances);
    // }

    // Handle variants and product colors
    if (variants?.length > 0) {
      for (const variant of variants) {
        // Upload variant images if needed
        const colorImageUrls = [];

        if (variant.images?.length > 0) {
          for (const file of variant.images) {
            const uploadedUrl = await uploadToImgBB(file.path); // or file if base64
            colorImageUrls.push({
              image_url: uploadedUrl,
              alt_text: file.alt_text || "",
            });
          }
        }

        // Create or find ProductColor (unique per product)
        let productColor = await ProductColor.findOne({
          where: {
            color_name: variant.color_name,
            product_id: newProduct.id,
          },
        });

        if (!productColor) {
          productColor = await ProductColor.create({
            color_name: variant.color_name,
            color_code: variant.color_code || "#FFFFFF",
            product_id: newProduct.id,
          });
        }

        // Save color images
        if (colorImageUrls.length > 0) {
          await Promise.all(
            colorImageUrls.map((img) =>
              Image.create({
                image_url: img.image_url,
                alt_text: img.alt_text || "",
                related_type: "productColor",
                related_id: productColor.id,
              })
            )
          );
        }

        // Create variant
        await ProductVariant.create({
          variant_name: variant.variant_name,
          stock: parseInt(variant.stock, 10) || 0,
          additional_price: parseFloat(variant.additional_price || 0),
          product_id: newProduct.id,
          product_color_id: productColor.id,
        });
      }
    }

    res.status(201).json({
      message: "Product created successfully",
      product: newProduct,
      images: imageUrls,
    });
  } catch (err) {
    console.error(err);
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
      const category = await Category.findOne({
        where: { name: category_name },
      });
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      category_id = category.id;
    }

    const updateData = {
      ...otherFields,
      ...(category_id && { category_id }),
    };

    const [updated] = await Product.update(updateData, {
      where: { id: req.params.id },
    });

    if (updated === 0) {
      return res
        .status(404)
        .json({ message: "Product not found or no changes made" });
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
    const deleted = await Product.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
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
    const {
      category,
      minPrice,
      maxPrice,
      search,
      page = 1,
      sortBy = "name",
      sortOrder = "ASC",
    } = req.query;

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

    // Fixed limit of 10 products per page
    const limit = 10;

    const offset = (parseInt(page) - 1) * limit;

    // Get total count for pagination
    const totalCount = await Product.count({ where: whereClause });

    // Get the products with pagination and sorting
    const products = await Product.findAll({
      where: whereClause,
      attributes: ["id", "name", "price", "description"],
      include: [
        {
          model: Image,
          // where: { related_type: "product" },
          // required: false,
          // attributes: ["image_url", "alt_text"],
          // limit: 1, // Only one image
        },
        {
          model: ProductColor,
          where: { product_id: { [Op.col]: "Product.id" } }, // Ensures match
          required: false,
          include: [
            {
              model: Image,
              // where: { related_type: "productColor" },
              // required: false,
              // attributes: ["image_url", "alt_text"],
              // limit: 1, // One image per color
            },
          ],
        },
        {
          model: Category,
          attributes: ["name"],
          required: false,
        },
      ],
      order: [[sortBy, sortOrder]], // Sorting by provided field and order
      // limit: parseInt(limit), // Number of results per page
      limit: limit, // Always 10 products per page
      offset: offset,
    });

    const formatted = products.map((product) => {
      const prod = product.toJSON();
      let image = prod.Images?.[0];

      // Fallback to ProductColor image
      if (!image && prod.ProductColors?.length > 0) {
        image = prod.ProductColors[0]?.Images?.[0] || null;
      }

      return {
        id: prod.id,
        name: prod.name,
        description: prod.description,
        price: prod.price,
        stock: prod.stock,
        category_name: prod.Category?.name || null,
        image_url: image?.image_url || null,
        alt_text: image?.alt_text || null,
      };
    });

    // res.json(formatted);
    res.json({
      formatted,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch products",
      error: err.message,
    });
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
          model: ProductColor,
          attributes: ["id", "color_name", "color_code"],
          include: [
            {
              model: Image,
              required: false,
              attributes: ["image_url", "alt_text"],
            },
          ],
        },
        /*
        {
          model: ProductVariant,
          attributes: ["id", "variant_name", "stock", "additional_price"],
          include: [
            {
              model: ProductColor,
              attributes: ["id", "color_name", "color_code"],
              include: [
                {
                  model: Image,
                  where: { related_type: "productColor" },
                  required: false,
                  attributes: ["image_url", "alt_text"],
                },
              ],
            },
            {
              model: Image,
              where: { related_type: "productVariant" },
              required: false,
              attributes: ["image_url", "alt_text"],
            },
          ],
        },
        */
      ],
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    // Rename Images -> images for consistency in ProductVariants
    /*
    product.ProductVariants.forEach((variant) => {
      if (variant.ProductColor?.Images) {
        variant.ProductColor.images = variant.ProductColor.Images;
        delete variant.ProductColor.Images;
      }
    });
    */

    // Calculate average rating
    const avgRatingData = await Review.findOne({
      attributes: [[fn("AVG", col("rating")), "avgRating"]],
      where: { product_id: product.id },
      raw: true,
    });

    const averageRating = parseFloat(avgRatingData.avgRating || 0).toFixed(1);

    // Attach average rating to product
    const productWithRating = {
      ...product.toJSON(),
      averageRating,
    };

    res.json(productWithRating);
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
            FROM Reviews AS review
            WHERE review.product_id = Product.id
          )`),
          "avgRating",
        ],
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM Reviews AS review
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
          limit: 1, // Only one image
        },
      ],
      having: sequelize.and(
        sequelize.literal(`(
          SELECT AVG(rating)
          FROM Reviews AS review
          WHERE review.product_id = Product.id
        ) >= 3`),
        sequelize.literal(`(
          SELECT AVG(rating)
          FROM Reviews AS review
          WHERE review.product_id = Product.id
        ) <= 5`)
      ),
      order: [[sequelize.literal("reviewCount"), "DESC"]],
      limit: 10,
      group: ["Product.id"],

      // need to try this to get the best sellers
      // order: [
      //   [sequelize.literal("reviewCount"), "DESC"],
      //   [sequelize.literal("avgRating"), "DESC"],
      // ],
      // limit: 10, // Top 10 best sellers
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
    console.error("Error in getBestSellersProducts:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch best sellers", error: err.message });
  }
};

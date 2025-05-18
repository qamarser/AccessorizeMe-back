import sequelize from "../config/sequelize.js";
import {
  Cart,
  Product,
  ProductVariant,
  ProductColor,
  Image,
} from "../config/db.js";
import { Op } from "sequelize";

async function auditAndCleanup() {
  try {
    await sequelize.authenticate();
    console.log("Database connected.");

    // 1. Remove cart items with missing product_variants
    const deletedCart = await Cart.destroy({
      where: {
        product_variant_id: {
          [Op.notIn]: sequelize.literal("(SELECT id FROM ProductVariants)"),
        },
      },
    });
    console.log(`Deleted ${deletedCart} cart items with missing variants.`);

    // 2. Clean orphaned images (bad related_id references)
    const deletedImagesForVariant = await Image.destroy({
      where: {
        related_type: "productVariant",
        related_id: {
          [Op.notIn]: sequelize.literal("(SELECT id FROM ProductVariants)"),
        },
      },
    });
    console.log(
      `Deleted ${deletedImagesForVariant} images with missing ProductVariants.`
    );

    const deletedImagesForProduct = await Image.destroy({
      where: {
        related_type: "product",
        related_id: {
          [Op.notIn]: sequelize.literal("(SELECT id FROM Products)"),
        },
      },
    });
    console.log(
      `Deleted ${deletedImagesForProduct} images with missing Products.`
    );

    const deletedImagesForColor = await Image.destroy({
      where: {
        related_type: "productColor",
        related_id: {
          [Op.notIn]: sequelize.literal("(SELECT id FROM ProductColors)"),
        },
      },
    });
    console.log(
      `Deleted ${deletedImagesForColor} images with missing ProductColors.`
    );

    // 3. Optional: Reset and seed database
    // If you have a `seed.js`, import and run it here
    // import seedDatabase from './seed.js';
    // await seedDatabase();

    console.log("Database audit and cleanup complete.");
    process.exit(0);
  } catch (err) {
    console.error("Error during audit/cleanup:", err);
    process.exit(1);
  }
}

auditAndCleanup();

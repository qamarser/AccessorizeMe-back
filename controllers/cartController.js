import {
    Cart,
    Product,
    User,
    Image,
    ProductVariant,
    ProductColor,
  } from "../config/db.js";
  import { Op } from "sequelize";
  
  // Add to cart
export const addToCart = async (req, res) => {
    try {
      const { product_id, product_variant_id, product_color_id, quantity } = req.body;
      const user_id = req.user.id;
  
      // Ensure product exists
      const product = await Product.findByPk(product_id);
      if (!product) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
  
      // If variant id is provided, ensure it exists
      if (product_variant_id) {
        const variant = await ProductVariant.findByPk(product_variant_id);
        if (!variant) {
          return res.status(400).json({ message: "Invalid product variant ID" });
        }
      }
  
      // If product_color_id is provided, ensure it exists
      if (product_color_id) {
        const color = await ProductColor.findByPk(product_color_id);
        if (!color) {
          return res.status(400).json({ message: "Invalid product color ID" });
        }
      }
  
      const [cartItem, created] = await Cart.findOrCreate({
        where: {
          user_id,
          product_id,
          product_variant_id: product_variant_id || null,
          product_color_id: product_color_id || null,
        },
        defaults: { quantity, product_color_id: product_color_id || null },
      });
  
      if (!created) {
        cartItem.quantity += quantity;
        await cartItem.save();
      }
  
      res.status(200).json({ message: "Product added to cart", cartItem });
    } catch (err) {
      console.error("Error in addToCart:", err);
      res
        .status(500)
        .json({ message: "Error adding to cart", error: err.message, stack: err.stack });
    }
  };
  
  // View cart
  export const getCart = async (req, res) => {
    try {
      const user_id = req.user.id;
      const cart = await Cart.findAll({
        where: { user_id },
        include: [
          {
            model: Product,
            attributes: ["id", "name", "price"],
            include: [
              {
                model: Image,
                required: false,
                where: {
                  related_type: {
                    [Op.in]: ["productVariant", "productColor", "product", "other"]
                  }
                },
                attributes: ["image_url", "alt_text"],
                limit: 1,
                constraints: false,
              }
            ],
          },
          {
            model: ProductVariant,
            required: false,
              include: [
                {
                  model: Image,
                  where: { related_type: ["productVariant", "productColor", "product", "other"] },
                  required: false,
                  attributes: ["image_url", "alt_text"],
                  limit: 1,
                  constraints: false,
                },
                {
                  model: ProductColor,
                  required: false,
                  include: [
                    {
                      model: Image,
                      where: { related_type: ["productColor", "product", "other"] },
                      required: false,
                      attributes: ["image_url", "alt_text"],
                      limit: 1,
                      constraints: false,
                    },
                  ],
                },
              ],
            constraints: false,
          },
          {
            model: ProductColor,
            required: false,
            foreignKey: "product_color_id",
            include: [
              {
                model: Image,
                where: { related_type: ["productColor", "product", "other"] },
                required: false,
                attributes: ["image_url", "alt_text"],
                limit: 1,
                constraints: false,
              },
            ],
            constraints: false,
          },
        ],
        constraints: false,
      });
  
      // Debug log image URLs
      cart.forEach(item => {
        if (item.Product && item.Product.Images && item.Product.Images.length > 0) {
          console.log(`Product ID ${item.Product.id} Image URL:`, item.Product.Images[0].image_url);
        }
        if (item.ProductVariant && item.ProductVariant.Images && item.ProductVariant.Images.length > 0) {
          console.log(`ProductVariant ID ${item.ProductVariant.id} Image URL:`, item.ProductVariant.Images[0].image_url);
        }
        if (item.ProductVariant && item.ProductVariant.ProductColor && item.ProductVariant.ProductColor.Images && item.ProductVariant.ProductColor.Images.length > 0) {
          console.log(`ProductColor ID ${item.ProductVariant.ProductColor.id} Image URL:`, item.ProductVariant.ProductColor.Images[0].image_url);
        }
      });
  
      let total = 0;
      if (cart && Array.isArray(cart)) {
        total = cart.reduce(function(sum, item) {
          return sum + (item.Product && item.Product.price ? parseFloat(item.Product.price) : 0) * item.quantity;
        }, 0);
      }
  
      res.status(200).json({ items: cart, total });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error fetching cart", error: err.message });
    }
  };
  
  // Update quantity
  export const updateCartItem = async (req, res) => {
    try {
      const { quantity } = req.body;
      const cartItem = await Cart.findByPk(req.params.id);
  
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
  
      cartItem.quantity = quantity;
      await cartItem.save();
      res.status(200).json({ message: "Cart updated", cartItem });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error updating cart", error: err.message });
    }
  };
  
  // Delete cart item
  export const deleteCartItem = async (req, res) => {
    try {
      const cartItem = await Cart.findByPk(req.params.id);
  
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
  
      await cartItem.destroy();
      res.status(200).json({ message: "Cart item removed" });
    } catch (err) {
      res
        .status(500)
        .json({ message: "Error deleting cart item", error: err.message });
    }
  };
  
  // Clear cart for a user
  export const clearCart = async (req, res) => {
    try {
      const user_id = req.user.id;
      await Cart.destroy({ where: { user_id } });
      res.status(200).json({ message: "Cart cleared" });
    } catch (err) {
      console.error("Error clearing cart:", err.message);
      res
        .status(500)
        .json({ message: "Error clearing cart", error: err.message });
    }
  };
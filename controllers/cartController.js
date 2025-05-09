import { Cart, Product, User, Image } from "../config/db.js";

// Add to cart
export const addToCart = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const user_id = req.user.id;

    // Ensure product exists
    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const [cartItem, created] = await Cart.findOrCreate({
      where: { user_id, product_id },
      defaults: { quantity },
    });

    if (!created) {
      cartItem.quantity += quantity;
      await cartItem.save();
    }

    res.status(200).json({ message: "Product added to cart", cartItem });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error adding to cart", error: err.message });
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
              where: { related_type: "product" },
              required: false,
              attributes: ["image_url", "alt_text"],
            },
          ],
        },
      ],
    });

    const total = cart.reduce(
      (sum, item) => sum + (item.Product?.price || 0) * item.quantity,
      0
    );

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
    res.status(500).json({ message: "Error clearing cart", error: err.message });
  }
};
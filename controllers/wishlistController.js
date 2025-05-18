import { Wishlist, Product, Image } from "../config/db.js";

export const addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;
    const user_id = req.user.id;

    // Check if already in wishlist
    const exists = await Wishlist.findOne({ where: { user_id, product_id } });
    // if (exists) return res.status(400).json({ message: "Already in wishlist" });
    if (exists) {
      return res.status(200).json({ alreadyAdded: true });
    }
    

    const item = await Wishlist.create({ user_id, product_id });
    res.status(201).json(item);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const user_id = req.user.id;

    const wishlist = await Wishlist.findAll({
      where: { user_id },
      include: {
        model: Product,
        include: [
          {
            model: Image,
            where: { related_type: "product" },
            required: false,
          },
        ],
      },
    });

    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { id } = req.params;

    // Delete by wishlist item id and user_id to ensure ownership
    const deleted = await Wishlist.destroy({ where: { id, user_id } });
    if (!deleted) return res.status(404).json({ message: "Item not found" });

    res.json({ message: "Item removed from wishlist" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

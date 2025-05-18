
import { Review, Product, User } from "../config/db.js"; // Import models
import { Op } from "sequelize";

// Create a new review
export const createReview = async (req, res) => {
  const { productId, rating, comment } = req.body;
  const userId = req.user.id;

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5." });
  }
  if (!comment || comment.trim() === "") {
    return res.status(400).json({ message: "Comment cannot be empty." });
  }

  try {
    // Check if the product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Create the review
    const review = await Review.create({
      product_id: productId,
      user_id: userId,
      rating,
      comment,
    });

    return res
      .status(201)
      .json({ message: "Review created successfully", review });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating review" });
  }
};

// Get reviews for a product
export const getProductReviews = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Fetch reviews for the product
    const reviews = await Review.findAll({
      where: { product_id: productId },
      include: [
        {
          model: User,
          attributes: ["id", "name"],
        },
      ],
    });

    return res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching reviews" });
  }
};

// Get all reviews - Admin
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: {
        user_id: {
          [Op.ne]: null,
        },
      },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
        {
          model: Product,
          attributes: ["id", "name"],
        },
      ],
    });
    return res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error fetching all reviews" });
  }
};

// Delete review - Admin only
export const deleteReview = async (req, res) => {
  try {
    const reviewId = req.params.id;

    // Admin check should be done in middleware
    const review = await Review.findByPk(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    await review.destroy();
    res.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete review" });
  }
};

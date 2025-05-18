import express from "express";
import {
  createReview,
  getProductReviews,
  getAllReviews,
  deleteReview,
} from "../controllers/reviewController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route for creating a review
router.post("/add", verifyToken, createReview);

// Route for getting reviews for a product
router.get("/product/:productId", getProductReviews);

// Admin route to get all reviews
router.get("/", verifyToken, isAdmin, getAllReviews);

// Admin route to delete a review
router.delete("/:id", verifyToken, isAdmin, deleteReview);

export default router;

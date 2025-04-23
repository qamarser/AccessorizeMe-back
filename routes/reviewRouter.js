import express from "express";
import {
  createReview,
  getProductReviews,
} from "../controllers/reviewController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Route for creating a review
router.post("/add", verifyToken, createReview);

// Route for getting reviews for a product
router.get("/product/:productId", verifyToken, getProductReviews);

export default router;

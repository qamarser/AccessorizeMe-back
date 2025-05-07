import express from "express";
import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlistController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, addToWishlist); // Add to wishlist
router.get("/", verifyToken, getWishlist); // Get all wishlist items
router.delete("/:id", verifyToken, removeFromWishlist); // Remove item

export default router;

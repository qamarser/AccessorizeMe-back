// routes/cartRoutes.js
import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  deleteCartItem,
} from "../controllers/cartController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // Adjust path if needed

const router = express.Router();

router.post("/add", verifyToken, addToCart);
router.get("/", verifyToken, getCart);
router.put("/:id", verifyToken, updateCartItem);
router.delete("/:id", verifyToken, deleteCartItem);

export default router;

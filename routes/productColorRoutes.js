import express from "express";
import {
  createProductColor,
  getAllProductColors,
  getProductColorById,
  updateProductColor,
  deleteProductColor,
} from "../controllers/productColorController.js";
import { isAdmin, verifyToken } from "../middleware/authMiddleware.js";
import { uploadAny } from "../middleware/upload.js";

const router = express.Router();

// Create a new color
router.post("/", verifyToken, isAdmin, uploadAny, createProductColor);

// Get all colors
router.get("/", getAllProductColors);

// Get single color
router.get("/:id",  getProductColorById);

// Update color
router.put("/:id", verifyToken, isAdmin, updateProductColor);

// Delete color
router.delete("/:id", verifyToken, isAdmin, deleteProductColor);

export default router;

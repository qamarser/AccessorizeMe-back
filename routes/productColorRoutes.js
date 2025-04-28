import express from "express";
import {
  createProductColor,
  getAllProductColors,
  getProductColorById,
  updateProductColor,
  deleteProductColor,
} from "../controllers/productColorController.js";

const router = express.Router();

// Create a new color
router.post("/", createProductColor);

// Get all colors
router.get("/", getAllProductColors);

// Get single color
router.get("/:id", getProductColorById);

// Update color
router.put("/:id", updateProductColor);

// Delete color
router.delete("/:id", deleteProductColor);

export default router;

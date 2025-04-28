import express from "express";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
    getProductsByCategory,
    getCategoryById,
} from "../controllers/categoryController.js";
import { isAdmin, verifyToken } from "../middleware/authMiddleware.js";
import { uploadAny } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getAllCategories); // Public
router.post("/", verifyToken, isAdmin, uploadAny, createCategory); // Admin only
router.put("/:id", verifyToken, isAdmin, updateCategory);
router.delete("/:id", verifyToken, isAdmin, deleteCategory);
router.get("/:id/products", getProductsByCategory); // Public
router.get("/:id", getCategoryById); // Public
export default router;

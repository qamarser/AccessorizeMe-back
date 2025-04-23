import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
} from "../controllers/productController.js";
import { isAdmin, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getAllProducts); // Public
router.get("/:id", getProductById); // Public
router.post("/", verifyToken, isAdmin, createProduct);
router.put("/:id", verifyToken, isAdmin, updateProduct);
router.delete("/:id", verifyToken, isAdmin, deleteProduct);

export default router;

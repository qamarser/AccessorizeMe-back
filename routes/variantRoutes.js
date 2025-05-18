import express from "express";
import {
  createVariant,
  getAllVariants,
  updateVariant,
  deleteVariant,
} from "../controllers/variantController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { uploadAny } from "../middleware/upload.js";

const router = express.Router();

router.post("/", verifyToken, isAdmin, uploadAny, createVariant);// Admin Create variant
router.get("/", verifyToken, isAdmin, getAllVariants); // Admin view all
router.put("/:id", verifyToken, isAdmin, updateVariant); // Admin update variant
router.delete("/:id", verifyToken, isAdmin, deleteVariant); // Admin delete variant

export default router;

import express from "express";
import { uploadImages } from "../controllers/uploadImagesController.js";
import { uploadMultiple } from "../middleware/upload.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/upload", verifyToken, isAdmin, uploadMultiple, uploadImages);

export default router;

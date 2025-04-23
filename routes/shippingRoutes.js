import express from "express";
import {
  createShipping,
  getAllShippings,
} from "../controllers/shippingController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", verifyToken, createShipping); // User
router.get("/", verifyToken, isAdmin, getAllShippings); // Admin

export default router;

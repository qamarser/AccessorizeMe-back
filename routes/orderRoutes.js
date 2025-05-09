// routes/orderRoutes.js
import express from "express";
import {
  placeOrder,
  getCustomerOrders,
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js"; // assumes isAdmin exists

const router = express.Router();

// Customer
router.post("/", verifyToken, placeOrder);
router.get("/my", verifyToken, getCustomerOrders);

// Admin
router.get( "/", verifyToken, isAdmin, getAllOrders );
router.patch("/:orderId/status", verifyToken, isAdmin, updateOrderStatus);
router.delete("/:orderId", verifyToken, isAdmin, deleteOrder);

export default router;

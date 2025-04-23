import express from "express";
import {
  createStockLog,
  getAllStockLogs,
  getLowStockAlerts,
  resolveLowStockAlert,
} from "../controllers/stocksController.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/log", verifyToken, isAdmin, createStockLog); // Log stock change
router.get("/logs", verifyToken, isAdmin, getAllStockLogs); // View all stock logs
router.get("/alerts", verifyToken, isAdmin, getLowStockAlerts); // View active low stock alerts
router.patch("/alerts/:alert_id/resolve", verifyToken, isAdmin, resolveLowStockAlert); // Resolve alert

export default router;

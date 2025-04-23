import { Product, StockLog, LowStockAlert } from "../config/db.js";

// Log a stock change (admin or order-related)
export const createStockLog = async (req, res) => {
  try {
    const { product_id, change_type, quantity_changed } = req.body;

    const product = await Product.findByPk(product_id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Update stock based on change type
    let newStock = product.stock;

    if (change_type === "sale") {
      newStock -= quantity_changed;
    } else if (change_type === "restock" || change_type === "return") {
      newStock += quantity_changed;
    } else if (change_type === "manual_update") {
      newStock = quantity_changed;
    }

    if (newStock < 0) newStock = 0;

    await product.update({ stock: newStock });

    await StockLog.create({
      product_id,
      change_type,
      quantity_changed,
    });

    // Check for low stock
    if (newStock <= 5) {
      await LowStockAlert.findOrCreate({
        where: {
          product_id,
          resolved: false,
        },
        defaults: {
          current_stock: newStock,
          notified_at: new Date(),
        },
      });
    }

    res.status(201).json({ message: "Stock log created and stock updated", newStock });
  } catch (err) {
    res.status(500).json({ message: "Failed to create stock log", error: err.message });
  }
};

// Get all stock logs (admin)
export const getAllStockLogs = async (req, res) => {
  try {
    const logs = await StockLog.findAll({ order: [["updated_at", "DESC"]] });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stock logs", error: err.message });
  }
};

// Get unresolved low stock alerts (admin)
export const getLowStockAlerts = async (req, res) => {
  try {
    const alerts = await LowStockAlert.findAll({
      where: { resolved: false },
      order: [["notified_at", "DESC"]],
    });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch low stock alerts", error: err.message });
  }
};

// Resolve a low stock alert (admin)
export const resolveLowStockAlert = async (req, res) => {
  try {
    const { alert_id } = req.params;
    const alert = await LowStockAlert.findByPk(alert_id);
    if (!alert) return res.status(404).json({ message: "Alert not found" });

    await alert.update({ resolved: true });
    res.json({ message: "Alert resolved" });
  } catch (err) {
    res.status(500).json({ message: "Failed to resolve alert", error: err.message });
  }
};

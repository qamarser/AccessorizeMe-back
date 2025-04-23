import express from "express";
import { signup, login, logout } from "../controllers/authcontrollers.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

// Protected Example:
router.get("/profile", verifyToken, (req, res) => {
  res.json({ message: "Welcome!", user: req.user });
});

router.get("/admin", verifyToken, isAdmin, (req, res) => {
  res.json({ message: "Admin access granted." });
});

export default router;

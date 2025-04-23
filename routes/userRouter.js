import express from "express";
import {
  getUserProfile,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  updateUserProfile,
} from "../controllers/userControllers.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 Get current user profile
router.get("/me", verifyToken, getUserProfile);

// ✏️ Update current user profile
router.put("/me", verifyToken, updateUserProfile);

// 🛡️ Admin: Get all users
router.get("/", verifyToken, getAllUsers);

// 🔎 Admin: Get a single user by ID
router.get("/:id", verifyToken, getSingleUser);

// 🛠️ Admin only: Update any user by ID
router.put("/:id", verifyToken, updateUser);

// ❌ Admin only: Delete user by ID
router.delete("/:id", verifyToken, deleteUser);

export default router;

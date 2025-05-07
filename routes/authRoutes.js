import express from "express";
import {
  signup,
  login,
  logout,
  currentUser,
} from "../controllers/authcontrollers.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", verifyToken, currentUser);
export default router;

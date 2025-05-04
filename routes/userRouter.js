import express from "express";
import {
  getUserProfile,
  getAllUsers,
  getSingleUser,
  updateUser,
  deleteUser,
  updateUserProfile,
  uploadUserProfileImage,
  changePassword,
} from "../controllers/userControllers.js";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { uploadSingle } from "../middleware/upload.js";

const router = express.Router();

// 🔐 Get current user profile
router.get("/me", verifyToken, getUserProfile);

  
// ✏️ Update current user profile
router.put("/me", verifyToken, updateUserProfile);

// 🖼️ Upload user profile image
router.post("/me/image", verifyToken, uploadSingle, uploadUserProfileImage);

// Change password
router.put( "/change-password", verifyToken, changePassword );

// 🛡️ Admin: Get all users
router.get("/", verifyToken, isAdmin, getAllUsers);

// 🔎 Admin: Get a single user by ID
router.get("/:id", verifyToken, isAdmin, getSingleUser);

// 🛠️ Admin only: Update any user by ID
router.put("/:id", verifyToken, isAdmin, updateUser);

// ❌ Admin only: Delete user by ID
router.delete("/:id", verifyToken, isAdmin, deleteUser);

export default router;


// import express from "express";
// import {
//   getUserProfile,
//   updateUserProfile,
//   getAllUsers,
//   getSingleUser,
//   updateUser,
//   deleteUser,
//   changePassword
// } from "../controllers/usercontroller.js";
// import { verifyToken } from "../middleware/authMiddleware.js";

// const router = express.Router();

// // Profile
// router.get("/me", verifyToken, getUserProfile);
// router.put("/me", verifyToken, updateUserProfile);

// // Change password
// router.put("/change-password", verifyToken, changePassword);

// // Admin routes
// router.get("/", verifyToken, getAllUsers);
// router.get("/:id", verifyToken, getSingleUser);
// router.put("/:id", verifyToken, updateUser);
// router.delete("/:id", verifyToken, deleteUser);

// export default router;

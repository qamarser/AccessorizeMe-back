import { User, Image } from "../config/db.js";
import jwt from "jsonwebtoken";

// Get User Profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email"],
      include: [
        {
          model: Image,
          as: "profileImage",
          attributes: ["id", "image_url", "alt_text"],
        },
      ],
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage ? user.profileImage.image_url : null,
    });
  } catch (error) {
    console.error("Error retrieving user profile:", error); // Log the error details
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get All Users - Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({ attributes: ['id', 'name', 'email', 'role'] });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch users", error });
  }
};

// Get Single User
export const getSingleUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Only admin or the user themself can view
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Admins only" });
    }

    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'role']
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user", error });
  }
};

// Update User Info 
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    //  Block if not admin
    if (req.user.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Only admin can update other users" });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, role } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role; 

    await user.save();

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update user", error });
  }
};


// Delete User - Admin only
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admin can delete users' });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete user", error });
  }
};

// Update User Profile (avoids misuse of /users/:id)
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    // profileImage is handled separately in images table

    await user.save();

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage ? user.profileImage.image_url : null,
    });
  } catch (error) {
    console.error("Error updating user profile:", error); // Log the error details
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

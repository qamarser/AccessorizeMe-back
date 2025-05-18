import { User, Image } from "../config/db.js";
import jwt from "jsonwebtoken";
import { uploadToImgBB } from "../utils/uploadToImgBB.js";
import bcrypt from "bcrypt";

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

    // Fetch user again with profileImage association to include image in response
    const updatedUser = await User.findByPk(userId, {
      attributes: ["id", "name", "email"],
      include: [
        {
          model: Image,
          as: "profileImage",
          attributes: ["id", "image_url", "alt_text"],
        },
      ],
    });

    res.json({
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      profileImage: updatedUser.profileImage ? updatedUser.profileImage.image_url : null,
    });
  } catch (error) {
    console.error("Error updating user profile:", error); // Log the error details
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// function to upload user profile image
export const uploadUserProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ message: "No image file uploaded" });
    }

    // Optionally upload to ImgBB and get URL
    let imageUrl = null;
    if (uploadToImgBB) {
      try {
        const imgbbResponse = await uploadToImgBB(req.file.path);
        if (imgbbResponse) {
          imageUrl = imgbbResponse;
        } else {
          throw new Error("Invalid ImgBB response");
        }
      } catch (uploadError) {
        console.error("ImgBB upload failed:", uploadError);
        // fallback to local file path
        imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      }
    } else {
      imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    // Save or update image record in DB
    let image = await Image.findOne({ where: { user_id: userId } });
    if (image) {
      image.image_url = imageUrl;
      await image.save();
    } else {
      image = await Image.create({
        user_id: userId,
        image_url: imageUrl,
        alt_text: "User profile image",
      });
    }

    // Return updated user profile with image URL
    const user = await User.findByPk(userId, {
      attributes: ["id", "name", "email"],
      include: [
        {
          model: Image,
          as: "profileImage",
          attributes: ["id", "image_url", "alt_text"],
        },
      ],
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      profileImage: imageUrl,
    });
  } catch (error) {
    console.error("Error uploading user profile image:", error);
    res.status(500).json({ message: "Failed to upload image", error: error.message });
  }
};


// Change Password (for logged-in users)
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; // From verifyToken middleware
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ message: "Both current and new passwords are required" });
    }

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

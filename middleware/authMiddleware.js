import jwt from "jsonwebtoken";
import { User } from "../config/db.js";

export const verifyToken = async (req, res, next) => {
  try {
    console.log("Cookies:", req.cookies);
    const token = req.cookies.token;

    if (!token)
      return res.status(401).json({ message: "Unauthorized. No token." });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded:", decoded);

    const user = await User.findByPk(decoded.id);
    if (!user)
      return res.status(401).json({ message: "Unauthorized. User not found." });

    req.user = { id: user.id, role: user.role };
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin")
    return res.status(403).json({ message: "Admins only." });
  next();
};

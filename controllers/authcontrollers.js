import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../config/db.js";

// Signup
export const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return res.status(400).json({ message: "Email already in use" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Login with Cookie
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user)
      return res
        .status(401)
        .json({ message: "Invalid credentials, wrong email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ message: "Invalid password, wrong password" });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
{ expiresIn: isNaN(Number(process.env.JWT_EXPIRATION)) ? process.env.JWT_EXPIRATION : Number(process.env.JWT_EXPIRATION) }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // only send cookie over HTTPS
      sameSite: "Strict",
      maxAge: parseInt(process.env.COOKIE_EXPIRES),
    });

    res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, role: user.role },
    });
  } catch (error) {
    console.error("login error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Logout (clear cookie)
export const logout = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

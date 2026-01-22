import { Request, Response } from "express";
import User from "../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Simple token generator inside controller
const generateToken = (userId: string, role: string): string => {
  const secret = process.env.JWT_SECRET || "default_dev_secret";
  return jwt.sign({ userId, role }, secret, { expiresIn: "7d" });
};

// 1. Login User
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    if (user.status === "INACTIVE") {
      return res.status(403).json({ message: "Account deactivated" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // ✅ Use the simple generator
    const token = generateToken(user._id.toString(), user.role);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 2. Admin Invite User
export const inviteUser = async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const tempPassword = "Temp@123";
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const user = new User({
      email,
      role: role || "STAFF",
      password: hashedPassword,
      name: email.split("@")[0],
      invitedAt: new Date(),
    });

    await user.save();

    res.json({
      message: "User invited successfully",
      user: {
        email: user.email,
        role: user.role,
        invitedAt: user.invitedAt,
        tempPassword: tempPassword, // For testing only
      },
    });
  } catch (error) {
    console.error("Invite error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

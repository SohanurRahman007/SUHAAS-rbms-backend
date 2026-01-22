import { Request, Response } from "express";
import User from "../models/User";
import Invite from "../models/Invite"; // নতুন ইম্পোর্ট
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  generateInviteToken,
  generateInviteLink,
} from "../utils/tokenGenerator"; // নতুন ইম্পোর্ট

// Helper: Generate JWT Token
const generateAuthToken = (userId: string, role: string): string => {
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

    const token = generateAuthToken(user._id.toString(), user.role);

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

// 2. Admin Invite User - UPDATED VERSION
export const inviteUser = async (req: Request, res: Response) => {
  try {
    const { email, role } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // 1. Check if user already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    // 2. Check if invite already exists and not expired
    const existingInvite = await Invite.findOne({ email });
    if (existingInvite && existingInvite.expiresAt > new Date()) {
      return res
        .status(400)
        .json({ message: "Active invite already exists for this email" });
    }

    // 3. Generate invite token and expiry (24 hours)
    const token = generateInviteToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // 4. Delete old expired invites if any
    if (existingInvite) {
      await Invite.deleteOne({ email });
    }

    // 5. Save new invite
    const invite = new Invite({
      email,
      role: role || "STAFF",
      token,
      expiresAt,
    });

    await invite.save();

    // 6. Generate invite link (for simulation)
    const inviteLink = generateInviteLink(token);

    res.json({
      message: "Invite sent successfully",
      invite: {
        email,
        role: invite.role,
        token,
        expiresAt,
        inviteLink,
      },
      note: "In production, send this link via email to the user",
    });
  } catch (error) {
    console.error("Invite error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 3. Register via Invite Token - NEW ENDPOINT
export const registerViaInvite = async (req: Request, res: Response) => {
  try {
    const { token, name, password } = req.body;

    if (!token || !name || !password) {
      return res.status(400).json({
        message: "Token, name and password are required",
      });
    }

    // 1. Find valid invite
    const invite = await Invite.findOne({
      token,
      expiresAt: { $gt: new Date() }, // Not expired
      acceptedAt: null, // Not already accepted
    });

    if (!invite) {
      return res.status(400).json({
        message: "Invalid or expired invite token",
      });
    }

    // 2. Check if user already exists
    const existingUser = await User.findOne({ email: invite.email });
    if (existingUser) {
      return res.status(400).json({ message: "User already registered" });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Create user
    const user = new User({
      name,
      email: invite.email,
      password: hashedPassword,
      role: invite.role,
      invitedAt: new Date(),
    });

    await user.save();

    // 5. Mark invite as accepted
    invite.acceptedAt = new Date();
    await invite.save();

    // 6. Generate auth token
    const authToken = generateAuthToken(user._id.toString(), user.role);

    res.json({
      message: "Registration successful",
      token: authToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// 4. Validate Invite Token - NEW ENDPOINT
export const validateInviteToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: "Token is required" });
    }

    const invite = await Invite.findOne({
      token: token as string,
      expiresAt: { $gt: new Date() },
      acceptedAt: null,
    });

    if (!invite) {
      return res.status(400).json({
        valid: false,
        message: "Invalid or expired token",
      });
    }

    res.json({
      valid: true,
      invite: {
        email: invite.email,
        role: invite.role,
        expiresAt: invite.expiresAt,
      },
    });
  } catch (error) {
    console.error("Validate token error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

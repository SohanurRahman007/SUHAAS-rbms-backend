import { Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../middleware/auth";

// 1. Get All Users (ADMIN only, paginated)
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find()
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(),
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get users error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};
// 2. Update User Role (ADMIN only)
export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["ADMIN", "MANAGER", "STAFF"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Valid role is required (ADMIN, MANAGER, STAFF)",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent self-role change (optional)
    if (user._id.toString() === req.user?.userId) {
      return res.status(400).json({
        success: false,
        message: "Cannot change your own role",
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: "User role updated successfully",
      data: {
        id: user._id,
        email: user.email,
        oldRole: user.role,
        newRole: role,
      },
    });
  } catch (error: any) {
    console.error("Update role error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user role",
      error: error.message,
    });
  }
};

// 3. Update User Status (ADMIN only)
export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["ACTIVE", "INACTIVE"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Valid status is required (ACTIVE, INACTIVE)",
      });
    }

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Prevent self-deactivation (optional)
    if (user._id.toString() === req.user?.userId && status === "INACTIVE") {
      return res.status(400).json({
        success: false,
        message: "Cannot deactivate your own account",
      });
    }

    user.status = status;
    await user.save();

    res.json({
      success: true,
      message: `User ${status === "ACTIVE" ? "activated" : "deactivated"} successfully`,
      data: {
        id: user._id,
        email: user.email,
        status: user.status,
      },
    });
  } catch (error: any) {
    console.error("Update status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update user status",
      error: error.message,
    });
  }
};

// 4. Get User by ID (ADMIN only)
export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error("Get user error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

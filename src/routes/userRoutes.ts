import express from "express";
import {
  getUsers,
  updateUserRole,
  updateUserStatus,
  getUserById,
} from "../controllers/userController";
import { authenticate, requireRole } from "../middleware/auth";

const router = express.Router();

// All routes require ADMIN role
router.use(authenticate, requireRole("ADMIN"));

// GET /users - Get all users (paginated)
router.get("/", getUsers);

// GET /users/:id - Get single user
router.get("/:id", getUserById);

// PATCH /users/:id/role - Update user role
router.patch("/:id/role", updateUserRole);

// PATCH /users/:id/status - Activate/deactivate user
router.patch("/:id/status", updateUserStatus);

export default router;

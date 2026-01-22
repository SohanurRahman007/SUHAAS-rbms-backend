import express from "express";
import {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  getProjectById,
} from "../controllers/projectController";
import { authenticate, requireRole } from "../middleware/auth";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// POST /projects - All authenticated users can create
router.post("/", createProject);

// GET /projects - All authenticated users can view
router.get("/", getProjects);

// GET /projects/:id - All authenticated users can view single
router.get("/:id", getProjectById);

// PATCH /projects/:id - ADMIN only (role-based middleware)
router.patch("/:id", requireRole("ADMIN"), updateProject);

// DELETE /projects/:id - ADMIN only (soft delete)
router.delete("/:id", requireRole("ADMIN"), deleteProject);

export default router;

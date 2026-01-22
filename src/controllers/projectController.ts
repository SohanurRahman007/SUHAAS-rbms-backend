import { Response } from "express";
import Project from "../models/Project";
import { AuthRequest } from "../middleware/auth";

// 1. Create Project (All authenticated users can create)
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const userId = req.user?.userId;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const project = new Project({
      name,
      description: description || "",
      createdBy: userId,
    });

    await project.save();

    // Populate creator info
    await project.populate("createdBy", "name email role");

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error: any) {
    console.error("Create project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: error.message,
    });
  }
};

// 2. Get All Projects (All authenticated users can view)
export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      Project.find()
        .populate("createdBy", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Project.countDocuments(),
    ]);

    res.json({
      success: true,
      data: projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Get projects error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
      error: error.message,
    });
  }
};

// 3. Update Project (ADMIN only)
export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Update fields if provided
    if (name !== undefined) project.name = name;
    if (description !== undefined) project.description = description;
    if (status !== undefined) project.status = status;

    await project.save();
    await project.populate("createdBy", "name email role");

    res.json({
      success: true,
      message: "Project updated successfully",
      data: project,
    });
  } catch (error: any) {
    console.error("Update project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update project",
      error: error.message,
    });
  }
};

// 4. Delete Project - SOFT DELETE (ADMIN only)
export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Soft delete - set isDeleted to true
    project.isDeleted = true;
    project.status = "DELETED";
    await project.save();

    res.json({
      success: true,
      message: "Project deleted successfully (soft delete)",
    });
  } catch (error: any) {
    console.error("Delete project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete project",
      error: error.message,
    });
  }
};

// 5. Get Single Project
export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id).populate(
      "createdBy",
      "name email role",
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      data: project,
    });
  } catch (error: any) {
    console.error("Get project error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch project",
      error: error.message,
    });
  }
};

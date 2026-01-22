import express from "express";
import authRoutes from "./authRoutes";
import projectRoutes from "./projectRoutes";
import userRoutes from "./userRoutes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/users", userRoutes);

export default router;

import express from "express";
import authRoutes from "./authRoutes";
import projectRoutes from "./projectRoutes";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);

export default router;

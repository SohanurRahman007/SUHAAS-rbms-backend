import express from "express";
import { login, inviteUser } from "../controllers/authController";

const router = express.Router();

// POST /auth/login
router.post("/login", login);

// POST /auth/invite (Admin only - temporarily open)
router.post("/invite", inviteUser);

export default router;

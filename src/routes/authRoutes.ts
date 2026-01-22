import express from "express";
import {
  login,
  inviteUser,
  registerViaInvite,
  validateInviteToken,
} from "../controllers/authController";

const router = express.Router();

// POST /auth/login
router.post("/login", login);

// POST /auth/invite (Admin only - temporarily open)
router.post("/invite", inviteUser);

// POST /auth/register-via-invite
router.post("/register-via-invite", registerViaInvite);

// GET /auth/validate-invite?token=xxx
router.get("/validate-invite", validateInviteToken);

export default router;

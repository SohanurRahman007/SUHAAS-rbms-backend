// src/models/Invite.ts
import mongoose from "mongoose";

const InviteSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["ADMIN", "MANAGER", "STAFF"], required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  acceptedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Invite", InviteSchema);

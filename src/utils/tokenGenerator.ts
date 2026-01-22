// src/utils/tokenGenerator.ts
import crypto from "crypto";

export const generateInviteToken = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

export const generateInviteLink = (token: string): string => {
  return `http://localhost:3000/register?token=${token}`;
};

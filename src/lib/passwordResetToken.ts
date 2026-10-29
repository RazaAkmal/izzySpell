import { createHash, randomBytes } from "node:crypto";

// Password reset tokens. The raw token only ever exists in the emailed link; the
// database stores just its SHA-256 hash (password_reset_tokens.token_hash).

export const RESET_TOKEN_BYTES = 32;
export const RESET_TOKEN_TTL_MINUTES = 60;
export const RESET_TOKENS_PER_HOUR = 3;

// 32 random bytes as base64url = 43 URL-safe characters
export const generateResetToken = () => randomBytes(RESET_TOKEN_BYTES).toString("base64url");

// SHA-256 hex digest (64 characters) of the raw token
export const hashResetToken = (token: string) => createHash("sha256").update(token, "utf8").digest("hex");
